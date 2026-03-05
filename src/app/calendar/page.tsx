'use client'
import { useEffect, useState } from 'react'
import { Task } from '@/lib/types'
import { format, startOfWeek, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns'

const categoryColors: Record<string, string> = {
  Environmental: '#22c55e', Research: '#3b82f6', Development: '#6366f1',
  Admin: '#94a3b8', Analysis: '#eab308', Strategy: '#f97316', Finance: '#a855f7',
}

export default function CalendarPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [view, setView] = useState<'week' | 'month'>('week')
  const [current, setCurrent] = useState(new Date())

  useEffect(() => { fetch('/api/tasks').then(r => r.json()).then(setTasks) }, [])

  const recurring = tasks.filter(t => t.column === 'Recurring')
  const scheduled = tasks.filter(t => t.scheduledDate)

  const weekStart = startOfWeek(current, { weekStartsOn: 1 })
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const monthDays = eachDayOfInterval({ start: startOfMonth(current), end: endOfMonth(current) })

  const getTasksForDay = (day: Date) => scheduled.filter(t => t.scheduledDate && isSameDay(new Date(t.scheduledDate), day))

  const btnStyle = (active: boolean) => ({
    padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer',
    background: active ? 'var(--accent)' : 'transparent',
    border: active ? 'none' : '1px solid var(--border)',
    color: active ? '#fff' : 'var(--text-muted)',
  })

  return (
    <div style={{ padding: '32px 40px' }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Schedule</div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text)', margin: 0, letterSpacing: '-0.02em' }}>Calendar</h1>
      </div>

      {/* Always Running */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 20px', marginBottom: 24 }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>Always Running</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {recurring.map(t => (
            <span key={t.id} style={{
              padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500,
              background: `${categoryColors[t.category] || '#6366f1'}18`,
              color: categoryColors[t.category] || '#a5b4fc',
              border: `1px solid ${categoryColors[t.category] || '#6366f1'}30`,
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: categoryColors[t.category] || '#6366f1', boxShadow: `0 0 4px ${categoryColors[t.category] || '#6366f1'}` }} />
              {t.title}
            </span>
          ))}
        </div>
      </div>

      {/* View controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={() => setCurrent(v => addDays(v, view === 'week' ? -7 : -30))} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text-muted)', padding: '5px 12px', cursor: 'pointer' }}>←</button>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', minWidth: 180, textAlign: 'center' }}>
            {view === 'week'
              ? `${format(weekStart, 'MMM d')} – ${format(addDays(weekStart, 6), 'MMM d, yyyy')}`
              : format(current, 'MMMM yyyy')}
          </span>
          <button onClick={() => setCurrent(v => addDays(v, view === 'week' ? 7 : 30))} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text-muted)', padding: '5px 12px', cursor: 'pointer' }}>→</button>
          <button onClick={() => setCurrent(new Date())} style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--accent)', padding: '5px 12px', cursor: 'pointer', fontSize: 12 }}>Today</button>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button style={btnStyle(view === 'week')} onClick={() => setView('week')}>Week</button>
          <button style={btnStyle(view === 'month')} onClick={() => setView('month')}>Month</button>
        </div>
      </div>

      {/* Week view */}
      {view === 'week' && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid var(--border)' }}>
            {weekDays.map(day => (
              <div key={day.toISOString()} style={{
                padding: '12px 14px',
                borderRight: '1px solid var(--border)',
                background: isToday(day) ? 'rgba(99,102,241,0.08)' : 'transparent',
              }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{format(day, 'EEE')}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: isToday(day) ? 'var(--accent)' : 'var(--text)', marginTop: 2 }}>{format(day, 'd')}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', minHeight: 200 }}>
            {weekDays.map(day => {
              const dayTasks = getTasksForDay(day)
              return (
                <div key={day.toISOString()} style={{ padding: '10px 8px', borderRight: '1px solid rgba(26,26,46,0.5)', background: isToday(day) ? 'rgba(99,102,241,0.04)' : 'transparent' }}>
                  {dayTasks.map(t => (
                    <div key={t.id} style={{ fontSize: 11, padding: '4px 8px', borderRadius: 5, marginBottom: 5, background: `${categoryColors[t.category] || '#6366f1'}20`, color: categoryColors[t.category] || '#a5b4fc', border: `1px solid ${categoryColors[t.category] || '#6366f1'}30`, lineHeight: 1.3 }}>{t.title}</div>
                  ))}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Month view */}
      {view === 'month' && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid var(--border)' }}>
            {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => (
              <div key={d} style={{ padding: '10px', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>{d}</div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {/* Empty cells for start of month */}
            {Array.from({ length: (monthDays[0].getDay() + 6) % 7 }, (_, i) => (
              <div key={`empty-${i}`} style={{ minHeight: 80, borderRight: '1px solid rgba(26,26,46,0.3)', borderBottom: '1px solid rgba(26,26,46,0.3)', background: 'rgba(0,0,0,0.1)' }} />
            ))}
            {monthDays.map(day => {
              const dayTasks = getTasksForDay(day)
              return (
                <div key={day.toISOString()} style={{ minHeight: 80, padding: '8px', borderRight: '1px solid rgba(26,26,46,0.3)', borderBottom: '1px solid rgba(26,26,46,0.3)', background: isToday(day) ? 'rgba(99,102,241,0.06)' : 'transparent' }}>
                  <div style={{ fontSize: 13, fontWeight: isToday(day) ? 700 : 400, color: isToday(day) ? 'var(--accent)' : 'var(--text-muted)', marginBottom: 4 }}>{format(day, 'd')}</div>
                  {dayTasks.slice(0, 2).map(t => (
                    <div key={t.id} style={{ fontSize: 10, padding: '2px 6px', borderRadius: 3, marginBottom: 2, background: `${categoryColors[t.category] || '#6366f1'}20`, color: categoryColors[t.category] || '#a5b4fc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</div>
                  ))}
                  {dayTasks.length > 2 && <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>+{dayTasks.length - 2} more</div>}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
