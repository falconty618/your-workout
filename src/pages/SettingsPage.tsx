import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { ShieldIcon } from '../components/Icons'
import { equipmentLabels, goalLabels } from '../domain'
import { useAppState } from '../state/AppState'

export function SettingsPage() {
  const { profile, plan, erase } = useAppState()
  const [confirmErase, setConfirmErase] = useState(false)
  const navigate = useNavigate()
  if (!profile) return <Navigate to="/setup" replace />
  const doErase = async () => { await erase(); navigate('/') }
  return <section className="page settings-page">
    <header className="page-heading"><div><p className="eyebrow">Preferences & privacy</p><h1>You stay in control.</h1><p>Review what shapes your plan or remove everything stored by this app.</p></div></header>
    <div className="settings-grid">
      <section className="settings-card"><div className="settings-card-head"><div><span className="overline">Profile</span><h2>Your planning inputs</h2></div><Link className="button secondary" to="/setup">Edit & regenerate</Link></div><dl><div><dt>Primary goal</dt><dd>{goalLabels[profile.goal]}</dd></div><div><dt>Experience</dt><dd>{profile.experience}</dd></div><div><dt>Availability</dt><dd>{profile.availability.length} day{profile.availability.length === 1 ? '' : 's'} per week</dd></div><div><dt>Equipment</dt><dd>{profile.equipment.map((item) => equipmentLabels[item]).join(', ')}</dd></div><div><dt>Session mode</dt><dd>{profile.sessionMode}</dd></div><div><dt>Weather location</dt><dd>{profile.location?.label ?? 'Not set'}</dd></div></dl></section>
      <section className="settings-card"><div className="settings-card-head"><div><span className="overline">Plan record</span><h2>Reproducible recommendations</h2></div></div>{plan ? <dl><div><dt>Planner</dt><dd>{plan.plannerVersion}</dd></div><div><dt>Catalog</dt><dd>{plan.catalogVersion}</dd></div><div><dt>Seed</dt><dd>{plan.seed}</dd></div><div><dt>Generated</dt><dd>{new Date(plan.generatedAt).toLocaleString()}</dd></div></dl> : <p>No plan has been generated.</p>}</section>
      <section className="settings-card privacy-card"><ShieldIcon /><div><span className="overline">On-device data</span><h2>Nothing is synced.</h2><p>Your profile, location preference, plan, and session history stay in IndexedDB in this browser. Clearing browser data or changing devices can remove them. No analytics or third-party trackers are included.</p></div></section>
      <section className="settings-card danger-zone"><span className="overline">Danger zone</span><h2>Erase all local data</h2><p>This permanently removes the profile, plans, location, and workout history stored by Your Workout in this browser.</p><button className="button danger" onClick={() => setConfirmErase(true)}>Erase all data</button></section>
    </div>
    <aside className="medical-note"><ShieldIcon /><p><strong>Remember:</strong> This product provides general fitness guidance, not medical advice. Weather and exercise information can be delayed, incomplete, or inaccurate. Assess your condition, equipment, and actual surroundings.</p></aside>
    {confirmErase && <div className="modal-backdrop"><section className="modal" role="alertdialog" aria-modal="true" aria-labelledby="erase-title"><h2 id="erase-title">Erase everything?</h2><p>This cannot be undone from this app. All locally stored profile, plan, and session data will be removed.</p><div><button className="button ghost" onClick={() => setConfirmErase(false)}>Cancel</button><button className="button danger" onClick={doErase}>Yes, erase all</button></div></section></div>}
  </section>
}
