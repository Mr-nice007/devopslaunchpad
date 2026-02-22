/**
 * PRD 03: GET /api/dashboard — personalized dashboard payload.
 * Auth required; returns enrollment, progress, resume, CTAs, messages.
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  getDefaultCourseId,
  getCourseByIdOrSlug,
  getModulesByCourseId,
  getLessonsByModuleIds,
  resolveEnrollment,
  getUserLessonProgress,
} from "@/db/queries/dashboard-queries";

const RATE_LIMIT_PER_MIN = 30;
const CACHE_TTL_MS = 30_000;

const rateLimitMap = new Map<
  string,
  { count: number; resetAt: number }
>();

function rateLimit(userId: string): boolean {
  const now = Date.now();
  const windowStart = now - 60_000;
  let entry = rateLimitMap.get(userId);
  if (!entry || entry.resetAt < windowStart) {
    entry = { count: 1, resetAt: now };
    rateLimitMap.set(userId, entry);
    return false;
  }
  entry.count++;
  if (entry.count > RATE_LIMIT_PER_MIN) return true;
  return false;
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json(
        { code: "UNAUTHORIZED", message: "Authentication required" },
        { status: 401 }
      );
    }

    if (rateLimit(userId)) {
      return NextResponse.json(
        { code: "RATE_LIMIT", message: "Too many requests" },
        { status: 429 }
      );
    }

    const courseIdParam = req.nextUrl.searchParams.get("courseId");
    let courseId: string;
    let course: { id: string; title: string; slug: string };

    if (courseIdParam) {
    const c = await getCourseByIdOrSlug(courseIdParam);
    if (!c) {
      return NextResponse.json(
        { code: "NOT_FOUND", message: "Course not found" },
        { status: 404 }
      );
    }
    courseId = c.id;
    course = { id: c.id, title: c.title, slug: c.slug };
  } else {
    const defaultId = await getDefaultCourseId();
    if (!defaultId) {
      return NextResponse.json(
        { code: "SERVER_ERROR", message: "No course configured" },
        { status: 500 }
      );
    }
    const c = await getCourseByIdOrSlug(defaultId);
    if (!c) {
      return NextResponse.json(
        { code: "SERVER_ERROR", message: "Course not found" },
        { status: 500 }
      );
    }
    courseId = c.id;
    course = { id: c.id, title: c.title, slug: c.slug };
  }

  const [enrollment, modules] = await Promise.all([
    resolveEnrollment(userId, courseId),
    getModulesByCourseId(courseId),
  ]);

  const isEnrolled =
    enrollment.status === "enrolled" || enrollment.status === "trial";
  const moduleIds = modules.map((m) => m.id);
  const lessons = await getLessonsByModuleIds(moduleIds);
  const lessonIds = lessons.map((l) => l.id);
  const progressRows = await getUserLessonProgress(userId, lessonIds);
  const progressByLesson = new Map(
    progressRows.map((p) => [p.lessonId, p])
  );

  const lessonsByModule = new Map<string, typeof lessons>();
  for (const les of lessons) {
    const list = lessonsByModule.get(les.moduleId) ?? [];
    list.push(les);
    lessonsByModule.set(les.moduleId, list);
  }
  for (const list of lessonsByModule.values()) {
    list.sort((a, b) => a.position - b.position);
  }

  type LessonMeta = {
    lessonId: string;
    title: string;
    slug: string;
    locked: boolean;
  };

  const modulePayload: {
    moduleId: string;
    title: string;
    percent: number;
    completed: number;
    total: number;
    nextLesson?: LessonMeta;
  }[] = [];

  let totalAccessible = 0;
  let totalCompleted = 0;
  let lastActivityAt: string | undefined;
  let resumeLesson: {
    lessonId: string;
    title: string;
    slug: string;
    moduleId: string;
  } | null = null;
  let lastViewedAt: Date | null = null;

  for (const mod of modules) {
    const modLessons = lessonsByModule.get(mod.id) ?? [];
    const accessible = modLessons.filter(
      (l) => isEnrolled || l.isFreePreview
    );
    const total = accessible.length;
    let completed = 0;
    let nextLesson: LessonMeta | undefined;

    for (const les of accessible) {
      const p = progressByLesson.get(les.id);
      if (p?.completedAt) completed++;
      if (!nextLesson && (!p || !p.completedAt)) {
        nextLesson = {
          lessonId: les.id,
          title: les.title,
          slug: les.slug,
          locked: !isEnrolled && !les.isFreePreview,
        };
      }
      if (p?.lastViewedAt && (isEnrolled || les.isFreePreview)) {
        if (!lastViewedAt || p.lastViewedAt > lastViewedAt) {
          lastViewedAt = p.lastViewedAt;
          resumeLesson = {
            lessonId: les.id,
            title: les.title,
            slug: les.slug,
            moduleId: mod.id,
          };
        }
      }
    }

    totalAccessible += total;
    totalCompleted += completed;

    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
    modulePayload.push({
      moduleId: mod.id,
      title: mod.title,
      percent,
      completed,
      total,
      nextLesson: nextLesson ?? undefined,
    });
  }

  if (!resumeLesson) {
    for (const mod of modules) {
      const next = modulePayload.find((m) => m.moduleId === mod.id)
        ?.nextLesson;
      if (next && !next.locked) {
        resumeLesson = {
          lessonId: next.lessonId,
          title: next.title,
          slug: next.slug,
          moduleId: mod.id,
        };
        break;
      }
    }
  }
  if (!resumeLesson) {
    const firstFree = lessons.find((l) => l.isFreePreview);
    if (firstFree) {
      const mod = modules.find((m) => m.id === firstFree.moduleId);
      if (mod) {
        resumeLesson = {
          lessonId: firstFree.id,
          title: firstFree.title,
          slug: firstFree.slug,
          moduleId: mod.id,
        };
      }
    }
  }

  for (const p of progressRows) {
    const t = p.lastViewedAt?.toISOString();
    if (t && (!lastActivityAt || t > lastActivityAt)) lastActivityAt = t;
  }

  const overallPercent =
    totalAccessible === 0
      ? 0
      : Math.round((totalCompleted / totalAccessible) * 100);

  const user = session.user!;
  const emailVerified = user.emailVerified != null;

  const res: {
    user: { id: string; name: string | null; email: string | null; emailVerified: boolean };
    course: { id: string; title: string; slug: string };
    enrollment: {
      status: string;
      source?: string;
      expiresAt?: string;
    };
    progress: {
      overallPercent: number;
      lastActivityAt?: string;
      modules: typeof modulePayload;
    };
    resume?: { lessonId: string; title: string; slug: string; moduleId: string };
    ctas?: {
      unlock: { pricingUrl: string; plan: string };
      freePreviewUrl?: string;
    };
    messages: { verifyEmailRequired: boolean };
  } = {
    user: {
      id: user.id!,
      name: user.name ?? null,
      email: (user.email as string) ?? null,
      emailVerified: !!emailVerified,
    },
    course,
    enrollment: {
      status: enrollment.status,
      ...(enrollment.source && { source: enrollment.source }),
      ...(enrollment.expiresAt && { expiresAt: enrollment.expiresAt }),
    },
    progress: {
      overallPercent,
      ...(lastActivityAt && { lastActivityAt }),
      modules: modulePayload,
    },
    messages: {
      verifyEmailRequired: !emailVerified,
    },
  };

  if (resumeLesson) res.resume = resumeLesson;
  if (!isEnrolled) {
    res.ctas = {
      unlock: {
        pricingUrl: "/pricing",
        plan: "Full course access",
      },
      freePreviewUrl: "/preview",
    };
  }

  return NextResponse.json(res, {
    headers: {
      "Cache-Control": `private, max-age=${Math.floor(CACHE_TTL_MS / 1000)}`,
    },
  });
  } catch (err) {
    console.error("[GET /api/dashboard]", err);
    return NextResponse.json(
      {
        code: "SERVER_ERROR",
        message:
          process.env.NODE_ENV === "development" && err instanceof Error
            ? err.message
            : "Something went wrong",
      },
      { status: 500 }
    );
  }
}
