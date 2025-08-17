export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const revalidate = 0
export const fetchCache = 'force-no-store'

import { NextResponse } from 'next/server'
import { isDevNoDB } from '@/lib/dev'
import { getSignedUploadUrlForCase } from '@/lib/document-utils'

export async function POST(req: Request, { params }: { params: { id: string } }) {
  // In mock mode, we don't do live uploads; front-end will fall back.
  if (isDevNoDB) return NextResponse.json({ ok: false, reason: 'mock' })
  const { filename, contentType } = await req.json().catch(() => ({}))
  if (!filename) return NextResponse.json({ ok: false, reason: 'bad-request' }, { status: 400 })

  const res = await getSignedUploadUrlForCase(params.id, filename, contentType || 'application/octet-stream')
  return NextResponse.json(res)
}
