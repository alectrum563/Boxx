import { useState, useEffect } from 'react'
import { useLocalStorage } from './hooks/useLocalStorage'
import { useNotifications } from './hooks/useNotifications'
import { useAuth } from './contexts/AuthContext'
import * as db from './lib/db'
import { supabase } from './lib/supabase'
import Navbar from './components/Navbar'
import Home from './components/Home'
import AllTasks from './components/AllTasks'
import Calendar from './components/Calendar'
import TaskDetail from './components/TaskDetail'
import FAB from './components/FAB'
import CreateTask from './components/CreateTask'
import CreateCategory from './components/CreateCategory'
import Auth from './components/Auth'

export default function App() {
  const { user, loading: authLoading } = useAuth()

  const [tasks, setTasks] = useState([])
  const [categories, setCategories] = useState([])
  const [displayName, setDisplayName] = useState('')
  const [dataLoading, setDataLoading] = useState(false)

  const [heroBg] = useLocalStorage('heroBg', null)
  const [heroBgAccent] = useLocalStorage('heroBgAccent', null)
  const [syncColors] = useLocalStorage('syncColors', false)
  const [notifPrefs] = useLocalStorage('notifPrefs', { enabled: false, offsets: [60 * 60 * 1000] })

  useNotifications(tasks, notifPrefs)
  const [selectedTask, setSelectedTask] = useState(null)
  const [modal, setModal] = useState(null)
  const [editingTask, setEditingTask] = useState(null)
  const [view, setView] = useState('tasks')

  useEffect(() => {
    if (!user) {
      setTasks([])
      setCategories([])
      setDisplayName('')
      return
    }
    loadData()
  }, [user])

  async function loadData() {
    setDataLoading(true)
    try {
      const [t, c, p] = await Promise.all([db.fetchTasks(), db.fetchCategories(), db.fetchProfile()])
      setTasks(t)
      setCategories(c)
      setDisplayName(p.displayName || '')
    } finally {
      setDataLoading(false)
    }
  }

  async function addCategory(cat) {
    const saved = await db.insertCategory(cat)
    setCategories(prev => [...prev, saved])
  }

  async function addTask(task) {
    const saved = await db.insertTask(task)
    setTasks(prev => [...prev, saved])
  }

  async function updateTask(updated) {
    await db.updateTask(updated)
    setTasks(prev => prev.map(t => t.id === updated.id ? updated : t))
    if (selectedTask?.id === updated.id) setSelectedTask(updated)
  }

  async function deleteTask(id) {
    const task = tasks.find(t => t.id === id)
    const deletedTask = { ...task, deleted: true, deletedAt: new Date().toISOString() }
    await db.updateTask(deletedTask)
    const remaining = tasks.filter(t => t.id !== id && t.categoryId === task?.categoryId && !t.deleted)
    if (task && task.categoryId !== 'ungrouped' && remaining.length === 0) {
      const cat = categories.find(c => c.id === task.categoryId)
      if (cat) {
        const updatedCat = { ...cat, isVisible: false }
        await db.updateCategory(updatedCat)
        setCategories(cats => cats.map(c => c.id === task.categoryId ? updatedCat : c))
      }
    }
    setTasks(prev => prev.map(t => t.id === id ? deletedTask : t))
    setSelectedTask(null)
  }

  async function finishTask(id) {
    const task = tasks.find(t => t.id === id)
    const updated = { ...task, completed: true }
    await db.updateTask(updated)
    setTasks(prev => prev.map(t => t.id === id ? updated : t))
  }

  async function reactivateTask(id) {
    const task = tasks.find(t => t.id === id)
    const updated = { ...task, completed: false }
    await db.updateTask(updated)
    setTasks(prev => prev.map(t => t.id === id ? updated : t))
    setSelectedTask(prev => prev?.id === id ? { ...prev, completed: false } : prev)
  }

  async function closeCategory(id) {
    const cat = categories.find(c => c.id === id)
    const updated = { ...cat, isVisible: false }
    await db.updateCategory(updated)
    setCategories(prev => prev.map(c => c.id === id ? updated : c))
  }

  function openCreateTask(task = null) {
    setEditingTask(task)
    setModal('create-task')
  }

  function closeModal() {
    setModal(null)
    setEditingTask(null)
  }

  const accentRgb = heroBgAccent
    ? `${heroBgAccent.r}, ${heroBgAccent.g}, ${heroBgAccent.b}`
    : null

  const syncColor = syncColors && heroBgAccent
    ? `rgb(${heroBgAccent.r}, ${heroBgAccent.g}, ${heroBgAccent.b})`
    : null

  // Show nothing while checking auth session
  if (authLoading) return null

  // Not logged in — show auth screen
  if (!user) return <Auth />

  const visibleTasks = tasks.filter(t => !t.deleted)

  return (
    <>
      {heroBg && (
        <div className="page-bg" aria-hidden="true">
          <div className="page-bg-img" style={{ backgroundImage: `url(${heroBg})` }} />
          {accentRgb && (
            <div
              className="page-bg-accent"
              style={{ background: `linear-gradient(to bottom, rgba(${accentRgb}, 0.08) 0%, transparent 25%, rgba(${accentRgb}, 0.52) 100%)` }}
            />
          )}
        </div>
      )}
      <Navbar view={view} onViewChange={setView} onSignOut={() => supabase.auth.signOut()} />
      <main>
        {dataLoading ? (
          <div className="app-loading">Loading…</div>
        ) : (
          <>
            {view === 'tasks' && (
              <>
                <Home
                  tasks={visibleTasks}
                  categories={categories}
                  displayName={displayName}
                  heroBgAccent={heroBgAccent}
                  syncColors={syncColors}
                  onSelectTask={setSelectedTask}
                  onFinishTask={finishTask}
                  onDeleteTask={deleteTask}
                  onReactivateTask={reactivateTask}
                />
                <AllTasks
                  tasks={visibleTasks}
                  categories={categories}
                  heroBgAccent={heroBgAccent}
                  syncColors={syncColors}
                  onSelectTask={setSelectedTask}
                  onCloseCategory={closeCategory}
                  onFinishTask={finishTask}
                  onDeleteTask={deleteTask}
                  onReactivateTask={reactivateTask}
                />
              </>
            )}
            {view === 'calendar' && (
              <Calendar
                tasks={visibleTasks}
                categories={categories}
                onSelectTask={setSelectedTask}
                heroBgAccent={heroBgAccent}
                syncColors={syncColors}
              />
            )}
          </>
        )}
      </main>

      <FAB
        onNewTask={() => openCreateTask(null)}
        onNewCategory={() => setModal('create-category')}
      />

      {selectedTask && (
        <TaskDetail
          task={selectedTask}
          categories={categories}
          syncColor={syncColor}
          onClose={() => setSelectedTask(null)}
          onEdit={(task) => {
            setSelectedTask(null)
            openCreateTask(task)
          }}
          onDelete={deleteTask}
          onFinish={(task) => updateTask({ ...task, completed: true })}
          onReactivate={(task) => reactivateTask(task.id)}
        />
      )}

      {modal === 'create-task' && (
        <CreateTask
          categories={categories}
          editingTask={editingTask}
          onSave={(task) => {
            editingTask ? updateTask(task) : addTask(task)
            closeModal()
          }}
          onClose={closeModal}
        />
      )}

      {modal === 'create-category' && (
        <CreateCategory
          onSave={(cat) => {
            addCategory(cat)
            closeModal()
          }}
          onClose={closeModal}
        />
      )}
    </>
  )
}
