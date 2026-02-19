import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/db";
import { usersTable, authTokensTable } from "@/db/schema/auth-schema";
import { eq, and, gt } from "drizzle-orm";
import { hashToken } from "@/lib/auth-utils";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const email = req.nextUrl.searchParams.get("email");
  if (!token || !email) {
    return NextResponse.redirect(
      new URL("/auth/verify?error=invalid", req.url)
    );
  }
  const tokenHash = hashToken(token);
  const now = new Date();

  const [row] = await db
    .select()
    .from(authTokensTable)
    .where(
      and(
        eq(authTokensTable.purpose, "email_verification"),
        eq(authTokensTable.tokenHash, tokenHash),
        eq(authTokensTable.identifier, email.toLowerCase().trim()),
        gt(authTokensTable.expires, now)
      )
    )
    .limit(1);

  if (!row || row.usedAt) {
    return NextResponse.redirect(
      new URL("/auth/verify?error=expired", req.url)
    );
  }

  await db
    .update(usersTable)
    .set({ emailVerified: now })
    .where(eq(usersTable.id, row.userId!));
  await db
    .update(authTokensTable)
    .set({ usedAt: now })
    .where(eq(authTokensTable.id, row.id));

  const base = new URL("/auth/verify", req.url);
  base.searchParams.set("success", "1");
  return NextResponse.redirect(base);
}
