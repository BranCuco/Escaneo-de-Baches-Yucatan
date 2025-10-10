import React, { useState } from 'react'

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export default function ReportForm({ onSubmit }) {
  const [description, setDescription] = useState('')
  const [severity, setSeverity] = useState('medium')

  function handleSubmit(e) {
    e.preventDefault()
    if (!description.trim()) return
    const report = {
      id: uid(),
      description: description.trim(),
      severity,
      createdAt: new Date().toISOString()
    }
    onSubmit(report)
    setDescription('')
    setSeverity('medium')
  }

  return (
    <form className="report-form" onSubmit={handleSubmit}>
      <h2>Nuevo reporte</h2>
      <label>
        Descripción
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
      </label>

      <label>
        Severidad
        <select value={severity} onChange={(e) => setSeverity(e.target.value)}>
          <option value="low">Baja</option>
          <option value="medium">Media</option>
          <option value="high">Alta</option>
        </select>
      </label>

      <div className="form-actions">
        <button type="submit">Agregar</button>
      </div>
    </form>
  )
}
