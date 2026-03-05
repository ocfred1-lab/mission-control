'use client'
import { useEffect, useState } from 'react'
import { TeamData } from '@/lib/types'

export default function TeamPage() {
  const [team, setTeam] = useState<TeamData | null>(null)
  const [editingMission, setEditingMission] = useState(false)
  const [missionDraft, setMissionDraft] = useState('')

  useEffect(() => {
    fetch('/api/team').then(r => r.json()).then((data: TeamData) => {
      setTeam(data)
      setMissionDraft(data.missionStatement)
    })
  }, [])

  const saveMission = async () => {
    if (!team) return
    const updated = { ...team, missionStatement: missionDraft }
    await fetch('/api/team', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ missionStatement: missionDraft }) })
    setTeam(updated)
    setEditingMission(false)
  }

  if (!team) return null

  return (
    <div style={{ padding: '32px 40px', maxWidth: 900 }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Organization</div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text)', margin: 0, letterSpacing: '-0.02em' }}>Team</h1>
      </div>

      {/* Mission statement */}
      <div style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(99,102,241,0.04) 100%)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 14, padding: '24px 28px', marginBottom: 40 }}>
        <div style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>Mission Statement</div>
        {editingMission ? (
          <div>
            <textarea
              value={missionDraft}
              onChange={e => setMissionDraft(e.target.value)}
              style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(99,102,241,0.4)', borderRadius: 8, padding: '12px 16px', color: 'var(--text)', fontSize: 18, fontWeight: 600, fontStyle: 'italic', lineHeight: 1.5, resize: 'vertical', minHeight: 80, outline: 'none' }}
            />
            <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
              <button onClick={saveMission} style={{ padding: '7px 16px', background: 'var(--accent)', border: 'none', borderRadius: 6, color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Save</button>
              <button onClick={() => { setEditingMission(false); setMissionDraft(team.missionStatement) }} style={{ padding: '7px 16px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20 }}>
            <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', margin: 0, fontStyle: 'italic', lineHeight: 1.5, letterSpacing: '-0.01em' }}>
              &ldquo;{team.missionStatement}&rdquo;
            </p>
            <button onClick={() => setEditingMission(true)} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text-muted)', padding: '5px 12px', fontSize: 11, cursor: 'pointer', flexShrink: 0 }}>Edit</button>
          </div>
        )}
      </div>

      {/* Team cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {team.members.map(member => (
          <div key={member.id} style={{
            background: 'var(--surface)',
            border: `1px solid ${member.isAI ? 'rgba(99,102,241,0.3)' : 'rgba(59,130,246,0.3)'}`,
            borderRadius: 14,
            padding: '28px',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* BG accent */}
            <div style={{ position: 'absolute', top: 0, right: 0, width: 120, height: 120, background: member.isAI ? 'rgba(99,102,241,0.06)' : 'rgba(59,130,246,0.06)', borderRadius: '0 14px 0 120px' }} />

            {/* Avatar + status */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 20 }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: member.isAI ? 'rgba(99,102,241,0.15)' : 'rgba(59,130,246,0.15)',
                border: `2px solid ${member.isAI ? 'rgba(99,102,241,0.4)' : 'rgba(59,130,246,0.4)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: member.isAI ? 24 : 18,
                fontWeight: 700, color: member.isAI ? '#a5b4fc' : '#93c5fd',
                flexShrink: 0,
                position: 'relative',
              }}>
                {member.avatar}
                {member.status === 'online' && (
                  <div style={{ position: 'absolute', bottom: 2, right: 2, width: 12, height: 12, borderRadius: '50%', background: '#22c55e', border: '2px solid var(--surface)' }} />
                )}
              </div>
              <div>
                <h3 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.01em' }}>{member.name}</h3>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>{member.role}</p>
              </div>
            </div>

            {/* Tags */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {member.tags.map(tag => (
                <span key={tag} style={{
                  fontSize: 11, padding: '3px 10px', borderRadius: 4,
                  background: member.isAI ? 'rgba(99,102,241,0.12)' : 'rgba(59,130,246,0.12)',
                  color: member.isAI ? '#a5b4fc' : '#93c5fd',
                  border: `1px solid ${member.isAI ? 'rgba(99,102,241,0.25)' : 'rgba(59,130,246,0.25)'}`,
                  fontWeight: 500,
                }}>
                  {tag}
                </span>
              ))}
            </div>

            {/* Status row */}
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 5px #22c55e' }} />
              <span style={{ fontSize: 11, color: '#22c55e', fontWeight: 600 }}>Online</span>
              {member.isAI && <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 'auto' }}>AI Agent · OpenClaw</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
