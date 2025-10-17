import React, { useState } from 'react'

async function sha256(text) {
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

function writeUsers(users) {
  localStorage.setItem('baches-users', JSON.stringify(users))
}

export default function Login({ onLogin }) {
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const [remember, setRemember] = useState(false)

  const logoData = 'data:image/svg+xml;utf8,' + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24">
      <rect width="24" height="24" fill="#19b5a7" rx="4" />
      <path d="M6 12c0-3.314 2.686-6 6-6s6 2.686 6 6-2.686 6-6 6-6-2.686-6-6zm3 0a3 3 0 106 0 3 3 0 00-6 0z" fill="#fff"/>
    </svg>
  `)

  async function handleLogin(e) {
    e.preventDefault()
    setError(null)
    setFieldErrors({})
    const errs = {}
    if (!username) errs.username = 'Usuario requerido'
    if (!password) errs.password = 'Contraseña requerida'
    if (Object.keys(errs).length) return setFieldErrors(errs)
    const users = readUsers()
    const user = users.find(u => u.username === username)
    if (!user) return setError('Usuario no encontrado')
    const h = await sha256(password)
    if (h !== user.hash) return setError('Contraseña incorrecta')
    const auth = { token: 'mock-' + Date.now().toString(36), user: username }
    localStorage.setItem('baches-auth', JSON.stringify(auth))
    onLogin(auth)
  }

  async function handleRegister(e) {
    e.preventDefault()
    setError(null)
    setFieldErrors({})
    const errs = {}
    if (!username) errs.username = 'Usuario requerido'
    if (!password) errs.password = 'Contraseña requerida'
    if (password !== confirm) errs.confirm = 'Las contraseñas no coinciden'
    if (Object.keys(errs).length) return setFieldErrors(errs)
    const users = readUsers()
    if (users.find(u => u.username === username)) return setError('El usuario ya existe')
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
