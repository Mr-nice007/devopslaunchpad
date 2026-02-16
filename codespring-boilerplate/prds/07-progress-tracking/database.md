## Feature Overview
Track per-lesson completion, lab submissions, and milestone achievements for each user to drive accurate module- and platform-level progress indicators. Persist immutable first-completion timestamps while allowing reversible current completion state for UX toggling.

## Requirements
- Record a single progress row per (user, lesson) with reversible current completion (toggle) and immutable first completion for audit/analytics.
- Support idempotent mark/unmark complete operations.
- Persist lab submission attempts with status, score, and artifact references; allow multiple attempts per (user, lab).
- Persist milestone achievements per (user, milestone) with uniqueness and optional revocation.
- Enable efficient aggregation queries for:
  - Module progress %: completed_lessons / total_lessons per module per user
  - Overall progress % per user
  - Latest lab submission status per (user, lab)
- Enforce referential integrity to core entities (users, lessons, labs, milestones).

## Data Model and Schema Design
- lesson_progress: One logical row per (user, lesson) with unique constraint. completed_at is NULL when unmarked; first_completed_at is immutable once set.
- lab_submission: Append-only attempts per (user, lab) with monotonic attempt_number.
- user_milestone: One row per (user, milestone); revocable via revoked flag and timestamp.

## Table Structures and Relationships
- FKs to external tables (not defined here): users(id), lessons(id, module_id), labs(id, lesson_id), milestones(id).
- ON DELETE CASCADE for child rows when user or content is removed.

## Indexes and Constraints
- lesson_progress: UNIQUE (user_id, lesson_id); btree index (user_id, completed_at) for progress scans; partial index on (lesson_id) WHERE completed_at IS NOT NULL for lesson aggregates.
- lab_submission: INDEX (user_id, lab_id); UNIQUE (user_id, lab_id, attempt_number); optional index (lab_id, status) for grading queues.
- user_milestone: UNIQUE (user_id, milestone_id); INDEX (user_id, achieved_at).

## Data Migration Strategies
- Phase 1: Create tables with defaults and constraints; backfill none initially.
- Phase 2 (optional backfill): If historical lesson events exist, upsert into lesson_progress setting first_completed_at; leave completed_at NULL unless currently considered complete by business rules.
- Zero-downtime: Add tables and indexes in separate transactions; create indexes concurrently where supported.

## Query Optimization Considerations
- Module progress: SELECT COUNT(*) FROM lessons l WHERE l.module_id=? as total; JOIN lesson_progress p ON p.lesson_id=l.id AND p.user_id=? AND p.completed_at IS NOT NULL for completed count. Ensure lessons(module_id) is indexed externally.
- Overall progress: Aggregate across all lessons visible to the user; optionally restrict by enrollment.
- Latest lab result: SELECT ... ORDER BY attempt_number DESC LIMIT 1 using (user_id, lab_id, attempt_number) composite.
- Mark complete: UPSERT on (user_id, lesson_id) setting completed_at=NOW(), first_completed_at=COALESCE(first_completed_at, NOW()). Unmark sets completed_at=NULL; do not modify first_completed_at.
- Use read replicas/caching for dashboard aggregates if necessary; otherwise rely on indexed counts for MVP.

## User Stories
- As an enrolled user, I can mark/unmark a lesson complete and see the module progress bar update immediately.
- As a learner, my lab submission attempts and latest status are visible to drive completion.
- As a learner, achieving a milestone is recorded once and reflected in my dashboard.

## Technical Considerations
- Timestamps stored in UTC (TIMESTAMP WITH TIME ZONE in Prisma maps to timestamptz).
- Source field values: 'manual' | 'auto' | 'system'.
- Ensure API idempotency: repeated mark complete calls must not create duplicates or change first_completed_at.

## Success Criteria
- Unique, consistent progress per (user, lesson); toggle works without duplicates.
- Module and overall progress queries return within 100ms P95 on datasets up to 1M progress rows.
- Latest lab submission resolved in O(log n) via indexed query.
- Milestone achievements remain unique and auditable even after unmarking lessons.
