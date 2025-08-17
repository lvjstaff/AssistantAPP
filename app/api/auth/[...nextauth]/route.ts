export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const revalidate = 0
export const fetchCache = 'force-no-store'

import NextAuth from 'next-auth'
import { getAuthOptions } from '@/lib/auth'

// Build a handler on demand so we can await async options safely.
async function buildHandler() {
  const opts = await getAuthOptions()
  // @ts-ignore - NextAuth returns a request handler when passed options
  return NextAuth(opts)
}

export async function GET(req: Request, ctx: any) {
  const handler = await buildHandler()
  // @ts-ignore
  return handler(req, ctx)
}

export async function POST(req: Request, ctx: any) {
  const handler = await buildHandler()
  // @ts-ignore
  return handler(req, ctx)
}
