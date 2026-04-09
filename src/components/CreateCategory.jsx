import { useState } from 'react'
import './CreateCategory.css'

const PRESET_COLORS = ['#4f8ef7', '#f59e0b', '#22c55e', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316']

export default function CreateCategory({ onSave, onClose }) {
  const [name, setName] = useState('')
  const [color, setColor] = useState('#4f8ef7')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) { setError('Name is required'); return }

    onSave({
      id: crypto.randomUUID(),
      name: name.trim(),
      color,
      isVisible: true,
    })
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2>New Category</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name *</label>
            <input
              type="text"
              value={name}
              onChange={e => { setName(e.target.value); setError('') }}
              placeholder="e.g. Work, Personal…"
              autoFocus
            />
            {error && <span className="form-error">{error}</span>}
          </div>

          <div className="form-group">
            <label>Color</label>
            <div className="color-picker">
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  className={`color-swatch${color === c ? ' selected' : ''}`}
                  style={{ background: c }}
                  onClick={() => setColor(c)}
                  title={c}
                />
              ))}
              <input
                type="color"
                value={color}
                onChange={e => setColor(e.target.value)}
                title="Custom color"
                className="color-custom"
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Create category</button>
          </div>
        </form>
      </div>
    </div>
  )
}
