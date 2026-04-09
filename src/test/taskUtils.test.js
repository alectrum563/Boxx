import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { deadlineUrgency, importanceScore, sortByImportance } from '../utils/taskUtils'

// Fix system time to noon so end-of-day deadlines give deterministic diffs
const FIXED_NOW = new Date('2026-04-03T12:00:00')

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(FIXED_NOW)
})

afterEach(() => {
  vi.useRealTimers()
})

// Returns a local YYYY-MM-DD string n days from the fixed date
function daysFromNow(n) {
  const d = new Date(FIXED_NOW)
  d.setDate(d.getDate() + n)
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-')
}

// At noon, end-of-day deadlines give these diffs (in days):
//  daysFromNow(-1) → ~-0.5  → < 0   → 6
//  daysFromNow(0)  → ~+0.5  → ≤ 1   → 5
//  daysFromNow(1)  → ~+1.5  → ≤ 3   → 4
//  daysFromNow(2)  → ~+2.5  → ≤ 3   → 4
//  daysFromNow(3)  → ~+3.5  → ≤ 7   → 3
//  daysFromNow(6)  → ~+6.5  → ≤ 7   → 3
//  daysFromNow(7)  → ~+7.5  → ≤ 14  → 2
//  daysFromNow(13) → ~+13.5 → ≤ 14  → 2
//  daysFromNow(14) → ~+14.5 → ≤ 30  → 1
//  daysFromNow(29) → ~+29.5 → ≤ 30  → 1
//  daysFromNow(31) → ~+31.5 → > 30  → 0

describe('deadlineUrgency', () => {
  it('returns 0 for null deadline', () => {
    expect(deadlineUrgency(null)).toBe(0)
  })

  it('returns 6 for overdue deadline (yesterday)', () => {
    expect(deadlineUrgency(daysFromNow(-1))).toBe(6)
  })

  it('returns 5 for deadline due today', () => {
    expect(deadlineUrgency(daysFromNow(0))).toBe(5)
  })

  it('returns 4 for deadline due tomorrow', () => {
    expect(deadlineUrgency(daysFromNow(1))).toBe(4)
  })

  it('returns 4 for deadline in 2 days', () => {
    expect(deadlineUrgency(daysFromNow(2))).toBe(4)
  })

  it('returns 3 for deadline in 3 days', () => {
    expect(deadlineUrgency(daysFromNow(3))).toBe(3)
  })

  it('returns 3 for deadline in 6 days', () => {
    expect(deadlineUrgency(daysFromNow(6))).toBe(3)
  })

  it('returns 2 for deadline in 7 days', () => {
    expect(deadlineUrgency(daysFromNow(7))).toBe(2)
  })

  it('returns 2 for deadline in 13 days', () => {
    expect(deadlineUrgency(daysFromNow(13))).toBe(2)
  })

  it('returns 1 for deadline in 14 days', () => {
    expect(deadlineUrgency(daysFromNow(14))).toBe(1)
  })

  it('returns 1 for deadline in 29 days', () => {
    expect(deadlineUrgency(daysFromNow(29))).toBe(1)
  })

  it('returns 0 for deadline far in the future', () => {
    expect(deadlineUrgency(daysFromNow(31))).toBe(0)
  })
})

describe('importanceScore', () => {
  it('is priority*2 when no deadline', () => {
    expect(importanceScore({ priority: 3, deadline: null })).toBe(6)
  })

  it('adds urgency 5 for a deadline due today', () => {
    expect(importanceScore({ priority: 2, deadline: daysFromNow(0) })).toBe(2 * 2 + 5)
  })

  it('gives max score for priority 5 + overdue deadline', () => {
    expect(importanceScore({ priority: 5, deadline: daysFromNow(-1) })).toBe(5 * 2 + 6)
  })
})

describe('sortByImportance', () => {
  it('sorts highest importance first', () => {
    const tasks = [
      { id: 'a', priority: 1, deadline: null },
      { id: 'b', priority: 5, deadline: daysFromNow(0) },
      { id: 'c', priority: 3, deadline: daysFromNow(7) },
    ]
    const sorted = sortByImportance(tasks)
    expect(sorted[0].id).toBe('b')
    expect(sorted[1].id).toBe('c')
    expect(sorted[2].id).toBe('a')
  })

  it('does not mutate the original array', () => {
    const tasks = [
      { id: 'a', priority: 1, deadline: null },
      { id: 'b', priority: 5, deadline: null },
    ]
    const original = [...tasks]
    sortByImportance(tasks)
    expect(tasks).toEqual(original)
  })

  it('returns empty array for empty input', () => {
    expect(sortByImportance([])).toEqual([])
  })
})
