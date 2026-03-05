'use client'
import { useEffect, useState } from 'react'
import { Project, ProjectStatus, Priority } from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'

const statusColors: Record<ProjectStatus, { bg: string; text: string; border: string }> = {
  Active: { bg: 'rgba(34,197,94,0.12)', text: '#22c55e', border: 'rgba(34,197,94,0.3)' },
  Planning: { bg: 'rgba(234,179,8,0.12)', text: '#eab308', border: 'rgba(234,179,8,0.3)' },
  Completed: { bg: 'rgba(148,163,184,0.12)', text: '#94a3b8', border: 'rgba(148,163,184,0.3)' },
  'On Hold': { bg: 'rgba(239,68,68,0.12)', text: '#ef4444', border: 'rgba(239,68,68,0.3)' },
}
const priorityColors: Record<Priority, string> = { high: '#ef4444', medium: '#eab308', low: '#475569' }

function NewProjectModal({ onClose, onSave }: { onClose: () => void; onSave: (p: Partial<Project>) => void }) {
  const [form, setForm] = useState({ name: '', description: '', status: 'Planning', progress: '0', priority: 'medium', owner: 'Mitch' })
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))
  const inputStyle = { width: '100%', background: 'var(--bg)', border: '1px solid var(--border2)', borderRadius: 6, padding: '8px 12px', color: 'var(--text)', fontSize: 13, outline: 'none' }
  const labelStyle = { fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 12, padding: 28, width: 480, maxWidth: '95vw' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>New Project</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>✕</button>
        </div>
        <div style={{ marginBottom: 14 }}><label style={labelStyle}>Project Name</label><input style={inputStyle} value={form.name} onChange={e => set('name', e.target.value)} placeholder="Project name..." /></div>
        <div style={{ marginBottom: 14 }}><label style={labelStyle}>Description</label><textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 72 }} value={form.description} onChange={e => set('description', e.target.value)} /></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
          <div><label style={labelStyle}>Status</label>
            <select style={inputStyle} value={form.status} onChange={e => set('status', e.target.value)}>
              <option>Active</option><option>Planning</option><option>On Hold</option><option>Completed</option>
            </select></div>
          <div><label style={labelStyle}>Priority</label>
            <select style={inputStyle} value={form.priority} onChange={e => set('priority', e.target.value)}>
              <option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option>
            </select></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
          <div><label style={labelStyle}>Progress (%)</label><input type="number" min="0" max="100" style={inputStyle} value={form.progress} onChange={e => set('progress', e.target.value)} /></div>
          <div><label style={labelStyle}>Owner</label>
            <select style={inputStyle} value={form.owner} onChange={e => set('owner', e.target.value)}>
              <option>Mitch</option><option>Fred</option>
            </select></div>
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text-muted)', cursor: 'pointer', fontSize: 13 }}>Cancel</button>
          <button onClick={() => { if (form.name) { onSave({ ...form, progress: parseInt(form.progress) }); onClose() } }} style={{ padding: '8px 16px', background: 'var(--accent)', border: 'none', borderRadius: 6, color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Create</button>
        </div>
      </div>
    </div>
  )
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [showModal, setShowModal] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => { fetch('/api/projects').then(r => r.json()).then(setProjects) }, [])

  const createProject = async (data: Partial<Project>) => {
    const res = await fetch('/api/projects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    const p = await res.json()
    setProjects(prev => [...prev, p])
  }

  return (
    <div style={{ padding: '32px 40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Portfolio</div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text)', margin: 0, letterSpacing: '-0.02em' }}>Projects</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>{projects.filter(p => p.status === 'Active').length} active · {projects.length} total</p>
        </div>
        <button onClick={() => setShowModal(true)} style={{ padding: '9px 18px', background: 'var(--accent)', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>+ New Project</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
        {projects.map(p => {
          const sc = statusColors[p.status] || statusColors.Planning
          const isExpanded = expanded === p.id
          return (
            <div key={p.id} onClick={() => setExpanded(isExpanded ? null : p.id)}
              style={{ background: 'var(--surface)', border: `1px solid ${isExpanded ? 'var(--border2)' : 'var(--border)'}`, borderRadius: 12, padding: '20px', transition: 'all 0.2s', cursor: 'pointer', boxShadow: isExpanded ? '0 4px 24px rgba(0,0,0,0.4)' : 'none' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border2)')}
              onMouseLeave={e => { if (!isExpanded) e.currentTarget.style.borderColor = 'var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 4, background: sc.bg, color: sc.text, border: `1px solid ${sc.border}`, fontWeight: 600 }}>{p.status}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: priorityColors[p.priority] }} title={`${p.priority} priority`} />
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', transition: 'transform 0.2s', display: 'inline-block', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</span>
                </div>
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', margin: '0 0 8px', letterSpacing: '-0.01em' }}>{p.name}</h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 16px', lineHeight: 1.5, ...(isExpanded ? {} : { display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }) }}>{p.description}</p>
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Progress</span>
                  <span style={{ fontSize: 11, color: 'var(--text)', fontWeight: 600 }}>{p.progress}%</span>
                </div>
                <div className="progress-bar"><div className="progress-fill" style={{ width: `${p.progress}%` }} /></div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  Owner: <span style={{ color: 'var(--text)' }}>{p.owner}</span>
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatDistanceToNow(new Date(p.updatedAt), { addSuffix: true })}</span>
              </div>
            </div>
          )
        })}
      </div>
      {showModal && <NewProjectModal onClose={() => setShowModal(false)} onSave={createProject} />}
    </div>
  )
}
