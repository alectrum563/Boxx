import Settings from './Settings'
import NotificationSettings from './NotificationSettings'
import Profile from './Profile'
import './Navbar.css'

function Logo() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="28" height="28" rx="7" fill="currentColor" />
      <line x1="8" y1="10" x2="20" y2="10" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <line x1="8" y1="14.5" x2="16" y2="14.5" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <path d="M14 20l2.5 2.5 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function Navbar({ view, onViewChange, onSignOut }) {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Logo />
        <span className="navbar-title">Boxx</span>
      </div>

      <div className="navbar-tabs">
        <button
          className={`navbar-tab${view === 'tasks' ? ' navbar-tab--active' : ''}`}
          onClick={() => onViewChange('tasks')}
        >
          Tasks
        </button>
        <button
          className={`navbar-tab${view === 'calendar' ? ' navbar-tab--active' : ''}`}
          onClick={() => onViewChange('calendar')}
        >
          Calendar
        </button>
      </div>

      <div className="navbar-right">
        {view === 'tasks' && (
          <a
            href="#all-tasks"
            className="navbar-link"
            onClick={(e) => {
              e.preventDefault()
              document.getElementById('all-tasks')?.scrollIntoView({ behavior: 'smooth' })
            }}
          >
            All Tasks ↓
          </a>
        )}
        <Settings />
        <NotificationSettings />
        <Profile onSignOut={onSignOut} />
      </div>
    </nav>
  )
}
