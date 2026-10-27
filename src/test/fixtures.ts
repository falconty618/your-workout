import type { Goal, UserProfile } from '../domain'

export function profileFixture(goal: Goal = 'general-fitness'): UserProfile {
  return {
    id: 'profile-test', createdAt: '2026-10-27T00:00:00.000Z', updatedAt: '2026-10-27T00:00:00.000Z',
    age: 32, sex: 'prefer-not-to-say', heightCm: 170, weightKg: 70, experience: 'beginner', recentConsistency: 'new',
    activityExperience: { strength: 'beginner', cardio: 'beginner', hiit: 'beginner', running: 'beginner' },
    goal, planDurationWeeks: 4,
    availability: [
      { day: 'Monday', startTime: '18:00', durationMinutes: 30 },
      { day: 'Wednesday', startTime: '18:00', durationMinutes: 35 },
      { day: 'Saturday', startTime: '09:00', durationMinutes: 45 },
    ],
    equipment: ['bodyweight', 'dumbbells', 'bands', 'treadmill', 'bike'],
    currentPain: false, injuryNotes: '', healthNotes: '', medicationNotes: '', pregnancy: false, restrictions: [],
    sessionMode: 'guided', instructionPreference: 'both', disclaimerAcceptedAt: '2026-10-27T00:00:00.000Z', disclaimerVersion: '1.0',
  }
}
