import { describe, expect, it } from 'vitest'
import { exercises } from '../catalog'
import { profileFixture } from '../test/fixtures'
import { evaluateProfileSafety, exerciseIsAllowed } from './safety'

describe('profile safety', () => {
  it('blocks automatic planning for current pain', () => {
    const profile = { ...profileFixture(), currentPain: true }
    expect(evaluateProfileSafety(profile).canGenerate).toBe(false)
  })

  it('requires a concrete avoided movement when an injury is described', () => {
    const profile = { ...profileFixture(), injuryNotes: 'Old knee injury', restrictions: [] }
    expect(evaluateProfileSafety(profile).blocking.join(' ')).toMatch(/movement to avoid/i)
  })

  it('filters unavailable equipment and restricted movement tags', () => {
    const squat = exercises.find((exercise) => exercise.id === 'db-goblet-squat')!
    expect(exerciseIsAllowed(squat, { ...profileFixture(), equipment: ['bodyweight'] })).toBe(false)
    expect(exerciseIsAllowed(squat, { ...profileFixture(), restrictions: ['deep-knee-flexion'] })).toBe(false)
  })
})
