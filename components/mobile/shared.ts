"use client";

import { useEffect, useState } from "react";

import { resolveIncidentPhotoUrl } from "@/lib/photoStorage";
import { supabase } from "@/lib/supabase";

// ---- Formatting (matches the Android app) ----------------------------------

export function formatCount(value: number) {
  return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

let dateTimeFormatter: Intl.DateTimeFormat | null = null;

export function formatDateTime(value: string | null | undefined) {
  if (!value) return "-";
  try {
    dateTimeFormatter ??= new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
    return dateTimeFormatter.format(new Date(value));
  } catch {
    return value;
  }
}

export function publicCode(item: { id: string }) {
  const digits = String(item.id ?? "").replace(/\D/g, "");
  return `FR-${digits.slice(-3).padStart(3, "0")}`;
}

export type StatusKey = "open" | "in_progress" | "resolved";

export function statusKey(status: string | null | undefined): StatusKey {
  if (status === "resolved") return "resolved";
  if (status === "in_progress" || status === "under_review") return "in_progress";
  return "open";
}

export const STATUS_LOOK: Record<StatusKey | "all", { label: string; color: string; tint: string }> = {
  all: { label: "All", color: "#1267e8", tint: "#eff6ff" },
  open: { label: "Open", color: "#dc2626", tint: "#fef2f2" },
  in_progress: { label: "In Progress", color: "#ea580c", tint: "#fff7ed" },
  resolved: { label: "Resolved", color: "#16a34a", tint: "#f0fdf4" },
};

export function severityLabel(severity: string | null | undefined) {
  if (severity === "critical") return "Critical";
  if (severity === "high") return "High";
  if (severity === "low") return "Low";
  return "Medium";
}

export function severityColor(severity: string | null | undefined) {
  if (severity === "low") return "#16a34a";
  if (severity === "medium") return "#f59e0b";
  return "#dc2626";
}

// ---- Incident details ------------------------------------------------------

// The details view is opened by IncidentDetailsHost (also on desktop).
export function openIncidentDetails(id: string) {
  window.dispatchEvent(new CustomEvent("sira:open-incident-details", { detail: id }));
}

// Signed URL for one private incident photo; undefined while loading.
export function useIncidentPhotoUrl(url: string | null | undefined) {
  const [src, setSrc] = useState<string | null | undefined>(undefined);
  useEffect(() => {
    let active = true;
    setSrc(undefined);
    if (!url) {
      setSrc(null);
      return;
    }
    resolveIncidentPhotoUrl(url).then((signed) => {
      if (active) setSrc(signed);
    });
    return () => {
      active = false;
    };
  }, [url]);
  return src;
}

// ---- Alerts badge (same rules as the Android app) --------------------------

export const ALERT_STATUSES = ["open", "submitted", "draft", "in_progress", "under_review"];

const ALERTS_SEEN_KEY = "sira_alerts_seen_at";
const BADGE_WINDOW_MS = 24 * 60 * 60 * 1000;

export function markAlertsSeen() {
  try {
    localStorage.setItem(ALERTS_SEEN_KEY, new Date().toISOString());
  } catch {
    // The badge keeps counting from the last 24 hours.
  }
}

function alertsSeenAt() {
  try {
    return Date.parse(localStorage.getItem(ALERTS_SEEN_KEY) ?? "") || 0;
  } catch {
    return 0;
  }
}

// New alerts: reported in the last 24 hours, after Alerts was last opened,
// and not reported by the signed-in user.
export async function countNewAlerts(userId: string | null | undefined) {
  const since = new Date(Math.max(Date.now() - BADGE_WINDOW_MS, alertsSeenAt())).toISOString();
  let query = supabase
    .from("sira_incidents")
    .select("id", { count: "exact", head: true })
    .eq("incident_type", "fiber_network_risk")
    .in("status", ALERT_STATUSES)
    .gt("created_at", since);
  if (userId) query = query.or(`reporter_user_id.is.null,reporter_user_id.neq.${userId}`);
  const { count, error } = await query;
  return error ? 0 : count ?? 0;
}
