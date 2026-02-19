import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/db";
import { usersTable, authTokensTable } from "@/db/schema/auth-schema";
import { eq, and } from "drizzle-orm";
import { randomUUID } from "crypto";
import {
  hashToken,
  generateToken,
  normalizeEmail,
  VERIFICATION_TTL_HOURS,
} from "@/lib/auth-utils";
import { sendVerificationEmail } from "@/lib/email";

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

    const [user] = await db
      .select({ id: usersTable.id, emailVerified: usersTable.emailVerified })
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);
    if (!user) {
      return NextResponse.json(
        { message: "If an account exists, a new verification email was sent." },
        { status: 200 }
      );
    }
    if (user.emailVerified) {
      return NextResponse.json(
        { message: "Account is already verified. You can sign in." },
        { status: 200 }
      );
    }

    const rawToken = generateToken();
    const tokenHash = hashToken(rawToken);
    const expires = new Date();
    expires.setHours(expires.getHours() + VERIFICATION_TTL_HOURS);

    await db.insert(authTokensTable).values({
      id: randomUUID(),
      purpose: "email_verification",
      identifier: email,
      tokenHash,
      expires,
      userId: user.id,
    });

    await sendVerificationEmail(email, rawToken);
    return NextResponse.json(
      { message: "Verification email sent. Check your inbox." },
      { status: 200 }
    );
  } catch (e) {
    console.error("Resend verification error:", e);
    return NextResponse.json(
      { code: "SERVER_ERROR", message: "Something went wrong." },
      { status: 500 }
    );
  }
}
