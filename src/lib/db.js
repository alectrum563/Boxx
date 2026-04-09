import { supabase } from './supabase'

async function uid() {
  const { data: { user } } = await supabase.auth.getUser()
  return user.id
}

// ── Mappers ────────────────────────────────────────────────────────────────

function taskFromRow(row) {
  return {
    id: row.id,
    name: row.name,
    categoryId: row.category_id ?? 'ungrouped',
    priority: row.priority,
    deadline: row.deadline ?? null,
    description: row.description ?? '',
    location: row.location ?? '',
    links: row.links ?? [],
    completed: row.completed,
    deleted: row.deleted,
    deletedAt: row.deleted_at ?? undefined,
    createdAt: row.created_at,
  }
}

function taskToRow(task) {
  return {
    id: task.id,
    name: task.name,
    category_id: task.categoryId === 'ungrouped' ? null : task.categoryId,
    priority: task.priority,
    deadline: task.deadline ?? null,
    description: task.description ?? '',
    location: task.location ?? '',
    links: task.links ?? [],
    completed: task.completed ?? false,
    deleted: task.deleted ?? false,
    deleted_at: task.deletedAt ?? null,
    created_at: task.createdAt,
  }
}

function categoryFromRow(row) {
  return {
    id: row.id,
    name: row.name,
    color: row.color,
    isVisible: row.is_visible,
    createdAt: row.created_at,
  }
}

function categoryToRow(cat) {
  return {
    id: cat.id,
    name: cat.name,
    color: cat.color,
    is_visible: cat.isVisible ?? true,
  }
}

// ── Tasks ──────────────────────────────────────────────────────────────────

export async function fetchTasks() {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) throw error
  return data.map(taskFromRow)
}

export async function insertTask(task) {
  const { data, error } = await supabase
    .from('tasks')
    .insert({ ...taskToRow(task), user_id: await uid() })
    .select()
    .single()
  if (error) throw error
  return taskFromRow(data)
}

export async function updateTask(task) {
  const { error } = await supabase
    .from('tasks')
    .update(taskToRow(task))
    .eq('id', task.id)
  if (error) throw error
}

// ── Profile ────────────────────────────────────────────────────────────────

export async function fetchProfile() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .single()
  if (error && error.code !== 'PGRST116') throw error // PGRST116 = no row found
  return data ? { displayName: data.display_name ?? '', timezone: data.timezone ?? 'UTC' } : { displayName: '', timezone: 'UTC' }
}

export async function upsertProfile(profile) {
  const { data: { user } } = await supabase.auth.getUser()
  const { error } = await supabase
    .from('profiles')
    .upsert({ id: user.id, display_name: profile.displayName, timezone: profile.timezone, updated_at: new Date().toISOString() })
  if (error) throw error
}

// ── Categories ─────────────────────────────────────────────────────────────

export async function fetchCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) throw error
  return data.map(categoryFromRow)
}

export async function insertCategory(cat) {
  const { data, error } = await supabase
    .from('categories')
    .insert({ ...categoryToRow(cat), user_id: await uid() })
    .select()
    .single()
  if (error) throw error
  return categoryFromRow(data)
}

export async function updateCategory(cat) {
  const { error } = await supabase
    .from('categories')
    .update(categoryToRow(cat))
    .eq('id', cat.id)
  if (error) throw error
}
