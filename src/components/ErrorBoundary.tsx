import { Component, type ErrorInfo, type ReactNode } from 'react'

export class ErrorBoundary extends Component<{ children: ReactNode }, { error?: Error }> {
  state: { error?: Error } = {}
  static getDerivedStateFromError(error: Error) { return { error } }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('Application error', error.name, info.componentStack) }
  render() {
    if (this.state.error) return <main className="center-page"><section className="panel narrow"><p className="eyebrow">Something went wrong</p><h1>Your data is still on this device.</h1><p>Reload the app and try again. If the problem continues, you can clear the app data from your browser settings.</p><button className="button primary" onClick={() => location.reload()}>Reload</button></section></main>
    return this.props.children
  }
}
