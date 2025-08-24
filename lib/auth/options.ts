import { Role } from "@prisma/client";
import type { NextAuthOptions } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { ENV, isProd } from '@/lib/env'

if (isProd && !ENV.NEXTAUTH_SECRET) {
  console.warn('[auth] NEXTAUTH_SECRET is missing in production. Set it on Cloud Run to enable secure sessions.')
}

export const authOptions: NextAuthOptions = {
  secret: ENV.NEXTAUTH_SECRET || undefined,
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toLowerCase().trim()
        const pass = credentials?.password
        if (!email || !pass) return null
        if (!isProd && email === 'demo@lvj.local' && pass === 'demo') {
          return { id: 'demo', name: 'Demo User', email, role: Role.ADMIN }
        }
        return null
      },
    }),
  ],
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/signin',
  },
  callbacks: {
    // This is the CORRECT, type-safe callback logic
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
      }
      return session;
    },
  },
}
