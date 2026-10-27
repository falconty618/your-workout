import { Link } from 'react-router-dom'
import { ArrowIcon, BoltIcon, CalendarIcon, CheckIcon, ShieldIcon } from '../components/Icons'

export function WelcomePage() {
  return <main className="welcome">
    <header className="welcome-nav"><span className="brand"><span className="brand-mark"><BoltIcon /></span>Your Workout</span><span className="local-pill">No account needed</span></header>
    <section className="hero">
      <div className="hero-copy">
        <p className="eyebrow">Built around real life</p>
        <h1>A workout plan that fits <em>your</em> week.</h1>
        <p className="lede">Tell us your goal, time, equipment, and boundaries. Get a practical plan that explains every choice—and adapts when today changes.</p>
        <Link className="button primary large" to="/setup">Build my plan <ArrowIcon /></Link>
        <p className="microcopy"><ShieldIcon /> Your details stay in this browser.</p>
      </div>
      <div className="hero-visual" aria-label="Example weekly workout plan">
        <div className="orbit orbit-one" /><div className="orbit orbit-two" />
        <div className="preview-card preview-main">
          <div className="preview-head"><div><span className="overline">Tuesday · 7:00</span><h2>Full-body foundations</h2></div><span className="duration">35 min</span></div>
          <div className="intensity"><span /><span /><span className="muted-bar" /><small>Moderate</small></div>
          <div className="preview-list"><p><CheckIcon /> Warm up gradually</p><p><CheckIcon /> 4 strength movements</p><p><CheckIcon /> Guided rests & cues</p></div>
          <div className="why"><BoltIcon /><div><strong>Why this fits</strong><span>Builds strength with bodyweight only, inside your Tuesday window.</span></div></div>
        </div>
        <div className="preview-card preview-float"><CalendarIcon /><div><span>3 sessions</span><small>planned this week</small></div></div>
      </div>
    </section>
    <section className="promise-grid" aria-label="Product benefits">
      <article><span>01</span><h3>Personal, not mysterious</h3><p>Every session tells you why it belongs in your plan.</p></article>
      <article><span>02</span><h3>Safety sets the pace</h3><p>Pain, restrictions, and available equipment override intensity.</p></article>
      <article><span>03</span><h3>Ready when plans change</h3><p>Short on time or caught by weather? Review an alternative first.</p></article>
    </section>
    <aside className="medical-note"><ShieldIcon /><p><strong>A quick safety note.</strong> Your Workout provides general fitness guidance, not medical advice, diagnosis, rehabilitation, or treatment. Stop for pain, dizziness, faintness, or unusual shortness of breath and seek qualified help when appropriate.</p></aside>
  </main>
}
