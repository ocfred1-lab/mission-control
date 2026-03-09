'use client'

import { useState, useEffect, useCallback } from 'react'
import { Brief } from '@/lib/types'

const SOURCE_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
  'trend-spotter': { label: 'Trend Spotter', icon: '📡', color: '#818cf8' },
  'manual':        { label: 'Manual',        icon: '✏️',  color: '#6b7280' },
}

function ago(iso: string) {
  const ms = Date.now() - new Date(iso).getTime()
  const m = Math.floor(ms / 60000)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function formatContent(content: string) {
  // Render markdown-ish content — bold, emoji bullets
  const lines = content.split('\n')
  return lines.map((line, i) => {
    const trimmed = line.trim()
    if (!trimmed) return <div key={i} style={{ height: 8 }} />

    // Section headers (🪙 **CRYPTO**)
    if (/^[🪙🤖💰📌]/.test(trimmed) && trimmed.includes('**')) {
      return (
        <div key={i} style={{
          fontSize: 13, fontWeight: 700, color: 'var(--text)',
          marginTop: 16, marginBottom: 6,
          display: 'flex', alignItems: 'center', gap: 8,
          letterSpacing: '0.04em', textTransform: 'uppercase',
        }}>
          {trimmed.replace(/\*\*/g, '')}
        </div>
      )
    }

    // Bullet points
    if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
      const text = trimmed.slice(2).replace(/\*\*([^*]+)\*\*/g, '$1')
      return (
        <div key={i} style={{
          fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7,
          paddingLeft: 14, position: 'relative', marginBottom: 4,
        }}>
          <span style={{
            position: 'absolute', left: 0, top: 7,
            width: 4, height: 4, borderRadius: '50%',
            background: 'rgba(165,180,252,0.5)',
          }} />
          {text}
        </div>
      )
    }

    // Divider
    if (trimmed === '---') {
      return <div key={i} style={{ borderTop: '1px solid var(--border)', margin: '10px 0' }} />
    }

    // Plain text
    const text = trimmed.replace(/\*\*([^*]+)\*\*/g, '$1')
    return (
      <div key={i} style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 2 }}>
        {text}
      </div>
    )
  })
}

function BriefCard({ brief, onDelete }: { brief: Brief; onDelete: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false)
  const src = SOURCE_CONFIG[brief.source] || { label: brief.source, icon: '📄', color: '#6b7280' }
  const preview = brief.content.slice(0, 220)

  return (
    <article style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 14,
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div
        onClick={() => setExpanded(e => !e)}
        style={{
          padding: '16px 20px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 14,
        }}
      >
        <div style={{
          width: 36, height: 36, minWidth: 36,
          borderRadius: 9,
          background: `${src.color}18`,
          border: `1px solid ${src.color}33`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 17,
        }}>
          {src.icon}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{brief.title}</span>
            <span style={{
              fontSize: 11, padding: '2px 7px', borderRadius: 999,
              background: `${src.color}18`, border: `1px solid ${src.color}33`,
              color: src.color, fontWeight: 600, letterSpacing: '0.05em',
            }}>{src.label}</span>
            {brief.tags.map(t => (
              <span key={t} style={{
                fontSize: 11, padding: '2px 7px', borderRadius: 999,
                background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)',
                color: 'var(--text-muted)',
              }}>{t}</span>
            ))}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', opacity: 0.7 }}>
            {ago(brief.timestamp)} · {new Date(brief.timestamp).toLocaleString()}
          </div>
          {!expanded && (
            <div style={{
              fontSize: 12, color: 'var(--text-muted)', marginTop: 8,
              lineHeight: 1.6, opacity: 0.8,
            }}>
              {preview}{brief.content.length > 220 ? '…' : ''}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 16, color: 'var(--text-muted)', opacity: 0.5 }}>
            {expanded ? '▲' : '▼'}
          </span>
          <button
            onClick={e => { e.stopPropagation(); onDelete(brief.id) }}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-muted)', fontSize: 16, opacity: 0.4, padding: '2px 4px',
            }}
          >×</button>
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div style={{
          padding: '0 20px 20px',
          borderTop: '1px solid var(--border)',
          paddingTop: 16,
        }}>
          {formatContent(brief.content)}
        </div>
      )}
    </article>
  )
}

export default function BriefsPage() {
  const [briefs, setBriefs] = useState<Brief[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  const fetchBriefs = useCallback(async () => {
    try {
      const res = await fetch('/api/briefs')
      setBriefs(await res.json())
      setLastRefresh(new Date())
    } catch { /* silent */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => {
    fetchBriefs()
    const iv = setInterval(fetchBriefs, 30000)
    return () => clearInterval(iv)
  }, [fetchBriefs])

  const handleDelete = async (id: string) => {
    await fetch('/api/briefs', {
      method: 'DELETE',
      body: JSON.stringify({ id }),
      headers: { 'Content-Type': 'application/json' },
    })
    setBriefs(prev => prev.filter(b => b.id !== id))
  }

  const sources = ['all', ...Array.from(new Set(briefs.map(b => b.source)))]
  const filtered = filter === 'all' ? briefs : briefs.filter(b => b.source === filter)

  return (
    <div style={{ maxWidth: 860, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)', margin: 0, letterSpacing: '-0.02em' }}>
              Briefs
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' }}>
              Trend briefings from Fred — crypto, AI, money-making. Auto-refreshes every 30s.
              Last: {lastRefresh.toLocaleTimeString()}
            </p>
          </div>
          <button
            onClick={fetchBriefs}
            style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)',
              borderRadius: 8, padding: '6px 12px', color: 'var(--text-muted)',
              fontSize: 12, cursor: 'pointer',
            }}
          >↺ Refresh</button>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
          <div style={{
            flex: 1, minWidth: 100, padding: '14px 16px',
            background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10,
          }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#818cf8', marginBottom: 2 }}>{briefs.length}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>📡 Total briefs</div>
          </div>
          <div style={{
            flex: 1, minWidth: 100, padding: '14px 16px',
            background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10,
          }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#34d399', marginBottom: 2 }}>
              {briefs.filter(b => Date.now() - new Date(b.timestamp).getTime() < 86400000).length}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>📅 Last 24h</div>
          </div>
          <div style={{
            flex: 1, minWidth: 100, padding: '14px 16px',
            background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10,
          }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>
              {briefs[0] ? ago(briefs[0].timestamp) : '—'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>🕐 Latest brief</div>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {sources.map(s => (
          <button key={s}
            onClick={() => setFilter(s)}
            style={{
              padding: '6px 14px', borderRadius: 999, fontSize: 12, cursor: 'pointer',
              background: filter === s ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)',
              border: filter === s ? '1px solid rgba(99,102,241,0.4)' : '1px solid var(--border)',
              color: filter === s ? '#a5b4fc' : 'var(--text-muted)',
              fontWeight: filter === s ? 600 : 400,
              textTransform: 'capitalize',
            }}
          >
            {s === 'all' ? `All (${briefs.length})` : s.replace('-', ' ')}
          </button>
        ))}
      </div>

      {/* Brief list */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)', fontSize: 14 }}>
          Loading briefs...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '60px 20px',
          background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12,
          color: 'var(--text-muted)',
        }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>📡</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>
            No briefs yet
          </div>
          <div style={{ fontSize: 13 }}>
            Fred will post the first trend briefing at 1 PM or 9 PM Mountain Time.
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(brief => (
            <BriefCard key={brief.id} brief={brief} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  )
}
