"use client";

import Link from "next/link";
import { trackEvent } from "@/lib/analytics";

export function UnlockCta() {
  return (
    <Link
      href="/pricing"
      onClick={() => trackEvent("cta_unlock_full_course")}
      className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
    >
      Unlock Full Course
    </Link>
  );
}
