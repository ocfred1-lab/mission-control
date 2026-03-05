import { NextResponse } from 'next/server'
import { getTasks, getProjects, getDocs, getMemory } from '@/lib/kv'

export async function GET() {
  const [tasks, projects, docs, memory] = await Promise.all([
    getTasks(), getProjects(), getDocs(), getMemory()
  ])
  return NextResponse.json({
    totalTasks: tasks.length,
    activeProjects: projects.filter((p: { status: string }) => p.status === 'Active').length,
    docsCreated: docs.length,
    memoryEntries: memory.length,
  })
}
