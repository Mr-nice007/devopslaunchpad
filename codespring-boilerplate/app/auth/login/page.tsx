"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TurnstileWidget } from "@/components/auth/turnstile-widget";
import { Eye, EyeOff, Loader2 } from "lucide-react";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRequired = !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailValid = EMAIL_REGEX.test(email.trim());
  const canSubmit = emailValid && password.length > 0 && (!turnstileRequired || turnstileToken) && !loading;

  const handleTurnstile = useCallback((token: string) => {
    setTurnstileToken(token);
    setError(null);
  }, []);
  const handleTurnstileExpire = useCallback(() => setTurnstileToken(null), []);
  const handleTurnstileError = useCallback(() => setTurnstileToken(null), []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    try {
      const result = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
        callbackUrl: returnTo,
      });
      if (result?.error === "UNVERIFIED") {
        setError("Please verify your email to continue.");
        setLoading(false);
        return;
      }
      if (result?.error || !result?.ok) {
        const message =
          process.env.NODE_ENV === "development" && result?.error
            ? `Invalid email or password. (${result.error})`
            : "Invalid email or password.";
        setError(message);
        setLoading(false);
        return;
      }
      router.push(result.url ?? returnTo);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>
          Enter your email and password to access your account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div
              role="alert"
              aria-live="assertive"
              className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="login-email">Email</Label>
            <Input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
              aria-invalid={!!email && !emailValid}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="login-password">Password</Label>
            <div className="relative">
              <Input
                id="login-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring rounded p-1"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <p className="text-sm">
              <Link href="/auth/reset-request" className="underline hover:text-foreground">
                Forgot password?
              </Link>
            </p>
          </div>
          <TurnstileWidget
            onVerify={handleTurnstile}
            onExpire={handleTurnstileExpire}
            onError={handleTurnstileError}
          />
          <Button type="submit" className="w-full" disabled={!canSubmit}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in…
              </>
            ) : (
              "Sign in"
            )}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href={`/auth/signup${returnTo !== "/dashboard" ? `?returnTo=${encodeURIComponent(returnTo)}` : ""}`} className="underline hover:text-foreground">
              Sign up
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
