import { NextResponse } from 'next/server'
import { getPrisma } from '@/lib/db'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export async function GET(req: Request) {
  const prisma = await getPrisma()
  const url = new URL(req.url)
  const limit = Number(url.searchParams.get('limit') ?? 50)
  const caseId = url.searchParams.get('caseId')

  let items = await (prisma as any).auditLog?.findMany?.({
    orderBy: { at: 'desc' },
    take: Math.min(Math.max(limit, 1), 200),
  }) ?? []

  if (caseId) {
    items = items.filter((row: any) => {
      const d = row?.data ?? {}
      return d?.caseId === caseId || d?.case_id === caseId || row?.entityId === caseId
    })
  }

  return NextResponse.json({ items })
}
