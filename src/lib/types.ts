export type TaskColumn = 'Recurring' | 'Backlog' | 'In Progress' | 'Review' | 'Done'
export type Priority = 'high' | 'medium' | 'low'
export type Assignee = 'Fred' | 'Mitch'
export type Category = 'Environmental' | 'Research' | 'Development' | 'Admin' | 'Analysis' | 'Strategy' | 'Finance'
export type ProjectStatus = 'Active' | 'Planning' | 'Completed' | 'On Hold'
export type DocType = 'Journal' | 'Report' | 'Analysis' | 'Plan' | 'Other'

export interface Task {
  id: string
  title: string
  description: string
  assignee: Assignee
  category: Category
  column: TaskColumn
  priority: Priority
  createdAt: string
  updatedAt: string
  scheduledDate?: string | null
}

export interface Project {
  id: string
  name: string
  description: string
  status: ProjectStatus
  progress: number
  priority: Priority
  owner: string
  createdAt: string
  updatedAt: string
}

export interface ActivityItem {
  id: string
  action: string
  type: 'task_complete' | 'task_create' | 'doc_create' | 'memory_update' | 'project_update' | 'system'
  icon: string
  color: string
  timestamp: string
}

export interface Doc {
  id: string
  title: string
  type: DocType
  content: string
  format: 'MD' | 'PDF' | 'DOCX'
  createdAt: string
  updatedAt: string
  wordCount?: number
}

export interface TeamMember {
  id: string
  name: string
  role: string
  avatar: string
  tags: string[]
  status: 'online' | 'offline' | 'busy'
  isAI?: boolean
}

export interface TeamData {
  missionStatement: string
  members: TeamMember[]
}

export interface MemoryEntry {
  id: string
  filename: string
  date: string
  label: string
  preview: string
  content: string
  entryCount: number
}

export type AgentStatus = 'running' | 'completed' | 'failed' | 'idle'

export interface SubAgent {
  id: string
  name: string
  task: string
  status: AgentStatus
  model: string
  startedAt: string
  updatedAt: string
  completedAt: string | null
  result: string | null
  tags: string[]
}
