"use client";

import Link from "next/link";
import { memo, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";

import { useAuth } from "@/context/AuthContext";
import Icon from "@/components/mobile/Icon";
import {
  formatCount,
  formatDateTime,
  openIncidentDetails,
  publicCode,
  severityColor,
  severityLabel,
  STATUS_LOOK,
  statusKey,
  useIncidentPhotoUrl,
} from "@/components/mobile/shared";
import { listIncidents } from "@/lib/incidents";
import { storagePathFromIncidentPhoto } from "@/lib/photoStorage";
import { supabase } from "@/lib/supabase";
import type { SiraIncident } from "@/types/incident";

const FILTERS = [
  ["all", "All"],
  ["open", "Open"],
  ["in_progress", "In Progress"],
  ["resolved", "Resolved"],
] as const;

type Filter = (typeof FILTERS)[number][0];

const PAGE = 30;

function normalizeSearch(value: unknown) {
  return String(value ?? "").toLowerCase().replace(/[^a-z0-9.]+/g, " ").trim();
}

export default function MobileIncidents() {
  const { user } = useAuth();
  const currentUserId = user?.id ?? null;
  const [incidents, setIncidents] = useState<SiraIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [limit, setLimit] = useState(PAGE);
  const deferredQuery = useDeferredValue(query);
  const sentinelRef = useRef<HTMLDivElement>(null);

  async function load() {
    setError("");
    try {
      setIncidents(await listIncidents());
    } catch (e: any) {
      setError(e?.message || "Incidents could not load.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const indexed = useMemo(
    () =>
      incidents.map((item) => ({
        item,
        status: statusKey(item.status),
        searchable: normalizeSearch(
          [
            publicCode(item),
            publicCode(item).replace("-", ""),
            item.id,
            item.title,
            item.description,
            "Fiber Risk",
            item.address_text,
            item.city,
            item.support_required,
            item.reported_by_name,
            item.reported_by_job_title,
            item.reported_by_company,
            item.reported_by_phone,
            STATUS_LOOK[statusKey(item.status)].label,
            severityLabel(item.severity),
          ].join(" ")
        ),
      })),
    [incidents]
  );

  const filtered = useMemo(() => {
    const terms = normalizeSearch(deferredQuery).split(/\s+/).filter(Boolean);
    return indexed
      .filter((entry) => (filter === "all" || entry.status === filter) && terms.every((t) => entry.searchable.includes(t)))
      .map((entry) => entry.item);
  }, [indexed, deferredQuery, filter]);

  const counts = useMemo(() => {
    const result = { open: 0, in_progress: 0, resolved: 0 };
    indexed.forEach((entry) => {
      result[entry.status] += 1;
    });
    return result;
  }, [indexed]);

  useEffect(() => setLimit(PAGE), [deferredQuery, filter]);

  // Draw more cards as the list nears the bottom, so long lists stay smooth.
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) setLimit((value) => value + PAGE);
    }, { rootMargin: "600px" });
    observer.observe(node);
    return () => observer.disconnect();
  }, [filtered.length, loading]);

  async function deleteIncident(item: SiraIncident) {
    if (!currentUserId || item.reporter_user_id !== currentUserId) {
      window.alert("Only the user who uploaded this incident can delete it.");
      return;
    }
    if (!window.confirm(`Delete ${publicCode(item)} and its images?`)) return;
    const paths = (item.photo_urls ?? []).map((url) => storagePathFromIncidentPhoto(String(url))).filter(Boolean) as string[];
    if (paths.length) {
      const { error: storageError } = await supabase.storage.from("incident-photos").remove(paths);
      if (storageError) {
        window.alert("Image delete failed: " + storageError.message);
        return;
      }
    }
    const { error: deleteError, count } = await supabase
      .from("sira_incidents")
      .delete({ count: "exact" })
      .eq("id", item.id)
      .eq("incident_type", "fiber_network_risk")
      .eq("reporter_user_id", currentUserId);
    if (deleteError) {
      window.alert("Delete failed: " + deleteError.message);
      return;
    }
    if (count === 0) {
      window.alert("This incident was not deleted because you are not its uploader.");
      return;
    }
    setIncidents((prev) => prev.filter((incident) => incident.id !== item.id));
  }

  // Details may change the list (status update, delete), so refresh after it closes.
  useEffect(() => {
    const onChanged = () => load();
    window.addEventListener("sira:incidents-changed", onChanged);
    return () => window.removeEventListener("sira:incidents-changed", onChanged);
  }, []);

  return (
    <div className="m-page m-page-fab">
      <img className="m-banner" src="/sira-banner-dark.png" alt="SIRA Smart Incident Reporting: Network Visibility, Fiber Risk Monitoring, Field Operations" />

      <div className="m-title-block">
        <h1 className="m-h1">Fiber Risk Incidents</h1>
        <p className="m-sub">
          {formatCount(incidents.length)} total • {formatCount(counts.open)} open • {formatCount(counts.in_progress)} in progress
        </p>
      </div>

      <div className="m-stat-row">
        {FILTERS.map(([key, label]) => {
          const active = filter === key;
          const look = STATUS_LOOK[key];
          const count = key === "all" ? incidents.length : counts[key];
          return (
            <button
              key={key}
              type="button"
              className="m-stat-card"
              aria-pressed={active}
              style={active ? { borderColor: look.color, background: look.tint } : undefined}
              onClick={() => setFilter(key)}
            >
              <span className="m-stat-label">
                {key === "all" ? <Icon name="layers" size={11} color={look.color} /> : <i className="m-dot" style={{ background: look.color }} />}
                {label}
              </span>
              <strong style={active ? { color: look.color } : undefined}>{formatCount(count)}</strong>
            </button>
          );
        })}
      </div>

      <label className="m-search">
        <Icon name="search" size={19} color="#64748b" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search FR ID, reporter or location"
          autoCorrect="off"
          autoCapitalize="none"
          enterKeyHint="search"
        />
        {query ? (
          <button type="button" aria-label="Clear search" onClick={() => setQuery("")}>
            <Icon name="closeCircle" size={19} color="#94a3b8" />
          </button>
        ) : null}
      </label>

      {!loading && (query || filter !== "all") ? (
        <p className="m-result-text">
          Showing {formatCount(filtered.length)} of {formatCount(incidents.length)}
        </p>
      ) : null}

      {error ? <div className="m-error">Load failed: {error}</div> : null}

      {loading ? (
        <div className="m-loading">
          <div className="spinner" />
          <span>Loading incidents...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="m-empty">
          <Icon name="search" size={36} color="#94a3b8" />
          <span>No matching incidents</span>
        </div>
      ) : (
        <div className="m-card-list">
          {filtered.slice(0, limit).map((item) => (
            <IncidentCard
              key={item.id}
              item={item}
              canDelete={Boolean(currentUserId) && item.reporter_user_id === currentUserId}
              onDelete={deleteIncident}
            />
          ))}
          <div ref={sentinelRef} />
        </div>
      )}

      <Link href="/report" className="m-fab" aria-label="Report a new incident">
        <Icon name="add" size={30} color="#ffffff" strokeWidth={2.4} />
      </Link>
    </div>
  );
}

