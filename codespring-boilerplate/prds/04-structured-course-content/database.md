## Feature Overview
Structured, hierarchical course content for DevOpsLaunchPad: modules (Git, CI/CD, Docker, Cloud Basics) containing lessons with MDX/Markdown and/or video, optional labs, and assessments. Supports free preview lessons accessible without enrollment; enrolled users can access all content and mark lessons complete.

## Requirements
- Model modules and ordered lessons with publish state and stable slugs.
- Lessons may contain: content (MDX/Markdown path or video URL), resources, assets, optional lab metadata, and optional assessment (quiz).
- Free preview: boolean on lesson; preview lessons retrievable publicly and flagged in responses.
- Access: content retrievable if lesson.is_preview = true OR user is enrolled (handled in app) and lesson.is_published = true.
- Completion tracking: per-user, per-lesson completion timestamp (only for enrolled users).
- Seed initial modules and designate at least one preview lesson per module.

## Data Model and Schema Design
- modules 1—N lessons. lessons 1—0..1 assessments. assessments 1—N questions 1—N options.
- lessons 1—N lesson_assets, 1—N lesson_resources, 1—0..1 lesson_labs.
- lesson_completions references external users table (Auth.js); enforce composite PK for idempotency.
- Content stored in Supabase Storage; DB stores storage paths (content_path, instructions_path, storage_path) and public URLs where applicable (video_url).

## Table Structures and Relationships
- Unique slug per module; unique (module_id, slug) per lesson for stable routing.
- Enumerations via VARCHAR with CHECKs (content_type: mdx|markdown|video; asset_type: image|attachment|code; question_type: single_choice|multiple_choice; resource kind optional).

## Indexes and Constraints
- modules.slug UNIQUE; lessons UNIQUE (module_id, slug).
- FKs: lessons.module_id → modules.id (ON DELETE CASCADE); cascading to dependent tables.
- Indexes:
  - lessons(module_id, position)
  - lessons(is_published, is_preview)
  - lesson_completions(user_id, completed_at DESC)
  - assessments.lesson_id UNIQUE
  - assessment_questions(assessment_id, position); assessment_options(question_id, position)
- Not-null where required for integrity (titles, slugs, positions, thresholds).

## Data Migration Strategies
- Create new tables with constraints and indexes.
- Backfill seed data for four MVP modules; generate slugs; set position sequentially.
- Upload MDX/Markdown and assets to Supabase; store resulting paths in content_path/instructions_path.
- Mark designated preview lessons (is_preview = true) and publish ready lessons.
- For existing users (if any), initialize lesson_completions empty; no backfill required.

## Query Optimization Considerations
- Lesson page load: SELECT by module.slug + lesson.slug with JOINs to assets/resources/lab; covered by UNIQUE + (module_id, position) index.
- Module syllabus: SELECT lessons WHERE module_id AND is_published ORDER BY position; index supports sort.
- Marketing preview listing: WHERE is_published AND is_preview; index supports filter.
- Progress fetch: LEFT JOIN lesson_completions ON (user_id, lesson_id); composite PK ensures fast existence checks.
- Use SELECT specific columns (avoid large TEXT fetches when rendering lists) to reduce I/O.

## User Stories
- As a visitor, I can open preview lessons without signing in.
- As an enrolled user, I can access all published lessons and mark them complete.
- As a learner, I can see labs and resources attached to a lesson.
- As a learner, I can take an assessment tied to a lesson.

## Technical Considerations
- Supabase Storage paths are authoritative for content/asset retrieval; ensure public or signed URL handling at app layer.
- Content_type governs rendering; when video, content_path may still hold transcript/notes.
- Prevent access to unpublished lessons regardless of preview status.

## Success Criteria
- Preview lessons publicly retrievable with correct labeling and upgrade CTA enabled by app logic.
- Enrolled users can access all published lessons and record completion.
- Module and lesson routing via slugs is stable and unique.
- P95 syllabus query <100ms and lesson load query <150ms on MVP dataset.
