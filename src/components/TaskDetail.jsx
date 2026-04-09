import './TaskDetail.css'

function formatDeadline(deadline) {
  if (!deadline) return 'No deadline'
  if (deadline.includes('T')) {
    const d = new Date(deadline)
    return d.toLocaleString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })
  }
  const d = new Date(deadline + 'T00:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })
}

export default function TaskDetail({ task, categories, onClose, onEdit, onDelete, onFinish, onReactivate, syncColor }) {
  const category = categories.find(c => c.id === task.categoryId)
  const displayColor = syncColor || category?.color

  function handleDelete() {
    if (window.confirm(`Delete "${task.name}"?`)) {
      onDelete(task.id)
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal task-detail-modal">
        <div className="modal-header">
          <div className="task-detail-title-row">
            {category && (
              <span
                className="task-detail-category-tag"
                style={{ borderColor: displayColor, color: displayColor }}
              >
                {category.name}
              </span>
            )}
            <h2 className={task.completed ? 'task-detail-title--done' : ''}>{task.name}</h2>
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="task-detail-body">
          <div className="task-detail-row">
            <div className="task-detail-stars">
              {Array.from({ length: 5 }, (_, i) => (
                <span key={i} className={i < task.priority ? 'star filled' : 'star'}>
                  {i < task.priority ? '★' : '☆'}
                </span>
              ))}
              <span className="task-detail-priority-label">Priority {task.priority}/5</span>
            </div>
          </div>

          <div className="task-detail-meta">
            <span className="task-detail-meta-item">
              📅 {formatDeadline(task.deadline)}
            </span>
            {task.completed && (
              <span className="task-detail-badge-done">Completed</span>
            )}
          </div>

          {task.description && (
            <div className="task-detail-section">
              <h3 className="task-detail-section-title">Description</h3>
              <p className="task-detail-description">{task.description}</p>
            </div>
          )}

          {task.location && (
            <div className="task-detail-section">
              <h3 className="task-detail-section-title">Location</h3>
              <p className="task-detail-location">📍 {task.location}</p>
            </div>
          )}

          {task.links && task.links.length > 0 && (
            <div className="task-detail-section">
              <h3 className="task-detail-section-title">Links</h3>
              <ul className="task-detail-links">
                {task.links.map((link, i) => (
                  <li key={i}>
                    <a href={link.url} target="_blank" rel="noopener noreferrer">
                      🔗 {link.label || link.url}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="task-detail-actions">
          {task.completed ? (
            <>
              <button className="btn btn-restart" onClick={() => onReactivate(task)}>
                💡 Restart
              </button>
              <button className="btn btn-danger" onClick={handleDelete}>
                ✕ Remove
              </button>
            </>
          ) : (
            <>
              <button className="btn btn-finish" onClick={() => onFinish(task)}>
                🏁 Finish!
              </button>
              <button className="btn btn-ghost" onClick={() => onEdit(task)}>Edit</button>
              <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
