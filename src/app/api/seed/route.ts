import { NextResponse } from 'next/server'
import { seedAll } from '@/lib/kv'

export async function POST() {
  await seedAll()
  return NextResponse.json({ ok: true, message: 'All data reseeded successfully' })
}
