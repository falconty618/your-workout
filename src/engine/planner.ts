import { exercises, CATALOG_VERSION } from '../catalog'
import type { AvailabilityWindow, Equipment, Goal, Plan, PlannedSession, SessionStep, TrainingType, UserProfile } from '../domain'
import { goalLabels } from '../domain'
import { evaluateProfileSafety, exerciseIsAllowed } from './safety'

export const PLANNER_VERSION = '1.0.0' as const

const templates: Record<Goal, TrainingType[]> = {
  'general-fitness': ['strength', 'cardio', 'strength', 'hiit'],
  'weight-loss': ['strength', 'cardio', 'hiit', 'strength'],
  'muscle-gain': ['strength', 'strength', 'strength', 'cardio'],
  strength: ['strength', 'strength', 'cardio', 'strength'],
  endurance: ['cardio', 'strength', 'cardio', 'hiit'],
  'running-performance': ['running', 'strength', 'running', 'cardio'],
}

const dayIndex: Record<AvailabilityWindow['day'], number> = {
  Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6, Sunday: 0,
}

function seeded(seed: number) {
  let value = seed >>> 0
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0
    return value / 4294967296
  }
}

function isoDateFor(day: AvailabilityWindow['day'], week: number, start: Date) {
  const date = new Date(start)
  date.setHours(12, 0, 0, 0)
  const distance = (dayIndex[day] - date.getDay() + 7) % 7
  date.setDate(date.getDate() + distance + week * 7)
  return date.toISOString().slice(0, 10)
}

function titleFor(type: TrainingType, index: number) {
  const titles: Record<TrainingType, string[]> = {
    strength: ['Full-body foundations', 'Strong movement practice', 'Total-body strength'],
    cardio: ['Steady cardio base', 'Low-impact conditioning', 'Aerobic builder'],
    hiit: ['Short interval circuit', 'Controlled conditioning', 'Full-body intervals'],
    running: ['Outdoor run–walk', 'Easy outdoor run', 'Running base session'],
  }
  return titles[type][index % titles[type].length]
}

function goalRole(goal: Goal, type: TrainingType) {
  if (type === 'strength') return goal === 'muscle-gain' ? 'Build repeatable training volume' : 'Build strength and movement capacity'
  if (type === 'running') return 'Develop running consistency and aerobic control'
  if (type === 'hiit') return 'Add time-efficient higher-effort conditioning'
  return 'Build an aerobic base and support recovery'
}

function buildSteps(type: TrainingType, durationMinutes: number, profile: UserProfile, random: () => number, makeId: (prefix: string) => string): { steps: SessionStep[]; equipment: Equipment[]; warnings: string[] } {
  const eligible = exercises
    .filter((exercise) => exercise.trainingTypes.includes(type) && exerciseIsAllowed(exercise, profile))
    .sort((a, b) => a.id.localeCompare(b.id))

  if (!eligible.length) throw new Error(`No safe ${type} exercises match the selected equipment and restrictions.`)
  const shuffled = [...eligible]
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1))
    ;[shuffled[index], shuffled[target]] = [shuffled[target], shuffled[index]]
  }
  const workBudget = Math.max(8, durationMinutes - 8)
  const selected = [] as typeof exercises
  let used = 0
  for (const exercise of shuffled) {
    if (selected.some((item) => item.substitutionGroup === exercise.substitutionGroup) && type === 'strength') continue
    if (used + exercise.estimatedMinutes <= workBudget || selected.length === 0) {
      selected.push(exercise)
      used += Math.min(exercise.estimatedMinutes, workBudget)
    }
    if (selected.length >= (type === 'strength' ? 4 : 3)) break
  }

  const steps: SessionStep[] = [{
    id: makeId('step'), kind: 'warmup', title: 'Warm up', durationSeconds: Math.min(300, Math.max(180, durationMinutes * 8)),
    cues: ['Begin easily and gradually increase your range.', 'Check how you feel before continuing.'],
  }]

  selected.forEach((exercise) => {
    const sets = profile.recentConsistency === 'new' ? Math.min(2, exercise.sets) : exercise.sets
    for (let set = 1; set <= sets; set += 1) {
      steps.push({
        id: makeId('step'), kind: 'work', exerciseId: exercise.id,
        title: `${exercise.name} · set ${set} of ${sets}`,
        durationSeconds: exercise.workSeconds,
        reps: exercise.reps,
        cues: [...exercise.cues, exercise.caution],
      })
      if (exercise.restSeconds && set < sets) {
        steps.push({ id: makeId('step'), kind: 'rest', title: 'Recover', durationSeconds: exercise.restSeconds, cues: ['Breathe steadily. Add more rest if you need it.'] })
      }
    }
  })

  steps.push({
    id: makeId('step'), kind: 'cooldown', title: 'Cool down', durationSeconds: Math.min(300, Math.max(180, durationMinutes * 7)),
    cues: ['Ease the pace down gradually.', 'Finish only when breathing feels settled.'],
  })

  const equipment = [...new Set(selected.flatMap((exercise) => exercise.equipment))]
  const warnings = selected.length < 2 ? ['Limited equipment or movement restrictions reduced the available exercise variety.'] : []
  return { steps, equipment, warnings }
}

