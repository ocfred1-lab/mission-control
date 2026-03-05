import { NextResponse } from 'next/server'
import { getProjects, setProjects } from '@/lib/kv'
import { Project } from '@/lib/types'

export async function GET() {
  const projects = await getProjects()
  return NextResponse.json(projects)
}

export async function POST(req: Request) {
  const body = await req.json()
  const projects = await getProjects()

  if (body._action === 'update') {
    const updated = projects.map((p: Project) =>
      p.id === body.id ? { ...p, ...body, updatedAt: new Date().toISOString() } : p
    )
    await setProjects(updated)
    return NextResponse.json({ ok: true })
  }

  const project: Project = {
    id: `proj_${Date.now()}`,
    name: body.name,
    description: body.description || '',
    status: body.status || 'Planning',
    progress: body.progress || 0,
    priority: body.priority || 'medium',
    owner: body.owner || 'Mitch',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  await setProjects([...projects, project])
  return NextResponse.json(project)
}
