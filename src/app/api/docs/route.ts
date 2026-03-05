import { NextResponse } from 'next/server'
import { getDocs, setDocs } from '@/lib/kv'
import { Doc } from '@/lib/types'

export async function GET() {
  const docs = await getDocs()
  return NextResponse.json(docs)
}

export async function POST(req: Request) {
  const body = await req.json()
  const docs = await getDocs()

  const doc: Doc = {
    id: `doc_${Date.now()}`,
    title: body.title,
    type: body.type || 'Other',
    content: body.content || '',
    format: body.format || 'MD',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    wordCount: body.content ? body.content.split(/\s+/).length : 0,
  }
  await setDocs([...docs, doc])
  return NextResponse.json(doc)
}
