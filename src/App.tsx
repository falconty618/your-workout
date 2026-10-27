import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { useAppState } from './state/AppState'
import { WelcomePage } from './pages/WelcomePage'
import { SetupPage } from './pages/SetupPage'
import { PlanPage } from './pages/PlanPage'
import { CheckInPage } from './pages/CheckInPage'
import { WorkoutPage } from './pages/WorkoutPage'
import { HistoryPage } from './pages/HistoryPage'
import { SettingsPage } from './pages/SettingsPage'

export function App() {
  const { loading, error, profile } = useAppState()
  if (loading) return <main className="loading-page"><span className="loader" /><p>Opening your plan…</p></main>
  if (error) return <main className="center-page"><section className="panel narrow"><p className="eyebrow danger-text">Storage unavailable</p><h1>Your browser could not open local data.</h1><p>{error}</p></section></main>
  return <Routes>
    <Route path="/" element={profile ? <Navigate to="/plan" replace /> : <WelcomePage />} />
    <Route path="/setup" element={<SetupPage />} />
    <Route element={<AppShell />}>
      <Route path="/plan" element={<PlanPage />} />
      <Route path="/session/:sessionId/check-in" element={<CheckInPage />} />
      <Route path="/session/:sessionId/workout" element={<WorkoutPage />} />
      <Route path="/history" element={<HistoryPage />} />
      <Route path="/settings" element={<SettingsPage />} />
    </Route>
    <Route path="*" element={<Navigate to={profile ? '/plan' : '/'} replace />} />
  </Routes>
}
