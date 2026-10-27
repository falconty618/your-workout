import { describe, expect, it } from 'vitest'
import { exercises } from '../catalog'
import { GOALS, type UserProfile } from '../domain'
import { profileFixture } from '../test/fixtures'
import { generatePlan, validatePlan } from './planner'

const fixedDate = new Date('2026-10-27T12:00:00.000Z')

describe('deterministic planner', () => {
  it.each(GOALS)('generates a valid plan for %s', (goal) => {
    const profile = profileFixture(goal)
    const plan = generatePlan(profile, 42, fixedDate)
    expect(plan.sessions).toHaveLength(profile.availability.length * profile.planDurationWeeks)
    expect(validatePlan(plan)).toEqual([])
    expect(plan.sessions.every((session) => session.rationale.length >= 2)).toBe(true)
  })

  it('reproduces the same plan for the same normalized inputs and seed', () => {
    const profile = profileFixture('strength')
    expect(generatePlan(profile, 918, fixedDate)).toEqual(generatePlan(profile, 918, fixedDate))
  })

  it('never includes unavailable equipment or restricted movements', () => {
    const profile: UserProfile = { ...profileFixture(), equipment: ['bodyweight'], restrictions: ['deep-knee-flexion'] }
    const plan = generatePlan(profile, 9, fixedDate)
    const used = plan.sessions.flatMap((session) => session.steps.map((step) => exercises.find((exercise) => exercise.id === step.exerciseId)).filter(Boolean))
    expect(used.every((exercise) => exercise!.equipment.every((item) => item === 'bodyweight'))).toBe(true)
    expect(used.every((exercise) => !exercise!.restrictionTags.includes('deep-knee-flexion'))).toBe(true)
  })

  it('schedules only on provided days and within duration', () => {
    const profile = profileFixture()
    const plan = generatePlan(profile, 3, fixedDate)
    const allowed = new Map(profile.availability.map((window) => [window.day, window.durationMinutes]))
    plan.sessions.forEach((session) => {
      const day = new Date(`${session.scheduledDate}T12:00:00`).toLocaleDateString('en-US', { weekday: 'long' })
      expect(allowed.has(day as never)).toBe(true)
      expect(session.durationMinutes).toBeLessThanOrEqual(allowed.get(day as never)!)
    })
  })
})
