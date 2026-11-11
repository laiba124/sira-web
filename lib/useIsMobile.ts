"use client";

import { useSyncExternalStore } from "react";

// Phones (and small touch tablets) get the SIRA app layout; desktop and laptop
// browsers keep the web console exactly as it was, even in a narrow window.
const MOBILE_QUERY = "(max-width: 900px) and (hover: none) and (pointer: coarse)";
const MOBILE_UA = /Android.+Mobile|iPhone|iPod|Windows Phone|Mobile Safari|Opera Mini|IEMobile/i;

function readIsMobile() {
  try {
    if (window.matchMedia(MOBILE_QUERY).matches) return true;
    return MOBILE_UA.test(navigator.userAgent) && window.innerWidth <= 900;
  } catch {
    return false;
  }
}

function subscribe(onChange: () => void) {
  const query = window.matchMedia(MOBILE_QUERY);
  query.addEventListener("change", onChange);
  window.addEventListener("resize", onChange);
  return () => {
    query.removeEventListener("change", onChange);
    window.removeEventListener("resize", onChange);
  };
}

/**
 * `null` while rendering on the server / before hydration, then `true` on
 * phones and `false` everywhere else. Callers render nothing for `null`, so
 * a phone never flashes the desktop layout first.
 */
export function useIsMobile(): boolean | null {
  return useSyncExternalStore<boolean | null>(subscribe, readIsMobile, () => null);
}
