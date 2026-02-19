import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/db";
import { usersTable, authTokensTable } from "@/db/schema/auth-schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import {
  hashPassword,
  hashToken,
  generateToken,
  validatePasswordStrength,
  normalizeEmail,
  VERIFICATION_TTL_HOURS,
} from "@/lib/auth-utils";
import { sendVerificationEmail } from "@/lib/email";
import { verifyTurnstileToken } from "@/lib/turnstile";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email: rawEmail, password, turnstileToken } = body as {
      email?: string;
      password?: string;
      turnstileToken?: string;
    };

    const email = rawEmail ? normalizeEmail(rawEmail) : "";
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { code: "INVALID_INPUT", message: "Valid email is required" },
        { status: 400 }
      );
    }
    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { code: "INVALID_INPUT", message: "Password is required" },
        { status: 400 }
      );
    }
    const pwdCheck = validatePasswordStrength(password);
    if (!pwdCheck.valid) {
      return NextResponse.json(
        { code: "INVALID_INPUT", message: pwdCheck.message },
        { status: 400 }
      );
    }
    if (turnstileToken && !(await verifyTurnstileToken(turnstileToken))) {
      return NextResponse.json(
        { code: "TURNSTILE_FAILED", message: "Verification failed. Please try again." },
        { status: 400 }
      );
    }

    const [existing] = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);
    if (existing) {
      return NextResponse.json(
        { code: "EMAIL_EXISTS", message: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const userId = randomUUID();
    const passwordHash = await hashPassword(password);
    await db.insert(usersTable).values({
      id: userId,
      email,
      passwordHash,
      emailVerified: null,
    });

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
      userId,
    });

    const sendResult = await sendVerificationEmail(email, rawToken);
    if (!sendResult.success) {
      return NextResponse.json(
        { code: "EMAIL_FAILED", message: "Could not send verification email. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Check your email to verify your account." },
      { status: 201 }
    );
  } catch (e) {
    console.error("Signup error:", e);
    return NextResponse.json(
      { code: "SERVER_ERROR", message: "Something went wrong." },
      { status: 500 }
    );
  }
}
