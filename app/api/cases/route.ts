import { NextResponse } from 'next/server'
import { getPrisma } from '@/lib/db'
import { isDevNoDB, listCasesMock } from '@/lib/dev'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export async function GET(req: Request) {
  const url = new URL(req.url)

  const search   = url.searchParams.get('search')   ?? ''
  const status   = url.searchParams.get('status')   ?? 'all'
  const sort     = url.searchParams.get('sort')     ?? 'updatedAt_desc'
  const visaType = url.searchParams.get('visaType') ?? 'all'
  const origin   = url.searchParams.get('origin')   ?? 'all'
  const lead     = url.searchParams.get('lead')     ?? 'all'

  // Mock mode: just reuse the existing mock list and ignore new filters
  if (isDevNoDB) {
    const items = listCasesMock({
      search,
      status,
      sort,
    } as any)
    return NextResponse.json({ items, cases: items })
  }

  const prisma = await getPrisma()

  const where: any = {}

  if (search) {
    where.OR = [
      { title:         { contains: search, mode: 'insensitive' } },
      { applicantName: { contains: search, mode: 'insensitive' } },
      { applicantEmail:{ contains: search, mode: 'insensitive' } },
    ]
  }

  if (status !== 'all') {
    // your CaseStatus enum is lower-case (e.g. 'new', 'in_review', ...)
    where.status = status
  }

  if (visaType !== 'all') {
    // VisaType enum (work, spouse, student, tourist, extension, asylum, other)
    where.visaType = visaType
  }

  if (origin !== 'all') {
    where.originCountry = origin === 'none' ? null : origin
  }

  if (lead !== 'all') {
    where.assigneeId = lead === 'none' ? null : lead
  }

  const orderBy =
    sort === 'updatedAt_asc' ? { updatedAt: 'asc' } : { updatedAt: 'desc' }

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
      visaType: true,
      originCountry: true,
      assigneeId: true,
      updatedAt: true,
    },
  })

  return NextResponse.json({ items, cases: items })
}

export async function POST(req: Request) {
  const body = await req.json()

  if (isDevNoDB) {
    // In mock mode, just echo back a fake id
    const now = new Date().toISOString()
    return NextResponse.json({
      case: {
        id: 'c_' + Math.random().toString(36).slice(2, 8),
        title: body.title,
        applicantName: body.applicantName,
        applicantEmail: body.applicantEmail,
        status: 'new',
        stage: 'Intake',
        updatedAt: now,
        createdAt: now,
      },
    })
  }

  const prisma = await getPrisma()
  const kase = await prisma.case.create({
    data: {
      title: body.title,
      applicantName: body.applicantName,
      applicantEmail: body.applicantEmail,
      status: 'new',
      stage: 'Intake',
    },
  })
  return NextResponse.json({ case: kase })
}
