import { describe, expect, it } from 'vitest'
import { profileFixture } from '../test/fixtures'
import { generatePlan } from './planner'
import { proposeAdaptation, validateAdaptedSession } from './adaptation'

const session = generatePlan(profileFixture(), 12, new Date('2026-10-27T12:00:00.000Z')).sessions[0]

describe('adaptation scope', () => {
  it('keeps time and equipment changes session-only', () => {
    expect(proposeAdaptation('time', session)?.scope).toBe('session')
    expect(proposeAdaptation('equipment', session)?.scope).toBe('session')
  })

  it('blocks starting when new pain or injury is reported', () => {
    expect(proposeAdaptation('pain', session)).toMatchObject({ scope: 'future', blocked: true })
    expect(proposeAdaptation('injury', session)).toMatchObject({ scope: 'future', blocked: true })
  })

  it('preserves warm-up and cool-down when time is reduced', () => {
    const updated = proposeAdaptation('time', session)!.apply(session)
    expect(updated.steps[0].kind).toBe('warmup')
    expect(updated.steps.at(-1)?.kind).toBe('cooldown')
  })

  it('builds valid work steps when equipment or weather changes', () => {
    const profile = profileFixture('running-performance')
    const running = generatePlan(profile, 12, new Date('2026-10-27T12:00:00.000Z')).sessions.find((item) => item.trainingType === 'running')!
    const indoor = proposeAdaptation('weather', running, profile)!.apply(running)
    expect(indoor.weatherSensitive).toBe(false)
    expect(indoor.steps.some((step) => step.kind === 'work')).toBe(true)
    expect(validateAdaptedSession(indoor, profile)).toEqual([])

    const bodyweight = proposeAdaptation('equipment', session, profile)!.apply(session)
    expect(bodyweight.steps.some((step) => step.kind === 'work')).toBe(true)
    expect(bodyweight.requiredEquipment).toEqual(['bodyweight'])
  })
})
