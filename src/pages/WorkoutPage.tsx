import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { CheckIcon, PauseIcon, PlayIcon } from '../components/Icons'
import { exercises, getExercise } from '../catalog'
import type { SessionRun } from '../domain'
import { exerciseIsAllowed } from '../engine/safety'
import { useAppState } from '../state/AppState'

function formatTimer(total = 0) {
  const minutes = Math.floor(total / 60).toString().padStart(2, '0')
  const seconds = Math.max(0, total % 60).toString().padStart(2, '0')
  return `${minutes}:${seconds}`
}

export function WorkoutPage() {
  const { sessionId } = useParams()
  const { profile, plan, runs, putRun, updateSession } = useAppState()
  const navigate = useNavigate()
  const session = plan?.sessions.find((item) => item.id === sessionId)
  const existingRun = runs.filter((item) => item.sessionId === sessionId && item.status !== 'completed').at(-1)
  const [run, setRun] = useState<SessionRun | undefined>(existingRun)
  const [playing, setPlaying] = useState(false)
  const [showEnd, setShowEnd] = useState(false)
  const started = useRef(false)
  const currentStep = session?.steps[run?.currentStepIndex ?? 0]
  const exercise = getExercise(currentStep?.exerciseId)

  const persist = useCallback(async (next: SessionRun) => { setRun(next); await putRun(next) }, [putRun])

  useEffect(() => {
    if (!session || started.current) return
    started.current = true
    const now = new Date().toISOString()
    const next = existingRun ?? { id: crypto.randomUUID(), sessionId: session.id, startedAt: now, lastActiveAt: now, currentStepIndex: 0, secondsRemaining: session.steps[0]?.durationSeconds, completedStepIds: [], status: 'in_progress' as const }
    void persist({ ...next, status: 'in_progress', lastActiveAt: now })
    if (session.status !== 'in_progress') void updateSession({ ...session, status: 'in_progress' })
  }, [session, existingRun, persist, updateSession])

  useEffect(() => {
    if (!playing || !run || !currentStep?.durationSeconds) return
    const timer = window.setInterval(() => {
      setRun((current) => {
        if (!current) return current
        const next = { ...current, secondsRemaining: Math.max(0, (current.secondsRemaining ?? currentStep.durationSeconds ?? 0) - 1), lastActiveAt: new Date().toISOString() }
        if (next.secondsRemaining === 0) setPlaying(false)
        return next
      })
    }, 1000)
    return () => window.clearInterval(timer)
  }, [playing, run?.currentStepIndex, currentStep?.durationSeconds])

  useEffect(() => {
    if (!run) return
    const save = () => void putRun({ ...run, status: run.status === 'completed' ? 'completed' : 'interrupted', lastActiveAt: new Date().toISOString() })
    window.addEventListener('beforeunload', save)
    document.addEventListener('visibilitychange', save)
    return () => { window.removeEventListener('beforeunload', save); document.removeEventListener('visibilitychange', save) }
  }, [run, putRun])

  const completeWorkout = async (current: SessionRun) => {
    if (!session) return
    const now = new Date().toISOString()
    await persist({ ...current, endedAt: now, lastActiveAt: now, status: 'completed' })
    await updateSession({ ...session, status: 'completed' })
    navigate('/history')
  }

  const next = async () => {
    if (!run || !session || !currentStep) return
    const completed = [...new Set([...run.completedStepIds, currentStep.id])]
    const nextIndex = run.currentStepIndex + 1
    if (nextIndex >= session.steps.length) return completeWorkout({ ...run, completedStepIds: completed })
    const nextRun = { ...run, completedStepIds: completed, currentStepIndex: nextIndex, secondsRemaining: session.steps[nextIndex].durationSeconds, lastActiveAt: new Date().toISOString(), status: 'in_progress' as const }
    setPlaying(false); await persist(nextRun)
  }

  const endEarly = async () => {
    if (!run || !session) return
    const now = new Date().toISOString()
    await persist({ ...run, endedAt: now, lastActiveAt: now, status: 'interrupted' })
    await updateSession({ ...session, status: 'interrupted' })
    navigate('/plan')
  }

  const alternative = useMemo(() => {
    if (!exercise || !profile) return undefined
    return exercises.find((item) => item.id !== exercise.id && item.substitutionGroup === exercise.substitutionGroup && exerciseIsAllowed(item, profile))
  }, [exercise, profile])
  const substitute = async () => {
    if (!alternative || !session || !currentStep) return
    const updated = { ...session, steps: session.steps.map((step) => step.id === currentStep.id ? { ...step, exerciseId: alternative.id, title: step.title.replace(exercise?.name ?? '', alternative.name), reps: alternative.reps, durationSeconds: alternative.workSeconds, cues: [...alternative.cues, alternative.caution] } : step), adaptationHistory: [...session.adaptationHistory, { id: crypto.randomUUID(), createdAt: new Date().toISOString(), type: 'other' as const, scope: 'session' as const, summary: `Substituted ${exercise?.name} with ${alternative.name}.` }] }
    await updateSession(updated)
  }

  if (!profile || !plan) return <Navigate to="/setup" replace />
  if (!session || !currentStep || !run) return <main className="loading-page"><span className="loader" /><p>Preparing your session…</p></main>
  const progress = Math.round(((run.currentStepIndex + 1) / session.steps.length) * 100)
  const isTimed = Boolean(currentStep.durationSeconds)

  return <section className="workout-page">
    <header className="workout-header"><div><span className="type-label">{session.trainingType}</span><strong>{session.title}</strong></div><div className="workout-progress"><span>{progress}%</span><div><i style={{ width: `${progress}%` }} /></div></div><button className="button ghost small" onClick={() => setShowEnd(true)}>End session</button></header>
    <main className="workout-stage">
      <div className="step-rail" aria-label="Workout steps">{session.steps.map((step, index) => <span key={step.id} className={index < run.currentStepIndex ? 'complete' : index === run.currentStepIndex ? 'active' : ''}>{index < run.currentStepIndex ? <CheckIcon /> : index + 1}</span>)}</div>
      <div className="active-step">
        <p className="eyebrow">{currentStep.kind} · step {run.currentStepIndex + 1} of {session.steps.length}</p>
        <h1>{currentStep.title}</h1>
        {currentStep.reps && <div className="rep-target">{currentStep.reps}</div>}
        {isTimed && profile.sessionMode === 'guided' && <button className={`timer-display ${playing ? 'running' : ''}`} onClick={() => setPlaying(!playing)} aria-label={playing ? 'Pause timer' : 'Start timer'}><span>{formatTimer(run.secondsRemaining ?? currentStep.durationSeconds)}</span><small>{playing ? <><PauseIcon /> Pause</> : <><PlayIcon /> {run.secondsRemaining === 0 ? 'Timer finished' : 'Start timer'}</>}</small></button>}
        <div className="cue-card"><span className="overline">Keep in mind</span><ul>{currentStep.cues.map((cue) => <li key={cue}>{cue}</li>)}</ul></div>
        {exercise?.resource && profile.instructionPreference !== 'written' && <a className="resource-link" href={exercise.resource.url} target="_blank" rel="noopener noreferrer">Open {exercise.resource.label} <span aria-hidden="true">↗</span><small>External site · opens a new tab</small></a>}
        <div className="workout-actions">{alternative && currentStep.kind === 'work' && <button className="button secondary" onClick={substitute}>Swap for {alternative.name}</button>}<button className="button primary large" onClick={next}>{run.currentStepIndex === session.steps.length - 1 ? 'Finish workout' : currentStep.kind === 'rest' ? 'Rest complete' : 'Complete step'} <CheckIcon /></button></div>
      </div>
      <aside className="up-next"><span className="overline">Up next</span>{session.steps[run.currentStepIndex + 1] ? <><strong>{session.steps[run.currentStepIndex + 1].title}</strong><small>{session.steps[run.currentStepIndex + 1].durationSeconds ? formatTimer(session.steps[run.currentStepIndex + 1].durationSeconds) : session.steps[run.currentStepIndex + 1].reps}</small></> : <><strong>Session complete</strong><small>Review and confirm your finish.</small></>}</aside>
    </main>
    {showEnd && <div className="modal-backdrop" role="presentation"><section className="modal" role="dialog" aria-modal="true" aria-labelledby="end-title"><h2 id="end-title">End before finishing?</h2><p>This will be saved as interrupted, not completed. You can resume or restart from your plan.</p><div><button className="button ghost" onClick={() => setShowEnd(false)}>Keep going</button><button className="button danger" onClick={endEarly}>End and save</button></div></section></div>}
  </section>
}
