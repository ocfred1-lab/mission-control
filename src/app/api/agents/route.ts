import { NextResponse } from 'next/server'
import { getAgents, setAgents } from '@/lib/kv'
import { SubAgent } from '@/lib/types'

export async function GET() {
  const agents = await getAgents()
  return NextResponse.json(agents.sort((a: SubAgent, b: SubAgent) =>
    new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
  ))
}

export async function POST(req: Request) {
  const body = await req.json()
  const agents = await getAgents()
  const agent: SubAgent = {
    id: body.id || `agent_${Date.now()}`,
    name: body.name,
    task: body.task,
    status: body.status || 'running',
    model: body.model || 'claude-sonnet-4-6',
    startedAt: body.startedAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    completedAt: body.completedAt || null,
    result: body.result || null,
    tags: body.tags || [],
  }
  const existing = agents.findIndex((a: SubAgent) => a.id === agent.id)
  if (existing >= 0) {
    agents[existing] = { ...agents[existing], ...agent, updatedAt: new Date().toISOString() }
  } else {
    agents.unshift(agent)
  }
  const updated = agents.slice(0, 200)
  await setAgents(updated)
  return NextResponse.json(agent)
}

export async function PUT(req: Request) {
  const body = await req.json()
  const agents = await getAgents()
  const idx = agents.findIndex((a: SubAgent) => a.id === body.id)
  if (idx === -1) return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
  agents[idx] = { ...agents[idx], ...body, updatedAt: new Date().toISOString() }
  await setAgents(agents)
  return NextResponse.json(agents[idx])
}

export async function DELETE(req: Request) {
  const { id } = await req.json()
  const agents = await getAgents()
  const updated = agents.filter((a: SubAgent) => a.id !== id)
  await setAgents(updated)
  return NextResponse.json({ success: true })
}
