'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const nav = [
  { href: '/overview', label: 'Overview', icon: '⚡' },
  { href: '/tasks', label: 'Tasks', icon: '✦' },
  { href: '/calendar', label: 'Calendar', icon: '◈' },
  { href: '/projects', label: 'Projects', icon: '⬡' },
  { href: '/memory', label: 'Memory', icon: '◎' },
  { href: '/docs', label: 'Docs', icon: '▣' },
  { href: '/team', label: 'Team', icon: '◉' },
]

export default function Sidebar() {
  const path = usePathname()

  return (
    <aside style={{
      width: 240,
      minWidth: 240,
      background: 'var(--surface)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      {/* Brand */}
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32,
            background: 'var(--accent)',
            borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16,
          }}>🎯</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.01em' }}>
              Mission Control
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Rocky View Consulting</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 12px', overflowY: 'auto' }}>
        {nav.map(({ href, label, icon }) => {
          const active = path === href || (href === '/overview' && path === '/')
          return (
            <Link key={href} href={href} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 12px',
                borderRadius: 6,
                marginBottom: 2,
                background: active ? 'rgba(99,102,241,0.15)' : 'transparent',
                border: active ? '1px solid rgba(99,102,241,0.25)' : '1px solid transparent',
                color: active ? '#a5b4fc' : 'var(--text-muted)',
                fontSize: 13,
                fontWeight: active ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => {
                if (!active) {
                  (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.04)'
                  ;(e.currentTarget as HTMLDivElement).style.color = 'var(--text)'
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  (e.currentTarget as HTMLDivElement).style.background = 'transparent'
                  ;(e.currentTarget as HTMLDivElement).style.color = 'var(--text-muted)'
                }
              }}
              >
                <span style={{ fontSize: 14, opacity: 0.8 }}>{icon}</span>
                {label}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Fred status */}
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div style={{
          width: 32, height: 32,
          background: 'rgba(99,102,241,0.15)',
          border: '1px solid rgba(99,102,241,0.3)',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14,
        }}>🔪</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>Fred</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)' }} />
            Online
          </div>
        </div>
      </div>
    </aside>
  )
}
