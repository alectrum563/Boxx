import { useState } from 'react'
import TaskCard from './TaskCard'
import './CategoryRow.css'

const CARD_CAP = 5

export default function CategoryRow({ category, tasks, onSelectTask, onClose, onFinishTask, onDeleteTask, onReactivateTask }) {
  const [expanded, setExpanded] = useState(false)

  const visibleTasks = expanded ? tasks : tasks.slice(0, CARD_CAP - 1)
  const hasMore = tasks.length >= CARD_CAP

  return (
    <div className="category-row" style={{ '--cat-color': category.color }}>
      <div className="category-row-header" style={{ borderLeftColor: category.color }}>
        <span className="category-row-name">{category.name}</span>
        <div className="category-row-meta">
          <span className="category-row-count">{tasks.length} task{tasks.length !== 1 ? 's' : ''}</span>
          {onClose && (
            <button
              className="category-row-close"
              title="Hide category"
              onClick={() => onClose(category.id)}
            >
              ×
            </button>
          )}
        </div>
      </div>

      {tasks.length === 0 ? (
        <p className="category-row-empty">No tasks in this category.</p>
      ) : (
        <div className="category-row-cards">
          {visibleTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              categoryColor={category.color}
              onClick={() => onSelectTask(task)}
              onFinish={() => onFinishTask(task.id)}
              onDelete={() => onDeleteTask(task.id)}
              onReactivate={() => onReactivateTask(task.id)}
            />
          ))}
          {hasMore && !expanded && (
            <button
              className="category-row-more"
              onClick={() => setExpanded(true)}
            >
              +{tasks.length - (CARD_CAP - 1)} more
            </button>
          )}
          {expanded && (
            <button
              className="category-row-more"
              onClick={() => setExpanded(false)}
            >
              Show less
            </button>
          )}
        </div>
      )}
    </div>
  )
}
