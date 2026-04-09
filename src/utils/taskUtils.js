export const UNGROUPED_CATEGORY = {
  id: 'ungrouped',
  name: 'Ungrouped',
  color: '#9ca3af',
  isVisible: true,
}

export function deadlineUrgency(deadline) {
  if (!deadline) return 0
  const now = new Date()
  const due = deadline.includes('T') ? new Date(deadline) : new Date(deadline + 'T23:59:59')
  const diffMs = due - now
  const diffDays = diffMs / (1000 * 60 * 60 * 24)
  if (diffDays < 0) return 6   // overdue
  if (diffDays <= 1) return 5
  if (diffDays <= 3) return 4
  if (diffDays <= 7) return 3
  if (diffDays <= 14) return 2
  if (diffDays <= 30) return 1
  return 0
}

export function importanceScore(task) {
  return task.priority * 2 + deadlineUrgency(task.deadline)
}

export function sortByImportance(tasks) {
  return [...tasks].sort((a, b) => importanceScore(b) - importanceScore(a))
}

function deadlineDate(deadline) {
  return deadline.includes('T') ? new Date(deadline) : new Date(deadline + 'T23:59:59')
}

export function sortByDeadline(tasks) {
  return [...tasks].sort((a, b) => {
    if (!a.deadline && !b.deadline) return 0
    if (!a.deadline) return 1
    if (!b.deadline) return -1
    return deadlineDate(a.deadline) - deadlineDate(b.deadline)
  })
}
