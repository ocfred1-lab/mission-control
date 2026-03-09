import { NextResponse } from 'next/server'
import { getData, setData } from '@/lib/kv'
import { Brief } from '@/lib/types'

export async function GET() {
  const briefs = await getData<Brief[]>('briefs', [])
  return NextResponse.json(briefs.sort((a: Brief, b: Brief) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  ))
}

export async function POST(req: Request) {
  const body = await req.json()
  const briefs = await getData<Brief[]>('briefs', [])
  const brief: Brief = {
    id: `brief_${Date.now()}`,
    title: body.title || 'Trend Briefing',
    source: body.source || 'trend-spotter',
    content: body.content,
    tags: body.tags || [],
    timestamp: body.timestamp || new Date().toISOString(),
  }
  const updated = [brief, ...briefs].slice(0, 100)
  await setData('briefs', updated)
  return NextResponse.json(brief)
}

export async function DELETE(req: Request) {
  const { id } = await req.json()
  const briefs = await getData<Brief[]>('briefs', [])
  await setData('briefs', briefs.filter((b: Brief) => b.id !== id))
  return NextResponse.json({ success: true })
}
