/**
 * Free preview lesson entry. PRD: "Start Free Preview navigates to working preview lesson."
 * When course/lesson content exists (PRD 04), route to the first preview lesson (e.g. /course/[slug]/lesson/[id]).
 */
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PreviewPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-muted/30">
      <div className="max-w-lg text-center space-y-6">
        <h1 className="text-2xl font-bold">Free Preview</h1>
        <p className="text-muted-foreground">
          Your first preview lesson will appear here. Once course content is set up, this page will redirect to the first free preview lesson.
        </p>
        <Button asChild>
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    </div>
  );
}
