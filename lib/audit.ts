import type { PrismaClient } from '@prisma/client'

export async function logAudit(
  prisma: PrismaClient,
  p: { action: string; entityType: string; entityId?: string | null; data?: any; actorId?: string | null; actorRole?: string | null }
) {
  const { action, entityType, entityId = null, data = null, actorId = null, actorRole = 'DEV' } = p
  try {
    // Optional chaining so older clients don’t explode
    await (prisma as any).auditLog?.create?.({
      data: { action, entityType, entityId, data, actorId, actorRole }
    })
  } catch (e) {
    console.error('auditLog create failed (non-fatal):', e)
  }
}
