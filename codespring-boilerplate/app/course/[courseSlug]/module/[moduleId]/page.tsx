/**
 * Module overview placeholder — PRD 03 deep link target.
 * Links from dashboard module cards.
 */
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CourseModulePage({
  params,
}: {
  params: { courseSlug: string; moduleId: string };
}) {
  return (
    <div className="p-6 md:p-10 max-w-2xl">
      <h1 className="text-2xl font-bold mb-4">Module</h1>
      <p className="text-muted-foreground mb-6">
        Lesson content for this module will appear here. Use the dashboard to
        resume or continue.
      </p>
      <Button asChild variant="outline">
        <Link href="/dashboard">Back to Dashboard</Link>
      </Button>
    </div>
  );
}
