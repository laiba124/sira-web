"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

// hCaptcha site key. Login requires the check only when this is set; it must
// match the hCaptcha secret configured in Supabase Auth (Attack Protection).
// The site key is public, so it is kept here rather than in hosting settings.
const HCAPTCHA_SITE_KEY = "89d8b814-e91a-430a-8ca0-95f89142c5fc";

export const CAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || HCAPTCHA_SITE_KEY;

type HCaptchaApi = {
  render: (container: HTMLElement, options: Record<string, unknown>) => string;
  reset: (widgetId?: string) => void;
};

declare global {
  interface Window { hcaptcha?: HCaptchaApi; }
}

const SCRIPT_SRC = "https://js.hcaptcha.com/1/api.js?render=explicit";
let scriptPromise: Promise<HCaptchaApi> | null = null;

function loadHCaptcha() {
  if (window.hcaptcha) return Promise.resolve(window.hcaptcha);
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = SCRIPT_SRC;
      script.async = true;
      script.onload = () => window.hcaptcha ? resolve(window.hcaptcha) : reject(new Error("hCaptcha unavailable"));
      script.onerror = () => { scriptPromise = null; reject(new Error("hCaptcha could not be loaded")); };
      document.head.appendChild(script);
    });
  }
  return scriptPromise;
}

export type HCaptchaHandle = { reset: () => void };

type Props = { onToken: (token: string | null) => void; onError?: (message: string) => void };

const HCaptcha = forwardRef<HCaptchaHandle, Props>(function HCaptcha({ onToken, onError }, ref) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const onTokenRef = useRef(onToken);
  const onErrorRef = useRef(onError);
  onTokenRef.current = onToken;
  onErrorRef.current = onError;

  useImperativeHandle(ref, () => ({
    reset: () => {
      if (window.hcaptcha && widgetIdRef.current !== null) window.hcaptcha.reset(widgetIdRef.current);
      onTokenRef.current(null);
    },
  }), []);

  useEffect(() => {
    let cancelled = false;
    loadHCaptcha().then((api) => {
      if (cancelled || !containerRef.current || widgetIdRef.current !== null) return;
      widgetIdRef.current = api.render(containerRef.current, {
        sitekey: CAPTCHA_SITE_KEY,
        callback: (token: string) => onTokenRef.current(token),
        "expired-callback": () => onTokenRef.current(null),
        "error-callback": () => { onTokenRef.current(null); onErrorRef.current?.("Security check could not be completed. Please try again."); },
      });
    }).catch(() => onErrorRef.current?.("Security check could not be loaded. Check your connection."));
    return () => { cancelled = true; };
  }, []);

  return <div ref={containerRef} style={{ display: "flex", justifyContent: "center", margin: "8px 0" }} />;
});

export default HCaptcha;
