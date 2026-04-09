import { UNGROUPED_CATEGORY } from '../utils/taskUtils'
import CategoryRow from './CategoryRow'
import './AllTasks.css'

export default function AllTasks({ tasks, categories, heroBgAccent, syncColors, onSelectTask, onCloseCategory, onFinishTask, onDeleteTask, onReactivateTask }) {
  const visibleCategories = categories.filter(c => c.isVisible)
  const ungroupedTasks = tasks.filter(t => t.categoryId === 'ungrouped' || !t.categoryId)
  const showUngrouped = ungroupedTasks.length > 0
  const hasContent = visibleCategories.length > 0 || showUngrouped

  const syncColor = syncColors && heroBgAccent
    ? `rgb(${heroBgAccent.r}, ${heroBgAccent.g}, ${heroBgAccent.b})`
    : null

  const sectionStyle = heroBgAccent ? {
    '--all-tasks-bg': `color-mix(in srgb, rgb(${heroBgAccent.r}, ${heroBgAccent.g}, ${heroBgAccent.b}) 22%, var(--bg))`,
  } : {}

  return (
    <section id="all-tasks" className="all-tasks" style={sectionStyle}>
      <div className="all-tasks-inner">
        <h2 className="all-tasks-heading">All Tasks</h2>

        {!hasContent ? (
          <p className="all-tasks-empty">
            No categories yet. Use the + button to create one.
          </p>
        ) : (
          <div className="all-tasks-rows">
            {visibleCategories.map(cat => {
              const catTasks = tasks.filter(t => t.categoryId === cat.id)
              const displayCat = syncColor ? { ...cat, color: syncColor } : cat
              return (
                <CategoryRow
                  key={cat.id}
                  category={displayCat}
                  tasks={catTasks}
                  onSelectTask={onSelectTask}
                  onClose={onCloseCategory}
                  onFinishTask={onFinishTask}
                  onDeleteTask={onDeleteTask}
                  onReactivateTask={onReactivateTask}
                />
              )
            })}
            {showUngrouped && (
              <CategoryRow
                key="ungrouped"
                category={syncColor ? { ...UNGROUPED_CATEGORY, color: syncColor } : UNGROUPED_CATEGORY}
                tasks={ungroupedTasks}
                onSelectTask={onSelectTask}
                onClose={null}
                onFinishTask={onFinishTask}
                onDeleteTask={onDeleteTask}
                onReactivateTask={onReactivateTask}
              />
            )}
          </div>
        )}
      </div>
    </section>
  )
}
