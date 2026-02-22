/**
 * Analytics events for marketing homepage (PRD 01).
 * Wire to Vercel Analytics, GA4, or your provider via trackEvent.
 */
export type CTAEvent = "cta_start_preview" | "cta_unlock_full_course";

export type DashboardEvent =
  | "dashboard_viewed"
  | "resume_clicked"
  | "unlock_clicked"
  | "module_opened"
  | "verification_resent";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    plausible?: (name: string, opts?: { props: Record<string, string> }) => void;
  }
}

export function trackEvent(event: CTAEvent, props?: Record<string, string>) {
  if (typeof window === "undefined") return;
  try {
    if (window.gtag) {
      window.gtag("event", event, props);
    }
    if (window.plausible) {
      window.plausible(event, { props: props ?? {} });
    }
  } catch (e) {
    console.warn("Analytics trackEvent failed:", e);
  }
}

export function trackDashboardEvent(
  event: DashboardEvent,
  props?: Record<string, string>
) {
  if (typeof window === "undefined") return;
  try {
    if (window.gtag) {
      window.gtag("event", event, props);
    }
    if (window.plausible) {
      window.plausible(event, { props: props ?? {} });
    }
  } catch (e) {
    console.warn("Analytics trackDashboardEvent failed:", e);
  }
}
