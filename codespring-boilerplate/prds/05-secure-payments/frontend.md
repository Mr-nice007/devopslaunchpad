Feature Overview
Enable secure, reliable checkout and subscription management to unlock course access after successful payment. Users purchase a subscription via Stripe Checkout and manage billing via a Stripe-hosted customer portal. UI must reflect real-time subscription status and restrict premium content until backend confirmation is received via webhooks.

Requirements
- Plans & Pricing
  - Display available subscription plan(s) with price, billing interval, and features.
  - Primary CTA: "Start Subscription" (disabled if already active).
  - Include trust indicators: "Secure payment via Stripe," accepted cards, and refund/cancel policy link.
- Checkout Initiation
  - "Start Subscription" triggers a server action/API to create a Stripe Checkout Session and redirects.
  - Preserve post-checkout redirect to return to "/billing?status=success" or "/billing?status=cancel".
  - Show a non-blocking loading state on CTA and prevent double-submission.
- Post-Checkout States
  - Success return: Show confirmation banner "Payment processing… This may take up to 30s" and begin polling (max 60s) for subscription activation. If confirmed, update UI: "Subscription Active" and unlock content.
  - Cancel return: Show neutral banner "Checkout canceled. No charges made."
  - Failure: Show error banner and offer "Retry Payment" if applicable.
- Billing & Subscription Management (Account > Billing)
  - Display current status: none, active, trialing, past_due, canceled, incomplete, incomplete_expired.
  - If active/trialing: show renewal date, plan, masked payment method, manage button.
  - If past_due/incomplete: show warning with "Update payment method" action.
  - Provide "Manage Billing" button that opens Stripe Customer Portal (new tab) for payment method updates, invoice history, and cancellation.
  - Show invoices list (date, amount, status, download link from Stripe) if available.
  - Provide "Cancel Subscription" action via Customer Portal only (no in-app destructive flow).
- Content Access Gates
  - Lock premium modules when status is not active/trialing. Show paywall with plan summary and CTA to subscribe.
  - After backend confirms activation (via webhook), auto-refresh UI session/state and remove paywall.
- Notifications
  - Show toast/banner on subscription updates (renewed, canceled, payment failed) when user navigates to app after a change.
- Responsive & Accessibility
  - Fully responsive (mobile-first). Buttons >=44px tap targets.
  - Semantic elements, ARIA for banners (role=alert for errors/warnings), focus management on dialog/redirect.
  - High-contrast text, keyboard accessible actions.

User Stories
- As a learner, I can subscribe and be redirected back with clear status so I know if access is granted.
- As a subscriber, I can view my billing status and invoices and manage my subscription securely.
- As a lapsed user, I see clear guidance to update payment details to restore access.

Technical Considerations
- Use Stripe-hosted Checkout and Customer Portal; never collect card data on-site.
- Auth required for initiating checkout/portal links; associate Stripe customer ID with authenticated user.
- UI must not grant access until backend marks subscription active via webhook; polling should hit a read-only subscription status endpoint.
- Handle race conditions: optimistic banners only; content remains gated until confirmed.
- Cache: SSR/CSR must revalidate user entitlements post-checkout (e.g., refetch on return, focus, and interval until confirmed).
- Errors: differentiate network vs payment failures; provide retry paths. Log client-side errors with correlation IDs.

Success Criteria
- Users can complete checkout and see access unlocked within 60 seconds of payment.
- 0 instances of card data handled by the frontend; only Stripe-hosted flows used.
- Subscription status accuracy ≥99.9% (UI matches backend state).
- Billing page loads <1.5s P75 and reflects status changes within 5s after page focus.
- Reduction in support tickets related to payment status or access by ≥80% post-launch.
