import { NavLink, Outlet } from 'react-router-dom'
import { BoltIcon, CalendarIcon, HistoryIcon, SettingsIcon } from './Icons'

export function AppShell() {
  return <div className="app-shell">
    <header className="topbar">
      <NavLink to="/plan" className="brand" aria-label="Your Workout home">
        <span className="brand-mark"><BoltIcon /></span><span>Your Workout</span>
      </NavLink>
      <nav className="desktop-nav" aria-label="Primary navigation">
        <NavLink to="/plan"><CalendarIcon /> Plan</NavLink>
        <NavLink to="/history"><HistoryIcon /> History</NavLink>
        <NavLink to="/settings"><SettingsIcon /> Settings</NavLink>
      </nav>
    </header>
    <main id="main-content"><Outlet /></main>
    <nav className="mobile-nav" aria-label="Primary navigation">
      <NavLink to="/plan"><CalendarIcon /><span>Plan</span></NavLink>
      <NavLink to="/history"><HistoryIcon /><span>History</span></NavLink>
      <NavLink to="/settings"><SettingsIcon /><span>Settings</span></NavLink>
    </nav>
  </div>
}
