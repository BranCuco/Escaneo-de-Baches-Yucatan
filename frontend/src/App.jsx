import React, { useEffect, useState } from 'react'
import ReportForm from './components/ReportForm'
import ReportList from './components/ReportList'
import MapPlaceholder from './components/MapPlaceholder'

const STORAGE_KEY = 'baches-reports'

export default function App() {
  const [reports, setReports] = useState([])
  const [selectedLocation, setSelectedLocation] = useState(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setReports(JSON.parse(raw))
    } catch (e) {
      console.error('Error parsing localStorage', e)
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

  function removeReport(id) {
    setReports((s) => s.filter(r => r.id !== id))
  }

  return (
    <div className="app-root">
      <header>
        <h1>Registro de Baches — Mockup (React + Vite)</h1>
      </header>

      <main>
        <section className="left">
          <ReportForm onSubmit={(r) => addReport({ ...r, location: selectedLocation || r.location })} selectedLocation={selectedLocation} onClearLocation={() => setSelectedLocation(null)} />
          <ReportList reports={reports} onRemove={removeReport} />
        </section>

        <aside className="right">
          <MapPlaceholder reports={reports} selected={selectedLocation} onSelect={setLocation} />
        </aside>
      </main>

      <footer>
        <small>Mockup — Datos guardados en localStorage</small>
      </footer>
    </div>
  )
}
