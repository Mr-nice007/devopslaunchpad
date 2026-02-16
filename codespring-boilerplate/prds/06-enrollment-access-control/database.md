## Feature Overview
Gate lesson access by enrollment status. Allow unrestricted preview for lessons flagged as preview. Grant course access within seconds of successful Stripe payment via webhook-driven entitlements.

## Requirements
- Lesson access rules:
  - If lesson.is_preview = true and lesson.is_published = true, allow access regardless of enrollment.
  - Otherwise require an active access_grant for the course (resource_type = 'course', status = 'active', current_timestamp BETWEEN starts_at AND COALESCE(expires_at, 'infinity')).
- Webhook-driven entitlement creation/update on successful Stripe events; ensure idempotency per event_id.
- Support revocation/expiry (e.g., refunds, subscription canceled/expired) and audit trail of changes.
- Immediate access after payment (p95 < 5s from webhook receipt).

## Data Model and Schema Design
- Courses aggregate lessons; lessons carry is_preview flag.
- Access is granted via access_grants linking user to a resource (course). Supports time-bound access (starts_at/expires_at) and statuses: pending, active, expired, revoked.
- payment_events persists raw provider events and processing state for replay/idempotency.

## Table Structures and Relationships
- access_grants.user_id references auth users (UUID). resource_id references courses.id when resource_type = 'course'. Enforce via FK where possible; otherwise validate at application layer.
- lessons.course_id references courses.id.

## Indexes and Constraints
- access_grants:
  - UNIQUE (user_id, resource_type, resource_id) WHERE status IN ('active','pending') to prevent duplicate active-like grants.
  - INDEX (user_id, resource_type, resource_id, status, starts_at, expires_at) for access checks.
  - PARTIAL INDEX (status) WHERE status = 'active' for fast gating.
  - CHECK status IN ('pending','active','expired','revoked').
- lessons:
  - INDEX (course_id, is_preview, is_published, slug).
- payment_events:
  - UNIQUE (provider, event_id) for idempotency.

## Data Migration Strategies
1. Add lessons.is_preview default false; backfill based on curated list; ensure only published lessons are exposed.
2. Create access_grants empty; backfill historical entitlements from Stripe (subscriptions and successful charges) by mapping stripe_customer_id/email to user_id; set starts_at = event time, expires_at per subscription period if applicable.
3. Ingest recent Stripe events into payment_events and mark processed to align state.
4. Enforce new uniqueness/partial indexes after data backfill to avoid conflicts.

## Query Optimization Considerations
- Access check single SELECT with composite index filter on (user_id, resource_type='course', resource_id, status='active') and time window.
- Use covering indexes to avoid table lookups during gating.
- Batch revoke/expire using indexed filters on expires_at < now().
- Keep payment_events small by archiving processed rows older than 90 days.

## User Stories
- As a non-enrolled user, I can view preview lessons but am blocked from full lessons.
- As a purchaser, I gain course access moments after paying.
- As support, I can revoke a grant to immediately block access.

## Technical Considerations
- Stripe webhook processing must be idempotent and retriable; record processing_status and errors.
- Timezone: store all timestamps in UTC.
- Soft revocation recorded with reason for audits; no hard deletes of grants.

## Success Criteria
- p95 access grant latency < 5s after webhook receipt.
- 0 duplicate active grants per (user, resource).
- Preview lessons always accessible without enrollment.
- Accurate revocation/expiry reflected within 60s.
