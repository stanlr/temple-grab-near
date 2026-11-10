import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './style.css';

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Temple Grab failed to render:', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, background: '#101a17', color: '#f0eee5', fontFamily: 'system-ui, sans-serif' }}>
          <section style={{ maxWidth: 520, textAlign: 'center', border: '1px solid #c9b66e66', padding: 28, background: '#14221f' }}>
            <p style={{ color: '#d5c47e', letterSpacing: 2, fontSize: 12 }}>TEMPLE GRAB — NEAR EDITION</p>
            <h1 style={{ fontSize: 26 }}>The game hit an error</h1>
            <p style={{ color: '#c3cbbf', lineHeight: 1.6 }}>Please refresh the page. If this keeps happening, send the error details below to the developer.</p>
            <pre style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', textAlign: 'left', color: '#f0c7a8', fontSize: 12 }}>{String(this.state.error?.message || this.state.error)}</pre>
            <button onClick={() => window.location.reload()} style={{ marginTop: 12, padding: '12px 20px', background: '#d0bd78', color: '#18231c', border: 0, fontWeight: 700 }}>REFRESH GAME</button>
          </section>
        </main>
      );
    }
    return this.props.children;
  }
}

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <React.StrictMode>
      <AppErrorBoundary><App /></AppErrorBoundary>
    </React.StrictMode>
  );
}
