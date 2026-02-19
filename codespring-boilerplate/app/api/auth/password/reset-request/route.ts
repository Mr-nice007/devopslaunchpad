import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/db";
import { usersTable, authTokensTable } from "@/db/schema/auth-schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import {
  hashToken,
  generateToken,
  normalizeEmail,
  RESET_TTL_HOURS,
} from "@/lib/auth-utils";
import { sendPasswordResetEmail } from "@/lib/email";
import { verifyTurnstileToken } from "@/lib/turnstile";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = body?.email ? normalizeEmail(String(body.email)) : "";
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { code: "INVALID_INPUT", message: "Valid email is required" },
        { status: 400 }
      );
    }
    if (body?.turnstileToken && !(await verifyTurnstileToken(body.turnstileToken))) {
      return NextResponse.json(
        { code: "TURNSTILE_FAILED", message: "Verification failed. Please try again." },
        { status: 400 }
      );
    }

    const [user] = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);

    if (user) {
      const rawToken = generateToken();
      const tokenHash = hashToken(rawToken);
      const expires = new Date();
      expires.setHours(expires.getHours() + RESET_TTL_HOURS);
      await db.insert(authTokensTable).values({
        id: randomUUID(),
        purpose: "password_reset",
        identifier: email,
        tokenHash,
        expires,
        userId: user.id,
      });
      await sendPasswordResetEmail(email, rawToken);
    }

    return NextResponse.json({
      message: "If an account exists with this email, you will receive a reset link.",
    });
  } catch (e) {
    console.error("Reset request error:", e);
    return NextResponse.json(
      { code: "SERVER_ERROR", message: "Something went wrong." },
      { status: 500 }
    );
  }
}
