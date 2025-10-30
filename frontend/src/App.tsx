import React, { useEffect, useState } from 'react'
import ReportForm from './components/ReportForm'
import ReportList from './components/ReportList'
import MapPlaceholder from './components/MapPlaceholder'
import Login from './components/Login'
import Sidebar from './components/Sidebar'
import VehiculosTrabajadores from './components/VehiculosTrabajadores'
import { readAuth, clearAuth } from './utils/auth'
import type { Report, Location as Loc, Auth } from './types'

const STORAGE_KEY = 'baches-reports'
const getUserStorageKey = (user: string) => `${STORAGE_KEY}:${user}`

export default function App(): JSX.Element {
  const [reports, setReports] = useState<Report[]>([])
  const [selectedLocation, setSelectedLocation] = useState<Loc | null>(null)
  const [auth, setAuth] = useState<Auth | null>(null)

  // Leer auth al montar y limpiar el key global antiguo (migración a por-usuario)
  useEffect(() => {
    try {
      // Limpia clave global antigua para evitar contaminación entre cuentas
      localStorage.removeItem(STORAGE_KEY)
    } catch {}
    try {
      const a = readAuth()
      if (a) setAuth(a)
    } catch (e) {
      console.warn('Error reading auth', e)
    }
  }, [])

  // Cargar reportes cuando cambia el usuario autenticado
  useEffect(() => {
    if (!auth) {
      setReports([])
      return
    }
    try {
      const userKey = getUserStorageKey(auth.user)
      const raw = localStorage.getItem(userKey)
      setReports(raw ? JSON.parse(raw) : [])
    } catch (e) {
      console.warn('Error loading user reports', e)
      setReports([])
    }
  }, [auth?.user])

  // Guardar reportes por-usuario
  useEffect(() => {
    if (!auth) return
    try {
      const userKey = getUserStorageKey(auth.user)
      localStorage.setItem(userKey, JSON.stringify(reports))
    } catch (e) {
      console.warn('Error saving user reports', e)
    }
  }, [reports, auth?.user])

  function addReport(report: Report) {
    setReports((s: Report[]) => [report, ...s])
  }

  function setLocation(loc: Loc | null) {
    setSelectedLocation(loc)
  }

  function handleLogin(a: Auth) {
    setAuth(a)
  }

  function handleLogout() {
    clearAuth()
    setAuth(null)
  }

  function removeReport(id: string) {
    setReports((s: Report[]) => s.filter((r: Report) => r.id !== id))
  }

  const [currentPage, setCurrentPage] = useState<string>('reportes')

  function navigate(page: string) {
    setCurrentPage(page)
  }

  if (!auth) return <div className="app-root"><Login onLogin={handleLogin} /></div>

  const displayEmail = auth.user && auth.user.includes('@') ? auth.user : `${auth.user}@example.com`
  const displayName = auth.user && auth.user.includes('@') ? auth.user.split('@')[0] : auth.user

  return (
    <div className="app-root app-with-sidebar">
      <header>
        <h1>Registro de Baches — Mockup (React + Vite)</h1>
        <div className="auth-area">Usuario: <strong>{auth.user}</strong> <button onClick={handleLogout}>Salir</button></div>
      </header>

      <div className="workspace">
  <Sidebar user={displayName} email={displayEmail} currentPage={currentPage} onNavigate={navigate} />

        <main className="content">
          {currentPage === 'reportes' && (
            <div className="reports-page">
              <section className="left">
                <ReportForm onSubmit={(r) => addReport({ ...r, location: selectedLocation || r.location })} selectedLocation={selectedLocation} onClearLocation={() => setSelectedLocation(null)} />
                <ReportList reports={reports} onRemove={removeReport} />
              </section>

              <aside className="right">
                <MapPlaceholder reports={reports} selected={selectedLocation} onSelect={setLocation} />
              </aside>
            </div>
          )}

          {currentPage === 'vehiculos' && (
            <div className="vehiculos-page">
              <VehiculosTrabajadores />
            </div>
          )}
        </main>
      </div>

      <footer>
        <small>Mockup — Datos guardados en localStorage</small>
      </footer>
    </div>
  )
}
