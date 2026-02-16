# Personalized Dashboard — Frontend PRD

## 1. Feature Overview
A centralized, personalized dashboard that surfaces enrolled course progress, next steps, and a quick "Resume" action. Above the fold, users either resume their last lesson or see an Unlock CTA if not enrolled. The dashboard also displays per-module progress and system prompts (e.g., verify email).

## 2. Requirements
- Layout (desktop ≥1024px / tablet 768–1023px / mobile <768px)
  - Top section: Welcome panel with user first name, status chip (Enrolled/Preview), and primary action:
    - Enrolled: "Resume" button + last lesson title and module.
    - Not enrolled: "Unlock full course" button + secondary "Free preview" link.
  - System banner (dismissible per session): "Verify your email" when session user.emailVerified === false, with "Resend verification" action.
  - Modules list: card per module with
    - Module title, optional subtitle, lesson count
    - Progress bar (% complete) + numeric label (e.g., 45%)
    - "Next up" indicator for the next incomplete lesson within that module
    - Clickable module card; nested "Continue" inline link for next lesson
- States
  - Enrolled: Show progress aggregates, Resume button enabled.
  - Not Enrolled: Hide progress bars (or show 0% with lock icons for locked lessons), show Unlock CTA + Free preview link.
  - Unverified Email: Show banner until verified (dismiss only hides for current session).
  - Loading: Skeletons for top panel (button placeholder, text lines) and module cards (title bars + progress bar placeholder).
  - Error: Inline error state with retry for data fetch sections (top panel and modules independently).
  - Empty: If enrolled but no progress, Resume button reads "Start course" linking to first lesson.
- Interactions
  - Resume: Navigates to last incomplete lesson deep link (/course/:slug/module/:mSlug/lesson/:lSlug).
  - Module card click: Navigates to module overview (/course/:slug/module/:mSlug).
  - "Continue" on module: Deep link to that module's next lesson.
  - Unlock CTA: Navigates to pricing/checkout flow.
  - Free preview: Navigates to preview module/lesson.
  - Verify email banner: "Resend verification" triggers request; show success/error toast.
- Visual/UX
  - Tailwind utility classes; consistent spacing scale; accessible color contrast (WCAG AA).
  - Progress bar: filled primary color; background neutral-200; rounded; aria-valuenow/aria-valuemin/max.
  - Status chip: small, subtle, non-interactive.
  - Buttons: Primary (Resume/Unlock), Secondary (Free preview), Link style (Continue).
- Accessibility
  - All actions keyboard-focusable with visible focus rings.
  - ARIA labels on buttons (e.g., "Resume last lesson: {lessonTitle}").
  - Banner announced via role=alert; dismiss button has aria-label.
  - Semantic structure: h1 for page title, h2 for Modules.
- Responsive
  - Mobile: Stack sections; single-column modules; buttons full-width.
  - Tablet: Two-column grid for modules where space allows.
  - Desktop: Top panel side-by-side (welcome copy + primary action); modules in 2–3 column grid depending on width.
- Telemetry
  - Track events: dashboard_viewed, resume_clicked, unlock_clicked, module_opened, verification_resent.
- Security/Permissions
  - Gate progress and resume data behind authenticated session; never expose locked lesson deep links to non-enrolled users.

## 3. User Stories
- As an enrolled learner, I can resume my last lesson with one click from the dashboard.
- As a non-enrolled visitor, I see a clear Unlock CTA and can access a free preview.
- As a learner with incomplete email verification, I'm prompted to verify with a one-click resend.

## 4. Technical Considerations
- Next.js 14 with Server Components for primary data fetch; client components for actions (buttons, toasts).
- Data needed:
  - Auth session (Auth.js): user.id, user.name, emailVerified.
  - Enrollment/access state (PostgreSQL via Prisma).
  - Progress aggregate per module (% complete, next lesson pointer).
  - Last incomplete lesson pointer across course.
- Caching: Revalidate dashboard data conservatively (e.g., revalidate on focus or 30s) to reflect progress updates.
- Error handling: Segment fetches; show partial content if one section fails.
- Emails: "Resend verification" triggers backend API using Resend; optimistic UI with toast.
- Links/Routes: Ensure deep links handle auth guard and redirect back after login.

## 5. Success Criteria
- Enrolled users see correct progress and functional Resume linking to the correct lesson.
- Non-enrolled users see Unlock CTA and working Free preview link; no access to locked lessons.
- Verify-email prompt appears only when unverified; resend action succeeds with visible feedback.
- Dashboard loads within 1.5s on median broadband (with skeletons within 200ms).
- All interactive elements pass keyboard navigation and contrast checks (WCAG AA).
