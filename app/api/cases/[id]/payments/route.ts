import { logAudit } from '@/lib/audit'

import { Prisma } from "@prisma/client";
import * as PrismaPkg from "@prisma/client";
import { NextResponse } from 'next/server'
import { getPrisma } from '@/lib/db'
import { isDevNoDB, listPaymentsMock, markPaymentPaidMock, createPaymentMock } from '@/lib/dev'

const PrismaRT = (PrismaPkg as any)?.Prisma ?? (Prisma as any);
const PayStatus = PrismaRT?.PaymentStatus ?? ({ unpaid: 'unpaid', paid: 'paid', void: 'void' } as const);
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  if (isDevNoDB) return NextResponse.json({ items: listPaymentsMock(params.id) })
  const prisma = await getPrisma()
  const items = await prisma.payment.findMany({
    where: { caseId: params.id },
    orderBy: { issuedAt: 'desc' },
  })
  return NextResponse.json({ items })
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json()

  // Mock mode
  if (isDevNoDB) {
    if (body.action === 'markPaid') {
      const item = markPaymentPaidMock(body.id)
      return NextResponse.json({ ok: true, item })
    }
    if (body.action === 'create') {
      const item = createPaymentMock(params.id, body)
      return NextResponse.json({ ok: true, item })
    }
    return NextResponse.json({ ok: false, reason: 'unknown-action' }, { status: 400 })
  }

  // DB mode
  const prisma = await getPrisma()

  if (body.action === 'markPaid') {
    const p = await prisma.payment.update({
      where: { id: body.id },
      data: { status: (Prisma as any)?.PaymentStatus?.PAID ?? ((PayStatus as any).paid as any), paidAt: new Date() },
    })
    await logAudit(prisma, { action: 'payment.markPaid', entityType: 'payment', entityId: p.id, data: { caseId: params.id } });
      await logAudit(prisma, { action: 'payment.create', entityType: 'payment', entityId: p.id, data: { caseId: params.id } });
      return NextResponse.json({ ok: true, item: p })
  }

  if (body.action === 'create') {
    const p = await prisma.payment.create({
      data: {
        caseId: params.id,
        description: String(body.description ?? 'Invoice'),
        amountCents: Number(body.amountCents ?? 0),
        currency: String(body.currency ?? 'USD'),
        status: (Prisma as any)?.PaymentStatus?.UNPAID ?? ((PayStatus as any).unpaid as any),
        invoiceNumber: String(body.invoiceNumber ?? `INV-${Date.now()}`),
      },
    })
    return NextResponse.json({ ok: true, item: p })
  }

  return NextResponse.json({ ok: false, reason: 'unknown-action' }, { status: 400 })
}
