"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import PageHeader from "@/components/PageHeader";
import IncidentRow from "@/components/IncidentRow";
import LeafletMap from "@/components/LeafletMap";
import { listIncidents } from "@/lib/incidents";
import {
  SIRA_SUBREGIONS,
  getSiraDistricts,
  inferSiraArea,
} from "@/lib/siraAreas";
import type { SiraIncident } from "@/types/incident";
import { getPublicIncidentCode, getShortStatusLabel } from "@/types/incident";

const PAKISTAN_CENTER = { latitude: 30.3753, longitude: 69.3451 };

function hasValidCoordinates(incident: SiraIncident) {
  const lat = Number(incident.latitude);
  const lng = Number(incident.longitude);
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= 23 &&
    lat <= 38 &&
    lng >= 60 &&
    lng <= 78
  );
}

export default function Incidents() {
  const [data, setData] = useState<SiraIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [severity, setSeverity] = useState("");
  const [stage, setStage] = useState("");
  const [sub, setSub] = useState("");
  const [dist, setDist] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      setData(await listIncidents());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const districts = useMemo(() => getSiraDistricts(sub), [sub]);

  const filtered = useMemo(
    () =>
      data.filter((incident) => {
        const area = inferSiraArea(incident);
        const haystack = [
          incident.title,
          incident.description,
          incident.reported_by_name,
          incident.reported_by_company,
          incident.address_text,
          getPublicIncidentCode(incident),
        ]
          .join(" ")
          .toLowerCase();

        return (
          (!q || haystack.includes(q.toLowerCase())) &&
          (!status || incident.status === status) &&
          (!severity || incident.severity === severity) &&
          (!stage || incident.stage === stage) &&
          (!sub || area?.subRegion === sub) &&
          (!dist || area?.name === dist)
        );
      }),
    [data, q, status, severity, stage, sub, dist]
  );

  const mappedIncidents = useMemo(
    () => filtered.filter(hasValidCoordinates),
    [filtered]
  );

  useEffect(() => {
    if (!filtered.length) {
      setSelectedId(null);
      return;
    }
    if (!selectedId || !filtered.some((incident) => incident.id === selectedId)) {
      setSelectedId(filtered[0].id);
    }
  }, [filtered, selectedId]);

  const selectedIncident =
    filtered.find((incident) => incident.id === selectedId) ?? null;
  const selectedArea = selectedIncident ? inferSiraArea(selectedIncident) : null;

  const mapCenter =
    selectedIncident && hasValidCoordinates(selectedIncident)
      ? {
          latitude: Number(selectedIncident.latitude),
          longitude: Number(selectedIncident.longitude),
        }
      : mappedIncidents[0]
        ? {
            latitude: Number(mappedIncidents[0].latitude),
            longitude: Number(mappedIncidents[0].longitude),
          }
        : PAKISTAN_CENTER;

  const activeFilters = [q, status, severity, stage, sub, dist].filter(Boolean).length;

  function clearFilters() {
    setQ("");
    setStatus("");
    setSeverity("");
    setStage("");
    setSub("");
    setDist("");
  }

  return (
    <>
      <PageHeader
        title="Incidents"
        subtitle="Monitor, assess and manage fiber network risks"
        actions={
          <>
            <button className="btn" onClick={load}>
              Refresh
            </button>
            <Link href="/report" className="btn primary">
              + New Incident
            </Link>
          </>
        }
      />

      <section className="incident-overview">
        <div>
          <span className="eyebrow">Smart Incident Reporting</span>
          <h2>Live Monitoring</h2>
          <p>
            Track incidents from Threat reporting through assessment, avoidance
            validation, action planning and implementation.
          </p>
        </div>
        <div className="overview-metrics" aria-label="Incident overview">
          <div>
            <strong>{filtered.length}</strong>
            <span>Visible</span>
          </div>
          <div>
            <strong>{filtered.filter((i) => i.status === "open").length}</strong>
            <span>Open</span>
          </div>
          <div>
            <strong>
              {filtered.filter((i) => i.status === "in_progress").length}
            </strong>
            <span>In progress</span>
          </div>
        </div>
      </section>

      <section className="card filter-card">
        <div className="filter-toolbar">
          <div className="field search-field">
            <label>Search incidents</label>
            <div className="search-control">
              <input
                className="input"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Title, ID, reporter, address..."
              />
            </div>
          </div>

          <div className="field">
            <label>Status</label>
            <select
              className="select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All statuses</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          <div className="field">
            <label>Severity</label>
            <select
              className="select"
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
            >
              <option value="">All severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div className="field">
            <label>Stage</label>
            <select
              className="select"
              value={stage}
              onChange={(e) => setStage(e.target.value)}
            >
              <option value="">All stages</option>
              <option value="Threat">Threat</option>
              <option value="Action Plan">Action Plan</option>
            </select>
          </div>

          <div className="field">
            <label>SubRegion</label>
            <select
              className="select"
              value={sub}
              onChange={(e) => {
                setSub(e.target.value);
                setDist("");
              }}
            >
              <option value="">All SubRegions</option>
              {SIRA_SUBREGIONS.map((item) => (
                <option key={item.name}>{item.name}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>District</label>
            <select
              className="select"
              value={dist}
              onChange={(e) => setDist(e.target.value)}
              disabled={!sub}
            >
              <option value="">All districts</option>
              {districts.map((item) => (
                <option key={item.name}>{item.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="filter-meta">
          <span>
            Showing <b>{filtered.length}</b> of {data.length} incidents
            <i> - </i> {mappedIncidents.length} mapped
          </span>
          {activeFilters > 0 && (
            <button className="clear-filter-btn" onClick={clearFilters}>
              Clear {activeFilters} filter{activeFilters > 1 ? "s" : ""}
            </button>
          )}
        </div>
      </section>

      <section className="incident-workspace">
        <div className="incident-list-pane">
          <div className="section-heading">
            <div>
              <span className="eyebrow dark">Incident queue</span>
              <h3>Incident list</h3>
            </div>
            <span className="record-count">{filtered.length} records</span>
          </div>

          {loading ? (
            <div className="card empty">Loading incidents...</div>
          ) : filtered.length ? (
            <div className="incident-grid">
            <div className="sira-incident-table-head" aria-hidden="true">
              <span>Severity / Status</span>
              <span>Incident / ID</span>
              <span>Workflow</span>
              <span>Location</span>
              <span>Reported</span>
              <span>Action</span>
            </div>
              {filtered.map((incident) => (
                <IncidentRow
                  key={incident.id}
                  i={incident}
                  variant="tile"
                  selected={incident.id === selectedId}
                  onSelect={() => setSelectedId(incident.id)}
                />
              ))}
            </div>
          ) : (
            <div className="card empty">
              No incidents match these filters. Try clearing one or more filters.
            </div>
          )}
        </div>

        <aside className="incident-map-panel">
          <div className="map-panel-head">
            <div>
              <span className="map-live-dot" />
              <span className="eyebrow dark">Live incident map</span>
              <h3>
                {selectedIncident
                  ? getPublicIncidentCode(selectedIncident)
                  : "Incident locations"}
              </h3>
            </div>
            <span className="mapped-count">{mappedIncidents.length} pins</span>
          </div>

          <div className="incident-map-shell">
            <LeafletMap
              center={mapCenter}
              zoom={selectedIncident && hasValidCoordinates(selectedIncident) ? 11 : 6}
              incidents={mappedIncidents}
              selectedIncidentId={selectedId}
              onIncidentSelect={setSelectedId}
            />
          </div>

          <div className="map-selection-card">
            {selectedIncident ? (
              <>
                <div className="map-selection-top">
                  <div>
                    <span
                      className={`severity-dot ${String(selectedIncident.severity)}`}
                    />
                    <strong>{selectedIncident.title}</strong>
                  </div>
                  <span className={`badge ${selectedIncident.status}`}>
                    {getShortStatusLabel(selectedIncident.status)}
                  </span>
                </div>
                <p>
                  {selectedIncident.stage || "Threat"} - {" "}
                  {selectedIncident.sub_stage || "Reported"}
                </p>
                <div className="map-selection-location">
                  <span>
                    {selectedArea
                      ? `${selectedArea.subRegion} / ${selectedArea.name}`
                      : selectedIncident.city || "Location not classified"}
                  </span>
                </div>
                <Link
                  className="map-detail-link"
                  href={`/incident/${selectedIncident.id}`}
                >
                  Open incident details
                </Link>
              </>
            ) : (
              <p className="muted">
                Select an incident card or a map pin to inspect its location.
              </p>
            )}
          </div>
        </aside>
      </section>
    </>
  );
}




