Feature Overview
Structured Course Content provides hierarchical course data (course → modules → lessons) for Git, CI/CD, Docker, and Cloud Basics. Lessons are MDX/Markdown-based with optional video and lab resources. A subset of lessons are publicly accessible via a preview flag; all other lessons require enrollment. Enrolled users can mark lessons as complete.

Requirements
- Data model
  - course: id, slug (unique), title, status (active)
  - module: id, course_id FK, slug (unique per course), title, description, display_order (int), published_at, is_published
  - lesson: id, module_id FK, slug (unique per module), title, summary, is_preview (bool), is_published (bool), content_path (Supabase Storage path), video_url (nullable), duration_seconds (int, >=0), resources (jsonb array of {type, label, url}), lab_instructions_url (nullable URL), display_order (int), published_at
  - lesson_completion: user_id FK, lesson_id FK, completed_at; unique(user_id, lesson_id)
  - enrollment: user_id FK, course_id FK, status ENUM[active, canceled, past_due], source ENUM[stripe, manual]; unique(user_id, course_id)
- Content storage
  - Supabase Storage bucket: course-content
  - Path convention: {courseSlug}/{moduleSlug}/{lessonSlug}/index.mdx and assets under same prefix
  - All objects private; serve via short-lived signed URLs
- Access rules
  - Unauthenticated: may GET preview lessons only (lesson.is_preview=true and is_published=true)
  - Authenticated & enrolled (enrollment.status=active for course): may GET any published lesson
  - Mark Complete only for authenticated & enrolled users
- Validation
  - Slugs: lowercase kebab-case; length 3–64; unique constraints as above
  - Titles: 3–120 chars; summary <= 280 chars
  - resources.url and lab_instructions_url must be HTTPS
  - display_order >= 0; modules and lessons ordered ascending
  - Content must exist at content_path when publishing (preflight check)
- Auditing
  - Timestamps (created_at, updated_at) on module and lesson; last_viewed_at per lesson (optional future)

API Endpoints (JSON; all times ISO 8601)
- GET /api/courses/:courseId/modules
  - Auth: optional
  - Returns list of published modules with lesson metadata (no content). For non-enrolled users, include all lessons but indicate access=false when !is_preview.
  - Response item: { id, slug, title, description, displayOrder, lessons: [{ id, slug, title, isPreview, isPublished, durationSeconds, access: boolean }] }
- GET /api/lessons/:lessonId
  - Auth: optional
  - Access check per rules; 403 if unauthorized; 404 if not published
  - Response: { id, moduleId, title, isPreview, durationSeconds, resources, labInstructionsUrl, contentSignedUrl, videoUrlSigned?, breadcrumbs: { course, module } }
- POST /api/lessons/:lessonId/complete
  - Auth: required; must be enrolled; idempotent
  - Body: none
  - Response: { status: "ok", completedAt }
- Admin (role=admin)
  - POST /api/admin/modules
  - POST /api/admin/lessons
  - PATCH /api/admin/lessons/:lessonId
  - All validate schema; publishing a lesson requires content_path to be resolvable in Storage; preview flag allowed on published/unpublished

Business Logic & Workflows
- Enrollment resolution: user is enrolled if enrollment.status=active for the course containing the lesson's module. Enrollment is created/updated via Stripe webhook handlers; cache status in enrollment table.
- Content delivery: On lesson GET, generate signed URLs (<= 5 minutes) for content_path and video_url (if present). Do not expose Storage tokens in logs.
- Completion: Upsert into lesson_completion; ignore if already exists; return existing timestamp.

Security & Authentication
- Auth via NextAuth (JWT/session). Use role claim for admin endpoints.
- Rate limit public preview endpoints (e.g., 60 req/min/IP).
- Validate all IDs belong to requested course/module where applicable to prevent enumeration.
- Only return is_preview and metadata for unpublished lessons to admins; 404 for others.

Performance Requirements
- P99 GET /api/lessons/:id < 300 ms excluding asset download.
- Cache module/lesson metadata (excluding signed URLs) in memory for 60s; bust on admin updates.
- Use HTTP caching headers: ETag for metadata responses; no-store on signed URL fields.

Technical Considerations
- Prisma models reflect schema above; use composite unique indexes for slugs and completions.
- Store resources as validated jsonb; enforce HTTPS.
- Soft-delete not required for MVP; use is_published flags.
- Seed initial course, modules, and preview lessons per scope.

Success Criteria
- Unauthenticated users can retrieve and view preview lessons via signed content URLs.
- Enrolled users can access all published lessons and mark completion successfully.
- Access to non-preview lessons is denied for non-enrolled users.
- Admins can create/update modules and lessons, toggle preview, and publish with validation.
- Observed performance meets targets; no unauthorized content leakage via URLs.
