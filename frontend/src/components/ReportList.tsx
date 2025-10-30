import React, { useState } from 'react'
import type { Report } from '../types'

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString()
  } catch (e) {
    return iso
  }
}

type Props = {
  reports: Report[]
  onRemove: (id: string) => void
}

export default function ReportList({ reports, onRemove }: Props) {
  const [preview, setPreview] = useState<string | null>(null)

  return (
    <div className="report-list">
      <h2>Reportes ({reports.length})</h2>
      {reports.length === 0 && <p>No hay reportes aún.</p>}
      <ul>
        {reports.map(r => (
          <li key={r.id} className={`report-item ${r.severity}`}>
            <div className="meta">
              <strong>{r.severity.toUpperCase()}</strong>
              <time>{formatDate(r.createdAt)}</time>
            </div>
            <p className="desc">{r.description}</p>
            {r.location && (
              <div className="location">Ubicación: {r.location.lat}, {r.location.lng}</div>
            )}
            {r.photo && (
              <div className="photo-thumb">
                <img src={r.photo} alt="foto" onClick={() => setPreview(r.photo || null)} />
              </div>
            )}
            <div className="actions">
              <button onClick={() => onRemove(r.id)}>Eliminar</button>
            </div>
          </li>
        ))}
      </ul>

      {preview && (
        <div className="image-modal" onClick={() => setPreview(null)}>
          <img src={preview} alt="preview large" />
        </div>
      )}
    </div>
  )
}
