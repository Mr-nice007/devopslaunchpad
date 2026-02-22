/**
 * PRD 03: Dashboard — courses, enrollment, progress, resume.
 */
import { eq, and, inArray, asc } from "drizzle-orm";
import { db } from "@/db/db";
import {
  coursesTable,
  courseModulesTable,
  lessonsTable,
  enrollmentsTable,
  userLessonProgressTable,
} from "@/db/schema/dashboard-schema";
import { getProfileByUserId } from "./profiles-queries";
import { randomUUID } from "crypto";

const DEFAULT_COURSE_SLUG = "devops-launchpad";

/** Get default (primary) course id; create placeholder course if none exists. */
export async function getDefaultCourseId(): Promise<string | null> {
  const [course] = await db
    .select({ id: coursesTable.id })
    .from(coursesTable)
    .limit(1);
  if (course) return course.id;
  // Seed default course + one module + one free preview lesson
  const id = randomUUID();
  await db.insert(coursesTable).values({
    id,
    title: "DevOps Launchpad",
    slug: DEFAULT_COURSE_SLUG,
  });
  const moduleId = randomUUID();
  await db.insert(courseModulesTable).values({
    id: moduleId,
    courseId: id,
    title: "Getting Started",
    position: 0,
  });
  await db.insert(lessonsTable).values({
    id: randomUUID(),
    moduleId,
    title: "Course introduction",
    slug: "course-introduction",
    position: 0,
    isFreePreview: true,
  });
  return id;
}

/** Get course by id or slug; return null if not found. */
export async function getCourseByIdOrSlug(
  idOrSlug: string
): Promise<{ id: string; title: string; slug: string } | null> {
  const byId = await db
    .select({ id: coursesTable.id, title: coursesTable.title, slug: coursesTable.slug })
    .from(coursesTable)
    .where(eq(coursesTable.id, idOrSlug))
    .limit(1);
  if (byId[0]) return byId[0];
  const bySlug = await db
    .select({ id: coursesTable.id, title: coursesTable.title, slug: coursesTable.slug })
    .from(coursesTable)
    .where(eq(coursesTable.slug, idOrSlug))
    .limit(1);
  return bySlug[0] ?? null;
}

/** All modules for a course ordered by position. */
export async function getModulesByCourseId(courseId: string) {
  return db
    .select()
    .from(courseModulesTable)
    .where(eq(courseModulesTable.courseId, courseId))
    .orderBy(asc(courseModulesTable.position));
}

/** All lessons for given module IDs, ordered by module position then lesson position. */
export async function getLessonsByModuleIds(moduleIds: string[]) {
  if (moduleIds.length === 0) return [];
  return db
    .select()
    .from(lessonsTable)
    .where(inArray(lessonsTable.moduleId, moduleIds))
    .orderBy(asc(lessonsTable.moduleId), asc(lessonsTable.position));
}

/** User's enrollment for a course (active or trialing). */
export async function getEnrollment(
  userId: string,
  courseId: string
): Promise<{
  status: string;
  source?: string;
  expiresAt?: Date;
} | null> {
  const [row] = await db
    .select()
    .from(enrollmentsTable)
    .where(
      and(
        eq(enrollmentsTable.userId, userId),
        eq(enrollmentsTable.courseId, courseId)
      )
    )
    .limit(1);
  if (!row) return null;
  const now = new Date();
  if (row.status === "active" || row.status === "trialing") {
    if (row.expiresAt && row.expiresAt < now)
      return { ...row, status: "expired", expiresAt: row.expiresAt };
    return {
      status: row.status,
      source: row.source ?? undefined,
      expiresAt: row.expiresAt ?? undefined,
    };
  }
  if (row.status === "expired" || (row.expiresAt && row.expiresAt < now))
    return { status: "expired", source: row.source ?? undefined, expiresAt: row.expiresAt ?? undefined };
  return null;
}

/** Determine enrollment: from enrollments table or profile.membership (pro = enrolled). */
export async function resolveEnrollment(
  userId: string,
  courseId: string
): Promise<{
  status: "enrolled" | "not_enrolled" | "expired" | "trial";
  source?: string;
  expiresAt?: string;
}> {
  const enrollment = await getEnrollment(userId, courseId);
  if (enrollment) {
    if (enrollment.status === "expired")
      return {
        status: "expired",
        source: enrollment.source,
        expiresAt: enrollment.expiresAt?.toISOString(),
      };
    return {
      status: enrollment.status === "trialing" ? "trial" : "enrolled",
      source: enrollment.source,
      expiresAt: enrollment.expiresAt?.toISOString(),
    };
  }
  // Fallback: profile membership pro => enrolled (subscription)
  const profile = await getProfileByUserId(userId);
  if (profile?.membership === "pro")
    return { status: "enrolled", source: "subscription" };
  return { status: "not_enrolled" };
}

/** User progress for lessons (completed_at, last_viewed_at). */
export async function getUserLessonProgress(userId: string, lessonIds: string[]) {
  if (lessonIds.length === 0) return [];
  return db
    .select()
    .from(userLessonProgressTable)
    .where(
      and(
        eq(userLessonProgressTable.userId, userId),
        inArray(userLessonProgressTable.lessonId, lessonIds)
      )
    );
}

/** Upsert last_viewed_at for a lesson (call when user views a lesson). */
export async function recordLessonView(userId: string, lessonId: string) {
  await db
    .insert(userLessonProgressTable)
    .values({
      userId,
      lessonId,
      lastViewedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [
        userLessonProgressTable.userId,
        userLessonProgressTable.lessonId,
      ],
      set: { lastViewedAt: new Date(), updatedAt: new Date() },
    });
}

/** Mark lesson completed. */
export async function markLessonCompleted(userId: string, lessonId: string) {
  const now = new Date();
  await db
    .insert(userLessonProgressTable)
    .values({
      userId,
      lessonId,
      completedAt: now,
      lastViewedAt: now,
    })
    .onConflictDoUpdate({
      target: [
        userLessonProgressTable.userId,
        userLessonProgressTable.lessonId,
      ],
      set: { completedAt: now, lastViewedAt: now, updatedAt: now },
    });
}
