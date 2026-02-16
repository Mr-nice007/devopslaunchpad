## Feature Overview
Secure, auditable payments and subscription lifecycle management using Stripe. Users gain/retain course access based on successful checkout, active subscription renewals, or cancellations, driven by Stripe webhooks (checkout.session.completed, payment_intent.succeeded, invoice.payment_succeeded/failed, customer.subscription.*).

## Requirements
- Persist Stripe identifiers for deterministic reconciliation and idempotent webhook processing.
- Support one-time purchases and recurring subscriptions (monthly/annual) with product/price catalog mirroring Stripe.
- Grant/refresh/revoke course access based on payment/subscription state with clear auditability.
- Ensure exactly-once processing of webhook events; store raw payloads and processing results.
- Expose efficient queries: get a user's active subscription, latest invoice, and current access grants.
- Enforce uniqueness of Stripe entity IDs; prevent duplicate sessions/payments.

## User Stories
- As a learner, after successful checkout, I immediately unlock relevant course access.
- As a subscriber, my access is extended on renewal and revoked on cancellation/expiry.
- As support, I can audit why/when access was granted or revoked using payment/subscription evidence.

## Technical Considerations
- Stripe IDs are the source of truth for external entities; all tables store corresponding unique Stripe IDs for upsert and reconciliation.
- Access is represented via access_grants; entries may expire (end of billing period) or be revoked (cancellation/failed payment) with provenance (source and link to subscription/payment).
- Webhook deduplication via stripe_event_id uniqueness and deterministic dedupe_hash (e.g., hash of type + object.id + created) to safely retry.
- Status fields use constrained VARCHAR with CHECK to allow evolvability while preventing invalid values.
- Time zones: all TIMESTAMP fields are TIMESTAMP WITH TIME ZONE (UTC normalized).

## Data Model and Schema Design
- One user has one Stripe customer (stripe_customers) and zero or more subscriptions (subscriptions), invoices (invoices), payments (payments), and checkout_sessions.
- Catalog: products (Stripe product) → prices (Stripe price). Subscriptions point to prices; invoices/payments reference subscriptions when applicable.
- Webhooks (webhook_events) store raw JSONB payloads and processing metadata.
- Access mapping (access_grants) references either a subscription or payment as provenance.

## Table Structures and Relationships
- FK: subscriptions.user_id → users.id (UUID); subscriptions.price_id → prices.id; invoices.subscription_id → subscriptions.id; payments.user_id → users.id; access_grants.user_id → users.id and nullable links to subscription_id/payment_id.
- Uniqueness: all stripe_*_id columns unique; one stripe_customer per user.

## Indexes and Constraints
- subscriptions: UNIQUE(stripe_subscription_id); INDEX(user_id, status); INDEX(user_id, current_period_end DESC) for latest active.
- prices: UNIQUE(stripe_price_id); INDEX(product_id, active);
- invoices: UNIQUE(stripe_invoice_id); INDEX(subscription_id, created_at DESC);
- payments: UNIQUE(stripe_payment_intent_id); INDEX(user_id, created_at DESC);
- checkout_sessions: UNIQUE(stripe_session_id); INDEX(user_id, status);
- access_grants: UNIQUE(user_id, access_type, resource_id) WHERE revoked_at IS NULL AND (expires_at IS NULL OR expires_at > NOW()); INDEX(user_id, expires_at) partial for active grants.
- webhook_events: UNIQUE(stripe_event_id); UNIQUE(dedupe_hash); INDEX(processed, received_at DESC).
- CHECK constraints on enum-like fields (status, mode, currency length=3, interval values month/year, access_type, source).

## Data Migration Strategies
- Create new tables with constraints and indexes; no destructive changes to users/courses.
- Backfill: if legacy Stripe customers exist, insert into stripe_customers with user mapping; otherwise lazily create at first checkout.
- Seed products/prices from Stripe via one-time sync job; maintain via admin sync when catalog changes.
- For existing active subscribers, insert subscriptions and corresponding access_grants with correct expires_at from Stripe current_period_end.
- Implement webhook replay-safe migration: process historical events in chronological order using webhook_events to avoid duplicates.

## Query Optimization Considerations
- Primary read paths:
  - Get active subscription: SELECT ... FROM subscriptions WHERE user_id=? AND status IN ('active','trialing','past_due') AND (cancel_at_period_end=false OR current_period_end>NOW()) ORDER BY current_period_end DESC LIMIT 1; leverage composite and DESC index.
  - Get active access: SELECT ... FROM access_grants WHERE user_id=? AND revoked_at IS NULL AND (expires_at IS NULL OR expires_at>NOW()); use partial index.
  - Webhook idempotency: SELECT id FROM webhook_events WHERE stripe_event_id=?; unique index ensures single processing.
- Store amounts as BIGINT (cents) to avoid floating point.

## Success Criteria
- 100% of successful Stripe checkouts lead to an access_grants record within <3s of webhook receipt.
- Zero duplicate processing of any Stripe event (enforced by unique keys).
- Accurate subscription state mirroring Stripe within one webhook cycle; access revoked within one billing period end.
- P95 read latency <50ms for active subscription/access queries.
- Complete, queryable audit trail linking access to payment/subscription and raw webhook payloads.
