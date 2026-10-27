import { Link, Navigate } from 'react-router-dom'
import { CalendarIcon, CheckIcon, PlayIcon } from '../components/Icons'
import { equipmentLabels, goalLabels, type PlannedSession } from '../domain'
import { useAppState } from '../state/AppState'

function formatDate(value: string) {
  return new Date(`${value}T12:00:00`).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
}

function SessionCard({ session }: { session: PlannedSession }) {
  return <article className={`session-card type-${session.trainingType}`}>
    <div className="session-date"><span>{formatDate(session.scheduledDate).split(',')[0]}</span><strong>{new Date(`${session.scheduledDate}T12:00:00`).getDate()}</strong><small>{session.startTime}</small></div>
    <div className="session-body">
      <div className="session-title-row"><div><span className="type-label">{session.trainingType}</span><h3>{session.title}</h3></div><span className={`status status-${session.status}`}>{session.status.replace('_', ' ')}</span></div>
      <div className="session-meta"><span>{session.durationMinutes} min</span><span>{session.intensity}</span><span>{session.requiredEquipment.map((item) => equipmentLabels[item]).join(', ') || 'No equipment'}</span></div>
      <details className="rationale"><summary>Why this session fits</summary><ul>{session.rationale.map((reason) => <li key={reason}>{reason}</li>)}</ul>{session.warnings.map((warning) => <p className="warning-copy" key={warning}>{warning}</p>)}</details>
    </div>
    <Link className="session-action" to={`/session/${session.id}/check-in`} aria-label={`${session.status === 'completed' ? 'Review' : 'Start'} ${session.title}`}>{session.status === 'completed' ? <CheckIcon /> : <PlayIcon />}</Link>
  </article>
}

export function PlanPage() {
  const { profile, plan } = useAppState()
  if (!profile) return <Navigate to="/setup" replace />
  if (!plan) return <section className="page"><div className="empty-state"><CalendarIcon /><h1>No plan yet</h1><p>Finish setup to create a plan around your week.</p><Link className="button primary" to="/setup">Build my plan</Link></div></section>
  const completed = plan.sessions.filter((item) => item.status === 'completed').length
  const next = plan.sessions.find((item) => item.status !== 'completed')
  return <section className="page plan-page">
    <header className="page-heading"><div><p className="eyebrow">{goalLabels[profile.goal]} · {plan.durationWeeks} weeks</p><h1>Your plan, at a glance.</h1><p>Every session fits a time you chose. Open “why” to see the reasoning behind it.</p></div><Link className="button secondary" to="/setup">Review setup</Link></header>
    <div className="plan-summary">
      <div className="progress-ring" style={{ '--progress': `${Math.round((completed / plan.sessions.length) * 360)}deg` } as React.CSSProperties}><span><strong>{completed}</strong><small>of {plan.sessions.length}</small></span></div>
      <div><span className="overline">Plan progress</span><h2>{completed ? 'Momentum is building.' : 'Your first session is ready.'}</h2><p>{next ? `Up next: ${next.title} on ${formatDate(next.scheduledDate)}.` : 'You completed every planned session.'}</p></div>
      {next && <Link className="button primary" to={`/session/${next.id}/check-in`}>Check in & start <PlayIcon /></Link>}
    </div>
    {plan.warnings.length > 0 && <aside className="plan-warnings"><strong>Plan notes</strong>{plan.warnings.map((warning) => <p key={warning}>{warning}</p>)}</aside>}
    <div className="weeks">{Array.from({ length: plan.durationWeeks }, (_, week) => <section className="week" key={week}><div className="week-heading"><span>0{week + 1}</span><div><h2>Week {week + 1}</h2><p>{week === 0 ? 'Start with control. Leave room to learn.' : (week + 1) % 4 === 0 ? 'A lighter week to absorb the work.' : 'Build gradually on the previous week.'}</p></div></div><div className="session-list">{plan.sessions.filter((item) => item.week === week + 1).map((session) => <SessionCard key={session.id} session={session} />)}</div></section>)}</div>
    <p className="version-note">Planner {plan.plannerVersion} · Catalog {plan.catalogVersion} · Seed {plan.seed}</p>
  </section>
}
