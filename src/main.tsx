import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { App } from './App'
import { ErrorBoundary } from './components/ErrorBoundary'
import { AppStateProvider } from './state/AppState'
import './styles.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode><ErrorBoundary><HashRouter><AppStateProvider><App /></AppStateProvider></HashRouter></ErrorBoundary></StrictMode>,
)
