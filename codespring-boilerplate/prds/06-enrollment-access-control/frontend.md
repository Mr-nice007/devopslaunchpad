## Feature Overview
Provide a consistent UI layer that grants or restricts access to course and lesson content based on enrollment status. Non-enrolled users can preview lessons explicitly flagged as "Preview," while all other lessons and course actions are gated. Access should update near-real-time after successful payment (webhook-driven), with clear UI feedback.

## Requirements
- Enrollment Status Surface
  - Display enrollment state at course level: Enrolled, Not Enrolled, Expired, Pending Activation.
  - Show badge in CourseHeader and LessonList: "Enrolled," "Preview," "Locked," "Expired."
- Lesson List Gating
  - Preview lessons: always clickable and playable without enrollment.
  - Non-preview lessons:
    - Enrolled: unlocked, normal navigation.
    - Not Enrolled/Expired: locked state, disabled primary action, show "Enroll to Unlock."
- Lesson Page Access Control
  - If preview: render full lesson content (video + materials if flagged preview).
  - If non-preview and user not enrolled:
    - Replace content with AccessGate module:
      - Title: "This lesson is locked"
      - Subtitle: "Enroll to access this and all lessons."
      - Primary CTA: "Enroll Now"
      - Secondary link: "View Preview Lessons"
  - If status Expired: message "Your access has expired" with CTA "Renew Access."
- Post-Payment UX
  - On return from checkout: show "Activating your access…" state.
  - Poll access status for up to 15s; auto-unlock and redirect to intended lesson when granted.
  - If not granted within window: show non-blocking info banner with "Refresh" and "Contact Support."
- CTAs and Navigation
  - Global and in-context "Enroll Now" CTAs initiate checkout.
  - If user not authenticated, route to sign-in/up then back to checkout.
- Visual States
  - Locked lessons: lock icon, subdued thumbnail, disabled hover, tooltip "Enroll to unlock."
  - Preview lessons: "Preview" pill badge, normal hover.
  - Enrolled: no lock, normal styling.
- Loading/Errors
  - Skeletons for CourseHeader and LessonList while checking access.
  - Non-intrusive toast for transient errors; persistent inline error for critical failures.
- Accessibility
  - Keyboard focusable CTAs; ARIA labels for locked items (aria-disabled, aria-describedby).
  - Icons with accessible names ("Locked lesson").
  - Color is not sole indicator; use text badges and icons.

## User Stories
- As a visitor, I can open preview lessons to evaluate the course without enrolling.
- As a purchaser, I see my access activate within seconds after payment and can immediately continue where I left off.
- As a lapsed user, I see an expired message and a clear path to renew.

## Technical Considerations
- AccessGuard component/hook:
  - useAccess(courseId): returns {status: enrolled | not_enrolled | expired | pending, loading, error, previewAllowed}.
  - Works SSR-safe with hydration; show skeleton until resolved.
- Route protection:
  - Client-side guard on lesson pages; rely on backend middleware for definitive checks.
- Polling:
  - After checkout return, poll access endpoint every 2s up to 15s; stop on success or error.
- State Sources:
  - Respect "preview" flag from lesson metadata.
- Responsive
  - Mobile: CTAs stacked; badges truncate with ellipsis; tooltips convert to helper text.

## Success Criteria
- Access state reflects payment within 15s of return from checkout.
- 100% of preview lessons accessible to non-enrolled users.
- 0 blocked navigations for enrolled users to non-preview lessons.
- Error rate for access checks <1% over 7 days; user-visible fallback present.
- Accessibility: All gated controls operable via keyboard and screen readers (manual QA pass).
