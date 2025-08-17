type Role = 'ADMIN' | 'STAFF' | 'CLIENT'
type User = { id: string; role: Role } | null

function devBypassUser(): User {
  if (process.env.SKIP_AUTH === '1' || process.env.NEXT_PUBLIC_SKIP_AUTH === '1') {
    return { id: 'dev-bypass', role: 'ADMIN' }
  }
  return null
}

function forbidden(): never {
  const err: any = new Error('forbidden')
  err.status = 403
  throw err
}

export async function assertCaseAccess(_caseId: string): Promise<{ user: User }> {
  const user = devBypassUser()
  if (user) return { user }
  // TODO: implement real session & case access checks
  forbidden()
}

export async function assertOrgAccess(_orgId: string): Promise<{ user: User }> {
  const user = devBypassUser()
  if (user) return { user }
  // TODO: implement real session & org access checks
  forbidden()
}
