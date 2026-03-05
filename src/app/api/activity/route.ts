import { NextResponse } from 'next/server'
import { getActivity, setActivity } from '@/lib/kv'
import { ActivityItem } from '@/lib/types'

export async function GET() {
  const items = await getActivity()
  return NextResponse.json(items.sort((a: ActivityItem, b: ActivityItem) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  ))
}

export async function POST(req: Request) {
  const body = await req.json()
  const items = await getActivity()
  const item: ActivityItem = {
    id: `act_${Date.now()}`,
    action: body.action,
    type: body.type || 'system',
    icon: body.icon || 'zap',
    color: body.color || 'blue',
    timestamp: new Date().toISOString(),
  }
  const updated = [item, ...items].slice(0, 100) // keep last 100
  await setActivity(updated)
  return NextResponse.json(item)
}
