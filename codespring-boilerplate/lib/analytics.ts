/**
 * Analytics events for marketing homepage (PRD 01).
 * Wire to Vercel Analytics, GA4, or your provider via trackEvent.
 */
export type CTAEvent = "cta_start_preview" | "cta_unlock_full_course";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    plausible?: (name: string, opts?: { props: Record<string, string> }) => void;
  }
}

export function trackEvent(event: CTAEvent, props?: Record<string, string>) {
  if (typeof window === "undefined") return;
  const payload = { event, ...props };
  try {
    if (window.gtag) {
      window.gtag("event", event, props);
    }
    if (window.plausible) {
      window.plausible(event, { props: props ?? {} });
    }
    // Optional: send to custom API
    // fetch('/api/analytics', { method: 'POST', body: JSON.stringify(payload) });
  } catch (e) {
    console.warn("Analytics trackEvent failed:", e);
  }
}
