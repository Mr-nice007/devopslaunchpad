# Progress Tracking

## 1. Feature Overview
Enable users to track their learning progress across lessons and modules. Users can mark/unmark individual lessons as complete, and see aggregated module- and overall-progress indicators on the Dashboard and within the lesson header. Progress must persist per authenticated user and update immediately in the UI.

## 2. Requirements
- Lesson completion
  - Display a "Mark Complete" toggle button on lesson pages for enrolled, authenticated users only.
  - States: default (incomplete), completed (checkmark), disabled (loading), hidden (not enrolled).
  - Unmarking is supported and should be idempotent.
  - Record and display the completion timestamp (tooltip on checkmark: "Completed on {date}").
- Aggregated progress
  - Module progress bar with percentage and fraction (e.g., 3/10) on:
    - Dashboard module cards
    - Lesson header (for the current module)
  - Overall progress percentage on Dashboard header.
  - Counts update immediately after marking/unmarking.
- UI components
  - LessonHeaderProgress: module name, progress bar (filled %, Tailwind colors), percent label.
  - CompletionToggle: button with check icon + label; aria-pressed reflects completion state.
  - ModuleCardProgress: compact progress bar + fraction + percent.
- Interactions
  - Clicking CompletionToggle performs optimistic update; show inline spinner during request.
  - Error handling: revert optimistic state on failure; show toast "Couldn't update progress. Try again."
  - Disabled when unauthenticated; show tooltip "Sign in to track progress."
- Loading/empty states
  - Skeletons for progress bars on first load.
  - If module has zero lessons, hide progress bar.
- Access control
  - Only enrolled users see and can toggle progress; non-enrolled see read-only UI ("Enroll to track progress").
- Accessibility
  - Keyboard: toggle via Enter/Space; focus ring visible.
  - ARIA: button with aria-pressed, aria-label "Mark lesson complete"/"Unmark lesson complete".
  - High-contrast colors; progress text has 4.5:1 contrast minimum.
- Responsiveness
  - Mobile: progress bar full-width; percent text wraps under bar if <360px.
  - Desktop: bar + percent inline; truncate long module titles with ellipsis and title attribute.

## 3. User Stories
- As an enrolled learner, I can mark a lesson complete so I can track my progress.
- As a learner, I can see my module and overall progress so I know what's left.
- As a learner, I can unmark a lesson if I made a mistake and see progress recalculate instantly.

## 4. Technical Considerations
- Data contract
  - Progress item: { lessonId, completedAt | null } per user.
  - Aggregates: module { completedCount, totalCount, percent }, overall { completedCount, totalCount, percent }.
- API/Actions
  - Mark complete/unmark endpoints or server actions must be idempotent; return current canonical state and updated aggregates for affected module and overall.
- State management
  - Use optimistic updates with revalidation; handle concurrent tab updates by reconciling with server response.
- Performance
  - Batch-fetch aggregates for all modules on Dashboard in one request.
  - Cache per-user progress; revalidate on focus/reconnect.
- Security
  - Require Auth session; enforce enrollment on server; ignore unauthorized toggles.

Note: Lab submissions and milestone tracking are out of MVP scope; reserve UI hooks but hide until backend is ready.

## 5. Success Criteria
- Users can mark/unmark lesson completion with immediate visible updates to module and overall progress.
- Dashboard and lesson header reflect accurate progress after refresh and across sessions.
- Unauthorized users cannot toggle progress; appropriate messaging is shown.
- Error and loading states are handled gracefully without breaking navigation or losing state.
- WCAG-compliant controls (keyboard operable, labeled, sufficient contrast) across breakpoints.
