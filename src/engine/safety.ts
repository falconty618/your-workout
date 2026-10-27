import type { Exercise, UserProfile } from '../domain'

export interface SafetyResult {
  canGenerate: boolean
  blocking: string[]
  warnings: string[]
}

export function evaluateProfileSafety(profile: UserProfile): SafetyResult {
  const blocking: string[] = []
  const warnings: string[] = []

  if (profile.currentPain) {
    blocking.push('Current pain needs to be assessed before an automatic plan can be created.')
  }
  if (profile.pregnancy) {
    warnings.push('Pregnancy can change exercise needs. Use this plan only after discussing exercise with a qualified healthcare professional.')
  }
  if (profile.healthNotes.trim()) {
    warnings.push('A disclosed health condition may require individual guidance beyond this general fitness planner.')
  }
  if (profile.medicationNotes.trim()) {
    warnings.push('Medication considerations may affect exercise response. Follow advice from a qualified professional.')
  }
  if (profile.injuryNotes.trim() && profile.restrictions.length === 0) {
    blocking.push('Choose at least one movement to avoid so the planner can respect the injury you described.')
  }
  if (!profile.availability.length) {
    blocking.push('Add at least one available workout window.')
  }

  return { canGenerate: blocking.length === 0, blocking, warnings }
}

export function exerciseIsAllowed(exercise: Exercise, profile: UserProfile): boolean {
  const equipmentAvailable = exercise.equipment.every((item) => profile.equipment.includes(item))
  const conflicts = exercise.restrictionTags.some((tag) => profile.restrictions.includes(tag))
  const levelRank = { beginner: 0, intermediate: 1, advanced: 2 }
  return equipmentAvailable && !conflicts && levelRank[exercise.level] <= levelRank[profile.experience]
}
