import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import TaskCard from '../components/TaskCard'

const FIXED_NOW = new Date('2026-04-03T12:00:00')

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(FIXED_NOW)
})

afterEach(() => {
  vi.useRealTimers()
})

function daysFromNow(n) {
  const d = new Date(FIXED_NOW)
  d.setDate(d.getDate() + n)
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-')
}

const baseTask = {
  id: '1',
  name: 'Buy groceries',
  priority: 3,
  deadline: null,
  completed: false,
  categoryId: 'cat1',
  description: '',
  location: '',
  links: [],
  createdAt: new Date().toISOString(),
}

const props = (overrides = {}) => ({
  task: { ...baseTask, ...overrides },
  onClick: vi.fn(),
  onFinish: vi.fn(),
  onDelete: vi.fn(),
  onReactivate: vi.fn(),
})

describe('TaskCard – active task', () => {
  it('renders the task name', () => {
    render(<TaskCard {...props()} />)
    expect(screen.getByText('Buy groceries')).toBeInTheDocument()
  })

  it('renders 3 filled stars and 2 empty stars', () => {
    render(<TaskCard {...props()} />)
    expect(screen.getAllByText('★')).toHaveLength(3)
    expect(screen.getAllByText('☆')).toHaveLength(2)
  })

  it('shows "No deadline" when deadline is null', () => {
    render(<TaskCard {...props()} />)
    expect(screen.getByText('No deadline')).toBeInTheDocument()
  })

  it('shows a formatted deadline when set', () => {
    render(<TaskCard {...props({ deadline: daysFromNow(10) })} />)
    expect(screen.getByText(/^Due /)).toBeInTheDocument()
  })

  it('applies urgent class for deadline within 2 days', () => {
    render(<TaskCard {...props({ deadline: daysFromNow(1) })} />)
    expect(screen.getByText(/^Due /)).toHaveClass('urgent')
  })

  it('does not apply urgent class for deadline far away', () => {
    render(<TaskCard {...props({ deadline: daysFromNow(10) })} />)
    expect(screen.getByText(/^Due /)).not.toHaveClass('urgent')
  })

  it('calls onClick when the card is clicked', () => {
    const p = props()
    render(<TaskCard {...p} />)
    fireEvent.click(screen.getByText('Buy groceries'))
    expect(p.onClick).toHaveBeenCalledOnce()
  })

  it('calls onFinish when 🏁 is clicked without triggering onClick', () => {
    const p = props()
    render(<TaskCard {...p} />)
    fireEvent.click(screen.getByTitle('Finish task'))
    expect(p.onFinish).toHaveBeenCalledOnce()
    expect(p.onClick).not.toHaveBeenCalled()
  })
})

describe('TaskCard – completed task', () => {
  it('shows the task name struck through', () => {
    render(<TaskCard {...props({ completed: true })} />)
    expect(screen.getByText('Buy groceries')).toBeInTheDocument()
  })

  it('shows "Finished ✓" label', () => {
    render(<TaskCard {...props({ completed: true })} />)
    expect(screen.getByText('Finished ✓')).toBeInTheDocument()
  })

  it('shows the 💡 restart and ✕ delete action buttons', () => {
    render(<TaskCard {...props({ completed: true })} />)
    expect(screen.getByTitle('Restart task')).toBeInTheDocument()
    expect(screen.getByTitle('Remove task')).toBeInTheDocument()
  })

  it('does not show the 🏁 finish button', () => {
    render(<TaskCard {...props({ completed: true })} />)
    expect(screen.queryByTitle('Finish task')).not.toBeInTheDocument()
  })

  it('calls onReactivate when 💡 is clicked', () => {
    const p = props({ completed: true })
    render(<TaskCard {...p} />)
    fireEvent.click(screen.getByTitle('Restart task'))
    expect(p.onReactivate).toHaveBeenCalledOnce()
  })

  it('calls onDelete when ✕ is clicked', () => {
    const p = props({ completed: true })
    render(<TaskCard {...p} />)
    fireEvent.click(screen.getByTitle('Remove task'))
    expect(p.onDelete).toHaveBeenCalledOnce()
  })

  it('restart and delete buttons do not trigger onClick', () => {
    const p = props({ completed: true })
    render(<TaskCard {...p} />)
    fireEvent.click(screen.getByTitle('Restart task'))
    fireEvent.click(screen.getByTitle('Remove task'))
    expect(p.onClick).not.toHaveBeenCalled()
  })
})
