import { NextResponse } from 'next/server'
import { getMemory } from '@/lib/kv'

export async function GET() {
  const entries = await getMemory()
  return NextResponse.json(entries)
}
