import { NextResponse } from 'next/server'
import { isDevNoDB, getCaseMock } from '@/lib/dev'
import { getPrisma } from '@/lib/db'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  if (isDevNoDB) {
    const c = getCaseMock(params.id)
    if (!c) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ case: c })
  }
  const prisma = await getPrisma()
  const c = await prisma.case.findUnique({ where: { id: params.id } })
  if (!c) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ case: c })
}
