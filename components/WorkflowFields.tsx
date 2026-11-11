"use client";
import { ACTION_PLAN_FORMULATION_OPTIONS, INCIDENT_STAGES, SUB_STAGES_BY_STAGE, type ActionPlanOption, type IncidentStage, type IncidentSubStage } from "@/lib/incidentWorkflow";

export type WorkflowValue = { stage: IncidentStage; subStage: IncidentSubStage; actionPlan: ActionPlanOption | null; threatDetails: string; actionPlanDetails: string };
export const DEFAULT_WORKFLOW: WorkflowValue = { stage:"Threat", subStage:"Reported", actionPlan:null, threatDetails:"", actionPlanDetails:"" };

export default function WorkflowFields({ value, onChange }: { value: WorkflowValue; onChange:(v:WorkflowValue)=>void }) {
  const subs = SUB_STAGES_BY_STAGE[value.stage];
  function setStage(stage: IncidentStage) { onChange({ ...value, stage, subStage: SUB_STAGES_BY_STAGE[stage][0] as IncidentSubStage, actionPlan: stage === "Threat" ? null : value.actionPlan }); }
  return <div className="card">
    <h3 className="card-title">Stage & Sub-stage</h3>
    <div className="form-grid">
      <div className="field"><label>Stage *</label><select className="select" value={value.stage} onChange={e=>setStage(e.target.value as IncidentStage)}>{INCIDENT_STAGES.map(x=><option key={x}>{x}</option>)}</select></div>
      <div className="field"><label>Sub-stage *</label><select className="select" value={value.subStage} onChange={e=>onChange({...value,subStage:e.target.value as IncidentSubStage})}>{subs.map(x=><option key={x}>{x}</option>)}</select></div>
      {value.stage === "Action Plan" && <div className="field full"><label>Action Plan *</label><select className="select" value={value.actionPlan ?? ""} onChange={e=>onChange({...value,actionPlan:(e.target.value||null) as ActionPlanOption|null})}><option value="">Select Action Plan</option>{ACTION_PLAN_FORMULATION_OPTIONS.map(x=><option key={x}>{x}</option>)}</select></div>}
      <div className="field full"><label>Threat</label><textarea className="textarea" maxLength={2000} value={value.threatDetails} onChange={e=>onChange({...value,threatDetails:e.target.value})} placeholder="Describe the threat, exposure or risk..." /></div>
      <div className="field full"><label>Action Plan Details</label><textarea className="textarea" maxLength={2000} value={value.actionPlanDetails} onChange={e=>onChange({...value,actionPlanDetails:e.target.value})} placeholder="Add action plan execution details..." /></div>
    </div>
  </div>;
}

export function validateWorkflow(v: WorkflowValue) {
  if (v.stage === "Action Plan" && !v.actionPlan) return "Select an Action Plan before submission.";
  return null;
}
