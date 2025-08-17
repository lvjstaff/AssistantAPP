import { NextResponse } from 'next/server'
import { getPrisma } from '@/lib/db'
import { isDevNoDB, listCasesMock } from '@/lib/dev'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const search = (url.searchParams.get('search') || '').trim()
  const status = (url.searchParams.get('status') || 'all').toLowerCase()
  const sort = url.searchParams.get('sort') || 'updatedAt_desc'
  const visaType = (url.searchParams.get('visaType') || 'all').toLowerCase()
  const origin = (url.searchParams.get('origin') || 'all').toUpperCase()
  const lead = url.searchParams.get('lead') || 'all'

  if (isDevNoDB) {
    // Filter the mock list in-memory
    let items = listCasesMock()
    if (search) {
      const s = search.toLowerCase()
      items = items.filter(c =>
        c.title.toLowerCase().includes(s) ||
        c.applicant.toLowerCase().includes(s) ||
        (c as any).applicantEmail?.toLowerCase?.().includes?.(s)
      )
    }
    if (status !== 'all') items = items.filter(c => (c.status || '').toLowerCase() === status)
    // mock items may not have visaType/origin/assignee; ignore when absent
    if (visaType !== 'all') items = items.filter((c: any) => (c.visaType || '').toLowerCase() === visaType)
    if (origin !== 'all') items = items.filter((c: any) => (c.originCountry || '').toUpperCase() === origin)
    if (lead !== 'all') items = items.filter((c: any) => (c.assigneeId || '') === lead)

    items = items.sort((a: any, b: any) =>
      sort === 'updatedAt_asc'
        ? new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
        : new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )

    return NextResponse.json({ items })
  }

  const prisma = await getPrisma()

  const where: any = {}
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { applicantName: { contains: search, mode: 'insensitive' } },
      { applicantEmail: { contains: search, mode: 'insensitive' } },
    ]
  }
  if (status !== 'all') where.status = status // enum mapped in schema
  if (visaType !== 'all') where.visaType = visaType // enum
  if (origin !== 'all') where.originCountry = origin
  if (lead !== 'all') where.assigneeId = lead

  const orderBy =
    sort === 'updatedAt_asc'
      ? { updatedAt: 'asc' as const }
      : sort === 'createdAt_desc'
      ? { createdAt: 'desc' as const }
      : sort === 'createdAt_asc'
      ? { createdAt: 'asc' as const }
      : { updatedAt: 'desc' as const }

  const items = await prisma.case.findMany({
    where,
    orderBy,
    select: {
      id: true,
      title: true,
      applicantName: true,
      applicantEmail: true,
      status: true,
      stage: true,
      updatedAt: true,
      visaType: true,
      originCountry: true,
      assigneeId: true,
    },
  })

  return NextResponse.json({ items })
}
