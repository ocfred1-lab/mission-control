'use client'
import { useEffect, useState } from 'react'
import { MemoryEntry } from '@/lib/types'
import ReactMarkdown from 'react-markdown'

const longTermPins = [
  { title: 'Core Identity', icon: '◉', color: '#6366f1', content: 'Mitch McCargar, 37, Calgary. Senior Environmental Operations Advisor at Cenovus Energy (Christina Lake SAGD). B.Sc. Geology, 12+ years energy/environmental experience. Business entity: Rocky View Consulting Ltd.' },
  { title: 'What He\'s Chasing', icon: '⚡', color: '#22c55e', content: 'Financial freedom > location flexibility > status > meaningful work. Optionality, not passion. The goal: build income streams via AI before mass adoption closes the window.' },
  { title: 'Key Patterns', icon: '◎', color: '#eab308', content: 'Shiny object syndrome. Analysis over execution. Confidence gap — knows value but doubts monetization. Tool switching as procrastination. Accountability trigger: "Is this 2015 again?"' },
  { title: 'The AI Bet', icon: '▦', color: '#3b82f6', content: 'Big energy uses dumbed-down Copilot. Small environmental firms and Indigenous operators in Alberta have zero AI strategy and can\'t afford dedicated IT. This gap = Rocky View Consulting\'s market.' },
]

export default function MemoryPage() {
  const [entries, setEntries] = useState<MemoryEntry[]>([])
  const [selected, setSelected] = useState<MemoryEntry | null>(null)
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/memory').then(r => r.json()).then((data: MemoryEntry[]) => {
      setEntries(data)
      if (data.length) setSelected(data[0])
    })
  }, [])

  const dateLabel = (entry: MemoryEntry) => entry.label || 'Older'
  const grouped: Record<string, MemoryEntry[]> = {}
  const order = ['Today', 'Yesterday', 'This Week', 'This Month', 'Older']
  entries.filter(e => e.filename.toLowerCase().includes(search.toLowerCase()) || e.preview.toLowerCase().includes(search.toLowerCase())).forEach(e => {
    const label = dateLabel(e)
    if (!grouped[label]) grouped[label] = []
    grouped[label].push(e)
  })

  return (
    <div style={{ padding: '32px 40px', maxHeight: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: 24, flexShrink: 0 }}>
        <div style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Context Engine</div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text)', margin: 0, letterSpacing: '-0.02em' }}>Memory</h1>
      </div>

      {/* Long-term memory pins */}
      <div style={{ marginBottom: 24, flexShrink: 0 }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>Long-Term Memory</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {longTermPins.map(pin => (
            <div key={pin.title} style={{ background: 'var(--surface)', border: `1px solid ${pin.color}30`, borderRadius: 10, padding: '14px 16px', cursor: 'pointer' }}
              onClick={() => setExpanded(expanded === pin.title ? null : pin.title)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ color: pin.color, fontSize: 14 }}>{pin.icon}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{pin.title}</span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0, lineHeight: 1.5, display: expanded === pin.title ? 'block' : '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: expanded === pin.title ? 'unset' : 'vertical', overflow: expanded === pin.title ? 'visible' : 'hidden' }}>{pin.content}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Sync notice */}
      <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 8, padding: '8px 14px', marginBottom: 20, fontSize: 12, color: '#a5b4fc', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <span>ℹ</span> Live sync available via VPS webhook — memory entries below are synced snapshots
      </div>

      {/* Split pane */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '340px 1fr', gap: 20, overflow: 'hidden' }}>
        {/* Left: file list */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search memory..."
              style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 6, padding: '7px 12px', color: 'var(--text)', fontSize: 12, outline: 'none' }}
            />
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {order.filter(g => grouped[g]?.length).map(group => (
              <div key={group}>
                <div style={{ padding: '10px 14px 6px', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{group}</div>
                {grouped[group].map(entry => (
                  <div key={entry.id} onClick={() => setSelected(entry)}
                    style={{ padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid rgba(26,26,46,0.5)', background: selected?.id === entry.id ? 'rgba(99,102,241,0.1)' : 'transparent', borderLeft: selected?.id === entry.id ? '2px solid var(--accent)' : '2px solid transparent', transition: 'all 0.15s' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{entry.filename}</span>
                      <span style={{ fontSize: 10, color: 'var(--accent)', background: 'rgba(99,102,241,0.15)', padding: '1px 6px', borderRadius: 10 }}>{entry.entryCount}</span>
                    </div>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{entry.preview}</p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Right: content viewer */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {selected ? (
            <>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{selected.filename}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{selected.date} · {selected.entryCount} entries</div>
                </div>
                <span style={{ fontSize: 10, color: 'var(--accent)', background: 'rgba(99,102,241,0.15)', padding: '3px 10px', borderRadius: 10, border: '1px solid rgba(99,102,241,0.3)' }}>MARKDOWN</span>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px', fontSize: 13, color: 'var(--text)', lineHeight: 1.7 }}>
                <ReactMarkdown>{selected.content}</ReactMarkdown>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, color: 'var(--text-muted)', fontSize: 13 }}>
              Select a memory file to view
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
