import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

type UserRole = 'client' | 'lvj_admin' | 'lvj_team' | 'lvj_marketing' | 'lawyer_admin' | 'lawyer_associate' | 'lawyer_assistant';
type Language = 'en' | 'ar' | 'pt';
type RenderMode = string;

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id?: string;
      role?: UserRole | string | null;
      preferredLanguage?: Language | string | null;
      renderMode?: RenderMode | string | null;
      termsAccepted?: boolean;
          firstName?: string | null;
      lastName?: string | null;
      termsVersion?: string | number | null;
    };

  }

  interface User extends DefaultUser {
    id?: string;
    role?: UserRole | string | null;
    preferredLanguage?: Language | string | null;
    renderMode?: RenderMode | string | null;
    termsAccepted?: boolean;
    firstName?: string | null;
  lastName?: string | null;
  termsVersion?: string | number | null;
}

}

declare module "next-auth/jwt" {
  interface JWT {
    role?: UserRole | string | null;
    preferredLanguage?: Language | string | null;
    renderMode?: RenderMode | string | null;
    termsAccepted?: boolean;
    firstName?: string | null;
  lastName?: string | null;
  termsVersion?: string | number | null;
}

}
