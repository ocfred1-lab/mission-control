// KV abstraction layer - falls back to in-memory store if @vercel/kv not configured
// This allows local development without KV credentials

import { Task, Project, ActivityItem, Doc, TeamData, MemoryEntry, SubAgent, Brief } from './types'
import { seedTasks, seedProjects, seedActivity, seedDocs, seedTeam, seedMemory, seedAgents } from './seed-data'

// In-memory fallback store for local development
const memStore: Record<string, unknown> = {}

async function kvGet<T>(key: string): Promise<T | null> {
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    try {
      const { kv } = await import('@vercel/kv')
      return await kv.get<T>(key)
    } catch {
      // fall through to mem store
    }
  }
  return (memStore[key] as T) ?? null
}

async function kvSet(key: string, value: unknown): Promise<void> {
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    try {
      const { kv } = await import('@vercel/kv')
      await kv.set(key, value)
      return
    } catch {
      // fall through
    }
  }
  memStore[key] = value
}

// Seed helpers
async function getOrSeed<T>(key: string, seedData: T): Promise<T> {
  const val = await kvGet<T>(key)
  if (val !== null) return val
  await kvSet(key, seedData)
  return seedData
}

export async function getTasks(): Promise<Task[]> {
  return getOrSeed('tasks', seedTasks)
}
export async function setTasks(tasks: Task[]): Promise<void> {
  return kvSet('tasks', tasks)
}

export async function getProjects(): Promise<Project[]> {
  return getOrSeed('projects', seedProjects)
}
export async function setProjects(projects: Project[]): Promise<void> {
  return kvSet('projects', projects)
}

export async function getActivity(): Promise<ActivityItem[]> {
  return getOrSeed('activity', seedActivity)
}
export async function setActivity(items: ActivityItem[]): Promise<void> {
  return kvSet('activity', items)
}

export async function getDocs(): Promise<Doc[]> {
  return getOrSeed('docs', seedDocs)
}
export async function setDocs(docs: Doc[]): Promise<void> {
  return kvSet('docs', docs)
}

export async function getTeam(): Promise<TeamData> {
  return getOrSeed('team', seedTeam)
}
export async function setTeam(team: TeamData): Promise<void> {
  return kvSet('team', team)
}

export async function getMemory(): Promise<MemoryEntry[]> {
  return getOrSeed('memory', seedMemory)
}

export async function getAgents(): Promise<SubAgent[]> {
  return getOrSeed('agents', seedAgents)
}
export async function setAgents(agents: SubAgent[]): Promise<void> {
  return kvSet('agents', agents)
}

export async function getBriefs(): Promise<Brief[]> {
  const val = await kvGet<Brief[]>('briefs')
  return val ?? []
}
export async function setBriefs(briefs: Brief[]): Promise<void> {
  return kvSet('briefs', briefs)
}

export async function seedAll(): Promise<void> {
  await kvSet('tasks', seedTasks)
  await kvSet('projects', seedProjects)
  await kvSet('activity', seedActivity)
  await kvSet('docs', seedDocs)
  await kvSet('team', seedTeam)
  await kvSet('memory', seedMemory)
  await kvSet('agents', seedAgents)
}
