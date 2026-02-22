/**
 * Lesson page placeholder — PRD 03 deep link target for Resume / Continue.
 * Full lesson content can be added later (e.g. video, markdown, labs).
 */
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LessonPage({
  params,
}: {
  params: { courseSlug: string; moduleId: string; lessonSlug: string };
}) {
  const { lessonSlug } = params;
  const title = decodeURIComponent(lessonSlug.replace(/-/g, " "));
  return (
    <div className="p-6 md:p-10 max-w-2xl">
      <h1 className="text-2xl font-bold mb-4 capitalize">{title}</h1>
      <p className="text-muted-foreground mb-6">
        Lesson content will appear here. Track progress and resume from the
        dashboard.
      </p>
      <Button asChild variant="outline">
        <Link href="/dashboard">Back to Dashboard</Link>
      </Button>
    </div>
  );
}
