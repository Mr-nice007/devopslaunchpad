"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { trackEvent } from "@/lib/analytics";

const PREVIEW_PATH = "/preview";
const UNLOCK_PATH = "/pricing";

export function HomeHeroCtas() {
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
      <Button
        size="lg"
        className="text-base px-8"
        asChild
      >
        <Link
          href={PREVIEW_PATH}
          onClick={() => trackEvent("cta_start_preview")}
        >
          Start Free Preview
        </Link>
      </Button>
      <Button
        size="lg"
        variant="outline"
        className="text-base px-8 border-2"
        asChild
      >
        <Link
          href={UNLOCK_PATH}
          onClick={() => trackEvent("cta_unlock_full_course")}
        >
          Unlock Full Course
        </Link>
      </Button>
    </div>
  );
}
