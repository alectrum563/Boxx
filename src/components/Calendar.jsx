import { useState } from 'react'
import './Calendar.css'

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function toDateStr(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-')
}

function getCalendarGrid(year, month) {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startPad = firstDay.getDay() // 0 = Sun

  const days = []

  // Padding from previous month
  for (let i = 0; i < startPad; i++) {
    days.push({ date: new Date(year, month, 1 - (startPad - i)), isCurrentMonth: false })
  }

  // Current month
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push({ date: new Date(year, month, d), isCurrentMonth: true })
  }

  // Padding to complete last week
  let next = 1
  while (days.length % 7 !== 0) {
    days.push({ date: new Date(year, month + 1, next++), isCurrentMonth: false })
  }

  return days
}

export default function Calendar({ tasks, categories, onSelectTask, heroBgAccent, syncColors }) {
  const syncColor = syncColors && heroBgAccent
    ? `rgb(${heroBgAccent.r}, ${heroBgAccent.g}, ${heroBgAccent.b})`
    : null
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())

  const todayStr = toDateStr(now)
  const days = getCalendarGrid(year, month)

  // Group tasks by their deadline date string
  const tasksByDate = {}
  tasks.forEach(task => {
    if (!task.deadline) return
    if (!tasksByDate[task.deadline]) tasksByDate[task.deadline] = []
    tasksByDate[task.deadline].push(task)
  })

  const noDeadlineCount = tasks.filter(t => !t.deadline && !t.completed).length

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }

  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  const monthLabel = new Date(year, month, 1).toLocaleDateString('en-US', {
    month: 'long', year: 'numeric',
  })

  return (
    <section className="calendar-view">
      <div className="calendar-header">
        <div className="calendar-nav">
          <button className="cal-nav-btn" onClick={prevMonth}>‹</button>
          <span className="calendar-month-label">{monthLabel}</span>
          <button className="cal-nav-btn" onClick={nextMonth}>›</button>
        </div>
        <button
          className="cal-today-btn"
          onClick={() => { setYear(now.getFullYear()); setMonth(now.getMonth()) }}
        >
          Today
        </button>
      </div>

      {noDeadlineCount > 0 && (
        <p className="calendar-no-deadline-note">
          {noDeadlineCount} active task{noDeadlineCount !== 1 ? 's have' : ' has'} no deadline and won't appear on the calendar.
        </p>
      )}

      <div className="calendar-grid">
        {DOW.map(d => (
          <div key={d} className="calendar-dow">{d}</div>
        ))}

        {days.map(({ date, isCurrentMonth }) => {
          const dateStr = toDateStr(date)
          const dayTasks = tasksByDate[dateStr] || []
          const isToday = dateStr === todayStr
          const isPast = dateStr < todayStr

          return (
            <div
              key={dateStr}
              className={[
                'calendar-cell',
                !isCurrentMonth && 'calendar-cell--other',
                isToday && 'calendar-cell--today',
              ].filter(Boolean).join(' ')}
            >
              <span className="calendar-day-num">{date.getDate()}</span>

              <div className="calendar-chips">
                {dayTasks.map(task => {
                  const cat = categories.find(c => c.id === task.categoryId)
                  const color = syncColor || cat?.color || '#9ca3af'
                  const overdue = isPast && !task.completed
                  return (
                    <button
                      key={task.id}
                      className={[
                        'calendar-chip',
                        task.completed && 'chip--done',
                        overdue && 'chip--overdue',
                      ].filter(Boolean).join(' ')}
                      style={{ borderLeftColor: color }}
                      onClick={() => onSelectTask(task)}
                      title={task.name}
                    >
                      {task.name}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
