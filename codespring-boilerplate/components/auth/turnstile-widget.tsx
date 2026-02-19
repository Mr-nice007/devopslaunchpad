"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const SCRIPT_URL = "https://challenges.cloudflare.com/turnstile/v0/api.js";

interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: () => void;
  className?: string;
}

export function TurnstileWidget({
  onVerify,
  onExpire,
  onError,
  className,
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const widgetIdRef = useRef<string | null>(null);

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  useEffect(() => {
    if (!siteKey) {
      setReady(true);
      return;
    }
    if (typeof window === "undefined") return;
    const existing = document.querySelector(`script[src="${SCRIPT_URL}"]`);
    if (existing) {
      setReady(true);
      return;
    }
    const script = document.createElement("script");
    script.src = SCRIPT_URL;
    script.async = true;
    script.defer = true;
    script.onload = () => setReady(true);
    document.head.appendChild(script);
    return () => {
      script.remove();
    };
  }, [siteKey]);

  const renderWidget = useCallback(() => {
    if (!siteKey || !containerRef.current || !ready) return;
    const win = window as Window & { turnstile?: { render: (el: HTMLElement, opts: object) => string } };
    if (!win.turnstile?.render) return;
    containerRef.current.innerHTML = "";
    widgetIdRef.current = win.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      callback: onVerify,
      "expired-callback": onExpire,
      "error-callback": onError,
    });
  }, [siteKey, ready, onVerify, onExpire, onError]);

  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(renderWidget, 100);
    return () => clearTimeout(t);
  }, [ready, renderWidget]);

  if (!siteKey) {
    return null;
  }
  return <div ref={containerRef} className={className} aria-label="Verification" />;
}
