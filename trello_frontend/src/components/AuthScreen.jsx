import { useState } from 'react'
import { api } from '../api.js'

export default function AuthScreen({ onSignedIn }) {
  const [mode, setMode] = useState('signin')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setError('')
    setInfo('')
    setBusy(true)
    try {
      if (mode === 'signin') {
        const data = await api.signin(username, password)
        onSignedIn(data.token, username)
      } else {
        await api.signup(username, password)
        setInfo('Registered. Sign in to continue')
        setMode('signin')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-grid" aria-hidden="true" />
      <div className="auth-card">
        <div className="reg-mark tl" />
        <div className="reg-mark tr" />
        <div className="reg-mark bl" />
        <div className="reg-mark br" />
        <div className="auth-eyebrow">DISPATCH · ACCESS SHEET</div>
        <h1>{mode === 'signin' ? 'Open your desk' : 'Register a desk'}</h1>

        <div className="auth-tabs">
          <button type="button" className={mode === 'signin' ? 'active' : ''} onClick={() => setMode('signin')}>
            Sign in
          </button>
          <button type="button" className={mode === 'signup' ? 'active' : ''} onClick={() => setMode('signup')}>
            Register
          </button>
        </div>

        <form onSubmit={submit}>
          <label>
            Username
            <input value={username} onChange={(e) => setUsername(e.target.value)} required autoFocus />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          <button className="btn primary full" disabled={busy}>
            {busy ? 'Working…' : mode === 'signin' ? 'Sign in' : 'Register'}
          </button>
        </form>

        {error && <div className="msg err">{error}</div>}
        {info && <div className="msg ok">{info}</div>}
      </div>
    </div>
  )
}
