# User Authentication

## Feature Overview
Enable secure email/password authentication with email verification, password reset, and session management. Support optional Google OAuth. Restrict access to gated resources until email is verified. Provide resilient flows with clear errors and token lifecycle controls.

## Requirements
- Sign Up (Credentials)
  - Endpoint: POST /api/auth/signup
  - Inputs: email (string), password (string), turnstileToken (string)
  - Validation: email format, password >= 12 chars, includes upper/lowercase and number or symbol; Turnstile validate; email must be unique.
  - Behavior: create user (emailVerified = null), store bcrypt-hashed password, create hashed verification token (expires 24h), send verification email via Resend. Return 201 with message.
  - Errors: 400 invalid input, 409 email exists, 429 throttled, 500 on send failure.

- Email Verification
  - Endpoint: GET /api/auth/verify?token=...&email=...
  - Inputs: token (string), email (string)
  - Behavior: verify hashed token matches and not expired; set emailVerified = now(); delete token; rotate session if authenticated; redirect to dashboard with success param.
  - Errors: 400 invalid/expired; allow POST /api/auth/verify/resend to issue a new token (rate-limited).

- Sign In (Credentials via Auth.js Credentials provider)
  - Endpoint: POST /api/auth/signin
  - Inputs: email, password, turnstileToken, optional redirectTo
  - Behavior: validate Turnstile; reject if not verified (return 403 with resend-verification hint); compare password; create session; set secure HttpOnly cookie; return 200 JSON with user summary and nextUrl.
  - Errors: 400 invalid input, 401 invalid credentials, 403 unverified, 429 throttled.

- Sign Out
  - Endpoint: POST /api/auth/signout
  - Behavior: invalidate current session (DB delete) and clear cookie. 204.

- Password Reset
  - Request: POST /api/auth/password/reset-request
    - Inputs: email
    - Behavior: always return 200; if user exists, create hashed reset token (expires 1h), send email via Resend. Rate limit by email/IP.
  - Confirm: POST /api/auth/password/reset-confirm
    - Inputs: token, email, newPassword
    - Validation: newPassword rules match signup.
    - Behavior: verify token; update password hash; delete all user sessions; delete token; send confirmation email. 200.
    - Errors: 400 invalid/expired, 429 throttled.

- Optional OAuth (Google)
  - If enabled, configure Auth.js Google provider. On first login, create User and Account; require emailVerified = now() if provider claims verified email.

- Protected Routes Policy
  - Any request to /api/secure/* requires a valid session and emailVerified != null.
  - Unauthorized: 401; Unverified: 403 with action=verify.

## User Stories
- As a new user, I can sign up with email/password and receive a verification email to activate my account.
- As a returning user, I can sign in and remain signed in securely across sessions.
- As a user who forgot my password, I can request a reset link and set a new password.
- As an unverified user, I am prompted to verify and can resend the verification email.

## Technical Considerations
- Data Model (Prisma)
  - User(id, email unique, passwordHash, emailVerified DateTime?, name?, image?)
  - Session(sessionToken, userId, expires)
  - VerificationToken(identifier email, token hashed, expires) for both verify and reset (different purpose types or separate tables/fields)
  - Account (OAuth) optional
- Security
  - Passwords: bcrypt cost ~12.
  - Tokens: store only hashed (SHA-256) with random 32+ bytes; single-use; TTL verify 24h, reset 1h.
  - Cookies: HttpOnly, Secure, SameSite=Lax, domain-scoped; session rotation on login and verify; idle timeout 30d, absolute 90d; rotate every 24h.
  - CSRF: Auth.js anti-CSRF on POST; ensure same-site and CSRF token checks.
  - Bot/abuse: Cloudflare Turnstile on signup/signin; per-IP/email throttling (e.g., 5/min, 50/day) on auth endpoints.
- Validation
  - Normalize emails (lowercase, trim); reject disposable domains (optional).
  - Return structured errors: { code, message, actionHint? }.
- Emails (Resend)
  - Templates: verification, reset request, reset success. Links include short-lived token, absolute URLs.
- Observability
  - Log auth events: auth_signup, auth_login, auth_verify, auth_reset with userId/IP (PII-safe).
- Performance
  - Endpoints P95 < 300ms excluding email send; email send async where possible.
  - DB indices: User.email, Session.sessionToken, VerificationToken.identifier, VerificationToken.expires.

## Success Criteria
- ≥98% of verification links successfully activate accounts within TTL.
- Unverified users are blocked from gated APIs 100% of the time.
- Password reset invalidates all existing sessions consistently.
- No plaintext secrets or tokens stored; bcrypt and hashed tokens verified in code review.
- Auth endpoints meet rate limits and latency targets; no critical auth vulnerabilities in security review.
