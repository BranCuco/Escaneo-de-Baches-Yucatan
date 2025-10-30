import React, { useState } from 'react'
import MapPlaceholder from './MapPlaceholder'
import { readAuth } from '../utils/auth'
import type { Location } from '../types'
import type { Report } from '../types'

const API_BASE = 'https://baches-yucatan-1.onrender.com/api'

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

type Props = {
  onCreated?: (created: any) => void
}

export default function TestCreateReport({ onCreated }: Props): JSX.Element {
  const [description, setDescription] = useState<string>('')
  const [severity, setSeverity] = useState<string>('medium')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [message, setMessage] = useState<string | null>(null)
  const [createdReport, setCreatedReport] = useState<any | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)
    setLoading(true)
    try {
      const auth = readAuth()
      if (!auth) throw new Error('No autorizado')

      let imageData: string | null = null
      if (photoFile) {
        imageData = await fileToBase64(photoFile)
      }

      const payload: any = {
        description,
        severity,
      }
      if (selectedLocation) payload.location = selectedLocation
      if (imageData) payload.images = [imageData]

      const res = await fetch(`${API_BASE}/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${auth.token}` },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const err = await res.text()
        throw new Error(err || 'Error creating report')
      }

      const created = await res.json().catch(() => null)

      setMessage('Reporte creado correctamente')
      setCreatedReport(created)
      setDescription('')
      setSeverity('medium')
      setPhotoFile(null)
  setSelectedLocation(null)
  if (onCreated) onCreated(created)
    } catch (err: any) {
      setMessage(String(err.message || err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page create-report-page">
      <h2>Crear reporte (sección de prueba)</h2>
      <form className="create-report-form" onSubmit={handleSubmit}>
        <label>Descripción
          <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe el bache..." required></textarea>
        </label>

        <label>Severidad
          <select value={severity} onChange={e => setSeverity(e.target.value)}>
            <option value="low">Baja</option>
            <option value="medium">Media</option>
            <option value="high">Alta</option>
          </select>
        </label>

        <label>Foto
          <input type="file" accept="image/*" onChange={e => setPhotoFile(e.target.files ? e.target.files[0] : null)} />
        </label>

        <div style={{marginTop:8}}>
          <small>Selecciona la ubicación haciendo click en el mapa:</small>
        </div>

        <div style={{marginTop:8}}>
          <MapPlaceholder reports={[]} selected={selectedLocation} onSelect={loc => setSelectedLocation(loc)} />
        </div>

        <div className="form-actions" style={{marginTop:10}}>
          <button type="submit" className="primary-btn" disabled={loading}>{loading ? 'Creando...' : 'Crear reporte'}</button>
        </div>

        {message && <p className="muted" style={{marginTop:8}}>{message}</p>}
        {createdReport && (
          <div className="success-box" style={{marginTop:8,border:'1px solid #d1e7dd',background:'#e9f7ef',padding:8}}>
            <strong>ID:</strong> {createdReport.id || createdReport._id || '—'}
            <div style={{marginTop:6}}><small>Respuesta del servidor:</small>
              <pre style={{whiteSpace:'pre-wrap',fontSize:'0.85rem'}}>{JSON.stringify(createdReport,null,2)}</pre>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}
