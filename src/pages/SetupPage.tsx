import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowIcon, BoltIcon, CheckIcon, ShieldIcon } from '../components/Icons'
import { DAYS, GOALS, equipmentLabels, goalLabels, type AvailabilityWindow, type Equipment, type RestrictionTag, type TrainingType, type UserProfile } from '../domain'
import { generatePlan } from '../engine/planner'
import { evaluateProfileSafety } from '../engine/safety'
import { searchLocation } from '../engine/weather'
import { useAppState } from '../state/AppState'

const steps = ['Safety', 'About you', 'Your goal', 'Your week', 'Equipment', 'Preferences']
const allEquipment = Object.keys(equipmentLabels) as Equipment[]
const restrictionOptions: Array<{ value: RestrictionTag; label: string }> = [
  { value: 'knee-impact', label: 'Impact through knees' }, { value: 'deep-knee-flexion', label: 'Deep knee bend' },
  { value: 'overhead', label: 'Overhead movement' }, { value: 'shoulder-load', label: 'Shoulder loading' },
  { value: 'spinal-load', label: 'Back / spinal loading' }, { value: 'wrist-load', label: 'Weight through wrists' },
  { value: 'running', label: 'Running' }, { value: 'jumping', label: 'Jumping' },
]

function initialProfile(): UserProfile {
  const now = new Date().toISOString()
  return {
    id: crypto.randomUUID(), createdAt: now, updatedAt: now, age: 30, sex: 'prefer-not-to-say', heightCm: 170, weightKg: 70,
    experience: 'beginner', recentConsistency: 'new', activityExperience: { strength: 'beginner', cardio: 'beginner', hiit: 'beginner', running: 'beginner' },
    goal: 'general-fitness', planDurationWeeks: 4, availability: [{ day: 'Monday', startTime: '18:00', durationMinutes: 35 }],
    equipment: ['bodyweight'], currentPain: false, injuryNotes: '', healthNotes: '', medicationNotes: '', pregnancy: false,
    restrictions: [], sessionMode: 'guided', instructionPreference: 'both', disclaimerAcceptedAt: '', disclaimerVersion: '1.0',
  }
}

