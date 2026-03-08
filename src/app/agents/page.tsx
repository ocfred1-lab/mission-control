'use client'

import { useState, useEffect, useCallback } from 'react'
import { SubAgent, AgentStatus } from '@/lib/types'

const STATUS_CONFIG: Record<AgentStatus, { label: string; color: string; dot: string; glow: string }> = {
  running:   { label: 'Running',   color: '#34d399', dot: '#34d399', glow: 'rgba(52,211,153,0.35)' },
  completed: { label: 'Done',      color: '#818cf8', dot: '#818cf8', glow: 'rgba(129,140,248,0.25)' },
  failed:    { label: 'Failed',    color: '#f87171', dot: '#f87171', glow: 'rgba(248,113,113,0.3)'  },
  idle:      { label: 'Idle',      color: '#6b7280', dot: '#6b7280', glow: 'transparent'            },
}

function ago(iso: string) {
  const ms = Date.now() - new Date(iso).getTime()
  const s = Math.floor(ms / 1000)
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function duration(start: string, end: string | null) {
  const ms = (end ? new Date(end) : new Date()).getTime() - new Date(start).getTime()
  const s = Math.floor(ms / 1000)
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ${s % 60}s`
  return `${Math.floor(m / 60)}h ${m % 60}m`
}

function AgentCard({ agent, onDelete }: { agent: SubAgent; onDelete: (id: string) => void }) {
  const cfg = STATUS_CONFIG[agent.status]
  const isRunning = agent.status === 'running'

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 12,
      padding: '18px 20px',
      display: 'flex',
      gap: 16,
      alignItems: 'flex-start',
      position: 'relative',
      overflow: 'hidden',
      transition: 'border-color 0.2s',
    }}>
      {/* Status indicator bar */}
      <div style={{
        position: 'absolute',
        left: 0, top: 0, bottom: 0,
        width: 3,
        background: cfg.color,
        borderRadius: '12px 0 0 12px',
        boxShadow: `0 0 12px ${cfg.glow}`,
      }} />

      {/* Avatar / icon */}
      <div style={{
        width: 40, height: 40, minWidth: 40,
        borderRadius: 10,
        background: `rgba(99,102,241,0.12)`,
        border: '1px solid rgba(99,102,241,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 18,
        position: 'relative',
      }}>
        🤖
        {isRunning && (
          <div style={{
            position: 'absolute', bottom: -3, right: -3,
            width: 10, height: 10,
            borderRadius: '50%',
            background: cfg.dot,
            border: '2px solid var(--bg)',
            boxShadow: `0 0 6px ${cfg.glow}`,
            animation: 'pulse 1.8s ease-in-out infinite',
          }} />
        )}
      </div>

      {/* Body */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{agent.name}</span>
          <span style={{
            fontSize: 11,
            padding: '2px 8px',
            borderRadius: 999,
            background: `${cfg.color}22`,
            border: `1px solid ${cfg.color}55`,
            color: cfg.color,
            fontWeight: 600,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}>{cfg.label}</span>
          {agent.tags.map(t => (
            <span key={t} style={{
              fontSize: 11, padding: '2px 7px', borderRadius: 999,
              background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)',
              color: 'var(--text-muted)',
            }}>{t}</span>
          ))}
        </div>

        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 10px', lineHeight: 1.6 }}>
          {agent.task}
        </p>

        {agent.result && (
          <div style={{
            fontSize: 12, color: '#a5b4fc',
            background: 'rgba(99,102,241,0.08)',
            border: '1px solid rgba(99,102,241,0.18)',
            borderRadius: 8, padding: '8px 12px',
            marginBottom: 10,
          }}>
            ✓ {agent.result}
          </div>
        )}

        <div style={{ display: 'flex', gap: 18, fontSize: 11, color: 'var(--text-muted)', flexWrap: 'wrap' }}>
          <span>🧠 {agent.model.replace('anthropic/', '').replace('claude-', '')}</span>
          <span>⏱ {duration(agent.startedAt, agent.completedAt)}</span>
          <span>🕐 Started {ago(agent.startedAt)}</span>
          {agent.completedAt && <span>✓ Finished {ago(agent.completedAt)}</span>}
        </div>
      </div>

      {/* Delete */}
      <button
        onClick={() => onDelete(agent.id)}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--text-muted)', fontSize: 16, padding: '2px 4px',
          opacity: 0.4,
        }}
        title="Remove"
      >×</button>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  )
}

const FILTER_OPTIONS: { label: string; value: AgentStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Running', value: 'running' },
  { label: 'Completed', value: 'completed' },
  { label: 'Failed', value: 'failed' },
  { label: 'Idle', value: 'idle' },
]

export default function AgentsPage() {
  const [agents, setAgents] = useState<SubAgent[]>([])
  const [filter, setFilter] = useState<AgentStatus | 'all'>('all')
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  const fetchAgents = useCallback(async () => {
    try {
      const res = await fetch('/api/agents')
      const data = await res.json()
      setAgents(data)
      setLastRefresh(new Date())
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAgents()
    const interval = setInterval(fetchAgents, 10000) // poll every 10s
    return () => clearInterval(interval)
  }, [fetchAgents])

  const handleDelete = async (id: string) => {
    await fetch('/api/agents', { method: 'DELETE', body: JSON.stringify({ id }), headers: { 'Content-Type': 'application/json' } })
    setAgents(prev => prev.filter(a => a.id !== id))
  }

  const filtered = filter === 'all' ? agents : agents.filter(a => a.status === filter)
  const counts = {
    all: agents.length,
    running: agents.filter(a => a.status === 'running').length,
    completed: agents.filter(a => a.status === 'completed').length,
    failed: agents.filter(a => a.status === 'failed').length,
    idle: agents.filter(a => a.status === 'idle').length,
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)', margin: 0, letterSpacing: '-0.02em' }}>
              Sub-Agents
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' }}>
              Live view of all spawned agents and what they&apos;re working on.
              Auto-refreshes every 10s. Last: {lastRefresh.toLocaleTimeString()}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {counts.running > 0 && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 12px', borderRadius: 999,
                background: 'rgba(52,211,153,0.12)',
                border: '1px solid rgba(52,211,153,0.3)',
                color: '#34d399', fontSize: 12, fontWeight: 600,
              }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399', animation: 'pulse 1.8s ease-in-out infinite' }} />
                {counts.running} running
              </div>
            )}
            <button
              onClick={fetchAgents}
              style={{
                background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)',
                borderRadius: 8, padding: '6px 12px', color: 'var(--text-muted)',
                fontSize: 12, cursor: 'pointer',
              }}
            >↺ Refresh</button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
          {([['running', '⚡', '#34d399'], ['completed', '✓', '#818cf8'], ['failed', '✗', '#f87171'], ['idle', '○', '#6b7280']] as const).map(([status, icon, color]) => (
            <div key={status} style={{
              flex: 1, minWidth: 100,
              padding: '14px 16px',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 10,
            }}>
              <div style={{ fontSize: 22, fontWeight: 700, color, marginBottom: 2 }}>{counts[status]}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{icon} {status}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {FILTER_OPTIONS.map(opt => (
          <button key={opt.value}
            onClick={() => setFilter(opt.value)}
            style={{
              padding: '6px 14px', borderRadius: 999, fontSize: 12, cursor: 'pointer',
              background: filter === opt.value ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)',
              border: filter === opt.value ? '1px solid rgba(99,102,241,0.4)' : '1px solid var(--border)',
              color: filter === opt.value ? '#a5b4fc' : 'var(--text-muted)',
              fontWeight: filter === opt.value ? 600 : 400,
            }}
          >
            {opt.label} {counts[opt.value] > 0 ? `(${counts[opt.value]})` : ''}
          </button>
        ))}
      </div>

      {/* Agent list */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)', fontSize: 14 }}>Loading agents...</div>
      ) : filtered.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '60px 20px',
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 12, color: 'var(--text-muted)',
        }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🤖</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>
            {filter === 'all' ? 'No agents spawned yet' : `No ${filter} agents`}
          </div>
          <div style={{ fontSize: 13 }}>
            Agents appear here when Fred spawns sub-tasks. They report their status in real time.
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(agent => (
            <AgentCard key={agent.id} agent={agent} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  )
}
