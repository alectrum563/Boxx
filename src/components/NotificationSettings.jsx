import { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import './NotificationSettings.css'

const OFFSETS = [
  { label: '15 minutes before', value: 15 * 60 * 1000 },
  { label: '30 minutes before', value: 30 * 60 * 1000 },
  { label: '1 hour before',     value: 60 * 60 * 1000 },
  { label: '3 hours before',    value: 3 * 60 * 60 * 1000 },
  { label: '6 hours before',    value: 6 * 60 * 60 * 1000 },
  { label: '1 day before',      value: 24 * 60 * 60 * 1000 },
  { label: '2 days before',     value: 2 * 24 * 60 * 60 * 1000 },
]

function BellIcon({ active }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  )
}

export default function NotificationSettings() {
  const [open, setOpen] = useState(false)
  const [prefs, setPrefs] = useLocalStorage('notifPrefs', { enabled: false, offsets: [60 * 60 * 1000] })

  const permission = typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  const supported = typeof Notification !== 'undefined'

  async function requestPermission() {
    const result = await Notification.requestPermission()
    if (result === 'granted' && !prefs.enabled) {
      setPrefs(p => ({ ...p, enabled: true }))
    }
  }

  function toggleEnabled(val) {
    if (val && permission !== 'granted') {
      requestPermission()
    } else {
      setPrefs(p => ({ ...p, enabled: val }))
    }
  }

  function toggleOffset(value) {
    setPrefs(p => {
      const exists = p.offsets.includes(value)
      return {
        ...p,
        offsets: exists
          ? p.offsets.filter(v => v !== value)
          : [...p.offsets, value],
      }
    })
  }

  const isActive = prefs.enabled && permission === 'granted'

  return (
    <div className="notif-wrap">
      <button
        className={`notif-btn${open ? ' notif-btn--open' : ''}${isActive ? ' notif-btn--active' : ''}`}
        onClick={() => setOpen(o => !o)}
        aria-label="Notification settings"
        title="Notification settings"
      >
        <BellIcon active={isActive} />
        {isActive && <span className="notif-dot" />}
      </button>

      {open && (
        <>
          <div className="notif-backdrop" onClick={() => setOpen(false)} />
          <div className="notif-panel">
            <p className="notif-heading">Notifications</p>

            {!supported ? (
              <p className="notif-unsupported">Not supported in this browser.</p>
            ) : (
              <>
                {permission === 'denied' && (
                  <p className="notif-denied">
                    Notifications are blocked. Enable them in your browser site settings.
                  </p>
                )}

                {permission === 'default' && (
                  <div className="notif-row">
                    <button className="notif-grant-btn" onClick={requestPermission}>
                      Grant permission
                    </button>
                  </div>
                )}

                {permission === 'granted' && (
                  <div className="notif-row">
                    <span className="notif-row-label">Enable notifications</span>
                    <label className="toggle" aria-label="Toggle notifications">
                      <input
                        type="checkbox"
                        checked={prefs.enabled}
                        onChange={e => toggleEnabled(e.target.checked)}
                      />
                      <span className="toggle-track" />
                    </label>
                  </div>
                )}

                <p className="notif-subheading">Notify me before deadline</p>
                <div className="notif-offsets">
                  {OFFSETS.map(o => (
                    <label key={o.value} className="notif-offset-row">
                      <input
                        type="checkbox"
                        checked={prefs.offsets.includes(o.value)}
                        onChange={() => toggleOffset(o.value)}
                        disabled={!prefs.enabled || permission !== 'granted'}
                      />
                      <span>{o.label}</span>
                    </label>
                  ))}
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}
