import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Plan, PlannedSession, SessionRun, UserProfile } from '../domain'
import * as repository from '../storage/database'

interface AppStateValue {
  loading: boolean
  error?: string
  profile?: UserProfile
  plan?: Plan
  runs: SessionRun[]
  putProfile(profile: UserProfile): Promise<void>
  putPlan(plan: Plan): Promise<void>
  updateSession(session: PlannedSession): Promise<void>
  putRun(run: SessionRun): Promise<void>
  erase(): Promise<void>
}

const AppStateContext = createContext<AppStateValue | null>(null)

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>()
  const [profile, setProfile] = useState<UserProfile>()
  const [plan, setPlan] = useState<Plan>()
  const [runs, setRuns] = useState<SessionRun[]>([])

  useEffect(() => {
    Promise.all([repository.loadLatestProfile(), repository.loadLatestPlan(), repository.loadRuns()])
      .then(([nextProfile, nextPlan, nextRuns]) => {
        setProfile(nextProfile); setPlan(nextPlan); setRuns(nextRuns)
      })
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Local data could not be opened.'))
      .finally(() => setLoading(false))
  }, [])

  const putProfile = useCallback(async (value: UserProfile) => {
    await repository.saveProfile(value); setProfile(value)
  }, [])
  const putPlan = useCallback(async (value: Plan) => {
    await repository.savePlan(value); setPlan(value)
  }, [])
  const updateSession = useCallback(async (session: PlannedSession) => {
    if (!plan) return
    const next = { ...plan, sessions: plan.sessions.map((item) => item.id === session.id ? session : item) }
    await repository.savePlan(next); setPlan(next)
  }, [plan])
  const putRun = useCallback(async (run: SessionRun) => {
    await repository.saveRun(run)
    setRuns((current) => [...current.filter((item) => item.id !== run.id), run].sort((a, b) => a.lastActiveAt.localeCompare(b.lastActiveAt)))
  }, [])
  const erase = useCallback(async () => {
    await repository.eraseAllData(); setProfile(undefined); setPlan(undefined); setRuns([])
  }, [])

  const value = useMemo(() => ({ loading, error, profile, plan, runs, putProfile, putPlan, updateSession, putRun, erase }), [loading, error, profile, plan, runs, putProfile, putPlan, updateSession, putRun, erase])
  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
}

export function useAppState() {
  const value = useContext(AppStateContext)
  if (!value) throw new Error('useAppState must be used inside AppStateProvider')
  return value
}
