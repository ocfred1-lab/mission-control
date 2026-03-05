'use client'
import { useEffect, useState } from 'react'
import { ActivityItem } from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'

interface Stats { totalTasks: number; activeProjects: number; docsCreated: number; memoryEntries: number }

const iconMap: Record<string, string> = {
  check: '✓', 'check-circle': '✓', plus: '+', file: '▣', brain: '◎',
  'trending-up': '↑', folder: '⬡', search: '⌕', zap: '⚡', 'bar-chart': '▦',
  globe: '◉', map: '⬡', default: '•',
}

const colorMap: Record<string, string> = {
  green: '#22c55e', yellow: '#eab308', red: '#ef4444', blue: '#3b82f6',
  indigo: '#6366f1', purple: '#a855f7', gray: '#94a3b8',
}

export default function OverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [activity, setActivity] = useState<ActivityItem[]>([])

  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(setStats)
    fetch('/api/activity').then(r => r.json()).then(setActivity)
  }, [])

  const statCards = stats ? [
    { label: 'Total Tasks', value: stats.totalTasks, color: '#6366f1', icon: '✦' },
    { label: 'Active Projects', value: stats.activeProjects, color: '#22c55e', icon: '⬡' },
    { label: 'Docs Created', value: stats.docsCreated, color: '#3b82f6', icon: '▣' },
    { label: 'Memory Entries', value: stats.memoryEntries, color: '#a855f7', icon: '◎' },
  ] : []

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1400 }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
          Command Center
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text)', margin: 0, letterSpacing: '-0.02em' }}>
          Overview
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        {statCards.map((s) => (
          <div key={s.label} style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: '20px 24px',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: 0, right: 0, width: 80, height: 80,
              background: s.color, opacity: 0.06, borderRadius: '0 12px 0 80px',
            }} />
            <div style={{ fontSize: 24, marginBottom: 8, opacity: 0.7, color: s.color }}>{s.icon}</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em' }}>
              {s.value ?? '—'}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
        {!stats && [0,1,2,3].map(i => (
          <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 24px', height: 100, animation: 'pulse 2s infinite' }} />
        ))}
      </div>

      {/* Content row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
        {/* Activity feed */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Activity Feed</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Fred&apos;s recent actions</div>
            </div>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 6px #22c55e' }} />
          </div>
          <div style={{ maxHeight: 500, overflowY: 'auto' }}>
            {activity.slice(0, 20).map((item) => (
              <div key={item.id} style={{
                padding: '12px 20px',
                borderBottom: '1px solid rgba(26,26,46,0.5)',
                display: 'flex', alignItems: 'flex-start', gap: 12,
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 6,
                  background: `${colorMap[item.color] || '#6366f1'}18`,
                  border: `1px solid ${colorMap[item.color] || '#6366f1'}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, color: colorMap[item.color] || '#6366f1',
                  flexShrink: 0, marginTop: 1,
                }}>
                  {iconMap[item.icon] || iconMap.default}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.4 }}>{item.action}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>
                    {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Mission statement */}
          <div style={{
            background: 'var(--surface)',
            border: '1px solid rgba(99,102,241,0.3)',
            borderRadius: 12,
            padding: '20px',
          }}>
            <div style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
              Mission
            </div>
            <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.6, margin: 0, fontStyle: 'italic' }}>
              &ldquo;Ship what builds freedom. Cut everything else. No more planning past the next step.&rdquo;
            </p>
          </div>

          {/* Quick links */}
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: '20px',
          }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 16 }}>Quick Actions</div>
            {[
              { label: 'View Task Board', href: '/tasks', color: '#6366f1' },
              { label: 'Open Projects', href: '/projects', color: '#22c55e' },
              { label: 'Read Memory', href: '/memory', color: '#a855f7' },
              { label: 'Browse Docs', href: '/docs', color: '#3b82f6' },
            ].map(link => (
              <a key={link.href} href={link.href} style={{ textDecoration: 'none' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 12px',
                  borderRadius: 8,
                  marginBottom: 6,
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--border)',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s',
                }}>
                  <span style={{ fontSize: 13, color: link.color, fontWeight: 500 }}>{link.label}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>→</span>
                </div>
              </a>
            ))}
          </div>

          {/* System status */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px' }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 16 }}>System Status</div>
            {[
              { label: 'Fred (AI Agent)', status: 'Online', color: '#22c55e' },
              { label: 'OpenClaw Gateway', status: 'Running', color: '#22c55e' },
              { label: 'Telegram', status: 'Connected', color: '#22c55e' },
              { label: 'Memory System', status: 'Active', color: '#22c55e' },
              { label: 'VPS (srv1305476)', status: 'Healthy', color: '#22c55e' },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.label}</span>
                <span style={{ fontSize: 11, color: s.color, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: s.color }} />
                  {s.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
