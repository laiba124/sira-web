export type IncidentType = "fiber_network_risk";

export type Severity = "low" | "medium" | "high" | "critical";

export type IncidentStatus =
  | "open"
  | "in_progress"
  | "resolved"
  | "submitted"
  | "draft"
  | "under_review";

export type LatLng = {
  latitude: number;
  longitude: number;
};

export type SiraIncident = {
  id: string;
  incident_type: IncidentType | string;
  severity: Severity | string;
  title: string;
  description?: string | null;
  latitude: number;
  longitude: number;
  address_text?: string | null;
  city?: string | null;
  unit_name?: string | null;
  support_required?: string | null;
  photo_urls?: string[] | null;
  reported_by_name?: string | null;
  reported_by_job_title?: string | null;
  reported_by_company?: string | null;
  reported_by_phone?: string | null;
  reporter_user_id?: string | null;
  stage?: "Threat" | "Action Plan" | string | null;
  sub_stage?:
    | "Reported"
    | "Assessment"
    | "Avoidance Validation"
    | "Formulation"
    | "Implementation"
    | string
    | null;
  action_plan?: string | null;
  threat_details?: string | null;
  action_plan_details?: string | null;
  status: IncidentStatus | string;
  created_at: string;
  updated_at?: string | null;
};

const FIBER_RISK_META = {
  label: "Fiber Network Risk",
  shortLabel: "Fiber Risk",
  prefix: "FR",
  color: "#f97316",
  icon: "git-network",
};

export function getIncidentTypeMeta(_type: string) {
  return FIBER_RISK_META;
}

export function getPublicIncidentCode(incident: Pick<SiraIncident, "id" | "incident_type">) {
  const digits = String(incident.id ?? "").replace(/\D/g, "");
  const number = digits.slice(-3).padStart(3, "0");
  return `FR-${number}`;
}

export function getShortStatusLabel(status: string) {
  if (status === "under_review" || status === "in_progress") return "In Progress";
  if (status === "resolved") return "Resolved";
  return "Open";
}

export function getSeverityLabel(severity: string) {
  if (severity === "critical") return "Critical";
  if (severity === "high") return "High";
  if (severity === "low") return "Low";
  return "Medium";
}

export function formatDateShort(value: string) {
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export function formatCoordinate(value: number, axis: "lat" | "lng") {
  const n = Number(value);
  if (!Number.isFinite(n)) return "--";
  const suffix = axis === "lat" ? (n >= 0 ? "N" : "S") : n >= 0 ? "E" : "W";
  return `${Math.abs(n).toFixed(4)}° ${suffix}`;
}

// One-line reporting summary shown in place of the old stage / sub-stage text.
export function getReportedLine(
  incident: Pick<SiraIncident, "reported_by_name" | "created_at">
) {
  const who = incident.reported_by_name?.trim() || "Unknown reporter";
  return `Reported by ${who} - ${formatDateShort(incident.created_at)}`;
}
