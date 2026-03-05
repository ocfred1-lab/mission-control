'use client'
import { useEffect, useState } from 'react'
import { Doc, DocType } from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'
import ReactMarkdown from 'react-markdown'

const typeColors: Record<DocType, { bg: string; text: string }> = {
  Journal: { bg: 'rgba(34,197,94,0.12)', text: '#22c55e' },
  Report: { bg: 'rgba(59,130,246,0.12)', text: '#60a5fa' },
  Analysis: { bg: 'rgba(234,179,8,0.12)', text: '#eab308' },
  Plan: { bg: 'rgba(99,102,241,0.12)', text: '#a5b4fc' },
  Other: { bg: 'rgba(148,163,184,0.12)', text: '#94a3b8' },
}
const typeIcons: Record<DocType, string> = { Journal: '📓', Report: '📊', Analysis: '🔬', Plan: '📋', Other: '📄' }
const FILTERS: (DocType | 'All')[] = ['All', 'Journal', 'Report', 'Analysis', 'Plan', 'Other']

export default function DocsPage() {
  const [docs, setDocs] = useState<Doc[]>([])
  const [selected, setSelected] = useState<Doc | null>(null)
  const [filter, setFilter] = useState<DocType | 'All'>('All')
  const [search, setSearch] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetch('/api/docs').then(r => r.json()).then((data: Doc[]) => {
      setDocs(data)
      if (data.length) setSelected(data[0])
    })
  }, [])

  const filtered = docs.filter(d => {
    const matchType = filter === 'All' || d.type === filter
    const matchSearch = d.title.toLowerCase().includes(search.toLowerCase()) || d.content.toLowerCase().includes(search.toLowerCase())
    return matchType && matchSearch
  })

  const copy = () => {
    if (selected) { navigator.clipboard.writeText(selected.content); setCopied(true); setTimeout(() => setCopied(false), 2000) }
  }

  return (
    <div style={{ padding: '32px 40px', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: 24, flexShrink: 0 }}>
        <div style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Document Library</div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text)', margin: 0, letterSpacing: '-0.02em' }}>Docs</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>{docs.length} documents</p>
      </div>

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '320px 1fr', gap: 20, overflow: 'hidden' }}>
        {/* Left panel */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search docs..." style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 6, padding: '7px 12px', color: 'var(--text)', fontSize: 12, outline: 'none', marginBottom: 10 }} />
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {FILTERS.map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{ padding: '3px 9px', borderRadius: 4, fontSize: 11, fontWeight: 500, cursor: 'pointer', border: 'none', background: filter === f ? 'var(--accent)' : 'rgba(255,255,255,0.06)', color: filter === f ? '#fff' : 'var(--text-muted)' }}>{f}</button>
              ))}
            </div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {filtered.map(doc => {
              const tc = typeColors[doc.type] || typeColors.Other
              return (
                <div key={doc.id} onClick={() => setSelected(doc)}
                  style={{ padding: '12px 14px', cursor: 'pointer', borderBottom: '1px solid rgba(26,26,46,0.5)', background: selected?.id === doc.id ? 'rgba(99,102,241,0.1)' : 'transparent', borderLeft: selected?.id === doc.id ? '2px solid var(--accent)' : '2px solid transparent' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>{typeIcons[doc.type]}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', lineHeight: 1.3, marginBottom: 5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.title}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 3, background: tc.bg, color: tc.text }}>{doc.type}</span>
                        <span style={{ fontSize: 10, color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '1px 5px', borderRadius: 3 }}>{doc.format}</span>
                        <span style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 'auto' }}>{formatDistanceToNow(new Date(doc.createdAt), { addSuffix: true })}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right panel */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {selected ? (
            <>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>{selected.title}</h2>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, display: 'flex', gap: 10 }}>
                    <span>{selected.type}</span>
                    <span>·</span>
                    <span>{formatDistanceToNow(new Date(selected.createdAt), { addSuffix: true })}</span>
                    <span>·</span>
                    <span>~{selected.wordCount || selected.content.split(/\s+/).length} words</span>
                  </div>
                </div>
                <button onClick={copy} style={{ padding: '7px 14px', background: copied ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.06)', border: `1px solid ${copied ? 'rgba(34,197,94,0.3)' : 'var(--border)'}`, borderRadius: 6, color: copied ? '#22c55e' : 'var(--text-muted)', fontSize: 12, cursor: 'pointer', fontWeight: 500 }}>
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px', fontSize: 13, color: 'var(--text)', lineHeight: 1.7 }}>
                <style>{`
                  .md-content h1, .md-content h2, .md-content h3 { color: var(--text); margin-top: 1.5em; }
                  .md-content h1 { font-size: 1.4em; }
                  .md-content h2 { font-size: 1.2em; border-bottom: 1px solid var(--border); padding-bottom: 6px; }
                  .md-content h3 { font-size: 1em; color: #a5b4fc; }
                  .md-content p { color: var(--text-muted); }
                  .md-content strong { color: var(--text); }
                  .md-content ul, .md-content ol { color: var(--text-muted); padding-left: 1.5em; }
                  .md-content table { width: 100%; border-collapse: collapse; font-size: 12px; }
                  .md-content th { background: var(--surface2); padding: 8px 12px; border: 1px solid var(--border); color: var(--text); text-align: left; }
                  .md-content td { padding: 8px 12px; border: 1px solid var(--border); color: var(--text-muted); }
                  .md-content code { background: var(--surface2); padding: 2px 6px; border-radius: 3px; font-size: 11px; color: #a5b4fc; }
                `}</style>
                <div className="md-content"><ReactMarkdown>{selected.content}</ReactMarkdown></div>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, color: 'var(--text-muted)', fontSize: 13 }}>Select a document</div>
          )}
        </div>
      </div>
    </div>
  )
}
