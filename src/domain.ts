export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const
export type DayOfWeek = (typeof DAYS)[number]

export const GOALS = ['general-fitness', 'weight-loss', 'muscle-gain', 'strength', 'endurance', 'running-performance'] as const
export type Goal = (typeof GOALS)[number]
export type Experience = 'beginner' | 'intermediate' | 'advanced'
export type TrainingType = 'strength' | 'cardio' | 'hiit' | 'running'
export type Equipment = 'bodyweight' | 'dumbbells' | 'bands' | 'kettlebells' | 'barbells' | 'machines' | 'treadmill' | 'bike'
export type RestrictionTag = 'knee-impact' | 'deep-knee-flexion' | 'overhead' | 'shoulder-load' | 'spinal-load' | 'wrist-load' | 'running' | 'jumping'

export interface AvailabilityWindow {
  day: DayOfWeek
  startTime: string
  durationMinutes: number
}

export interface LocationPreference {
  source: 'browser' | 'manual'
  label: string
  latitude: number
  longitude: number
  updatedAt: string
}

export interface UserProfile {
  id: string
  createdAt: string
  updatedAt: string
  age: number
  sex: 'female' | 'male' | 'intersex' | 'prefer-not-to-say'
  heightCm: number
  weightKg: number
  experience: Experience
  recentConsistency: 'new' | 'inconsistent' | 'consistent'
  activityExperience: Record<TrainingType, Experience>
  goal: Goal
  planDurationWeeks: number
  availability: AvailabilityWindow[]
  equipment: Equipment[]
  currentPain: boolean
  injuryNotes: string
  healthNotes: string
  medicationNotes: string
  pregnancy: boolean
  restrictions: RestrictionTag[]
  location?: LocationPreference
  sessionMode: 'guided' | 'plan-only'
  instructionPreference: 'written' | 'external' | 'both'
  disclaimerAcceptedAt: string
  disclaimerVersion: '1.0'
}

export interface Exercise {
  id: string
  name: string
  trainingTypes: TrainingType[]
  equipment: Equipment[]
  level: Experience
  patterns: string[]
  primaryMuscles: string[]
  restrictionTags: RestrictionTag[]
  substitutionGroup: string
  cues: string[]
  caution: string
  sets: number
  reps?: string
  workSeconds?: number
  restSeconds: number
  estimatedMinutes: number
  resource?: { label: string; url: string }
}

export type StepKind = 'warmup' | 'work' | 'rest' | 'cooldown'
export interface SessionStep {
  id: string
  kind: StepKind
  title: string
  exerciseId?: string
  durationSeconds?: number
  reps?: string
  cues: string[]
  completed?: boolean
}

export interface PlannedSession {
  id: string
  week: number
  scheduledDate: string
  startTime: string
  trainingType: TrainingType
  title: string
  goalRole: string
  durationMinutes: number
  intensity: 'easy' | 'moderate' | 'challenging'
  requiredEquipment: Equipment[]
  rationale: string[]
  warnings: string[]
  weatherSensitive: boolean
  steps: SessionStep[]
  status: 'planned' | 'in_progress' | 'interrupted' | 'completed' | 'skipped'
  adaptationHistory: AdaptationRecord[]
}

export interface Plan {
  id: string
  profileId: string
  profileSnapshot: UserProfile
  plannerVersion: '1.0.0'
  catalogVersion: '1.0.0'
  seed: number
  startDate: string
  durationWeeks: number
  generatedAt: string
  warnings: string[]
  sessions: PlannedSession[]
}

export type ChangeType = 'none' | 'fatigue' | 'pain' | 'injury' | 'equipment' | 'time' | 'weather' | 'other'
export interface AdaptationRecord {
  id: string
  createdAt: string
  type: ChangeType
  scope: 'session' | 'future'
  summary: string
}

export interface SessionRun {
  id: string
  sessionId: string
  startedAt: string
  lastActiveAt: string
  endedAt?: string
  currentStepIndex: number
  secondsRemaining?: number
  completedStepIds: string[]
  status: 'in_progress' | 'paused' | 'interrupted' | 'completed'
}

export interface WeatherSnapshot {
  fetchedAt: string
  temperatureC: number
  apparentTemperatureC: number
  precipitationMm: number
  windKph: number
  weatherCode: number
  level: 'normal' | 'caution' | 'severe'
  reasons: string[]
}

export const goalLabels: Record<Goal, string> = {
  'general-fitness': 'General fitness',
  'weight-loss': 'Weight loss',
  'muscle-gain': 'Muscle gain',
  strength: 'Strength',
  endurance: 'Endurance',
  'running-performance': 'Running performance',
}

export const equipmentLabels: Record<Equipment, string> = {
  bodyweight: 'Bodyweight',
  dumbbells: 'Dumbbells',
  bands: 'Resistance bands',
  kettlebells: 'Kettlebells',
  barbells: 'Barbells & plates',
  machines: 'Machines / cables',
  treadmill: 'Treadmill',
  bike: 'Stationary bike',
}
