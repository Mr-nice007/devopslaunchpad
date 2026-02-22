"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { trackDashboardEvent } from "@/lib/analytics";
import type { DashboardResponse } from "./dashboard-types";
import { Play, Lock, ChevronRight, Mail, Loader2, X } from "lucide-react";

export function DashboardClient() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifyBannerDismissed, setVerifyBannerDismissed] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    let cancelled = false;
    async function fetchDashboard() {
      try {
        const res = await fetch("/api/dashboard");
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j.message ?? `HTTP ${res.status}`);
        }
        const json: DashboardResponse = await res.json();
        if (!cancelled) {
          setData(json);
          trackDashboardEvent("dashboard_viewed");
        }
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Failed to load dashboard");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchDashboard();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleResendVerification() {
    if (!data?.user?.email || resendLoading) return;
    setResendLoading(true);
    try {
      const res = await fetch("/api/auth/verify/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.user.email }),
      });
      const j = await res.json().catch(() => ({}));
      if (res.ok) {
        trackDashboardEvent("verification_resent");
        toast({ title: "Verification email sent", description: "Check your inbox." });
      } else {
        toast({ title: "Could not send", description: j.message ?? "Please try again.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Please try again.", variant: "destructive" });
    } finally {
      setResendLoading(false);
    }
  }

  if (loading) return <DashboardSkeleton />;
  if (error) return <DashboardError message={error} onRetry={() => window.location.reload()} />;
  if (!data) return null;

  const isEnrolled = data.enrollment.status === "enrolled" || data.enrollment.status === "trial";
  const firstName = data.user.name?.split(/\s+/)[0] ?? "there";
  const courseSlug = data.course.slug;
  const showVerifyBanner = data.messages.verifyEmailRequired && !verifyBannerDismissed;
  const resumeModuleTitle = data.resume
    ? data.progress.modules.find((m) => m.moduleId === data.resume?.moduleId)?.title
    : undefined;

  return (
    <div className="p-6 md:p-10 space-y-8">
      <h1 className="text-3xl font-bold tracking-tight sr-only">
        Dashboard
      </h1>

      {/* Verify email banner — dismissible per session */}
      {showVerifyBanner && (
        <Alert
          role="alert"
          className="rounded-lg border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800"
        >
          <Mail className="h-4 w-4" />
          <AlertTitle>Verify your email</AlertTitle>
          <AlertDescription className="flex flex-col sm:flex-row sm:items-center gap-2">
            <span className="flex-1">
              Please verify your email to unlock all features. We sent a link to{" "}
              <strong>{data.user.email ?? "your email"}</strong>.
            </span>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handleResendVerification}
                disabled={resendLoading}
              >
                {resendLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {resendLoading ? "Sending…" : "Resend verification"}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setVerifyBannerDismissed(true)}
                aria-label="Dismiss verification reminder"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Welcome panel */}
      <section
        className="rounded-xl border bg-card p-6 md:flex md:items-center md:justify-between md:gap-6"
        aria-label="Welcome and primary action"
      >
        <div>
          <h2 className="text-xl font-semibold">
            Welcome back, {firstName}
          </h2>
          <p className="text-muted-foreground mt-1">
            {isEnrolled
              ? `You're enrolled in ${data.course.title}.`
              : "Preview the course, then unlock full access."}
          </p>
          <span
            className="inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium bg-muted mt-2"
            aria-hidden
          >
            {isEnrolled ? "Enrolled" : "Preview"}
          </span>
        </div>
        <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
          {isEnrolled && data.resume ? (
            <div className="flex flex-col gap-1">
              <Button asChild size="lg" className="shrink-0 w-fit">
                <Link
                  href={`/course/${courseSlug}/module/${data.resume.moduleId}/lesson/${data.resume.slug}`}
                  onClick={() =>
                    trackDashboardEvent("resume_clicked", {
                      lessonId: data.resume!.lessonId,
                      lessonTitle: data.resume!.title,
                    })
                  }
                  aria-label={`Resume last lesson: ${data.resume.title}`}
                >
                  <Play className="mr-2 h-4 w-4" />
                  Resume
                </Link>
              </Button>
              <p className="text-sm text-muted-foreground">
                {data.resume.title}
                {resumeModuleTitle ? ` · ${resumeModuleTitle}` : ""}
              </p>
            </div>
          ) : !isEnrolled && data.ctas ? (
            <>
              <Button asChild size="lg" className="shrink-0">
                <Link
                  href={data.ctas.unlock.pricingUrl}
                  onClick={() => trackDashboardEvent("unlock_clicked")}
                >
                  Unlock full course
                </Link>
              </Button>
              {data.ctas.freePreviewUrl && (
                <Button asChild variant="outline" size="lg" className="shrink-0">
                  <Link href={data.ctas.freePreviewUrl}>Free preview</Link>
                </Button>
              )}
            </>
          ) : isEnrolled && !data.resume && data.progress.modules[0] ? (
            <Button asChild size="lg">
              <Link
                href={`/course/${courseSlug}/module/${data.progress.modules[0].moduleId}/lesson/${data.progress.modules[0].nextLesson?.slug ?? "start"}`}
                onClick={() => trackDashboardEvent("resume_clicked", { target: "start" })}
              >
                Start course
              </Link>
            </Button>
          ) : null}
        </div>
      </section>

      {/* Modules */}
      <section aria-labelledby="modules-heading">
        <h2 id="modules-heading" className="text-2xl font-bold mb-6">
          Modules
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.progress.modules.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground text-sm">
                  No modules yet. Unlock the course to see the full curriculum.
                </p>
              </CardContent>
            </Card>
          ) : (
            data.progress.modules.map((mod) => (
              <Card
                key={mod.moduleId}
                className="group hover:shadow-md transition-shadow"
              >
                <Link
                  href={`/course/${courseSlug}/module/${mod.moduleId}`}
                  onClick={() =>
                    trackDashboardEvent("module_opened", {
                      moduleId: mod.moduleId,
                      title: mod.title,
                    })
                  }
                  className="block"
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span>{mod.title}</span>
                      {!isEnrolled && (
                        <Lock className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden />
                      )}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {mod.completed} of {mod.total} lessons
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Progress
                        value={mod.percent}
                        className="h-2 flex-1"
                        aria-valuenow={mod.percent}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      />
                      <span className="text-sm font-medium tabular-nums">
                        {mod.percent}%
                      </span>
                    </div>
                    {mod.nextLesson && !mod.nextLesson.locked && (
                      <span className="inline-flex items-center text-sm text-primary font-medium">
                        Continue
                        <ChevronRight className="h-4 w-4 ml-0.5" />
                      </span>
                    )}
                  </CardContent>
                </Link>
                {mod.nextLesson && !mod.nextLesson.locked && (
                  <div className="px-6 pb-6 pt-0 flex flex-col gap-1">
                    <Link
                      href={`/course/${courseSlug}/module/${mod.moduleId}/lesson/${mod.nextLesson.slug}`}
                      className="inline-flex items-center text-sm font-medium text-primary hover:underline w-fit"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Continue
                      <ChevronRight className="h-4 w-4 ml-0.5" />
                    </Link>
                    <span className="text-sm text-muted-foreground">
                      Next: {mod.nextLesson.title}
                    </span>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="p-6 md:p-10 space-y-8">
      <Skeleton className="h-10 w-48" />
      <section className="rounded-xl border p-6 space-y-4">
        <Skeleton className="h-6 w-64" />
        <Skeleton className="h-4 w-full max-w-md" />
        <div className="flex gap-3">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-28" />
        </div>
      </section>
      <section>
        <Skeleton className="h-8 w-32 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-2 w-full rounded-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

function DashboardError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="p-6 md:p-10">
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
        <p className="text-destructive font-medium">Something went wrong</p>
        <p className="text-sm text-muted-foreground mt-1">{message}</p>
        <Button variant="outline" className="mt-4" onClick={onRetry}>
          Try again
        </Button>
      </div>
    </div>
  );
}
