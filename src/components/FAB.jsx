import { useState } from 'react'
import './FAB.css'

export default function FAB({ onNewTask, onNewCategory }) {
  const [open, setOpen] = useState(false)

  function handleOption(fn) {
    setOpen(false)
    fn()
  }

  return (
    <div className="fab-container">
      {open && (
        <>
          <div className="fab-backdrop" onClick={() => setOpen(false)} />
          <div className="fab-menu">
            <button className="fab-option" onClick={() => handleOption(onNewCategory)}>
              <span className="fab-option-icon">🏷️</span>
              New Category
            </button>
            <button className="fab-option" onClick={() => handleOption(onNewTask)}>
              <span className="fab-option-icon">📝</span>
              New Task
            </button>
          </div>
        </>
      )}
      <button
        className={`fab-btn${open ? ' fab-btn--open' : ''}`}
        onClick={() => setOpen(o => !o)}
        aria-label="Add new"
      >
        +
      </button>
    </div>
  )
}
