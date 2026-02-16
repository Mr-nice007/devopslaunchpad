## Feature Overview
Secure email/password authentication with optional OAuth (Google), email verification, password reset, and session management. Enforces verified emails before access, protects against brute-force attacks, and supports secure, rotating, HttpOnly sessions.

## Requirements
- Create users with unique email; store bcrypt password hash (nullable for OAuth-only users).
- Email verification via token link; mark email_verified on success and unlock gated features.
- Login with credentials; block if unverified; provide resend verification flow.
- Password reset via email token; upon success, rotate password hash and revoke active sessions.
- Optional OAuth account linking; one user may have multiple provider accounts.
- Maintain secure, expiring sessions with rotation on privilege changes and periodic renewal; revoke on logout or reset.
- Store only hashed verification/reset tokens; single-use with expiration and replay protection.

## Data Model and Schema Design
- users holds primary identity and password hash.
- sessions holds stateless session records keyed by a unique session_token.
- accounts stores OAuth linkages per provider.
- auth_tokens stores hashed, purpose-scoped tokens for email verification and password reset.

## Table Structures and Relationships
- users (1) — (N) sessions via user_id.
- users (1) — (N) accounts via user_id.
- users (0..1) — (N) auth_tokens via user_id; identifier stores email for flows initiated pre-user or re-verification.

## Indexes and Constraints
- users: unique index on LOWER(email); check is_active is true for login; nullable password_hash allowed if an accounts row exists (enforced in application layer).
- sessions: unique index on session_token; index on user_id; ensure expires > now() for validity.
- accounts: unique composite (provider, provider_account_id); index on user_id.
- auth_tokens: unique composite (purpose, token_hash); index on (identifier, purpose); index on expires for cleanup; enforce used_at IS NULL and expires > now() on consumption (app-level).
- Foreign keys: sessions.user_id → users.id (ON DELETE CASCADE); accounts.user_id → users.id (ON DELETE CASCADE); auth_tokens.user_id → users.id (SET NULL).

## Data Migration Strategies
- Create new tables with constraints and indexes.
- For existing emails, backfill LOWER(email) unique index; resolve collisions before enforcing constraint.
- If migrating tokens, re-hash plain tokens to token_hash and set purpose accordingly; invalidate unknown/expired tokens.
- Add background job to purge expired sessions and tokens.

## Query Optimization Considerations
- Use LOWER(email) index for case-insensitive lookups on signup/login.
- Rely on session_token unique index for O(1) session validation.
- Filter tokens by (purpose, token_hash) with a covering unique index; secondary filter on expires.
- Batch cleanup via indexed expires columns.

## Technical Considerations
- Passwords hashed with bcrypt (work factor ~12); store only password_hash.
- Cookies: HttpOnly, Secure, SameSite=Lax; rotate session_token on login, verification, and password reset.
- Brute-force mitigation: increment failed_login_attempts; set locked_until; respect during login.

## Success Criteria
- Verified users can log in and persist sessions; unverified users blocked with resend flow.
- One-time, hashed tokens enforce single-use and expiry.
- Sessions revoked on logout and password reset.
- OAuth accounts map uniquely to users without duplicating emails.
