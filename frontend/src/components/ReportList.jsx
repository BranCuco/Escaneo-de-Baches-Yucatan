import React from 'react'

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString()
  } catch (e) {
    return iso
  }
}

export default function ReportList({ reports, onRemove }) {
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
            <div className="actions">
              <button onClick={() => onRemove(r.id)}>Eliminar</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
