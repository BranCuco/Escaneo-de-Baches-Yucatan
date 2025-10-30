import React, { useState } from 'react'
import type { Auth } from '../types'
import { writeAuth } from '../utils/auth'

async function sha256(text: string) {
  const enc = new TextEncoder()
  const data = enc.encode(text)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

function readUsers() {
  try {
    const raw = localStorage.getItem('baches-users')
    return raw ? JSON.parse(raw) : []
  } catch (e) {
    return []
  }
}

function writeUsers(users: any[]) {
  localStorage.setItem('baches-users', JSON.stringify(users))
}

type Props = {
  onLogin: (a: Auth) => void
}

export default function Login({ onLogin }: Props) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [remember, setRemember] = useState(false)

  const logoData = 'data:image/svg+xml;utf8,' + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24">
      <rect width="24" height="24" fill="#19b5a7" rx="4" />
      <path d="M6 12c0-3.314 2.686-6 6-6s6 2.686 6 6-2.686 6-6 6-6-2.686-6-6zm3 0a3 3 0 106 0 3 3 0 00-6 0z" fill="#fff"/>
    </svg>
  `)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setFieldErrors({})
    const errs: Record<string, string> = {}
    if (!username) errs.username = 'Usuario requerido'
    if (!password) errs.password = 'Contraseña requerida'
    if (Object.keys(errs).length) return setFieldErrors(errs)
    try {
      const res = await fetch('https://baches-yucatan-1.onrender.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: username, password })
      })
      const data = await res.json()
      if (!res.ok) return setError(data?.message || 'Login failed')
      const token = data.token || data.data?.token || data.accessToken
      const userEmail = data.user?.email || data.data?.user?.email || username
      if (!token) return setError('Token not returned from server')
      const auth: Auth = { token, user: userEmail }
      writeAuth(auth)
      onLogin(auth)
    } catch (err) {
      console.error(err)
      setError('Error de conexión')
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setFieldErrors({})
    const errs: Record<string, string> = {}
    if (!username) errs.username = 'Usuario requerido'
    if (!password) errs.password = 'Contraseña requerida'
    if (password !== confirm) errs.confirm = 'Las contraseñas no coinciden'
    if (Object.keys(errs).length) return setFieldErrors(errs)
    try {
      // derive a simple name from email before @ if possible
      const name = username.includes('@') ? username.split('@')[0] : username
      const payload = { email: username, password, name, lastname: '' , role: 'worker' }
      const res = await fetch('https://baches-yucatan-1.onrender.com/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (!res.ok) return setError(data?.message || 'Register failed')
      const token = data.token || data.data?.token || data.accessToken
      const userEmail = data.user?.email || data.data?.user?.email || username
      if (!token) return setError('Token not returned from server')
      const auth: Auth = { token, user: userEmail }
      writeAuth(auth)
      onLogin(auth)
    } catch (err) {
      console.error(err)
      setError('Error de conexión')
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          {mode === 'login' ? (
            <>
              <img src={logoData} alt="logo" className="auth-logo" />
              <h3>Inicie sesión para continuar</h3>
              <div className="muted"> <button className="link" onClick={() => { setMode('register'); setError(null); setFieldErrors({}); }}>Registrarse</button></div>
            </>
          ) : (
            <>
              <img src={logoData} alt="logo" className="auth-logo" />
              <h3>Crea tu cuenta</h3>
              <div className="muted">¿Ya tienes una cuenta? <button className="link" onClick={() => { setMode('login'); setError(null); setFieldErrors({}); }}>Iniciar sesión</button></div>
            </>
          )}
        </div>

        <div className="auth-body">
          {error && <div className="form-error">{error}</div>}

          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="auth-form">
              <input className="input" placeholder="Email " value={username} onChange={e => setUsername(e.target.value)} autoFocus />
              {fieldErrors.username && <div className="field-error">{fieldErrors.username}</div>}

              <div className="password-row">
                <input className="input" type={showPassword ? 'text' : 'password'} placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} />
                <button type="button" className="small" onClick={() => setShowPassword(s => !s)}>{showPassword ? 'Hide' : 'Mostrar'}</button>
              </div>
              {fieldErrors.password && <div className="field-error">{fieldErrors.password}</div>}

              <label className="checkbox"><input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} /> Recuerdame</label>

              <button className="primary-btn" type="submit">Iniciar sesión</button>

              <div className="auth-footer">
                <button type="button" className="link">¿Olvidaste tu contraseña?</button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="auth-form">
              <input className="input" placeholder="Email" value={username} onChange={e => setUsername(e.target.value)} autoFocus />
              {fieldErrors.username && <div className="field-error">{fieldErrors.username}</div>}

              <input className="input" type={showPassword ? 'text' : 'password'} placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} />
              {fieldErrors.password && <div className="field-error">{fieldErrors.password}</div>}

              <input className="input" type={showPassword ? 'text' : 'password'} placeholder="Repite tu contraseña" value={confirm} onChange={e => setConfirm(e.target.value)} />
              {fieldErrors.confirm && <div className="field-error">{fieldErrors.confirm}</div>}

              <button className="primary-btn" type="submit">Registrarse</button>

            
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
