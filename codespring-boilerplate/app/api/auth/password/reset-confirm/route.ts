import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/db";
import {
  usersTable,
  authTokensTable,
  sessionsTable,
} from "@/db/schema/auth-schema";
import { eq, and, gt } from "drizzle-orm";
import { hashPassword, validatePasswordStrength, normalizeEmail, hashToken } from "@/lib/auth-utils";
import { sendPasswordResetSuccessEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, email: rawEmail, newPassword } = body as {
      token?: string;
      email?: string;
      newPassword?: string;
    };
    const email = rawEmail ? normalizeEmail(String(rawEmail)) : "";
    if (!token || !email || !newPassword) {
      return NextResponse.json(
        { code: "INVALID_INPUT", message: "Token, email, and new password are required" },
        { status: 400 }
      );
    }
    const pwdCheck = validatePasswordStrength(newPassword);
    if (!pwdCheck.valid) {
      return NextResponse.json(
        { code: "INVALID_INPUT", message: pwdCheck.message },
        { status: 400 }
      );
    }

    const tokenHash = hashToken(token);
    const now = new Date();
    const [row] = await db
      .select()
      .from(authTokensTable)
      .where(
        and(
          eq(authTokensTable.purpose, "password_reset"),
          eq(authTokensTable.tokenHash, tokenHash),
          eq(authTokensTable.identifier, email),
          gt(authTokensTable.expires, now)
        )
      )
      .limit(1);

    if (!row || row.usedAt || !row.userId) {
      return NextResponse.json(
        { code: "INVALID_TOKEN", message: "This link is invalid or has expired." },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(newPassword);
    await db
      .update(usersTable)
      .set({ passwordHash })
      .where(eq(usersTable.id, row.userId));
    await db.delete(sessionsTable).where(eq(sessionsTable.userId, row.userId));
    await db.update(authTokensTable).set({ usedAt: now }).where(eq(authTokensTable.id, row.id));

    await sendPasswordResetSuccessEmail(email);
    return NextResponse.json({ message: "Password updated. You can sign in now." });
  } catch (e) {
    console.error("Reset confirm error:", e);
    return NextResponse.json(
      { code: "SERVER_ERROR", message: "Something went wrong." },
      { status: 500 }
    );
  }
}
