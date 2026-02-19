import { createHash, randomBytes } from "crypto";
import bcrypt from "bcrypt";

const BCRYPT_ROUNDS = 12;
const TOKEN_BYTES = 32;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function generateToken(): string {
  return randomBytes(TOKEN_BYTES).toString("hex");
}

export const PASSWORD_MIN_LENGTH = 12;

/**
 * Validate password: >= 12 chars, upper, lower, number or symbol.
 */
export function validatePasswordStrength(password: string): {
  valid: boolean;
  message?: string;
} {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return { valid: false, message: "Password must be at least 12 characters" };
  }
  if (password.length > 72) {
    return { valid: false, message: "Password must be at most 72 characters" };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: "Password must include an uppercase letter" };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: "Password must include a lowercase letter" };
  }
  if (!/[0-9]/.test(password) && !/[^A-Za-z0-9]/.test(password)) {
    return {
      valid: false,
      message: "Password must include a number or symbol",
    };
  }
  return { valid: true };
}

export function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

export const VERIFICATION_TTL_HOURS = 24;
export const RESET_TTL_HOURS = 1;
