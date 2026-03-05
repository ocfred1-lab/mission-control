import { NextResponse } from 'next/server'
import { getTasks, setTasks } from '@/lib/kv'
import { Task } from '@/lib/types'

export async function GET() {
  const tasks = await getTasks()
  return NextResponse.json(tasks)
}

export async function POST(req: Request) {
  const body = await req.json()
  const tasks = await getTasks()
  
  if (body._action === 'reorder') {
    // Update column for a task (drag-drop)
    const updated = tasks.map((t: Task) => t.id === body.id ? { ...t, column: body.column, updatedAt: new Date().toISOString() } : t)
    await setTasks(updated)
    return NextResponse.json({ ok: true })
  }
  
  if (body._action === 'delete') {
    const updated = tasks.filter((t: Task) => t.id !== body.id)
    await setTasks(updated)
    return NextResponse.json({ ok: true })
  }

  // Create new task
  const task: Task = {
    id: `task_${Date.now()}`,
    title: body.title,
    description: body.description || '',
    assignee: body.assignee || 'Mitch',
    category: body.category || 'Admin',
    column: body.column || 'Backlog',
    priority: body.priority || 'medium',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    scheduledDate: body.scheduledDate || null,
  }
  await setTasks([...tasks, task])
  return NextResponse.json(task)
}
