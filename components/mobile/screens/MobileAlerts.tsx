"use client";

import { useEffect, useState } from "react";

import Icon from "@/components/mobile/Icon";
import { ALERT_STATUSES, formatDateTime, openIncidentDetails } from "@/components/mobile/shared";
import { fetchAllRows } from "@/lib/fetchAllRows";
import { supabase } from "@/lib/supabase";

type FiberAlert = {
  id: string;
  title: string;
  status: string;
  severity: string;
  address_text: string | null;
  city: string | null;
  created_at: string;
};

export default function MobileAlerts() {
  const [alerts, setAlerts] = useState<FiberAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      const { data, error: loadError } = await fetchAllRows<FiberAlert>((from, to) =>
        supabase
          .from("sira_incidents")
          .select("id, title, status, severity, address_text, city, created_at")
          .eq("incident_type", "fiber_network_risk")
          .in("status", ALERT_STATUSES)
          .order("created_at", { ascending: false })
          .order("id")
          .range(from, to)
      );
      if (loadError) setError(loadError.message);
      else setAlerts(data ?? []);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="m-page m-alerts">
      <h1 className="m-alerts-title">Fiber Risk Alerts</h1>
      <p className="m-alerts-sub">Open and work-in-progress FR incidents requiring field attention.</p>

      {error ? <div className="m-error">Alerts could not load: {error}</div> : null}

      {loading ? (
        <div className="m-state">
          <div className="spinner" />
          <span>Loading alerts...</span>
        </div>
      ) : alerts.length === 0 ? (
        <div className="m-state">
          <div className="m-clear-icon">
            <Icon name="checkCircle" size={34} color="#16a34a" />
          </div>
          <strong>No active Fiber Risk alerts</strong>
          <span>All recorded Fiber Risk incidents are resolved.</span>
        </div>
      ) : (
        alerts.map((item) => {
          const inProgress = item.status === "in_progress" || item.status === "under_review";
          const color = inProgress ? "#f97316" : "#dc2626";
          return (
            <button key={item.id} type="button" className="m-alert-card" onClick={() => openIncidentDetails(item.id)}>
              <span className="m-alert-icon" style={{ background: color }}>
                <Icon name="network" size={24} color="#ffffff" />
              </span>
              <span className="m-alert-text">
                <span className="m-alert-top">
                  <strong>{item.title || "Fiber Network Risk"}</strong>
                  <span className="m-alert-pill" style={{ background: `${color}18`, color }}>
                    {inProgress ? "Work in Progress" : "Open"}
                  </span>
                </span>
                <span className="m-alert-sub">{item.address_text || item.city || "GPS selected location"}</span>
                <span className="m-alert-date">
                  {String(item.severity ?? "medium").toUpperCase()} • {formatDateTime(item.created_at)}
                </span>
              </span>
              <Icon name="chevronRight" size={22} color="#94a3b8" />
            </button>
          );
        })
      )}
    </div>
  );
}
