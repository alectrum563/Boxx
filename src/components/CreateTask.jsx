import { useState } from 'react'
import './CreateTask.css'

const EMPTY_LINK = { label: '', url: '' }

function initForm(task) {
  if (task) {
    const hasTime = task.deadline?.includes('T')
    return {
      name: task.name,
      categoryId: task.categoryId,
      priority: task.priority,
      deadline: hasTime ? task.deadline.split('T')[0] : (task.deadline || ''),
      deadlineTime: hasTime ? task.deadline.split('T')[1].slice(0, 5) : '',
      description: task.description || '',
      location: task.location || '',
      links: task.links?.length ? task.links : [],
    }
  }
  return {
    name: '',
    categoryId: '',
    priority: 3,
    deadline: '',
    deadlineTime: '',
    description: '',
    location: '',
    links: [],
  }
}

export default function CreateTask({ categories, editingTask, onSave, onClose }) {
  const [form, setForm] = useState(() => initForm(editingTask))
  const [errors, setErrors] = useState({})

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
    if (errors[field]) setErrors(e => ({ ...e, [field]: null }))
  }

  function setLink(i, field, value) {
    setForm(f => {
      const links = [...f.links]
      links[i] = { ...links[i], [field]: value }
      return { ...f, links }
    })
  }

  function addLink() {
    setForm(f => ({ ...f, links: [...f.links, { ...EMPTY_LINK }] }))
  }

  function removeLink(i) {
    setForm(f => ({ ...f, links: f.links.filter((_, idx) => idx !== i) }))
  }

  function validate() {
    const e = {}
    if (!form.name.trim()) e.name = 'Name is required'
    return e
  }

  function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    const task = {
      ...(editingTask || {}),
      id: editingTask?.id || crypto.randomUUID(),
      name: form.name.trim(),
      categoryId: form.categoryId || 'ungrouped',
      priority: form.priority,
      deadline: form.deadline
        ? (form.deadlineTime ? `${form.deadline}T${form.deadlineTime}` : form.deadline)
        : null,
      description: form.description.trim(),
      location: form.location.trim(),
      links: form.links.filter(l => l.url.trim()),
      completed: editingTask?.completed ?? false,
      createdAt: editingTask?.createdAt || new Date().toISOString(),
    }
    onSave(task)
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2>{editingTask ? 'Edit Task' : 'New Task'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="Task name"
              autoFocus
            />
            {errors.name && <span className="form-error">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label>Category (optional)</label>
            <select value={form.categoryId} onChange={e => set('categoryId', e.target.value)}>
              <option value="">Ungrouped</option>
              {categories.filter(c => c.isVisible !== false).map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Priority</label>
            <div className="priority-picker">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  type="button"
                  className={`priority-star${n <= form.priority ? ' active' : ''}`}
                  onClick={() => set('priority', n)}
                >
                  {n <= form.priority ? '★' : '☆'}
                </button>
              ))}
              <span className="priority-label">{form.priority}/5</span>
            </div>
          </div>

          <div className="form-group">
            <label>Deadline (optional)</label>
            <div className="deadline-row">
              <input
                type="date"
                value={form.deadline}
                onChange={e => set('deadline', e.target.value)}
              />
              <input
                type="time"
                value={form.deadlineTime}
                onChange={e => set('deadlineTime', e.target.value)}
                disabled={!form.deadline}
                placeholder="Time"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Description (optional)</label>
            <textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Add details…"
            />
          </div>

          <div className="form-group">
            <label>Location (optional)</label>
            <input
              type="text"
              value={form.location}
              onChange={e => set('location', e.target.value)}
              placeholder="e.g. Room 3B, Online, etc."
            />
          </div>

          <div className="form-group">
            <label>Links (optional)</label>
            {form.links.map((link, i) => (
              <div key={i} className="link-row">
                <input
                  type="text"
                  value={link.label}
                  onChange={e => setLink(i, 'label', e.target.value)}
                  placeholder="Label"
                />
                <input
                  type="url"
                  value={link.url}
                  onChange={e => setLink(i, 'url', e.target.value)}
                  placeholder="https://…"
                />
                <button type="button" className="link-remove" onClick={() => removeLink(i)}>×</button>
              </div>
            ))}
            <button type="button" className="btn btn-ghost add-link-btn" onClick={addLink}>
              + Add link
            </button>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">
              {editingTask ? 'Save changes' : 'Create task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
