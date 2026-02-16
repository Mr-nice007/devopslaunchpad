## Feature Overview
Centralized, personalized dashboard displaying a user's enrollment status, progress by module, and a one-click Resume action to the next lesson. If not enrolled, show Unlock CTA with free preview availability. Surface verify-email prompt when applicable.

## Requirements
- Display user's enrollment/access state per course. If no active enrollment, show Unlock CTA and mark previewable lessons.
- Show Resume button to last in-progress or next-up lesson for the primary course context.
- Render course outline with per-module completion percentage and next-up indicator.
- Persist last resumed lesson and dashboard last-seen for UX continuity.
- Respect email verification state to show/hide verify-email prompt.
- Support multiple courses but optimized for the primary course; aggregates computed per (user, course).

## User Stories
- As an enrolled user, I see a Resume button navigating to my next lesson and module progress bars.
- As a non-enrolled user, I see an Unlock CTA and which lessons are available as free previews.
- As a returning user, my dashboard remembers my last resumed lesson.
- As an unverified user, I see a verify-email prompt until dismissed or verified.

## Data Model and Schema Design
- Normalize learning content (courses → modules → lessons).
- Track access via enrollments (status: active, trialing, canceled, expired, gifted).
- Capture fine-grained user_lesson_progress; derive course-level aggregates into user_course_progress for fast dashboard reads.
- Persist dashboard UI state (resume target, prompts) in user_dashboard_state.

### Table Relationships
- courses 1–N course_modules 1–N lessons.
- users 1–N enrollments per course.
- users 1–N user_lesson_progress per lesson.
- users 1–N user_course_progress per course.
- users 1–1 user_dashboard_state.

## Indexes and Constraints
- Uniqueness:
  - enrollments (user_id, course_id) unique; latest status reflects access.
  - user_lesson_progress (user_id, lesson_id) unique.
  - user_course_progress (user_id, course_id) unique.
  - course_modules (course_id, position) unique; lessons (module_id, position) unique.
- Foreign keys with ON UPDATE CASCADE, ON DELETE RESTRICT for content; ON DELETE CASCADE for user_* tables.
- Indexes:
  - user_lesson_progress: (user_id), (lesson_id), (user_id, updated_at DESC).
  - user_course_progress: (user_id), (course_id), (user_id, recalculated_at DESC).
  - enrollments: (user_id), (course_id), partial index WHERE status IN ('active','trialing').
  - lessons: (module_id, position), (slug).
  - course_modules: (course_id, position).

## Data Migration Strategies
- Create content and progress tables without downtime.
- Backfill user_course_progress by aggregating user_lesson_progress:
  - completed_pct = completed_lessons / total_lessons * 100 (rounded).
  - last_lesson_id = most recent in-progress or completed.
  - next_lesson_id = first not-yet-completed ordered by course_modules.position, lessons.position; if none, null.
- Initialize user_dashboard_state.last_resume_lesson_id from user_course_progress.next_lesson_id.
- Derive enrollment rows from Stripe subscription data; set status and ends_at.

## Query Optimization Considerations
- Primary dashboard query loads:
  - enrollment for user+course with active/trialing via partial index.
  - user_course_progress for aggregates and resume targets.
  - module-level progress via grouped join on user_lesson_progress (optionally cached in user_course_progress if needed later).
- Keep reads single-roundtrip by preloading lessons for the module containing next_lesson_id.
- Schedule periodic background recomputation of user_course_progress; also trigger on lesson progress updates.
- Avoid COUNT(*) scans by storing total_lesson counts on course_modules and courses if needed later (out of scope for MVP).

## Technical Considerations
- All timestamps in UTC; soft-deletes not required for MVP.
- Status fields constrained via CHECKs; Prisma enums may map to VARCHAR.
- Ensure idempotent upserts for progress and aggregates.

## Success Criteria
- Enrolled users consistently receive Resume target within <150ms DB time and accurate module/course percentages.
- Non-enrolled users see Unlock CTA with correct preview flags.
- Verify-email prompt only shows when users.email_verified = false and dismissed flag not set.
- Aggregates remain consistent after progress changes within 5s background SLA.
