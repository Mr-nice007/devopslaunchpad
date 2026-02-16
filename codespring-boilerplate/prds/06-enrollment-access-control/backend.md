# Enrollment & Access Control (Backend)

## Feature Overview
Control user access to course and lesson content based on enrollment/payment status. Allow unauthenticated preview access for lessons flagged as preview. Grant course access within seconds of successful Stripe payment via webhook-driven AccessGrants.

## Requirements
- Preview access:
  - Lessons with isPreview = true must be accessible without authentication or enrollment.
- Gated access:
  - Non-preview lessons require an active AccessGrant for the lesson's courseId.
  - Access is enforced on all content retrieval endpoints (e.g., lesson content, downloadable assets).
- Enrollment creation:
  - Stripe webhook events create/update AccessGrants:
    - Grant active access on checkout.session.completed and invoice.paid.
    - Revoke/expire access on invoice.payment_failed (past_due -> pending; canceled/unpaid -> revoked) and customer.subscription.deleted (revoked).
  - Mapping from Stripe price/product to courseId is required.
- Idempotency and data integrity:
  - Webhook handling must be idempotent per Stripe event id.
  - At most one active AccessGrant per (userId, courseId).
- Latency:
  - Access must reflect payment within 5s of webhook receipt.
- Expiry:
  - For subscriptions: expiresAt set to current period end; revocation when canceled/ended.
  - For one-time purchases: expiresAt = null (lifetime) unless configured.
- Auditing:
  - Persist status changes with timestamps and source event ids for traceability.
- Errors:
  - If user not authenticated and lesson not preview -> 401.
  - If authenticated without active grant -> 403.
  - Nonexistent course/lesson -> 404.

## API Endpoints
- GET /api/courses/{courseId}/lessons/{lessonId}/access
  - Auth: Optional (preview path allowed). Uses session if present.
  - Response 200:
    - { access: "preview" | "granted" | "denied", reason?: string }
  - 404 if lesson/course missing.

- GET /api/courses/{courseId}/lessons/{lessonId}/content
  - Auth: Optional.
  - Behavior: Serve content if isPreview or active grant; else 401/403 as above.

- POST /api/access/validate
  - Auth: Required.
  - Body: { courseId: string, lessonId?: string }
  - Response 200: { allowed: boolean, accessLevel: "preview" | "enrolled" | "none" }

- POST /api/webhooks/stripe
  - Auth: None. Verify Stripe signature.
  - Consumes events: checkout.session.completed, invoice.paid, invoice.payment_failed, customer.subscription.deleted, customer.subscription.updated.
  - Response 200 on success; 2xx on already-processed; 4xx on signature/validation errors.

## Data Model (PostgreSQL via Prisma)
- AccessGrant
  - id (uuid)
  - userId (uuid) FK User
  - courseId (uuid) FK Course
  - status (enum): active | pending | revoked | expired
  - source (enum): stripe
  - stripeCustomerId (string)
  - stripeSubscriptionId (string | null)
  - stripePriceId (string | null)
  - stripeProductId (string | null)
  - startsAt (timestamptz)
  - expiresAt (timestamptz | null)
  - createdAt, updatedAt
  - UNIQUE (userId, courseId) WHERE status = 'active'

- StripeEventLog
  - id (uuid)
  - stripeEventId (string) UNIQUE
  - type (string)
  - processedAt (timestamptz)
  - payloadDigest (string)

- Lesson
  - id, courseId, isPreview (boolean)

- PriceCourseMap
  - stripePriceId (string) UNIQUE
  - courseId (uuid)

## Business Logic
- Access check:
  - If lesson.isPreview = true -> allow.
  - Else fetch active AccessGrant where userId, courseId match and (expiresAt IS NULL OR expiresAt > now()).
- Webhook mapping:
  - Determine user by Stripe customer id; prefer userId in Stripe metadata if present.
  - On success events: upsert AccessGrant to active, set startsAt=now, expiresAt per subscription period.
  - On payment_failed/past_due: set status=pending (retain read-only? MVP deny access).
  - On subscription canceled/ended: status=revoked, expiresAt=now.

## Security & Validation
- All non-preview content requires Auth.js session.
- Verify Stripe signatures; reject replay using StripeEventLog.
- Validate course/lesson existence and PriceCourseMap presence; log and 400 if unmapped.

## Technical Considerations
- Supabase Storage signed URLs must only be issued after access validation; TTL ≤ 5 minutes.
- Caching: optional in-process cache (≤30s) for access checks; must invalidate on webhook by courseId/userId.
- Observability: log access denials and webhook state transitions with correlation ids.

## User Stories
- As a user who just paid, I can access all non-preview lessons of the purchased course within seconds.
- As a visitor, I can view preview lessons without creating an account.
- As a lapsed subscriber, I cannot access gated lessons once payment fails or subscription is canceled.

## Success Criteria
- 99% of successful payments reflected in access within 5s of webhook receipt.
- 0 duplicate active AccessGrants per user/course.
- Preview lessons return access: "preview" for unauthenticated users.
- Non-enrolled gated requests return 401/403 consistently.
- Webhook handler processes events idempotently with <1% failures and complete audit logs.
