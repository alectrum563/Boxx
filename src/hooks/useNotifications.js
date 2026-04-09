import { useEffect, useRef } from 'react'

function deadlineMs(deadline) {
  if (!deadline) return null
  return deadline.includes('T')
    ? new Date(deadline).getTime()
    : new Date(deadline + 'T23:59:59').getTime()
}

function offsetLabel(ms) {
  const h = ms / 3600000
  if (h < 1) return `${ms / 60000} minutes`
  if (h === 1) return '1 hour'
  if (h < 24) return `${h} hours`
  if (h === 24) return '1 day'
  return `${h / 24} days`
}

async function fireNotification(task, offsetMs) {
  if (Notification.permission !== 'granted') return
  const label = offsetLabel(offsetMs)
  const options = {
    body: `Due: ${task.deadline?.includes('T')
      ? new Date(task.deadline).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
      : new Date(task.deadline + 'T00:00:00').toLocaleDateString('en-US', { dateStyle: 'medium' })}`,
    icon: '/favicon.svg',
    tag: `task-${task.id}-${offsetMs}`,
    renotify: false,
  }

  try {
    const reg = await navigator.serviceWorker.ready
    reg.showNotification(`⏰ "${task.name}" in ${label}`, options)
  } catch {
    new Notification(`⏰ "${task.name}" in ${label}`, options)
  }
}

export function useNotifications(tasks, prefs) {
  const timersRef = useRef([])

  useEffect(() => {
    // Clear previous timers
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []

    if (!prefs?.enabled || Notification.permission !== 'granted') return
    if (!prefs.offsets?.length || !tasks?.length) return

    const now = Date.now()
    const maxScheduleMs = 7 * 24 * 60 * 60 * 1000 // only schedule within 7 days

    tasks.forEach(task => {
      if (task.completed || task.deleted || !task.deadline) return
      const dueMs = deadlineMs(task.deadline)
      if (!dueMs) return

      prefs.offsets.forEach(offsetMs => {
        const notifyAt = dueMs - offsetMs
        const delay = notifyAt - now

        if (delay > 0 && delay <= maxScheduleMs) {
          const timer = setTimeout(() => fireNotification(task, offsetMs), delay)
          timersRef.current.push(timer)
        }
      })
    })

    return () => {
      timersRef.current.forEach(clearTimeout)
      timersRef.current = []
    }
  }, [tasks, prefs])
}
