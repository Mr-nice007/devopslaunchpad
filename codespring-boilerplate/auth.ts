import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/db/db";
import {
  usersTable,
  sessionsTable,
  accountsTable,
  verificationTokensTable,
} from "@/db/schema/auth-schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

// Auth.js requires a secret for signing; use a dev fallback only when not in production
const authSecret =
  process.env.AUTH_SECRET ||
  (process.env.NODE_ENV === "development" ? "dev-secret-replace-with-openssl-rand-base64-32" : undefined);
if (!authSecret && process.env.NODE_ENV === "development") {
  console.warn("[auth] Using dev secret. Set AUTH_SECRET in .env.local for production.");
}
export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: authSecret,
  adapter: DrizzleAdapter(db, {
    usersTable,
    sessionsTable,
    accountsTable,
    verificationTokensTable,
  }),
  session: {
    strategy: "database",
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
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.emailVerified = user.emailVerified ?? null;
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
        const [user] = await db
          .select()
          .from(usersTable)
          .where(eq(usersTable.email, email))
          .limit(1);
        if (!user?.passwordHash) return null;
        const ok = await bcrypt.compare(
          String(credentials.password),
          user.passwordHash
        );
        if (!ok) return null;
        if (!user.emailVerified) {
          throw new Error("UNVERIFIED");
        }
        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          image: user.image ?? undefined,
          emailVerified: user.emailVerified ?? undefined,
        };
      },
    }),
  ],
  events: {
    async signIn() {
      // Optional: log auth_login
    },
  },
});
