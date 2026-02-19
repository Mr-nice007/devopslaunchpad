import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "DevOps Launchpad";

function baseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export async function sendVerificationEmail(
  to: string,
  token: string
): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    console.warn("RESEND_API_KEY not set; skipping verification email");
    return { success: true };
  }
  const verifyUrl = `${baseUrl()}/auth/verify?token=${encodeURIComponent(token)}&email=${encodeURIComponent(to)}`;
  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Verify your ${APP_NAME} account`,
    html: `
      <p>Thanks for signing up. Please verify your email by clicking the link below.</p>
      <p><a href="${verifyUrl}">Verify your email</a></p>
      <p>This link expires in 24 hours. If you didn't create an account, you can ignore this email.</p>
    `,
  });
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function sendPasswordResetEmail(
  to: string,
  token: string
): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    console.warn("RESEND_API_KEY not set; skipping reset email");
    return { success: true };
  }
  const resetUrl = `${baseUrl()}/auth/reset?token=${encodeURIComponent(token)}&email=${encodeURIComponent(to)}`;
  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Reset your ${APP_NAME} password`,
    html: `
      <p>You requested a password reset. Click the link below to set a new password.</p>
      <p><a href="${resetUrl}">Reset password</a></p>
      <p>This link expires in 1 hour. If you didn't request this, you can ignore this email.</p>
    `,
  });
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function sendPasswordResetSuccessEmail(to: string): Promise<void> {
  if (!resend) return;
  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Your ${APP_NAME} password was reset`,
    html: `<p>Your password was successfully changed. If you didn't make this change, please contact support.</p>`,
  });
}
