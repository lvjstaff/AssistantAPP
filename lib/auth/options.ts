import type { NextAuthOptions } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { ENV, isProd } from '@/lib/env'

// In production, you MUST set NEXTAUTH_SECRET. We don't throw at build time to avoid failing Cloud Run builds.
// At runtime, NextAuth will warn if the secret is empty; we also log a clear message.
if (isProd && !ENV.NEXTAUTH_SECRET) {
  console.warn('[auth] NEXTAUTH_SECRET is missing in production. Set it on Cloud Run to enable secure sessions.')
}

export const authOptions: NextAuthOptions = {
  secret: ENV.NEXTAUTH_SECRET || undefined,
  // You can switch to OAuth providers here; Credentials keeps deps minimal
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // Example: replace with real DB call.
        // Graceful behavior: if no DB configured, allow a demo login in non-prod.
        const email = credentials?.email?.toLowerCase().trim()
        const pass = credentials?.password
        if (!email || !pass) return null
        if (!isProd && email === 'demo@lvj.local' && pass === 'demo') {
          return { id: 'demo', name: 'Demo User', email, role: 'lvj_admin' }
        }
        // In prod without a DB wired, fail gracefully.
        return null
      },
    }),
  ],
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/signin',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role || 'client'
      }
      return token
    },
    async session({ session, token }) {
      session.user = {
        ...session.user,
        id: token.sub,
        role: (token as any).role || 'client',
      }
      return session
    },
  },
}
