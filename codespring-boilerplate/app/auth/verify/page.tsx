"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const success = searchParams.get("success") === "1";
  const error = searchParams.get("error");
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <Card>
        <CardContent className="pt-6 flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Verifying…</p>
        </CardContent>
      </Card>
    );
  }

  if (success) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            <CardTitle>Email verified</CardTitle>
          </div>
          <CardDescription>
            Your account is verified. You can now sign in and access the dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <Link href="/auth/login">Sign in</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (error === "expired" || error === "invalid") {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 text-destructive">
            <XCircle className="h-5 w-5" />
            <CardTitle>Link expired or invalid</CardTitle>
          </div>
          <CardDescription>
            This verification link has expired or was already used. Request a new one below.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ResendVerificationForm />
          <Button asChild variant="outline" className="w-full">
            <Link href="/auth/login">Back to sign in</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6 flex flex-col items-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
        <p className="text-muted-foreground">Verifying your email…</p>
        <Button asChild variant="outline">
          <Link href="/auth/login">Back to sign in</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function ResendVerificationForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  return (
    <form
      className="space-y-2"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!email.trim()) return;
        setLoading(true);
        setErr(null);
        try {
          const res = await fetch("/api/auth/verify/resend", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: email.trim() }),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) setErr(data.message || "Failed to send.");
          else setDone(true);
        } catch {
          setErr("Something went wrong.");
        } finally {
          setLoading(false);
        }
      }}
    >
      <Label htmlFor="verify-resend-email">Email</Label>
      <Input
        id="verify-resend-email"
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={loading || done}
        required
      />
      {done && <p className="text-sm text-green-600">Verification email sent. Check your inbox.</p>}
      {err && <p className="text-sm text-destructive">{err}</p>}
      <Button type="submit" disabled={loading || done} className="w-full">
        {loading ? "Sending…" : "Resend verification email"}
      </Button>
    </form>
  );
}
