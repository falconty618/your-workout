import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { ArrowIcon, CloudIcon, ShieldIcon } from '../components/Icons'
import type { ChangeType, PlannedSession, WeatherSnapshot } from '../domain'
import { proposeAdaptation, type AdaptationProposal } from '../engine/adaptation'
import { fetchWeather } from '../engine/weather'
import { useAppState } from '../state/AppState'

const changes: Array<{ type: ChangeType; label: string; detail: string }> = [
  { type: 'fatigue', label: 'Low energy or fatigue', detail: 'Reduce intensity or total work' },
  { type: 'pain', label: 'New pain', detail: 'Stop conflicting recommendations' },
  { type: 'injury', label: 'New or changed injury', detail: 'Review future sessions too' },
  { type: 'equipment', label: 'Equipment unavailable', detail: 'Use bodyweight alternatives today' },
  { type: 'time', label: 'Less time available', detail: 'Keep essentials and shorten today' },
  { type: 'weather', label: 'Weather concern', detail: 'Review outdoor alternatives' },
  { type: 'other', label: 'Something else changed', detail: 'Record a caution before starting' },
]

export function CheckInPage() {
  const { sessionId } = useParams()
  const { profile, plan, updateSession } = useAppState()
  const navigate = useNavigate()
  const session = plan?.sessions.find((item) => item.id === sessionId)
  const [selected, setSelected] = useState<ChangeType>('none')
  const [proposal, setProposal] = useState<AdaptationProposal | null>(null)
  const [weather, setWeather] = useState<WeatherSnapshot>()
  const [weatherError, setWeatherError] = useState('')
  const [weatherLoading, setWeatherLoading] = useState(false)

  useEffect(() => {
    if (!session?.weatherSensitive || !profile?.location) return
    const controller = new AbortController(); setWeatherLoading(true)
    fetchWeather(profile.location, controller.signal).then(setWeather).catch((reason: unknown) => { if ((reason as Error).name !== 'AbortError') setWeatherError(reason instanceof Error ? reason.message : 'Weather unavailable.') }).finally(() => setWeatherLoading(false))
    return () => controller.abort()
  }, [session?.id, session?.weatherSensitive, profile?.location])

  if (!profile || !plan) return <Navigate to="/setup" replace />
  if (!session) return <Navigate to="/plan" replace />
  const start = () => navigate(`/session/${session.id}/workout`)
  const choose = (type: ChangeType) => { setSelected(type); setProposal(type === 'none' ? null : proposeAdaptation(type, session, profile)) }
  const apply = async () => {
    if (!proposal) return start()
    const updated = proposal.apply(session); await updateSession(updated)
    if (proposal.blocked) navigate('/setup'); else navigate(`/session/${session.id}/workout`)
  }
  const indoor = async () => {
    const weatherProposal = proposeAdaptation('weather', session, profile)
    if (weatherProposal) { await updateSession(weatherProposal.apply(session)); navigate(`/session/${session.id}/workout`) }
  }
  const reschedule = async () => {
    const current = new Date(`${session.scheduledDate}T12:00:00`)
    const candidates = profile.availability.map((window) => {
      const date = new Date(current); const target = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].indexOf(window.day)
      let distance = (target - date.getDay() + 7) % 7; if (distance === 0) distance = 7; date.setDate(date.getDate() + distance)
      return { window, date }
    }).sort((a, b) => a.date.getTime() - b.date.getTime())
    const target = candidates[0]
    if (!target) return
    const updated: PlannedSession = { ...session, scheduledDate: target.date.toISOString().slice(0, 10), startTime: target.window.startTime, durationMinutes: Math.min(session.durationMinutes, target.window.durationMinutes), adaptationHistory: [...session.adaptationHistory, { id: crypto.randomUUID(), createdAt: new Date().toISOString(), type: 'weather', scope: 'session', summary: `Moved to ${target.window.day} because of weather.` }] }
    await updateSession(updated); navigate('/plan')
  }

  const weatherNeedsChoice = session.weatherSensitive && (weather?.level !== 'normal' || weatherError)
  return <section className="page checkin-page">
    <Link to="/plan" className="back-link">← Back to plan</Link>
    <div className="checkin-grid">
      <div>
        <p className="eyebrow">Pre-workout check-in</p><h1>Has anything changed?</h1><p className="lede-small">A quick check keeps today’s recommendation relevant. You review every proposed change before it is applied.</p>
        {session.weatherSensitive && <section className={`weather-card ${weather?.level ?? ''}`}><CloudIcon /><div><span className="overline">Outdoor conditions · {profile.location?.label ?? 'No location set'}</span>{weatherLoading && <p>Checking current conditions…</p>}{weather && <><h2>{Math.round(weather.apparentTemperatureC)}°C feels-like · {Math.round(weather.windKph)} km/h wind</h2><p>{weather.level === 'normal' ? 'No configured caution threshold was crossed. Check actual local conditions before leaving.' : weather.reasons.join(' · ')}</p><small>Updated {new Date(weather.fetchedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. Forecast data can be delayed or inaccurate.</small></>}{weatherError && <><h2>Weather unavailable</h2><p>{weatherError} Choose an indoor alternative, postpone, or continue using your own assessment.</p></>}{!profile.location && <p>Add a location in setup, or choose how to proceed using your own assessment.</p>}</div></section>}
        {weatherNeedsChoice ? <div className="weather-choices"><h2>Choose today’s option</h2>{weather?.level !== 'severe' && <button className="choice-button" onClick={start}><span>Keep the outdoor session</span><small>I acknowledge the warning and will assess actual conditions.</small></button>}<button className="choice-button" onClick={indoor}><span>Replace with indoor cardio</span><small>Changes only this session.</small></button><button className="choice-button" onClick={reschedule}><span>Move to my next available window</span><small>Keeps the outdoor session and uses availability already provided.</small></button>{weather?.level === 'severe' && <p className="error-message">The outdoor option is blocked because a configured severe threshold was crossed.</p>}</div> : <>
          <button className={`all-good ${selected === 'none' ? 'selected' : ''}`} onClick={() => choose('none')}><ShieldIcon /><span><strong>Everything is fine</strong><small>Start the session as planned</small></span><ArrowIcon /></button>
          <div className="change-list">{changes.filter((item) => item.type !== 'weather' || session.weatherSensitive).map((item) => <button className={selected === item.type ? 'selected' : ''} key={item.type} onClick={() => choose(item.type)}><span><strong>{item.label}</strong><small>{item.detail}</small></span><span className="radio-dot" /></button>)}</div>
          {proposal && <section className={`proposal ${proposal.blocked ? 'blocked' : ''}`}><span className="overline">Proposed · {proposal.scope === 'session' ? 'Today only' : 'Current and future sessions'}</span><h2>{proposal.title}</h2><p>{proposal.explanation}</p><button className="button primary" onClick={apply}>{proposal.blocked ? 'Review safety profile' : 'Apply and continue'} <ArrowIcon /></button></section>}
          {!proposal && <button className="button primary full" onClick={start}>Start as planned <ArrowIcon /></button>}
        </>}
      </div>
      <aside className="today-card"><span className="type-label">Today’s session</span><h2>{session.title}</h2><p>{session.goalRole}</p><dl><div><dt>Time</dt><dd>{session.durationMinutes} min</dd></div><div><dt>Effort</dt><dd>{session.intensity}</dd></div><div><dt>Steps</dt><dd>{session.steps.filter((step) => step.kind === 'work').length} work blocks</dd></div></dl><details><summary>Session outline</summary><ol>{session.steps.filter((step) => step.kind !== 'rest').map((step) => <li key={step.id}>{step.title}</li>)}</ol></details></aside>
    </div>
  </section>
}
