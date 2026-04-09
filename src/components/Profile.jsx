import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { fetchProfile, upsertProfile } from '../lib/db'
import './Profile.css'

const TIMEZONES = Intl.supportedValuesOf?.('timeZone') ?? [
  'UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Asia/Tokyo', 'Asia/Shanghai',
  'Asia/Kolkata', 'Australia/Sydney',
]

function getInitials(displayName, email) {
  if (displayName?.trim()) return displayName.trim()[0].toUpperCase()
  if (email) return email[0].toUpperCase()
  return '?'
}

export default function Profile({ onSignOut }) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC')
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState(null) // { type: 'success'|'error', msg }
  const [loaded, setLoaded] = useState(false)
  const panelRef = useRef(null)

  useEffect(() => {
    if (open && !loaded) {
      fetchProfile().then(p => {
        setDisplayName(p.displayName)
        setTimezone(p.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC')
        setLoaded(true)
      })
    }
  }, [open, loaded])

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setStatus(null)
    try {
      await upsertProfile({ displayName, timezone })
      setStatus({ type: 'success', msg: 'Saved!' })
      setTimeout(() => setStatus(null), 2500)
    } catch (err) {
      setStatus({ type: 'error', msg: err.message })
    } finally {
      setSaving(false)
    }
  }

  const initials = getInitials(displayName, user?.email)

  return (
    <div className="profile-wrap">
      <button
        className={`profile-btn${open ? ' profile-btn--open' : ''}`}
        onClick={() => setOpen(o => !o)}
        aria-label="Profile"
        title="Profile"
      >
        <span className="profile-avatar">{initials}</span>
      </button>

      {open && (
        <>
          <div className="profile-backdrop" onClick={() => setOpen(false)} />
          <div className="profile-panel" ref={panelRef}>
            <div className="profile-panel-header">
              <div className="profile-panel-avatar">{initials}</div>
              <div className="profile-panel-identity">
                {displayName && <p className="profile-panel-name">{displayName}</p>}
                <p className="profile-panel-email">{user?.email}</p>
              </div>
            </div>

            <form className="profile-form" onSubmit={handleSave}>
              <div className="profile-field">
                <label>Display name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  placeholder="Your name"
                />
              </div>

              <div className="profile-field">
                <label>Email</label>
                <input
                  type="text"
                  value={user?.email ?? ''}
                  disabled
                  className="profile-field-readonly"
                />
              </div>

              <div className="profile-field">
                <label>Time zone</label>
                <select value={timezone} onChange={e => setTimezone(e.target.value)}>
                  {TIMEZONES.map(tz => (
                    <option key={tz} value={tz}>{tz.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>

              {status && (
                <p className={`profile-status profile-status--${status.type}`}>{status.msg}</p>
              )}

              <button type="submit" className="profile-save-btn" disabled={saving}>
                {saving ? 'Saving…' : 'Save changes'}
              </button>
            </form>

            <div className="profile-panel-footer">
              <button className="profile-signout-btn" onClick={onSignOut}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Sign out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
