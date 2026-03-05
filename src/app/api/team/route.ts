import { NextResponse } from 'next/server'
import { getTeam, setTeam } from '@/lib/kv'

export async function GET() {
  const team = await getTeam()
  return NextResponse.json(team)
}

export async function POST(req: Request) {
  const body = await req.json()
  const team = await getTeam()
  const updated = { ...team, ...body }
  await setTeam(updated)
  return NextResponse.json(updated)
}
