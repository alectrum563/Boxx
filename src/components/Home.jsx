import { deadlineUrgency, importanceScore, sortByDeadline } from '../utils/taskUtils'
import TaskCard from './TaskCard'
import './Home.css'

function renderCards(taskList, categories, onSelectTask, onFinishTask, onDeleteTask, onReactivateTask, syncColor) {
  return taskList.map(task => {
    const cat = categories.find(c => c.id === task.categoryId)
    return (
      <TaskCard
        key={task.id}
        task={task}
        categoryColor={syncColor || cat?.color}
        onClick={() => onSelectTask(task)}
        onFinish={() => onFinishTask(task.id)}
        onDelete={() => onDeleteTask(task.id)}
        onReactivate={() => onReactivateTask(task.id)}
      />
    )
  })
}

export default function Home({ tasks, categories, displayName, heroBgAccent, syncColors, onSelectTask, onFinishTask, onDeleteTask, onReactivateTask }) {
  const syncColor = syncColors && heroBgAccent
    ? `rgb(${heroBgAccent.r}, ${heroBgAccent.g}, ${heroBgAccent.b})`
    : null
  const activeTasks = tasks.filter(t => !t.completed)

  // Coming up: tasks with a deadline within 30 days (or overdue), sorted soonest first
  const comingUp = sortByDeadline(
    activeTasks.filter(t => t.deadline && deadlineUrgency(t.deadline) > 0)
  ).slice(0, 5)

  // High priority: sorted by priority desc, importance as tiebreaker
  const highPriority = [...activeTasks]
    .sort((a, b) => b.priority - a.priority || importanceScore(b) - importanceScore(a))
    .slice(0, 5)

  const showComingUp = comingUp.length > 0
  const showHighPriority = highPriority.length > 0

  return (
    <section className="home">
      <div className="home-hero">
        <h1 className="home-title">Welcome back{displayName ? `, ${displayName}` : ''}</h1>
        <p className="home-subtitle">Here&apos;s what needs your attention</p>
      </div>

      {activeTasks.length === 0 ? (
        <p className="home-empty">No tasks yet. Use the + button to get started.</p>
      ) : (
        <div className={`home-sections${showComingUp && showHighPriority ? ' home-sections--two' : ''}`}>
          {showComingUp && (
            <div className="home-section">
              <h2 className="home-section-label">Coming up</h2>
              <div className="home-cards">
                {renderCards(comingUp, categories, onSelectTask, onFinishTask, onDeleteTask, onReactivateTask, syncColor)}
              </div>
            </div>
          )}
          {showHighPriority && (
            <div className="home-section">
              <h2 className="home-section-label">High priority</h2>
              <div className="home-cards">
                {renderCards(highPriority, categories, onSelectTask, onFinishTask, onDeleteTask, onReactivateTask, syncColor)}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="home-scroll-hint">
        <button
          className="home-scroll-btn"
          onClick={() => document.getElementById('all-tasks')?.scrollIntoView({ behavior: 'smooth' })}
        >
          See all tasks ↓
        </button>
      </div>
    </section>
  )
}
