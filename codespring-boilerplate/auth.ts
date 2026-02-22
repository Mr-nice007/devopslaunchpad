import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/db/db";
import { usersTable } from "@/db/schema/auth-schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

// Auth.js requires a secret for signing; use a dev fallback only when not in production
const authSecret =
  process.env.AUTH_SECRET ||
  (process.env.NODE_ENV === "development" ? "dev-secret-replace-with-openssl-rand-base64-32" : undefined);
if (!authSecret && process.env.NODE_ENV === "development") {
  console.warn("[auth] Using dev secret. Set AUTH_SECRET in .env.local for production.");
}

// Credentials provider only works with JWT sessions (not database sessions).
export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: authSecret,
  trustHost: true,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  pages: {
    signIn: "/auth/login",
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      const returnTo = url.startsWith("/") ? baseUrl + url : url;
      if (returnTo.startsWith(baseUrl)) return returnTo;
      return baseUrl + "/dashboard";
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.emailVerified = (user as { emailVerified?: Date | null }).emailVerified ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.sub ?? token.id ?? "");
        session.user.emailVerified = (token.emailVerified as Date | null) ?? null;
      }
      return session;
    },
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const email = String(credentials.email).toLowerCase().trim();
        try {
          const [user] = await db
            .select()
            .from(usersTable)
            .where(eq(usersTable.email, email))
            .limit(1);
          if (!user) {
            if (process.env.NODE_ENV === "development") {
              console.warn("[auth] No user found for email:", email);
            }
            return null;
          }
          if (!user.passwordHash) {
            if (process.env.NODE_ENV === "development") {
              console.warn("[auth] User has no password set:", user.id);
            }
            return null;
          }
          const ok = await bcrypt.compare(
            String(credentials.password),
            user.passwordHash
          );
          if (!ok) {
            if (process.env.NODE_ENV === "development") {
              console.warn("[auth] Password mismatch for email:", email);
            }
            return null;
          }
          // Allow unverified users to sign in so they can reach the dashboard
          // and use the verify-email banner / resend flow (no throw → no CallbackRouteError).
          return {
            id: user.id,
            email: user.email,
            name: user.name ?? undefined,
            image: user.image ?? undefined,
            emailVerified: user.emailVerified ?? undefined,
          };
        } catch (err) {
          console.error("[auth] authorize error:", err);
          return null;
        }
      },
    }),
  ],
  events: {
    async signIn() {
      // Optional: log auth_login
    },
  },
});
