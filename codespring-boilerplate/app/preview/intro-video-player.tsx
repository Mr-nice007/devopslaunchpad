"use client";

import { useMemo } from "react";
import { trackEvent } from "@/lib/analytics";
import Link from "next/link";

function isYouTubeUrl(url: string | undefined): boolean {
  if (!url) return false;
  return (
    url.includes("youtube.com/watch") ||
    url.includes("youtube.com/embed") ||
    url.includes("youtu.be/")
  );
}

function youtubeEmbedUrl(url: string): string {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]+)/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]+)/,
  ];
  for (const re of patterns) {
    const m = url.match(re);
    if (m) return `https://www.youtube.com/embed/${m[1]}?rel=0`;
  }
  return url;
}

interface IntroVideoPlayerProps {
  url: string | undefined;
}

export function IntroVideoPlayer({ url }: IntroVideoPlayerProps) {
  const embedUrl = useMemo(() => url && isYouTubeUrl(url) ? youtubeEmbedUrl(url) : null, [url]);

  if (!url) {
    return (
      <div className="aspect-video rounded-xl border border-border bg-muted flex items-center justify-center">
        <div className="text-center p-8 max-w-sm">
          <p className="text-muted-foreground text-sm">
            Add <code className="text-xs bg-muted px-1.5 py-0.5 rounded">NEXT_PUBLIC_INTRO_VIDEO_URL</code> to your
            .env.local with a YouTube link or direct video URL to show the course intro here.
          </p>
          <p className="mt-4 text-xs text-muted-foreground">
            Example: https://www.youtube.com/watch?v=xxxxx
          </p>
        </div>
      </div>
    );
  }

  if (embedUrl) {
    return (
      <div className="aspect-video rounded-xl overflow-hidden border border-border bg-black shadow-lg">
        <iframe
          src={embedUrl}
          title="Course introduction"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden border border-border bg-black shadow-lg">
      <video
        className="w-full aspect-video"
        controls
        preload="metadata"
        poster=""
        title="Course introduction"
      >
        <source src={url} type="video/mp4" />
        <p className="text-muted-foreground p-4 text-center">
          Your browser does not support the video tag.{" "}
          <Link href="/pricing" onClick={() => trackEvent("cta_unlock_full_course")} className="underline">
            Unlock Full Course
          </Link>
        </p>
      </video>
    </div>
  );
}
