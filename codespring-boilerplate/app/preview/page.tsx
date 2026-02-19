/**
 * Single course introduction video (PRD 01).
 * Accessible without enrollment; player with inline upgrade CTA.
 */
import Link from "next/link";
import type { Metadata } from "next";
import { IntroVideoPlayer } from "./intro-video-player";
import { UnlockCta } from "./unlock-cta";

export const metadata: Metadata = {
  title: "Free Preview — Course Introduction | DevOps Launchpad",
  description:
    "Watch the course introduction video. No credit card required. Unlock the full course when you're ready.",
};

export default function PreviewPage() {
  const introVideoUrl = process.env.NEXT_PUBLIC_INTRO_VIDEO_URL;

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <div className="container mx-auto max-w-4xl px-4 py-10 md:py-16">
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Course introduction
          </h1>
          <p className="mt-2 text-muted-foreground">
            Watch the intro video below. No credit card required.
          </p>
        </div>

        <IntroVideoPlayer url={introVideoUrl} />

        <div className="mt-10 p-6 rounded-xl border border-border bg-card text-center shadow-sm">
          <h2 className="text-lg font-semibold mb-2">Ready for the full course?</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
            Get lifetime access to all 8 modules, hands-on labs, and support.
          </p>
          <UnlockCta />
        </div>

        <p className="mt-8 text-center">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to Home
          </Link>
        </p>
      </div>
    </div>
  );
}
