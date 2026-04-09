import './TaskCard.css'

function formatDeadline(deadline) {
  if (!deadline) return null
  const d = new Date(deadline + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function isUrgent(deadline) {
  if (!deadline) return false
  const now = new Date()
  const due = new Date(deadline + 'T23:59:59')
  const diffDays = (due - now) / (1000 * 60 * 60 * 24)
  return diffDays <= 2
}

export default function TaskCard({ task, onClick, onFinish, onDelete, onReactivate, categoryColor }) {
  const deadlineText = formatDeadline(task.deadline)
  const urgent = task.deadline ? isUrgent(task.deadline) : false
  const cardStyle = { '--cat-color': categoryColor || '#9ca3af' }

  if (task.completed) {
    return (
      <div className="task-card task-card--completed" style={cardStyle} onClick={onClick} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onClick()}>
        <p className="task-card-name">{task.name}</p>
        <span className="task-card-done-label">Finished ✓</span>
        <div className="task-card-done-actions">
          <button
            className="task-card-action task-card-action--restart"
            title="Restart task"
            onClick={(e) => { e.stopPropagation(); onReactivate() }}
          >
            💡
          </button>
          <button
            className="task-card-action task-card-action--delete"
            title="Remove task"
            onClick={(e) => { e.stopPropagation(); onDelete() }}
          >
            ✕
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className="task-card"
      style={cardStyle}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      <p className="task-card-name">{task.name}</p>
      <div className="task-card-stars" style={{ '--star-intensity': `${task.priority * 20}%` }}>
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i} className={i < task.priority ? 'star filled' : 'star'}>
            {i < task.priority ? '★' : '☆'}
          </span>
        ))}
      </div>
      <div className="task-card-footer">
        <span className={`task-card-deadline${urgent ? ' urgent' : ''}`}>
          {deadlineText ? `Due ${deadlineText}` : 'No deadline'}
        </span>
        <button
          className="task-card-finish"
          title="Finish task"
          onClick={(e) => { e.stopPropagation(); onFinish() }}
        >
          🏁
        </button>
      </div>
    </div>
  )
}
