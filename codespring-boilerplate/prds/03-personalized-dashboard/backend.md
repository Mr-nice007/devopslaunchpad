## Feature Overview
Provide a personalized dashboard payload for authenticated users to see enrollment/access state, progress aggregates per module, and a quick "Resume" target. If the user is not enrolled, return Unlock CTA metadata and a free preview link. Include a verify-email prompt flag when applicable.

## Requirements
- Authentication
  - Require NextAuth session. 401 if unauthenticated.
  - Include email verification state in response (from users.email_verified_at or equivalent boolean).

- Enrollment & Access
  - Determine access via Enrollment or active Stripe Subscription (synced by webhooks).
  - Enrollment status: enrolled | not_enrolled | expired | trial. Include source: subscription | one_time.
  - If not_enrolled, do not expose locked lesson content URLs; return minimal metadata with locked=true.
  - If expired, set enrolled=false but include expired_at.

- Progress & Resume
  - Compute overall progress (completed_lessons/total_lessons for accessible lessons).
  - Per-module aggregates: percent_complete, completed_count, total_count, next_lesson (first incomplete and accessible).
  - Resume target: last viewed accessible lesson (fallback to next_lesson or first free lesson).
  - Exclude lessons requiring enrollment if user lacks access; mark locked=true and omit restricted URLs.
  - Timestamps in ISO8601 UTC.

- CTAs & System Messages
  - If enrolled: include resume target fields.
  - If not_enrolled: include unlock_cta {pricing_url, plan_recommendation} and free_preview_url.
  - If email unverified: set verify_email_required=true and include verification_resend_supported=true if Resend configured.

- Validation Rules
  - courseId (optional): UUID/string; if omitted, use default primary course.
  - Reject invalid courseId with 404.
  - Ensure next/resume lesson belongs to requested course and is accessible by user's access tier.

- Rate Limiting
  - 30 requests/min per user; respond 429 on exceed.

## API Endpoints
- GET /api/dashboard
  - Query: courseId?: string
  - Auth: required (NextAuth session cookie/JWT)
  - Response 200:
    - user: {id, name, emailVerified: boolean}
    - course: {id, title}
    - enrollment: {status, source?: string, expiresAt?: string}
    - progress:
      - overallPercent: number (0-100)
      - lastActivityAt?: string
      - modules: [
        {moduleId, title, percent: number, completed: number, total: number,
         nextLesson?: {lessonId, title, slug, locked: boolean}}
      ]
    - resume?: {lessonId, title, slug}
    - ctas?: {unlock: {pricingUrl, plan: string}, freePreviewUrl?: string}
    - messages: {verifyEmailRequired: boolean}
  - Errors: 401, 404 (course not found), 429 (rate limit), 500.

- POST /api/email/verification/resend
  - Auth: required; only if not verified.
  - Response 204 on enqueue. Errors: 400 (already verified), 429, 500.

## Business Logic & Data Sources
- Access check: active subscription (subscriptions.status in [active, trialing]) or enrollment with access_expires_at > now().
- Progress derivation from lesson_progress (user_id, lesson_id, completed_at, last_viewed_at).
- Module/lesson ordering via modules.position, lessons.position.
- Free preview: lessons.is_free_preview=true are always accessible/viewable.

## Security
- Enforce user scoping on all queries (user_id = session.user.id).
- Do not return signed URLs or private asset links in this payload.
- Only include minimal metadata for locked lessons.

## Performance
- P95 < 300ms for GET /api/dashboard (US regions).
- Single round-trip DB query with aggregations; avoid N+1.
- Cache per-user/course response for 30s; purge on progress/enrollment update events.

## User Stories
- As an enrolled user, I see my per-module progress and a Resume button for my last lesson.
- As a non-enrolled user, I see an Unlock CTA and a free preview link.
- As an unverified user, I see a prompt to verify and can resend a verification email.

## Success Criteria
- Enrolled users consistently receive correct resume target and module percentages.
- Non-enrolled users receive Unlock CTA and free preview link; no restricted content leaked.
- Unverified users receive verify prompt and can trigger resend (rate-limited).
- API meets auth, validation, and performance requirements with <1% error rate (4xx excluded).
