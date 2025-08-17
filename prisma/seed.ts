import { PrismaClient } from '@prisma/client'
if (process.env.SKIP_DB === '1') {
  console.log('SKIP_DB=1 — skipping seed.')
  process.exit(0)
}
const prisma = new PrismaClient()
async function main() {
  const user = await prisma.user.upsert({
    where: { email: 'demo@lvj.local' },
    update: {},
    create: { email: 'demo@lvj.local', name: 'LVJ Demo', role: 'STAFF' }
  })
  await prisma.case.create({
    data: {
      title: 'Tourist Extension – Ali Ahmad',
      applicantName: 'Ali Ahmad',
      applicantEmail: 'ali@example.com',
      status: 'DOCUMENTS_PENDING',
      stage: 'Intake',
      clientId: user.id,
      assigneeId: user.id,
      documents: {
        create: [
          { name: 'Passport Scan', state: 'UPLOADED' },
          { name: 'Bank Statements', state: 'REQUESTED' },
        ]
      },
      payments: {
        create: [
          { description: 'Service Fee – Filing', amountCents: 75000, currency: 'USD', status: 'UNPAID', invoiceNumber: 'INV-1001' }
        ]
      }
    }
  })
  console.log('Seeded demo data.')
}
main().finally(() => prisma.$disconnect())
