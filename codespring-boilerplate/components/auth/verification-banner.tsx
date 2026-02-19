"use client";

import { useState } from "react";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Mail, Loader2 } from "lucide-react";

interface VerificationBannerProps {
  email: string;
  inline?: boolean;
}

export function VerificationBanner({ email, inline }: VerificationBannerProps) {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleResend() {
    if (!email || loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) setSent(true);
    } finally {
      setLoading(false);
    }
  }

  if (inline) {
    return (
      <div className="rounded-lg border bg-muted/50 p-4 max-w-md space-y-2">
        <p className="text-sm font-medium">Verify your email</p>
        <p className="text-sm text-muted-foreground">
          We sent a link to <strong>{email}</strong>. Click it to verify, or request a new one.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={handleResend}
          disabled={loading || sent}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {sent ? "Sent! Check your email" : "Resend verification email"}
        </Button>
      </div>
    );
  }

  return (
    <Alert className="rounded-none border-x-0 border-t-0 bg-amber-50 dark:bg-amber-950/30 border-amber-200">
      <Mail className="h-4 w-4" />
      <AlertTitle>Verify your email</AlertTitle>
      <AlertDescription className="flex flex-col sm:flex-row sm:items-center gap-2">
        <span>
          Please verify your email to access the dashboard. We sent a link to <strong>{email}</strong>.
        </span>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button variant="outline" size="sm" onClick={handleResend} disabled={loading || sent}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {sent ? "Sent!" : "Resend verification email"}
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/auth/login">Sign out</Link>
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
