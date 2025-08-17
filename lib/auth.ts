import 'server-only'
import type { NextAuthOptions, User } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'

export async function getAuthOptions(): Promise<NextAuthOptions> {
  const providers: any[] = []

  // Dev-only Credentials login (works w/ or w/o DB)
  if (process.env.NODE_ENV !== 'production') {
    providers.push(
      Credentials({
        name: 'Dev Login',
        credentials: {
          email: { label: 'Email', type: 'email', placeholder: 'you@example.com' },
          code:  { label: 'Access Code', type: 'password', placeholder: process.env.DEV_LOGIN_CODE ?? 'lvjdev' },
        },
        async authorize(creds) {
          const email = (creds?.email ?? '').toString().trim().toLowerCase()
          const code  = (creds?.code ?? '').toString().trim()
          const expected = process.env.DEV_LOGIN_CODE ?? 'lvjdev'
          if (!email || code !== expected) return null
          const user: User = { id: email, email, name: email.split('@')[0] }
          return user
        }
      })
    )
  }

  // Optional: turn on PrismaAdapter when DB is on & flag is set
  const useAdapter = process.env.ENABLE_PRISMA_ADAPTER === '1' && process.env.SKIP_DB !== '1'
  const adapter = useAdapter
    ? (await import('@next-auth/prisma-adapter')).PrismaAdapter((await import('@/lib/db')).getPrisma())
    : undefined

  const opts: NextAuthOptions = {
    adapter: adapter as any,        // only truthy if flag on
    session: { strategy: 'jwt' },   // keep JWT sessions
    providers,
    pages: { signIn: '/signin' },
    callbacks: {
      async jwt({ token, user }) {
        if (user) {
          token.email = user.email
          token.name  = user.name
          token.sub   = user.id as string
        }
        return token
      },
      async session({ session, token }) {
        if (session?.user) {
          session.user.email = (token.email as string) ?? session.user.email
          session.user.name  = (token.name as string) ?? session.user.name
          ;(session.user as any).id = token.sub
        }
        return session
      },
    },
  }
  return opts
}
