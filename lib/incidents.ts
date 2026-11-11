import { fetchAllRows } from "@/lib/fetchAllRows";
import { supabase } from "@/lib/supabase";
import type { SiraIncident } from "@/types/incident";

export async function listIncidents() {
  // The id tiebreak keeps page boundaries stable when created_at values match.
  const { data, error } = await fetchAllRows<SiraIncident>((from, to) => supabase.from("sira_incidents").select("*").eq("incident_type", "fiber_network_risk").order("created_at", { ascending: false }).order("id").range(from, to));
  if (error) throw error;
  return (data ?? []) as SiraIncident[];
}

export async function getIncident(id: string) {
  const { data, error } = await supabase.from("sira_incidents").select("*").eq("id", id).eq("incident_type", "fiber_network_risk").single();
  if (error) throw error;
  return data as SiraIncident;
}
