# User Authentication (Frontend/UI)

## Feature Overview
Enable users to sign up, verify email, log in, reset passwords, maintain secure sessions, and sign out. Provide clear, accessible UI with strong validation, bot protection, and consistent redirect behavior. Block access to gated routes until email verification completes.

## Requirements
- Pages/Routes
  - /auth/signup: Email, password inputs; Cloudflare Turnstile; submit to create unverified user; success state shows "Check your email" with resend and change email.
  - /auth/login: Email, password; Turnstile; "Forgot password?" link; optional "Continue with Google" button if OAuth enabled.
  - /auth/verify: Handles verification link states: verifying (loading), success (redirect to intended page or /dashboard), expired/invalid (error with "Resend verification").
  - /auth/reset-request: Email input; on success show confirmation and "Open email" CTA.
  - /auth/reset: New password + confirm; token from URL; success message then redirect to /auth/login.
  - Sign out: Client action via menu; upon success redirect to homepage.
- Form UX
  - Inputs: labeled, descriptive placeholders; password show/hide toggle.
  - Validation: email format; password 8–72 chars; show inline errors; disable submit until valid + Turnstile completed.
  - Loading states: button shows spinner + disabled; prevent duplicate submissions.
  - Errors: human-readable (invalid credentials, email already in use, unverified account, expired/used link, rate limited); display via alert region with aria-live=assertive.
- Verification Gate
  - Gated routes (e.g., /dashboard, course modules): if session but email not verified, block content and show persistent banner with "Resend verification email" and info on current email; allow sign out/change email. Support in-page resend with success toast.
- Redirects
  - After login: redirect to returnTo (query/referrer) or /dashboard.
  - After signup: show "Check your email" page; keep session if created; after verifying, auto-redirect to intended page if possible.
  - After reset success: toast + redirect to /auth/login.
- Optional OAuth (Google)
  - Show provider button above divider; mirrors same redirects; on error show provider-specific message.
- Visual/Responsive
  - Centered card layout; single-column on mobile, split-illustration optional on md+.
  - Primary CTA prominent; secondary links minimal.
- Accessibility
  - Keyboard navigable; focus trap within modals; visible focus rings.
  - Associate labels; describe errors per field; aria-live for form/global errors.
  - Color contrast AA; support reduced motion.
- Security UI
  - Use HttpOnly cookies (no UI exposure); CSRF token as hidden input.
  - Turnstile widget on signup, login, reset-request; show challenge and validation errors.
  - Do not reveal account existence: use generic success copy on reset-request and signup (if email already registered).
- Content/Copy (examples)
  - Signup success: "Check your email to verify your account."
  - Unverified login: "Please verify your email to continue." [Resend link]
  - Expired link: "This link has expired." [Resend verification]

## User Stories
- As a new user, I can create an account and receive a verification email to unlock the dashboard.
- As a returning user, I can log in and be redirected to my last intended page.
- As an unverified user, I'm prompted to verify with an easy resend action.
- As a user who forgot their password, I can request a reset and set a new password.
- As a user, I can sign out and know I've been logged out.

## Technical Considerations
- Next.js 14 App Router with server actions for Auth.js (Credentials; optional Google).
- Persist and respect returnTo via query/state; sanitize allowed origins/paths.
- Show token-based states by reading URL params on /auth/verify and /auth/reset.
- Integrate Resend email flows with consistent copy and brand styling.
- Log optional analytics events: auth_signup, auth_login, auth_verify, auth_reset (result, provider, latency).

## Success Criteria
- Users can sign up, receive verification, verify, log in/out, and reset passwords without backend errors.
- Unverified users cannot access gated routes; verification banner and resend work reliably.
- Redirects behave as specified across flows and devices.
- Forms meet accessibility requirements and display clear, localized errors.
- Turnstile blocks automated submissions; no account enumeration via UI.
- Session persists across refresh; email verification preserves/establishes session when possible.
