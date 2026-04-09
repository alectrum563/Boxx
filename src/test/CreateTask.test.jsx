import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CreateTask from '../components/CreateTask'

const categories = [
  { id: 'cat1', name: 'Work', color: '#4f8ef7', isVisible: true },
  { id: 'cat2', name: 'Personal', color: '#22c55e', isVisible: true },
]

function renderCreateTask(props = {}) {
  const defaults = {
    categories,
    editingTask: null,
    onSave: vi.fn(),
    onClose: vi.fn(),
  }
  return render(<CreateTask {...defaults} {...props} />)
}

describe('CreateTask – validation', () => {
  it('shows an error when submitting with no name', async () => {
    renderCreateTask()
    fireEvent.click(screen.getByText('Create task'))
    expect(await screen.findByText('Name is required')).toBeInTheDocument()
  })

  it('does not require a category (category is optional)', async () => {
    renderCreateTask()
    fireEvent.click(screen.getByText('Create task'))
    await screen.findByText('Name is required')
    expect(screen.queryByText('Category is required')).not.toBeInTheDocument()
  })
})

describe('CreateTask – submission', () => {
  it('calls onSave with correct data when submitted with a category', async () => {
    const onSave = vi.fn()
    const user = userEvent.setup()
    renderCreateTask({ onSave })

    await user.type(screen.getByPlaceholderText('Task name'), 'Fix bug')
    await user.selectOptions(screen.getByRole('combobox'), 'cat1')
    fireEvent.click(screen.getByText('Create task'))

    await waitFor(() => expect(onSave).toHaveBeenCalledOnce())
    const saved = onSave.mock.calls[0][0]
    expect(saved.name).toBe('Fix bug')
    expect(saved.categoryId).toBe('cat1')
    expect(saved.completed).toBe(false)
    expect(saved.id).toBeTruthy()
  })

  it('defaults categoryId to "ungrouped" when no category selected', async () => {
    const onSave = vi.fn()
    const user = userEvent.setup()
    renderCreateTask({ onSave })

    await user.type(screen.getByPlaceholderText('Task name'), 'Uncategorised task')
    fireEvent.click(screen.getByText('Create task'))

    await waitFor(() => expect(onSave).toHaveBeenCalledOnce())
    expect(onSave.mock.calls[0][0].categoryId).toBe('ungrouped')
  })

  it('preserves id and createdAt when editing', async () => {
    const onSave = vi.fn()
    const user = userEvent.setup()
    const editingTask = {
      id: 'existing-id',
      name: 'Old name',
      categoryId: 'cat1',
      priority: 2,
      deadline: null,
      description: '',
      location: '',
      links: [],
      completed: false,
      createdAt: '2024-01-01T00:00:00.000Z',
    }
    renderCreateTask({ editingTask, onSave })

    const nameInput = screen.getByDisplayValue('Old name')
    await user.clear(nameInput)
    await user.type(nameInput, 'New name')
    fireEvent.click(screen.getByText('Save changes'))

    await waitFor(() => expect(onSave).toHaveBeenCalledOnce())
    const saved = onSave.mock.calls[0][0]
    expect(saved.id).toBe('existing-id')
    expect(saved.createdAt).toBe('2024-01-01T00:00:00.000Z')
    expect(saved.name).toBe('New name')
  })

  it('calls onClose when Cancel is clicked', () => {
    const onClose = vi.fn()
    renderCreateTask({ onClose })
    fireEvent.click(screen.getByText('Cancel'))
    expect(onClose).toHaveBeenCalledOnce()
  })
})

describe('CreateTask – links', () => {
  it('adds a link row when "Add link" is clicked', () => {
    renderCreateTask()
    fireEvent.click(screen.getByText('+ Add link'))
    expect(screen.getByPlaceholderText('Label')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('https://…')).toBeInTheDocument()
  })

  it('removes a link row when its × button is clicked', () => {
    renderCreateTask()
    fireEvent.click(screen.getByText('+ Add link'))
    expect(screen.getByPlaceholderText('Label')).toBeInTheDocument()
    // Use the CSS class to target the link-remove button specifically
    fireEvent.click(document.querySelector('.link-remove'))
    expect(screen.queryByPlaceholderText('Label')).not.toBeInTheDocument()
  })
})
