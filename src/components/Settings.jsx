import { useState, useEffect, useRef } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { extractDominantColor } from '../utils/colorUtils'
import './Settings.css'

function GearIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

export default function Settings() {
  const [open, setOpen] = useState(false)
  const [darkMode, setDarkMode] = useLocalStorage('darkMode', false)
  const [heroBg, setHeroBg] = useLocalStorage('heroBg', null)
  const [heroBgAccent, setHeroBgAccent] = useLocalStorage('heroBgAccent', null)
  const [syncColors, setSyncColors] = useLocalStorage('syncColors', false)
  const fileRef = useRef(null)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''

    const reader = new FileReader()
    reader.onload = (ev) => {
      const img = new Image()
      img.onload = () => {
        // Resize to max 1920×1080 to keep localStorage usage reasonable
        const maxW = 1920, maxH = 1080
        let w = img.naturalWidth, h = img.naturalHeight
        if (w > maxW || h > maxH) {
          const scale = Math.min(maxW / w, maxH / h)
          w = Math.round(w * scale)
          h = Math.round(h * scale)
        }

        // Draw full-size version for storage
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        canvas.getContext('2d').drawImage(img, 0, 0, w, h)

        // Draw small version for color extraction
        const sc = document.createElement('canvas')
        sc.width = 80; sc.height = 80
        const sCtx = sc.getContext('2d')
        sCtx.drawImage(img, 0, 0, 80, 80)
        const accent = extractDominantColor(sCtx.getImageData(0, 0, 80, 80))

        try {
          setHeroBg(canvas.toDataURL('image/jpeg', 0.85))
          setHeroBgAccent(accent)
        } catch {
          alert('Image is too large to store. Please try a smaller image.')
        }
      }
      img.src = ev.target.result
    }
    reader.readAsDataURL(file)
  }

  function removeBackground() {
    setHeroBg(null)
    setHeroBgAccent(null)
  }

  return (
    <div className="settings-wrap">
      <button
        className={`settings-btn${open ? ' settings-btn--open' : ''}`}
        onClick={() => setOpen(o => !o)}
        aria-label="Settings"
        title="Settings"
      >
        <GearIcon />
      </button>

      {open && (
        <>
          <div className="settings-backdrop" onClick={() => setOpen(false)} />
          <div className="settings-panel">
            <p className="settings-heading">Settings</p>

            <div className="settings-row">
              <span className="settings-row-label">Dark mode</span>
              <label className="toggle" aria-label="Toggle dark mode">
                <input
                  type="checkbox"
                  checked={darkMode}
                  onChange={e => setDarkMode(e.target.checked)}
                />
                <span className="toggle-track" />
              </label>
            </div>

            {heroBg && heroBgAccent && (
              <div className="settings-row">
                <span className="settings-row-label">Sync colors</span>
                <label className="toggle" aria-label="Toggle sync colors">
                  <input
                    type="checkbox"
                    checked={syncColors}
                    onChange={e => setSyncColors(e.target.checked)}
                  />
                  <span className="toggle-track" />
                </label>
              </div>
            )}

            <div className="settings-row settings-row--col">
              <span className="settings-row-label">Background image</span>
              <div className="settings-bg-buttons">
                <button
                  className="settings-bg-import"
                  onClick={() => fileRef.current?.click()}
                >
                  {heroBg ? 'Change image' : 'Import image'}
                </button>
                {heroBg && (
                  <button className="settings-bg-remove" onClick={removeBackground}>
                    Remove
                  </button>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
