Feature Overview
Enable secure checkout and subscription management using Stripe to unlock course access upon successful payment. The backend must create Stripe Checkout Sessions, process webhooks to grant/revoke access, and maintain accurate subscription state for renewals, cancellations, and payment failures.

Requirements
- Authentication
  - Only authenticated users (NextAuth session) can initiate checkout.
  - Link users to Stripe via user.stripeCustomerId; create if absent.

- Plans and Entitlements
  - Whitelist Stripe Price IDs (env-configured) mapped to access tiers (e.g., Basic, Pro) and course entitlements.
  - Never trust client-sent price; server selects by validated plan key.

- API Endpoints (Next.js API routes on Vercel)
  - POST /api/payments/checkout
    - Auth required. Body: { planKey: string, successUrl: string, cancelUrl: string }.
    - Validates planKey against config; returns { checkoutUrl }.
    - Server sets Checkout Session metadata: userId, planKey, tier, environment.
    - Mode: subscription. Collects tax IDs where applicable.
  - POST /api/payments/portal
    - Auth required. Returns { portalUrl } for Stripe Billing Portal (manage payment method, cancel, invoices).

- Webhooks (Vercel Function with raw body)
  - POST /api/stripe/webhook
    - Verify signature with STRIPE_WEBHOOK_SECRET. Respond 2xx within 5s.
    - Idempotent processing (persist processed Stripe event IDs).
    - Handle events:
      - checkout.session.completed: link session.customer to user (via metadata.userId or email), create/update Subscription record, grant entitlements.
      - customer.subscription.created/updated: upsert subscription (status, current_period_start/end, cancel_at_period_end, latest_invoice), adjust entitlements on status changes (active/past_due/canceled/incomplete/paused).
      - invoice.payment_succeeded: record Payment, extend entitlements to period_end.
      - invoice.payment_failed: mark past_due; send dunning email (Resend); keep access until Stripe marks unpaid per policy (configurable grace period: default 3 days).
      - customer.subscription.deleted: revoke entitlements at period_end unless immediate cancellation.
      - charge.refunded (optional): revoke entitlements if full refund and no active sub.
    - On processing error: log, do not 2xx; allow Stripe retries.

- Data Model (Prisma)
  - User: id (PK), email (unique), stripeCustomerId (unique nullable).
  - Subscription: id (PK), userId (FK), stripeSubscriptionId (unique), priceId, tier, status, currentPeriodStart, currentPeriodEnd, cancelAtPeriodEnd, canceledAt, trialEnd, metadata (JSON), updatedAt.
  - Payment: id (PK), userId (FK), stripeInvoiceId (unique), stripePaymentIntentId (unique), amount, currency, status, paidAt.
  - Entitlement: id (PK), userId (FK), tier, source ("subscription"), validFrom, validUntil, active (derived).
  - ProcessedEvent: stripeEventId (PK), processedAt.

- Business Rules
  - Access is granted if there exists any active Entitlement with validUntil > now.
  - On downgrade or cancellation with cancelAtPeriodEnd: entitlements remain until currentPeriodEnd.
  - On immediate cancellation/refund: set validUntil = now.
  - Single active subscription per user per product; enforce via unique index (userId, tier, status in ['active','trialing']).

- Validation
  - Reject unknown planKey/priceId, invalid URLs (must be same-origin allowlist), and unauthenticated requests.
  - Ensure metadata.userId matches resolved user (email fallback only when absent and verified unique).

Technical Considerations
- Security: verify Stripe signatures; use raw body; never expose secrets; enforce CORS same-origin; use Stripe client/server keys correctly.
- Idempotency: store processed event IDs; use idempotency keys on session creation (userId+planKey hash).
- Observability: structured logs with event type, userId, subscriptionId; alert on webhook failures >5/min.
- Performance: API p95 < 300ms; webhook p95 < 1500ms; minimal DB roundtrips; avoid long-running tasks—defer emails to background where possible.
- Emails (Resend): send on purchase confirmation, payment failure, cancellation confirmation (templated, localized later).
- Environment: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_PRICE_MAP (JSON), BILLING_PORTAL_RETURN_URL, APP_URL.

User Stories
- As a learner, I can purchase a subscription and immediately gain access to courses.
- As a subscriber, I can manage my billing (update card, cancel) via a portal.
- As an admin, I can see accurate subscription and payment records for support.

Success Criteria
- >99.9% accurate entitlement state vs Stripe for active users.
- Webhook success rate >99% with retry-safe processing; zero duplicate grants.
- Time-to-access after checkout.session.completed < 10 seconds.
- No ability to purchase unapproved plans; all requests authenticated and validated.
- Auditability: every entitlement change traceable to a Stripe event and DB record.
