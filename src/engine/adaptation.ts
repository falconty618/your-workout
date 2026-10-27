import { exercises, getExercise } from '../catalog'
import type { AdaptationRecord, ChangeType, Exercise, PlannedSession, SessionStep, UserProfile } from '../domain'
import { exerciseIsAllowed } from './safety'

export interface AdaptationProposal {
  type: ChangeType
  scope: 'session' | 'future'
  title: string
  explanation: string
  blocked?: boolean
  apply(session: PlannedSession): PlannedSession
}

function stepsFromExercises(session: PlannedSession, selected: Exercise[]): SessionStep[] {
  const warmup = session.steps.find((step) => step.kind === 'warmup')!
  const cooldown = session.steps.find((step) => step.kind === 'cooldown')!
  const work: SessionStep[] = []
  selected.forEach((exercise) => {
    const sets = Math.min(2, exercise.sets)
    for (let set = 1; set <= sets; set += 1) {
      work.push({ id: crypto.randomUUID(), kind: 'work', exerciseId: exercise.id, title: `${exercise.name} · set ${set} of ${sets}`, reps: exercise.reps, durationSeconds: exercise.workSeconds, cues: [...exercise.cues, exercise.caution] })
      if (exercise.restSeconds && set < sets) work.push({ id: crypto.randomUUID(), kind: 'rest', title: 'Recover', durationSeconds: exercise.restSeconds, cues: ['Breathe steadily. Add more rest if you need it.'] })
    }
  })
  return [warmup, ...work, cooldown]
}

function safeBodyweight(profile: UserProfile | undefined, types: Exercise['trainingTypes']) {
  const adjusted = profile ? { ...profile, equipment: ['bodyweight'] as UserProfile['equipment'] } : undefined
  return exercises.filter((exercise) => exercise.equipment.every((item) => item === 'bodyweight') && exercise.trainingTypes.some((type) => types.includes(type)) && (!adjusted || exerciseIsAllowed(exercise, adjusted)))
}

export function validateAdaptedSession(session: PlannedSession, profile: UserProfile): string[] {
  const errors: string[] = []
  session.steps.forEach((step) => {
    const exercise = getExercise(step.exerciseId)
    if (exercise && !exerciseIsAllowed(exercise, profile)) errors.push(`${exercise.name} conflicts with current profile constraints.`)
  })
  session.requiredEquipment.forEach((item) => { if (!profile.equipment.includes(item) && item !== 'bodyweight') errors.push(`Unavailable equipment: ${item}.`) })
  if (!session.steps.some((step) => step.kind === 'work')) errors.push('Adapted session has no work steps.')
  return errors
}

export function proposeAdaptation(type: ChangeType, session: PlannedSession, profile?: UserProfile): AdaptationProposal | null {
  if (type === 'none') return null
  const base = (scope: 'session' | 'future', title: string, explanation: string, transform: (session: PlannedSession) => PlannedSession, blocked = false): AdaptationProposal => ({ type, scope, title, explanation, blocked, apply: transform })
  const record = (scope: 'session' | 'future', summary: string): AdaptationRecord => ({ id: crypto.randomUUID(), createdAt: new Date().toISOString(), type, scope, summary })

  if (type === 'time') return base('session', 'Shorten today’s session', 'Warm-up and cool-down stay in place. Accessory work is reduced for this session only.', (current) => ({ ...current, durationMinutes: Math.max(15, Math.round(current.durationMinutes * 0.7)), steps: [current.steps[0], ...current.steps.filter((step) => step.kind === 'work').slice(0, 3), current.steps[current.steps.length - 1]], adaptationHistory: [...current.adaptationHistory, record('session', 'Reduced today’s session to essential work.')] }))
  if (type === 'fatigue') return base('session', 'Use an easier session today', 'Intensity and total work are reduced. You can reassess before the next session.', (current) => ({ ...current, intensity: 'easy', steps: current.steps.filter((_, index) => index % 3 !== 2 || index === current.steps.length - 1), adaptationHistory: [...current.adaptationHistory, record('session', 'Reduced intensity and volume for fatigue.')] }))
  if (type === 'equipment') return base('session', 'Switch to a bodyweight session', 'Today’s equipment-dependent steps are replaced with compatible bodyweight movements. This does not alter future sessions.', (current) => {
    const candidates = safeBodyweight(profile, current.trainingType === 'strength' ? ['strength'] : ['cardio', 'hiit']).slice(0, 3)
    return { ...current, title: 'Bodyweight alternative', requiredEquipment: ['bodyweight'], steps: stepsFromExercises(current, candidates), adaptationHistory: [...current.adaptationHistory, record('session', 'Used bodyweight-only alternatives today.')] }
  })
  if (type === 'weather') return base('session', 'Replace the outdoor session indoors', 'Weather affects this session only. A compatible indoor cardio session will be used.', (current) => {
    const indoorProfile: UserProfile | undefined = profile ? { ...profile, equipment: profile.equipment.includes('bodyweight') ? profile.equipment : [...profile.equipment, 'bodyweight'] } : undefined
    const indoor = exercises.filter((exercise) => exercise.trainingTypes.includes('cardio') && !exercise.restrictionTags.includes('running') && (!indoorProfile || exerciseIsAllowed(exercise, indoorProfile))).slice(0, 2)
    return { ...current, title: 'Indoor cardio alternative', trainingType: 'cardio', requiredEquipment: [...new Set(indoor.flatMap((exercise) => exercise.equipment))], steps: stepsFromExercises(current, indoor), weatherSensitive: false, intensity: 'moderate', adaptationHistory: [...current.adaptationHistory, record('session', 'Replaced outdoor session because of weather.')] }
  })
  if (type === 'pain') return base('future', 'Stop and reassess pain', 'Starting this session is blocked. Conflicting movements should be removed from this and future sessions after your profile is updated.', (current) => ({ ...current, warnings: [...current.warnings, 'Blocked because new pain was reported. Update your safety profile before continuing.'], adaptationHistory: [...current.adaptationHistory, record('future', 'Blocked due to new pain.')] }), true)
  if (type === 'injury') return base('future', 'Update your safety profile first', 'A new or changed injury can affect the remaining plan. Automatic start is blocked until restrictions are reviewed.', (current) => ({ ...current, warnings: [...current.warnings, 'Blocked until the changed injury and movement restrictions are reviewed.'], adaptationHistory: [...current.adaptationHistory, record('future', 'Blocked due to changed injury.')] }), true)
  return base('session', 'Review today before starting', 'No automatic change is safe from this description. Review the session and use your own judgment.', (current) => ({ ...current, warnings: [...current.warnings, 'An unclassified change was reported before this session.'], adaptationHistory: [...current.adaptationHistory, record('session', 'Recorded another relevant change.')] }))
}
