import React, { useState } from 'react'

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export default function ReportForm({ onSubmit, selectedLocation, onClearLocation }) {
  const [description, setDescription] = useState('')
  const [severity, setSeverity] = useState('medium')
  const [photoData, setPhotoData] = useState(null)
  const [error, setError] = useState(null)

  function handlePhoto(e) {
    const file = e.target.files && e.target.files[0]
    if (!file) return setPhotoData(null)
    if (!file.type.startsWith('image/')) return setError('El archivo debe ser una imagen')
    const reader = new FileReader()
    reader.onload = () => setPhotoData(reader.result)
    reader.onerror = () => setError('No se pudo leer la imagen')
    reader.readAsDataURL(file)
  }

  function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    if (!description.trim()) return setError('La descripción es obligatoria')
    // location will be filled from selectedLocation in App
    const report = {
      id: uid(),
      description: description.trim(),
      severity,
      location: null, // App will merge selectedLocation if present
      photo: photoData,
      createdAt: new Date().toISOString()
    }

    onSubmit(report)
    setDescription('')
    setSeverity('medium')
    setPhotoData(null)
  }

  return (
    <form className="report-form" onSubmit={handleSubmit}>
      <h2>Nuevo reporte</h2>
      {error && <div className="form-error">{error}</div>}
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

      {selectedLocation ? (
        <div className="selected-location">
          <strong>Ubicación seleccionada:</strong>
          <div>{selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}</div>
          {onClearLocation && <button type="button" onClick={onClearLocation}>Limpiar ubicación</button>}
        </div>
      ) : (
        <div className="selected-location muted">Haga click en el mapa para seleccionar ubicación (opcional)</div>
      )}
      <label>
        Foto (opcional)
        <input type="file" accept="image/*" onChange={handlePhoto} />
      </label>
      {photoData && <div className="photo-preview"><img src={photoData} alt="preview" /></div>}

      <div className="form-actions">
        <button type="submit">Agregar</button>
      </div>
    </form>
  )
}
