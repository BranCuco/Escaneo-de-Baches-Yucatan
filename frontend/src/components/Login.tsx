import React, { useState } from 'react'
import type { Auth } from '../types'

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
    <svg xmlns="http://www.w3.org/2000/svg" width="220" height="90" viewBox="0 0 220 90">
      <rect x="0" y="0" width="220" height="90" rx="6" fill="#e6e6e6" />
      <text x="110" y="52" font-family="Arial, sans-serif" font-size="20" fill="#777" text-anchor="middle">LOGO</text>
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
    const users = readUsers()
    const user = users.find((u: any) => u.username === username)
    if (!user) return setError('Usuario no encontrado')
    const h = await sha256(password)
    if (h !== user.hash) return setError('Contraseña incorrecta')
    const auth = { token: 'mock-' + Date.now().toString(36), user: username }
    localStorage.setItem('baches-auth', JSON.stringify(auth))
    onLogin(auth)
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
    const users = readUsers()
    if (users.find((u: any) => u.username === username)) return setError('El usuario ya existe')
    const h = await sha256(password)
    users.push({ username, hash: h })
    writeUsers(users)
    // auto-login
    const auth = { token: 'mock-' + Date.now().toString(36), user: username }
    localStorage.setItem('baches-auth', JSON.stringify(auth))
    onLogin(auth)
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
                <button type="button" className="small show-btn" onClick={() => setShowPassword(s => !s)}>{showPassword ? 'Ocultar' : 'Mostrar'}</button>
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
