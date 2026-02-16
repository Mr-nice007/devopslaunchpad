# Structured Course Content — Frontend PRD

## Feature Overview
Provide a structured, navigable course experience for modules (Git, CI/CD, Docker, Cloud Basics) consisting of lessons (MDX/Markdown), labs (instructions/links), and assessments. Support free lesson previews (publicly accessible) with clear labeling and in-player upgrade CTAs. Enrolled users can access all lessons and mark them complete.

## Requirements
- Navigation
  - Modules index: cards for each module with title, description, lesson count, and progress (if enrolled).
  - Module detail: left sidebar list of lessons grouped by section (Lessons, Labs, Assessments) with:
    - Lesson title, type badge (Lesson/Lab/Assessment), duration (optional), completion state (checkmark for completed).
    - Preview flag shown as "Preview" pill; locked lessons show lock icon and disabled state for guests.
  - Current lesson highlighted in sidebar; sticky sidebar on desktop.

- Lesson Player
  - Header: module name, lesson title, type badge, "Preview" label if applicable.
  - Content: render MDX/Markdown (headings, code blocks with syntax highlight, images, lists), embedded video (if provided), and resources list (links open in new tab with external icon).
  - Labs: show instructions with callouts; "Open Lab" links/buttons (external).
  - Actions:
    - Mark Complete button: visible to enrolled users only; toggles to "Completed" with check; keyboard accessible; optimistic update with inline error fallback.
    - Upgrade CTA for guests: persistent non-intrusive banner and in-player button ("Unlock full course") visible on preview lessons; clicking opens pricing/checkout route.
    - Gated actions (Mark Complete, assessments start buttons) hidden for guests/non-enrolled.
  - Empty/error states: missing content → friendly message + back to module; asset load errors with retry.

- Access and Visibility
  - Guests:
    - Can open preview lessons directly from module list and via shareable URL.
    - Non-preview lessons appear locked; clicking shows modal/sheet explaining enrollment requirement + CTA.
  - Enrolled:
    - Full access; can mark complete; see progress.

- Progress Indicators
  - Per-lesson completion checkbox in sidebar (read-only for guests).
  - Module-level progress bar (enrolled only) in module header.

- Responsive & UX
  - Mobile: collapsible lesson list (sheet/drawer), player takes full width; actions in sticky footer.
  - Tablet/Desktop: two-column layout (25–35% sidebar, 65–75% content); sticky sidebar.
  - Max content width for readability; code blocks horizontally scrollable.

- Accessibility
  - Semantic landmarks (nav, main), focus management on route change to lesson title.
  - All interactive elements keyboard operable; visible focus states.
  - ARIA labels for badges, lock state, progress; sufficient color contrast; captions support for video.

## User Stories
- As a guest, I can view preview lessons and clearly see which lessons are locked, with a path to upgrade.
- As an enrolled user, I can read any lesson, complete labs, and mark lessons as complete.
- As a user, I can navigate between lessons and track my progress within a module.

## Technical Considerations
- Component Architecture
  - ModuleIndex, ModuleDetailLayout (Sidebar, ProgressHeader), LessonListItem, LessonPlayer (Header, ContentRenderer, Actions), UpgradeBanner, CompletionButton.
- Data Contracts (read-only to frontend)
  - Module: id, slug, title, description, counts, userProgress% (if enrolled).
  - Lesson: id, slug, title, type, duration, isPreview, isCompleted (if enrolled), order, assetRefs.
- Rendering
  - MDX/Markdown renderer with code highlighting; images/videos from Supabase Storage (public for preview assets; signed/checked for enrolled where needed).
  - Lazy-load media; code-split MDX renderer.
- State & Routing
  - Next.js App Router; routes: /modules, /modules/[module]/[lesson].
  - Auth states: guest vs enrolled determine visibility/actions.
  - Optimistic completion toggle with rollback on failure.
- Analytics
  - Events: lesson_view, preview_view, upgrade_cta_click, mark_complete, lab_link_click.

## Success Criteria
- Preview lessons publicly viewable without login and labeled "Preview."
- Non-preview lessons visibly locked for guests with upgrade path.
- Enrolled users can view all lessons and mark complete; state persists and reflects in UI.
- Accurate per-lesson and module progress for enrolled users.
- Responsive layouts function across viewport sizes; passes basic a11y checks (keyboard-only, contrast).
- No critical rendering errors for MDX, images, or video; acceptable LCP (<2.5s) on preview lessons.
