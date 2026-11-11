export const INCIDENT_STAGES = ["Threat", "Action Plan"] as const;

export type IncidentStage = (typeof INCIDENT_STAGES)[number];

export const SUB_STAGES_BY_STAGE = {
  Threat: ["Reported", "Assessment", "Avoidance Validation"],
  "Action Plan": ["Formulation", "Implementation"],
} as const satisfies Record<IncidentStage, readonly string[]>;

export type ThreatSubStage = (typeof SUB_STAGES_BY_STAGE.Threat)[number];
export type ActionPlanSubStage =
  (typeof SUB_STAGES_BY_STAGE)["Action Plan"][number];
export type IncidentSubStage = ThreatSubStage | ActionPlanSubStage;

export const ACTION_PLAN_FORMULATION_OPTIONS = [
  "Increase route patrolling frequency",
  "Deploy night patrolling teams",
  "Position static guards at vulnerable sites",
  "Execute temporary fiber cable re-routing",
  "Shift underground fiber cable to aerial",
] as const;

export type ActionPlanOption =
  (typeof ACTION_PLAN_FORMULATION_OPTIONS)[number];

export const DEFAULT_INCIDENT_STAGE: IncidentStage = "Threat";
export const DEFAULT_INCIDENT_SUB_STAGE: IncidentSubStage = "Reported";

export function getSubStages(stage: IncidentStage): readonly IncidentSubStage[] {
  return SUB_STAGES_BY_STAGE[stage] as readonly IncidentSubStage[];
}

export function normalizeIncidentStage(value?: string | null): IncidentStage {
  return value === "Action Plan" ? "Action Plan" : "Threat";
}

export function normalizeIncidentSubStage(
  stage: IncidentStage,
  value?: string | null,
): IncidentSubStage {
  const allowed = getSubStages(stage);
  return allowed.includes(value as IncidentSubStage)
    ? (value as IncidentSubStage)
    : allowed[0];
}

export function isActionPlanOption(
  value?: string | null,
): value is ActionPlanOption {
  return ACTION_PLAN_FORMULATION_OPTIONS.includes(value as ActionPlanOption);
}
