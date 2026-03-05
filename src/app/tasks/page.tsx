'use client'
import { useEffect, useState } from 'react'
import { Task, TaskColumn, ActivityItem } from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'

const COLUMNS: TaskColumn[] = ['Recurring', 'Backlog', 'In Progress', 'Review', 'Done']

const categoryColors: Record<string, string> = {
  Environmental: '#22c55e', Research: '#3b82f6', Development: '#6366f1',
  Admin: '#94a3b8', Analysis: '#eab308', Strategy: '#f97316', Finance: '#a855f7',
}
const priorityColors: Record<string, string> = { high: '#ef4444', medium: '#eab308', low: '#475569' }
const colColors: Record<string, string> = {
  Recurring: '#6366f1', Backlog: '#475569', 'In Progress': '#eab308', Review: '#3b82f6', Done: '#22c55e'
}

const iconMap: Record<string, string> = { check: '✓', 'check-circle': '✓', plus: '+', file: '▣', brain: '◎', 'trending-up': '↑', folder: '⬡', search: '⌕', zap: '⚡', 'bar-chart': '▦', globe: '◉', map: '◉', default: '•' }
const colorMap: Record<string, string> = { green: '#22c55e', yellow: '#eab308', red: '#ef4444', blue: '#3b82f6', indigo: '#6366f1', purple: '#a855f7', gray: '#94a3b8' }

function NewTaskModal({ onClose, onSave }: { onClose: () => void; onSave: (t: Partial<Task>) => void }) {
  const [form, setForm] = useState({ title: '', description: '', assignee: 'Mitch', category: 'Admin', column: 'Backlog', priority: 'medium', scheduledDate: '' })
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))
  const labelStyle = { fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }
  const inputStyle = { width: '100%', background: 'var(--bg)', border: '1px solid var(--border2)', borderRadius: 6, padding: '8px 12px', color: 'var(--text)', fontSize: 13, outline: 'none' }
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 12, padding: 28, width: 480, maxWidth: '95vw' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>New Task</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>✕</button>
        </div>
        <div style={{ marginBottom: 14 }}><label style={labelStyle}>Title</label><input style={inputStyle} value={form.title} onChange={e => set('title', e.target.value)} placeholder="Task title..." /></div>
        <div style={{ marginBottom: 14 }}><label style={labelStyle}>Description</label><textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 72 }} value={form.description} onChange={e => set('description', e.target.value)} placeholder="What needs to be done..." /></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
          <div><label style={labelStyle}>Assignee</label>
            <select style={inputStyle} value={form.assignee} onChange={e => set('assignee', e.target.value)}>
              <option>Mitch</option><option>Fred</option>
            </select></div>
          <div><label style={labelStyle}>Category</label>
            <select style={inputStyle} value={form.category} onChange={e => set('category', e.target.value)}>
              {['Environmental','Research','Development','Admin','Analysis','Strategy','Finance'].map(c => <option key={c}>{c}</option>)}
            </select></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
          <div><label style={labelStyle}>Column</label>
            <select style={inputStyle} value={form.column} onChange={e => set('column', e.target.value)}>
              {COLUMNS.map(c => <option key={c}>{c}</option>)}
            </select></div>
          <div><label style={labelStyle}>Priority</label>
            <select style={inputStyle} value={form.priority} onChange={e => set('priority', e.target.value)}>
              <option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option>
            </select></div>
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text-muted)', cursor: 'pointer', fontSize: 13 }}>Cancel</button>
          <button onClick={() => { if (form.title) { onSave(form); onClose() } }} style={{ padding: '8px 16px', background: 'var(--accent)', border: 'none', borderRadius: 6, color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Create Task</button>
        </div>
      </div>
    </div>
  )
}

