import { describe, expect, it } from 'vitest'
import { exercises } from './catalog'

describe('exercise catalog', () => {
  it('has stable unique IDs and complete written guidance', () => {
    expect(new Set(exercises.map((exercise) => exercise.id)).size).toBe(exercises.length)
    exercises.forEach((exercise) => {
      expect(exercise.cues.length).toBeGreaterThanOrEqual(2)
      expect(exercise.caution.length).toBeGreaterThan(10)
      expect(exercise.estimatedMinutes).toBeGreaterThan(0)
    })
  })
})
