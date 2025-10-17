import React, { useEffect, useState } from 'react'
import ReportForm from './components/ReportForm'
import ReportList from './components/ReportList'
import MapPlaceholder from './components/MapPlaceholder'
import Login from './components/Login'
import Sidebar from './components/Sidebar'
import VehiculosTrabajadores from './components/VehiculosTrabajadores'

const STORAGE_KEY = 'baches-reports'

export default function App() {
  const [reports, setReports] = useState([])
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [auth, setAuth] = useState(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setReports(JSON.parse(raw))
    } catch (e) {
      console.error('Error parsing localStorage', e)
    }
    try {
      const a = localStorage.getItem('baches-auth')
      if (a) setAuth(JSON.parse(a))
    } catch (e) {
      console.warn('Error reading auth', e)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports))
  }, [reports])

  function addReport(report) {
    setReports((s) => [report, ...s])
  }

  function setLocation(loc) {
    setSelectedLocation(loc)
  }

  function handleLogin(a) {
    setAuth(a)
  }

  function handleLogout() {
    localStorage.removeItem('baches-auth')
    setAuth(null)
  }

  function removeReport(id) {
    setReports((s) => s.filter(r => r.id !== id))
  }

  const [currentPage, setCurrentPage] = useState('reportes')

  function navigate(page) {
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