export function validatePlan(plan: Plan): string[] {
  const errors: string[] = []
  const profile = plan.profileSnapshot
  plan.sessions.forEach((session) => {
    const window = profile.availability.find((item) => item.day === new Date(`${session.scheduledDate}T12:00:00`).toLocaleDateString('en-US', { weekday: 'long' }))
    if (!window) errors.push(`${session.title} is scheduled outside the supplied availability.`)
    if (window && session.durationMinutes > window.durationMinutes) errors.push(`${session.title} exceeds its available time.`)
    session.requiredEquipment.forEach((item) => {
      if (!profile.equipment.includes(item)) errors.push(`${session.title} requires unavailable equipment: ${item}.`)
    })
    session.steps.forEach((step) => {
      const exercise = exercises.find((item) => item.id === step.exerciseId)
      if (exercise && !exerciseIsAllowed(exercise, profile)) errors.push(`${session.title} contains a restricted exercise: ${exercise.name}.`)
    })
  })
  return errors
}

export function generatePlan(profile: UserProfile, seed = 20261027, now = new Date()): Plan {
  const safety = evaluateProfileSafety(profile)
  if (!safety.canGenerate) throw new Error(safety.blocking.join(' '))
  const random = seeded(seed)
  let idCounter = 0
  const makeId = (prefix: string) => `${prefix}-${seed.toString(36)}-${(++idCounter).toString(36)}`
  const pattern = templates[profile.goal]
  const sessions: PlannedSession[] = []
  const sortedWindows = [...profile.availability].sort((a, b) => dayIndex[a.day] - dayIndex[b.day])

  for (let week = 0; week < profile.planDurationWeeks; week += 1) {
    sortedWindows.forEach((window, slot) => {
      const type = pattern[slot % pattern.length]
      const built = buildSteps(type, window.durationMinutes, profile, random, makeId)
      const recoveryWeek = profile.planDurationWeeks >= 4 && (week + 1) % 4 === 0
      sessions.push({
        id: makeId('session'), week: week + 1, scheduledDate: isoDateFor(window.day, week, now), startTime: window.startTime,
        trainingType: type, title: titleFor(type, slot + week), goalRole: goalRole(profile.goal, type), durationMinutes: window.durationMinutes,
        intensity: recoveryWeek ? 'easy' : week === 0 || profile.experience === 'beginner' ? 'moderate' : 'challenging',
        requiredEquipment: built.equipment,
        rationale: [
          `${goalLabels[profile.goal]} benefits from this session's ${type} focus.`,
          `It fits your ${window.durationMinutes}-minute ${window.day} window and uses only selected equipment.`,
          recoveryWeek ? 'This is a planned easier week to manage accumulated fatigue.' : `Volume is scaled for ${profile.experience} experience and ${profile.recentConsistency} recent consistency.`,
        ],
        warnings: built.warnings, weatherSensitive: type === 'running', steps: built.steps, status: 'planned', adaptationHistory: [],
      })
    })
  }

  const plan: Plan = {
    id: makeId('plan'), profileId: profile.id, profileSnapshot: structuredClone(profile), plannerVersion: PLANNER_VERSION,
    catalogVersion: CATALOG_VERSION, seed, startDate: now.toISOString().slice(0, 10), durationWeeks: profile.planDurationWeeks,
    generatedAt: now.toISOString(), warnings: safety.warnings,
    sessions,
  }
  const validationErrors = validatePlan(plan)
  if (validationErrors.length) throw new Error(validationErrors.join(' '))
  return plan
}
