import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import App from '../App'

beforeEach(() => {
  localStorage.clear()
  vi.spyOn(window, 'confirm').mockReturnValue(true)
})

function seedStorage(tasks = [], categories = []) {
  localStorage.setItem('tasks', JSON.stringify(tasks))
  localStorage.setItem('categories', JSON.stringify(categories))
}

function makeCategory(overrides = {}) {
  return { id: 'cat1', name: 'Work', color: '#4f8ef7', isVisible: true, ...overrides }
}

function makeTask(overrides = {}) {
  return {
    id: 'task1',
    name: 'Write report',
    categoryId: 'cat1',
    priority: 3,
    deadline: null,
    description: '',
    location: '',
    links: [],
    completed: false,
    createdAt: new Date().toISOString(),
    ...overrides,
  }
}

describe('App – rendering', () => {
  it('renders the navbar title', () => {
    render(<App />)
    expect(screen.getByText('Boxx')).toBeInTheDocument()
  })

  it('shows empty state when no tasks exist', () => {
    render(<App />)
    expect(screen.getByText(/No tasks yet/)).toBeInTheDocument()
  })

  it('shows top priorities section when tasks exist', () => {
    seedStorage([makeTask()], [makeCategory()])
    render(<App />)
    expect(screen.getByText('Top priorities')).toBeInTheDocument()
    expect(screen.getAllByText('Write report').length).toBeGreaterThan(0)
  })
})

describe('App – finishing a task', () => {
  it('shows Finished ✓ after clicking 🏁 on the card', async () => {
    seedStorage([makeTask()], [makeCategory()])
    render(<App />)
    // Task appears in both Home and AllTasks — click the first instance
    fireEvent.click(screen.getAllByTitle('Finish task')[0])
    expect(await screen.findByText('Finished ✓')).toBeInTheDocument()
  })
})

describe('App – reactivating a finished task', () => {
  it('removes "Finished ✓" after clicking 💡', async () => {
    seedStorage([makeTask({ completed: true })], [makeCategory()])
    render(<App />)
    expect(screen.getAllByText('Finished ✓').length).toBeGreaterThan(0)
    fireEvent.click(screen.getAllByTitle('Restart task')[0])
    await waitFor(() => expect(screen.queryByText('Finished ✓')).not.toBeInTheDocument())
  })
})

describe('App – deleting a task', () => {
  it('removes the task card after clicking ✕', async () => {
    seedStorage([makeTask({ completed: true })], [makeCategory()])
    render(<App />)
    fireEvent.click(screen.getAllByTitle('Remove task')[0])
    await waitFor(() => expect(screen.queryByText('Write report')).not.toBeInTheDocument())
  })

  it('retains the task in localStorage with deleted:true after clicking ✕', async () => {
    seedStorage([makeTask({ completed: true })], [makeCategory()])
    render(<App />)
    fireEvent.click(screen.getAllByTitle('Remove task')[0])
    await waitFor(() => expect(screen.queryByText('Write report')).not.toBeInTheDocument())
    const stored = JSON.parse(localStorage.getItem('tasks'))
    expect(stored).toHaveLength(1)
    expect(stored[0].deleted).toBe(true)
    expect(stored[0].deletedAt).toBeTruthy()
  })

  it('hides the category row when its last task is deleted', async () => {
    seedStorage([makeTask({ completed: true })], [makeCategory()])
    render(<App />)
    fireEvent.click(screen.getAllByTitle('Remove task')[0])
    await waitFor(() => expect(screen.queryByText('Work')).not.toBeInTheDocument())
  })

  it('keeps the category when other tasks remain', async () => {
    const tasks = [
      makeTask({ id: 'task1', completed: true }),
      makeTask({ id: 'task2', name: 'Another task', completed: false }),
    ]
    seedStorage(tasks, [makeCategory()])
    render(<App />)
    fireEvent.click(screen.getAllByTitle('Remove task')[0])
    await waitFor(() => expect(screen.queryByText('Write report')).not.toBeInTheDocument())
    expect(screen.getByText('Work')).toBeInTheDocument()
  })
})

describe('App – ungrouped tasks', () => {
  it('shows the Ungrouped row when a task has no category', () => {
    seedStorage([makeTask({ categoryId: 'ungrouped' })], [])
    render(<App />)
    expect(screen.getByText('Ungrouped')).toBeInTheDocument()
  })

  it('hides Ungrouped row when its last task is deleted', async () => {
    seedStorage([makeTask({ categoryId: 'ungrouped', completed: true })], [])
    render(<App />)
    expect(screen.getByText('Ungrouped')).toBeInTheDocument()
    fireEvent.click(screen.getAllByTitle('Remove task')[0])
    await waitFor(() => expect(screen.queryByText('Ungrouped')).not.toBeInTheDocument())
  })
})

describe('App – FAB opens modals', () => {
  it('opens the New Task modal', async () => {
    render(<App />)
    fireEvent.click(screen.getByLabelText('Add new'))
    fireEvent.click(await screen.findByText('New Task'))
    expect(await screen.findByRole('heading', { name: 'New Task' })).toBeInTheDocument()
  })

  it('opens the New Category modal', async () => {
    render(<App />)
    fireEvent.click(screen.getByLabelText('Add new'))
    fireEvent.click(await screen.findByText('New Category'))
    expect(await screen.findByRole('heading', { name: 'New Category' })).toBeInTheDocument()
  })
})
