import { Navigate } from 'react-router-dom'
import { CheckIcon, HistoryIcon } from '../components/Icons'
import { useAppState } from '../state/AppState'

export function HistoryPage() {
  const { profile, plan, runs } = useAppState()
  if (!profile) return <Navigate to="/setup" replace />
  const finished = runs.filter((item) => item.status === 'completed' || item.status === 'interrupted').sort((a, b) => b.lastActiveAt.localeCompare(a.lastActiveAt))
  const completed = finished.filter((item) => item.status === 'completed').length
  const minutes = finished.reduce((total, run) => total + Math.max(0, Math.round((new Date(run.endedAt ?? run.lastActiveAt).getTime() - new Date(run.startedAt).getTime()) / 60000)), 0)
  return <section className="page history-page">
    <header className="page-heading"><div><p className="eyebrow">Local completion history</p><h1>Work you’ve done.</h1><p>Completed and interrupted sessions are kept distinct. Detailed performance feedback comes later.</p></div></header>
    <div className="history-stats"><article><strong>{completed}</strong><span>completed sessions</span></article><article><strong>{finished.length - completed}</strong><span>interrupted sessions</span></article><article><strong>{minutes}</strong><span>minutes recorded</span></article></div>
    {!finished.length ? <div className="empty-state"><HistoryIcon /><h2>Your history starts after session one.</h2><p>Closing or ending early records an interrupted session so progress is never overstated.</p></div> : <div className="history-list">{finished.map((run) => { const session = plan?.sessions.find((item) => item.id === run.sessionId); return <article key={run.id}><span className={`history-icon ${run.status}`}>{run.status === 'completed' ? <CheckIcon /> : '!'}</span><div><span className="overline">{new Date(run.startedAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span><h2>{session?.title ?? 'Workout session'}</h2><p>{run.completedStepIds.length} steps recorded · {run.status}</p></div><time>{new Date(run.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time></article> })}</div>}
  </section>
}