const IncidentCard = memo(function IncidentCard({
  item,
  canDelete,
  onDelete,
}: {
  item: SiraIncident;
  canDelete: boolean;
  onDelete: (item: SiraIncident) => void;
}) {
  const look = STATUS_LOOK[statusKey(item.status)];
  const photoUrl = item.photo_urls?.find(Boolean) ?? null;
  const photo = useIncidentPhotoUrl(photoUrl);
  const location = item.address_text || item.city || "GPS selected location";

  return (
    <div
      className="m-incident-card"
      role="button"
      tabIndex={0}
      onClick={() => openIncidentDetails(item.id)}
      onKeyDown={(e) => e.key === "Enter" && openIncidentDetails(item.id)}
    >
      <span className="m-rail" style={{ background: look.color }} />
      <div className="m-thumb-wrap">
        {photoUrl && photo ? (
          <img className="m-thumb" src={photo} alt="" loading="lazy" />
        ) : (
          <div className="m-thumb m-thumb-empty">
            <Icon name="network" size={24} color="#f97316" />
          </div>
        )}
      </div>
      <div className="m-card-body">
        <div className="m-top-line">
          <span className="m-code">{publicCode(item)}</span>
          <span className="m-top-badges">
            <span className="m-status-pill" style={{ background: look.tint, color: look.color }}>
              {look.label}
            </span>
            <span className="m-severity">
              <i className="m-dot" style={{ background: severityColor(item.severity), width: 7, height: 7 }} />
              {severityLabel(item.severity)}
            </span>
          </span>
          {canDelete ? (
            <button
              type="button"
              className="m-delete-btn"
              aria-label={`Delete ${publicCode(item)}`}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(item);
              }}
            >
              <Icon name="trash" size={16} color="#dc2626" />
            </button>
          ) : null}
        </div>

        <div className="m-card-title-text">{item.title || "Fiber Risk"}</div>

        <div className="m-meta-row">
          <div className="m-meta-grid">
            <span className="m-meta">
              <Icon name="person" size={12} color="#64748b" />
              <span>{(item.reported_by_name || "Field User") + " • " + (item.reported_by_company || "Company")}</span>
            </span>
            <span className="m-meta">
              <Icon name="call" size={12} color="#64748b" />
              <span>{item.reported_by_phone || "Mobile not added"}</span>
            </span>
          </div>
          <span className="m-view-btn" aria-hidden="true">
            <Icon name="eye" size={18} color="#1267e8" />
          </span>
        </div>

        <div className="m-bottom-line">
          <span className="m-meta">
            <Icon name="location" size={12} color="#64748b" />
            <span>{location}</span>
          </span>
          <time>{formatDateTime(item.created_at)}</time>
        </div>
      </div>
    </div>
  );
});