export function SetupPage() {
  const { profile: saved, putProfile, putPlan } = useAppState()
  const [profile, setProfile] = useState<UserProfile>(() => saved ? structuredClone(saved) : initialProfile())
  const [step, setStep] = useState(0)
  const [accepted, setAccepted] = useState(Boolean(saved?.disclaimerAcceptedAt))
  const [error, setError] = useState('')
  const [locationQuery, setLocationQuery] = useState(saved?.location?.label ?? '')
  const [locationStatus, setLocationStatus] = useState('')
  const navigate = useNavigate()

  const safety = useMemo(() => evaluateProfileSafety(profile), [profile])
  const patch = <K extends keyof UserProfile>(key: K, value: UserProfile[K]) => setProfile((current) => ({ ...current, [key]: value, updatedAt: new Date().toISOString() }))
  const toggleArray = <T,>(items: T[], value: T) => items.includes(value) ? items.filter((item) => item !== value) : [...items, value]
  const setDay = (day: typeof DAYS[number], enabled: boolean) => {
    const current = profile.availability
    patch('availability', enabled ? [...current, { day, startTime: '18:00', durationMinutes: 35 }] : current.filter((item) => item.day !== day))
  }
  const setWindow = (day: typeof DAYS[number], field: keyof AvailabilityWindow, value: string | number) => patch('availability', profile.availability.map((item) => item.day === day ? { ...item, [field]: value } : item))
  const next = () => {
    setError('')
    if (step === 0 && !accepted) return setError('Please acknowledge the safety information to continue.')
    if (step === 3 && !profile.availability.length) return setError('Choose at least one available day.')
    setStep((value) => Math.min(steps.length - 1, value + 1)); window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const finish = async () => {
    const finalProfile = { ...profile, disclaimerAcceptedAt: profile.disclaimerAcceptedAt || new Date().toISOString(), updatedAt: new Date().toISOString() }
    const result = evaluateProfileSafety(finalProfile)
    if (!result.canGenerate) { setError(result.blocking.join(' ')); return }
    try {
      const plan = generatePlan(finalProfile)
      await putProfile(finalProfile); await putPlan(plan); navigate('/plan')
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'The plan could not be generated.') }
  }
  const findLocation = async () => {
    setLocationStatus('Searching…')
    try { const location = await searchLocation(locationQuery); patch('location', location); setLocationQuery(location.label); setLocationStatus('Location saved for weather checks.') }
    catch (reason) { setLocationStatus(reason instanceof Error ? reason.message : 'Location search failed.') }
  }
  const useBrowserLocation = () => {
    setLocationStatus('Requesting browser location…')
    navigator.geolocation.getCurrentPosition((position) => {
      patch('location', { source: 'browser', label: 'Approximate browser location', latitude: Number(position.coords.latitude.toFixed(2)), longitude: Number(position.coords.longitude.toFixed(2)), updatedAt: new Date().toISOString() })
      setLocationQuery('Approximate browser location'); setLocationStatus('Location saved with reduced precision.')
    }, () => setLocationStatus('Location permission was denied. Manual entry remains available.'), { enableHighAccuracy: false, timeout: 8000 })
  }

  return <main className="setup-page">
    <header className="setup-header"><Link to="/" className="brand"><span className="brand-mark"><BoltIcon /></span>Your Workout</Link><span>Setup · about 4 minutes</span></header>
    <div className="setup-progress"><div style={{ width: `${((step + 1) / steps.length) * 100}%` }} /><span>Step {step + 1} of {steps.length}</span></div>
    <section className="setup-layout">
      <aside className="step-list" aria-label="Setup progress">{steps.map((label, index) => <button key={label} className={index === step ? 'active' : index < step ? 'done' : ''} onClick={() => index < step && setStep(index)} disabled={index > step}><span>{index < step ? <CheckIcon /> : index + 1}</span>{label}</button>)}</aside>
      <form className="setup-form" onSubmit={(event) => event.preventDefault()}>
        {step === 0 && <fieldset><legend><span className="eyebrow">Start safely</span>Before we build your plan</legend><p className="section-intro">Your answers filter movements and may block automatic planning. They are stored only in this browser.</p>
          <div className="safety-banner"><ShieldIcon /><p><strong>General fitness guidance only.</strong> This app does not replace medical advice, diagnosis, rehabilitation, or treatment. Stop exercising for pain, dizziness, faintness, unusual shortness of breath, or other concerning symptoms.</p></div>
          <label className="switch-row"><span><strong>Are you in pain right now?</strong><small>Current pain blocks automatic planning.</small></span><input type="checkbox" checked={profile.currentPain} onChange={(e) => patch('currentPain', e.target.checked)} /></label>
          <label>Existing injury or limitation<textarea value={profile.injuryNotes} onChange={(e) => patch('injuryNotes', e.target.value)} placeholder="Optional—describe only what matters for exercise" /></label>
          <label>Health condition relevant to exercise<textarea value={profile.healthNotes} onChange={(e) => patch('healthNotes', e.target.value)} placeholder="Optional" /></label>
          <div className="two-col"><label>Medication consideration<textarea value={profile.medicationNotes} onChange={(e) => patch('medicationNotes', e.target.value)} placeholder="Optional" /></label><label className="check-card"><input type="checkbox" checked={profile.pregnancy} onChange={(e) => patch('pregnancy', e.target.checked)} /><span><strong>Pregnancy applies</strong><small>This adds a conservative warning.</small></span></label></div>
          <div><span className="field-label">Movements or activities to avoid</span><div className="chip-grid">{restrictionOptions.map((option) => <label className="choice-chip" key={option.value}><input type="checkbox" checked={profile.restrictions.includes(option.value)} onChange={() => patch('restrictions', toggleArray(profile.restrictions, option.value))} /><span>{option.label}</span></label>)}</div></div>
          <label className="acknowledge"><input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} /><span>I understand my own condition and will seek qualified medical advice when appropriate.</span></label>
        </fieldset>}

        {step === 1 && <fieldset><legend><span className="eyebrow">About you</span>Set a sensible starting point</legend><p className="section-intro">These details are used conservatively. We do not calculate or diagnose health status.</p>
          <div className="three-col"><label>Age<input type="number" min="16" max="100" value={profile.age} onChange={(e) => patch('age', Number(e.target.value))} /></label><label>Height (cm)<input type="number" min="120" max="230" value={profile.heightCm} onChange={(e) => patch('heightCm', Number(e.target.value))} /></label><label>Weight (kg)<input type="number" min="35" max="300" value={profile.weightKg} onChange={(e) => patch('weightKg', Number(e.target.value))} /></label></div>
          <label>Sex<select value={profile.sex} onChange={(e) => patch('sex', e.target.value as UserProfile['sex'])}><option value="prefer-not-to-say">Prefer not to say</option><option value="female">Female</option><option value="male">Male</option><option value="intersex">Intersex</option></select></label>
          <div><span className="field-label">Overall training experience</span><div className="card-options">{(['beginner', 'intermediate', 'advanced'] as const).map((value) => <label key={value}><input type="radio" name="experience" checked={profile.experience === value} onChange={() => patch('experience', value)} /><span><strong>{value[0].toUpperCase() + value.slice(1)}</strong><small>{value === 'beginner' ? 'Learning and building consistency' : value === 'intermediate' ? 'Training regularly with sound basics' : 'Several years of structured training'}</small></span></label>)}</div></div>
          <label>Recent consistency<select value={profile.recentConsistency} onChange={(e) => patch('recentConsistency', e.target.value as UserProfile['recentConsistency'])}><option value="new">New or returning after a break</option><option value="inconsistent">Some recent training, not consistent</option><option value="consistent">Consistent for the last 3+ months</option></select></label>
          <div><span className="field-label">Experience by activity</span><div className="activity-grid">{(['strength', 'cardio', 'hiit', 'running'] as TrainingType[]).map((activity) => <label key={activity}>{activity.toUpperCase()}<select value={profile.activityExperience[activity]} onChange={(e) => patch('activityExperience', { ...profile.activityExperience, [activity]: e.target.value as UserProfile['experience'] })}><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option></select></label>)}</div></div>
        </fieldset>}

        {step === 2 && <fieldset><legend><span className="eyebrow">Direction</span>What are you training for?</legend><p className="section-intro">Choose one primary goal for this plan. You stay in control and can generate a new plan later.</p>
          <div className="goal-grid">{GOALS.map((goal) => <label key={goal}><input type="radio" name="goal" checked={profile.goal === goal} onChange={() => patch('goal', goal)} /><span><strong>{goalLabels[goal]}</strong><small>{goal === 'strength' ? 'Practice heavier, lower-rep work' : goal === 'muscle-gain' ? 'Build repeatable resistance volume' : goal === 'running-performance' ? 'Combine running and supporting strength' : goal === 'endurance' ? 'Expand sustained work capacity' : goal === 'weight-loss' ? 'Blend strength and conditioning' : 'A balanced mix of movement'}</small></span></label>)}</div>
          <label>Plan duration <div className="range-row"><input type="range" min="1" max="12" value={profile.planDurationWeeks} onChange={(e) => patch('planDurationWeeks', Number(e.target.value))} /><output>{profile.planDurationWeeks} {profile.planDurationWeeks === 1 ? 'week' : 'weeks'}</output></div></label>
        </fieldset>}

        {step === 3 && <fieldset><legend><span className="eyebrow">Your real week</span>When can you actually train?</legend><p className="section-intro">There is no minimum. We only schedule inside the windows you provide.</p>
          <div className="availability-list">{DAYS.map((day) => { const window = profile.availability.find((item) => item.day === day); return <div className={window ? 'availability-row selected' : 'availability-row'} key={day}><label className="day-check"><input type="checkbox" checked={Boolean(window)} onChange={(e) => setDay(day, e.target.checked)} /><span>{day.slice(0, 3)}</span></label>{window ? <><label><span>Start</span><input type="time" value={window.startTime} onChange={(e) => setWindow(day, 'startTime', e.target.value)} /></label><label><span>Duration</span><select value={window.durationMinutes} onChange={(e) => setWindow(day, 'durationMinutes', Number(e.target.value))}><option value="20">20 min</option><option value="30">30 min</option><option value="35">35 min</option><option value="45">45 min</option><option value="60">60 min</option></select></label></> : <span className="unavailable">Not available</span>}</div> })}</div>
          {profile.availability.length < 2 && <p className="inline-note">One session is still useful, but progress toward {goalLabels[profile.goal].toLowerCase()} may be slower with limited availability.</p>}
        </fieldset>}

        {step === 4 && <fieldset><legend><span className="eyebrow">What you have</span>Select available equipment</legend><p className="section-intro">The planner will never require equipment you do not select.</p>
          <div className="equipment-grid">{allEquipment.map((item) => <label key={item}><input type="checkbox" checked={profile.equipment.includes(item)} onChange={() => patch('equipment', toggleArray(profile.equipment, item))} /><span><CheckIcon /><strong>{equipmentLabels[item]}</strong></span></label>)}</div>
          {!profile.equipment.length && <p className="error-message">Select at least Bodyweight so the planner has a valid movement set.</p>}
        </fieldset>}

        {step === 5 && <fieldset><legend><span className="eyebrow">Last details</span>How should sessions work?</legend><p className="section-intro">Location is optional and is used only for outdoor-run weather checks.</p>
          <div><span className="field-label">Session mode</span><div className="card-options two">{(['guided', 'plan-only'] as const).map((value) => <label key={value}><input type="radio" name="mode" checked={profile.sessionMode === value} onChange={() => patch('sessionMode', value)} /><span><strong>{value === 'guided' ? 'Guided mode' : 'Plan-only mode'}</strong><small>{value === 'guided' ? 'Steps, timers, rests, and completion controls' : 'Outline and instructions without active timers'}</small></span></label>)}</div></div>
          <label>Instruction preference<select value={profile.instructionPreference} onChange={(e) => patch('instructionPreference', e.target.value as UserProfile['instructionPreference'])}><option value="written">Concise written guidance</option><option value="external">Reviewed external resources</option><option value="both">Written guidance and resources</option></select></label>
          <div className="location-box"><div><strong>Weather location</strong><small>Stored at reduced precision when possible.</small></div><div className="location-actions"><input value={locationQuery} onChange={(e) => setLocationQuery(e.target.value)} placeholder="City, country" aria-label="Manual weather location" /><button type="button" className="button secondary" onClick={findLocation}>Find</button><button type="button" className="button ghost" onClick={useBrowserLocation}>Use my location</button></div>{locationStatus && <p aria-live="polite">{locationStatus}</p>}</div>
          <div className="review-card"><span><BoltIcon /></span><div><strong>Ready to build</strong><p>{profile.planDurationWeeks} weeks · {profile.availability.length} session{profile.availability.length === 1 ? '' : 's'} per week · {goalLabels[profile.goal]}</p><small>The result will be saved in this browser and validated before display.</small></div></div>
          {safety.warnings.map((warning) => <p className="inline-note" key={warning}>{warning}</p>)}
        </fieldset>}

        {error && <p className="error-message" role="alert">{error}</p>}
        <footer className="form-actions">{step > 0 ? <button className="button ghost" type="button" onClick={() => setStep(step - 1)}>Back</button> : <span />}{step < steps.length - 1 ? <button className="button primary" type="button" onClick={next}>Continue <ArrowIcon /></button> : <button className="button primary" type="button" disabled={!profile.equipment.length} onClick={finish}>Generate my plan <BoltIcon /></button>}</footer>
      </form>
    </section>
  </main>
}
