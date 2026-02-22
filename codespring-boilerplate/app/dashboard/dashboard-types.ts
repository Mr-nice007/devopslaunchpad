/** PRD 03: Dashboard API response shape */
export interface DashboardModule {
  moduleId: string;
  title: string;
  percent: number;
  completed: number;
  total: number;
  nextLesson?: {
    lessonId: string;
    title: string;
    slug: string;
    locked: boolean;
  };
}

export interface DashboardResponse {
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
    modules: DashboardModule[];
  };
  resume?: { lessonId: string; title: string; slug: string; moduleId: string };
  ctas?: {
    unlock: { pricingUrl: string; plan: string };
    freePreviewUrl?: string;
  };
  messages: { verifyEmailRequired: boolean };
}
