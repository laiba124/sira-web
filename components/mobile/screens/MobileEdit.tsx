"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useAuth } from "@/context/AuthContext";
import Icon from "@/components/mobile/Icon";
import { openIncidentDetails, statusKey, type StatusKey } from "@/components/mobile/shared";
import { supabase } from "@/lib/supabase";

const SEVERITIES = ["low", "medium", "high", "critical"] as const;
const STATUSES: { key: StatusKey; label: string }[] = [
  { key: "open", label: "Open" },
  { key: "in_progress", label: "In Progress" },
  { key: "resolved", label: "Resolved" },
];

export default function MobileEdit() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [blocked, setBlocked] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [severity, setSeverity] = useState<string>("high");
  const [status, setStatus] = useState<StatusKey>("open");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [support, setSupport] = useState("");

  useEffect(() => {
    if (!id || !user) return;
    (async () => {
      setLoading(true);
      const { data, error: loadError } = await supabase
        .from("sira_incidents")
        .select("*")
        .eq("id", id)
        .eq("incident_type", "fiber_network_risk")
        .eq("reporter_user_id", user.id)
        .maybeSingle();
      if (loadError) setBlocked("Load failed: " + loadError.message);
      else if (!data) setBlocked("Only the user who uploaded this Fiber Risk incident can edit it.");
      else {
        setSeverity(data.severity ?? "high");
        setStatus(statusKey(data.status));
        setTitle(data.title ?? "");
        setDescription(data.description ?? "");
        setAddress(data.address_text ?? "");
        setCity(data.city ?? "");
        setSupport(data.support_required ?? "");
      }
      setLoading(false);
    })();
  }, [id, user]);

  async function save() {
    if (!id || !user) return;
    if (!title.trim()) return setError("Please enter incident title.");
    setSaving(true);
    setError("");
    const { error: updateError } = await supabase
      .from("sira_incidents")
      .update({
        incident_type: "fiber_network_risk",
        severity,
        status,
        title: title.trim(),
        description: description.trim() || null,
        address_text: address.trim() || null,
        city: city.trim() || null,
        support_required: support.trim() || null,
      })
      .eq("id", id)
      .eq("incident_type", "fiber_network_risk")
      .eq("reporter_user_id", user.id);
    setSaving(false);
    if (updateError) setError("Update failed: " + updateError.message);
    else setSaved(true);
  }

  function backToIncident() {
    router.replace("/incidents");
    setTimeout(() => openIncidentDetails(String(id)), 250);
  }

  if (loading) {
    return (
      <div className="m-loading m-loading-full">
        <div className="spinner" />
        <span>Loading Fiber Risk incident...</span>
      </div>
    );
  }

  if (blocked) {
    return (
      <div className="m-page">
        <div className="m-state">
          <Icon name="lock" size={34} color="#94a3b8" />
          <strong>Not allowed</strong>
          <span>{blocked}</span>
          <button type="button" className="m-btn-save" style={{ marginTop: 14, padding: "0 22px" }} onClick={() => router.back()}>
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="m-page m-form-page">
      <h1 className="m-big-title">Edit Fiber Risk</h1>
      <p className="m-big-sub">Update the incident details and status.</p>

      <section className="m-form-card">
        <h2 className="m-form-title">Incident Type</h2>
        <div className="m-fixed-type">
          <span className="m-fixed-type-icon">
            <Icon name="network" size={21} color="#ffffff" />
          </span>
          <div>
            <strong>Fiber Network Risk</strong>
            <span>SIRA is currently restricted to FR incidents only.</span>
          </div>
          <Icon name="lock" size={18} color="#64748b" />
        </div>
      </section>

      <section className="m-form-card">
        <h2 className="m-form-title">Status</h2>
        <div className="m-chip-wrap">
          {STATUSES.map((item) => (
            <button key={item.key} type="button" className={status === item.key ? "m-sev-chip is-active" : "m-sev-chip"} onClick={() => setStatus(item.key)}>
              {item.label}
            </button>
          ))}
        </div>
      </section>

      <section className="m-form-card">
        <h2 className="m-form-title">Severity</h2>
        <div className="m-chip-wrap">
          {SEVERITIES.map((item) => (
            <button key={item} type="button" className={severity === item ? "m-sev-chip is-active" : "m-sev-chip"} onClick={() => setSeverity(item)}>
              {item.toUpperCase()}
            </button>
          ))}
        </div>
      </section>

      <section className="m-form-card">
        <h2 className="m-form-title">Details</h2>
        <input className="m-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Incident title" maxLength={160} />
        <textarea className="m-input m-textarea" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description / notes" />
        <input className="m-input" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Location label" />
        <textarea
          className="m-input m-textarea-lg"
          value={support}
          onChange={(e) => setSupport(e.target.value)}
          placeholder="Support Required e.g. Fiber team visit, cable spare, transmission support"
        />
      </section>

      {error ? <div className="m-error">{error}</div> : null}

      <button type="button" className="m-submit m-submit-blue" onClick={save} disabled={saving}>
        {saving ? (
          <span className="m-spin-sm" />
        ) : (
          <>
            <Icon name="save" size={22} color="#ffffff" />
            Save Changes
          </>
        )}
      </button>

      {saved ? (
        <div className="m-dialog-backdrop">
          <div className="m-dialog">
            <h3>Updated</h3>
            <p>Fiber Risk incident updated successfully.</p>
            <div className="m-dialog-actions">
              <button type="button" className="m-btn-save" onClick={backToIncident}>
                OK
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
