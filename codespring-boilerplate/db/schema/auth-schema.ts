import {
  pgTable,
  text,
  timestamp,
  integer,
  varchar,
  primaryKey,
} from "drizzle-orm/pg-core";

/**
 * Auth.js / NextAuth compatible schema + custom fields for credentials auth.
 * - users: id (matches profiles.userId), email, emailVerified, passwordHash, name, image
 * - sessions: sessionToken, userId, expires
 * - accounts: OAuth provider accounts
 * - verificationTokens: Auth.js magic-link style (optional)
 * - auth_tokens: our hashed tokens for email verification and password reset
 */

export const usersTable = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  passwordHash: text("password_hash"),
  name: text("name"),
  image: text("image"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const sessionsTable = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const accountsTable = pgTable(
  "accounts",
  {
    userId: text("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.provider, table.providerAccountId] }),
  })
);

export const verificationTokensTable = pgTable("verification_tokens", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull(),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

/**
 * Custom table for hashed, purpose-scoped tokens (email verification, password reset).
 * PRD: store only hashed tokens; single-use; TTL verify 24h, reset 1h.
 */
export const authTokensTable = pgTable("auth_tokens", {
  id: text("id").primaryKey(),
  purpose: text("purpose").notNull(), // 'email_verification' | 'password_reset'
  identifier: text("identifier").notNull(), // email
  tokenHash: text("token_hash").notNull(),
  expires: timestamp("expires", { mode: "date" }).notNull(),
  userId: text("user_id").references(() => usersTable.id, { onDelete: "set null" }),
  usedAt: timestamp("used_at", { mode: "date" }),
});

export type InsertUser = typeof usersTable.$inferInsert;
export type SelectUser = typeof usersTable.$inferSelect;
export type InsertSession = typeof sessionsTable.$inferInsert;
export type SelectSession = typeof sessionsTable.$inferSelect;
export type InsertAccount = typeof accountsTable.$inferInsert;
export type SelectAccount = typeof accountsTable.$inferSelect;
export type InsertAuthToken = typeof authTokensTable.$inferInsert;
export type SelectAuthToken = typeof authTokensTable.$inferSelect;