function TaskCard({ task, onDragStart }: { task: Task; onDragStart: (e: React.DragEvent, id: string) => void }) {
  return (
    <div className="kanban-card" draggable onDragStart={e => onDragStart(e, task.id)}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', lineHeight: 1.4, flex: 1, marginRight: 8 }}>{task.title}</div>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: priorityColors[task.priority] || '#475569', flexShrink: 0, marginTop: 4 }} />
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{task.description}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 4, background: task.assignee === 'Fred' ? 'rgba(99,102,241,0.15)' : 'rgba(59,130,246,0.15)', color: task.assignee === 'Fred' ? '#a5b4fc' : '#93c5fd', border: `1px solid ${task.assignee === 'Fred' ? 'rgba(99,102,241,0.3)' : 'rgba(59,130,246,0.3)'}` }}>{task.assignee}</span>
        <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 4, background: `${categoryColors[task.category] || '#6366f1'}18`, color: categoryColors[task.category] || '#6366f1', border: `1px solid ${categoryColors[task.category] || '#6366f1'}30` }}>{task.category}</span>
        <span style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 'auto' }}>{formatDistanceToNow(new Date(task.updatedAt), { addSuffix: true })}</span>
      </div>
    </div>
  )
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [activity, setActivity] = useState<ActivityItem[]>([])
  const [showModal, setShowModal] = useState(false)
  const [dragId, setDragId] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState<TaskColumn | null>(null)

  useEffect(() => {
    fetch('/api/tasks').then(r => r.json()).then(setTasks)
    fetch('/api/activity').then(r => r.json()).then(setActivity)
  }, [])

  const createTask = async (data: Partial<Task>) => {
    const res = await fetch('/api/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    const task = await res.json()
    setTasks(prev => [...prev, task])
  }

  const onDragStart = (e: React.DragEvent, id: string) => { setDragId(id); e.dataTransfer.effectAllowed = 'move' }
  const onDragOver = (e: React.DragEvent, col: TaskColumn) => { e.preventDefault(); setDragOver(col) }
  const onDrop = async (col: TaskColumn) => {
    if (!dragId) return
    setTasks(prev => prev.map(t => t.id === dragId ? { ...t, column: col, updatedAt: new Date().toISOString() } : t))
    await fetch('/api/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ _action: 'reorder', id: dragId, column: col }) })
    setDragId(null); setDragOver(null)
  }

  return (
    <div style={{ padding: '32px 40px', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexShrink: 0 }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Work Queue</div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text)', margin: 0, letterSpacing: '-0.02em' }}>Tasks</h1>
        </div>
        <button onClick={() => setShowModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 18px', background: 'var(--accent)', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
          + New Task
        </button>
      </div>

      <div style={{ flex: 1, display: 'flex', gap: 20, overflow: 'hidden' }}>
        {/* Kanban board */}
        <div style={{ flex: 1, display: 'flex', gap: 14, overflowX: 'auto' }}>
          {COLUMNS.map(col => {
            const colTasks = tasks.filter(t => t.column === col)
            const isDragTarget = dragOver === col
            return (
              <div key={col}
                onDragOver={e => onDragOver(e, col)}
                onDragLeave={() => setDragOver(null)}
                onDrop={() => onDrop(col)}
                style={{ width: 280, minWidth: 280, display: 'flex', flexDirection: 'column', background: isDragTarget ? 'rgba(99,102,241,0.05)' : 'transparent', borderRadius: 10, transition: 'background 0.15s', border: isDragTarget ? '1px dashed rgba(99,102,241,0.4)' : '1px solid transparent' }}>
                {/* Column header */}
                <div style={{ padding: '10px 12px 12px', flexShrink: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: colColors[col] }} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', letterSpacing: '0.02em', textTransform: 'uppercase' }}>{col}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 'auto', background: 'rgba(255,255,255,0.06)', padding: '1px 7px', borderRadius: 10 }}>{colTasks.length}</span>
                  </div>
                </div>
                {/* Cards */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '0 4px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {colTasks.map(t => <TaskCard key={t.id} task={t} onDragStart={onDragStart} />)}
                </div>
              </div>
            )
          })}
        </div>

        {/* Activity sidebar */}
        <div style={{ width: 300, minWidth: 300, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 5px #22c55e' }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Live Activity</span>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {activity.slice(0, 25).map(item => (
              <div key={item.id} style={{ padding: '10px 14px', borderBottom: '1px solid rgba(26,26,46,0.5)', display: 'flex', gap: 10 }}>
                <div style={{ width: 22, height: 22, borderRadius: 5, background: `${colorMap[item.color] || '#6366f1'}18`, border: `1px solid ${colorMap[item.color] || '#6366f1'}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: colorMap[item.color] || '#6366f1', flexShrink: 0, marginTop: 1 }}>{iconMap[item.icon] || '•'}</div>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--text)', lineHeight: 1.4 }}>{item.action}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {showModal && <NewTaskModal onClose={() => setShowModal(false)} onSave={createTask} />}
    </div>
  )
}
