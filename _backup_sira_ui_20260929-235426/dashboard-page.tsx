"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import PageHeader from "@/components/PageHeader";
import IncidentRow from "@/components/IncidentRow";
import LeafletMap from "@/components/LeafletMap";

import { listIncidents } from "@/lib/incidents";
import { inferSiraArea } from "@/lib/siraAreas";

import type { SiraIncident } from "@/types/incident";

import {
  getPublicIncidentCode,
  getShortStatusLabel,
} from "@/types/incident";

const PAKISTAN_CENTER = {
  latitude: 30.3753,
  longitude: 69.3451,
};

const SUBSTAGES = [
  "Reported",
  "Assessment",
  "Avoidance Validation",
  "Formulation",
  "Implementation",
];

type StatusFilter = "" | "open" | "in_progress" | "resolved";

function normalizeStatus(status: string): StatusFilter {
  if (status === "resolved") return "resolved";

  if (
    status === "in_progress" ||
    status === "under_review"
  ) {
    return "in_progress";
  }

  return "open";
}

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

export default function Dashboard() {
  const [data, setData] = useState<SiraIncident[]>([]);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("");

  const [severityFilter, setSeverityFilter] =
    useState("");

  const [stageFilter, setStageFilter] =
    useState("");

  const [subStageFilter, setSubStageFilter] =
    useState("");

  const [selectedId, setSelectedId] =
    useState<string | null>(null);

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

  /* ========================================================
     SUMMARY COUNTS
     ======================================================== */

  const stats = useMemo(() => {
    return {
      total: data.length,

      open: data.filter(
        (incident) =>
          normalizeStatus(incident.status) === "open"
      ).length,

      progress: data.filter(
        (incident) =>
          normalizeStatus(incident.status) === "in_progress"
      ).length,

      resolved: data.filter(
        (incident) =>
          normalizeStatus(incident.status) === "resolved"
      ).length,

      threat: data.filter(
        (incident) =>
          (incident.stage || "Threat") === "Threat"
      ).length,

      action: data.filter(
        (incident) =>
          incident.stage === "Action Plan"
      ).length,
    };
  }, [data]);

  /* ========================================================
     FILTERED INCIDENTS
     ======================================================== */

  const filtered = useMemo(() => {
    return data.filter((incident) => {
      const normalized = normalizeStatus(incident.status);

      return (
        (!statusFilter || normalized === statusFilter) &&
        (!severityFilter ||
          incident.severity === severityFilter) &&
        (!stageFilter ||
          (incident.stage || "Threat") === stageFilter) &&
        (!subStageFilter ||
          (incident.sub_stage || "Reported") === subStageFilter)
      );
    });
  }, [
    data,
    statusFilter,
    severityFilter,
    stageFilter,
    subStageFilter,
  ]);

  const mappedIncidents = useMemo(
    () => filtered.filter(hasValidCoordinates),
    [filtered]
  );

  /* ========================================================
     SELECT FIRST INCIDENT AFTER FILTER CHANGE
     ======================================================== */

  useEffect(() => {
    if (!filtered.length) {
      setSelectedId(null);
      return;
    }

    if (
      !selectedId ||
      !filtered.some(
        (incident) => incident.id === selectedId
      )
    ) {
      setSelectedId(filtered[0].id);
    }
  }, [filtered, selectedId]);

  const selectedIncident =
    filtered.find(
      (incident) => incident.id === selectedId
    ) ?? null;

  const selectedArea = selectedIncident
    ? inferSiraArea(selectedIncident)
    : null;

  const mapCenter =
    selectedIncident &&
    hasValidCoordinates(selectedIncident)
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

  /* ========================================================
     SEVERITY COUNTS
     ======================================================== */

  const severityCounts = useMemo(() => {
    return {
      critical: data.filter(
        (i) => i.severity === "critical"
      ).length,

      high: data.filter(
        (i) => i.severity === "high"
      ).length,

      medium: data.filter(
        (i) => i.severity === "medium"
      ).length,

      low: data.filter(
        (i) => i.severity === "low"
      ).length,
    };
  }, [data]);

  const subStageCounts = useMemo(() => {
    return SUBSTAGES.map((subStage) => ({
      name: subStage,

      count: data.filter(
        (incident) =>
          (incident.sub_stage || "Reported") === subStage
      ).length,
    }));
  }, [data]);

  const activeFilterCount = [
    statusFilter,
    severityFilter,
    stageFilter,
    subStageFilter,
  ].filter(Boolean).length;

  function clearFilters() {
    setStatusFilter("");
    setSeverityFilter("");
    setStageFilter("");
    setSubStageFilter("");
  }

  function selectStatus(value: StatusFilter) {
    setStatusFilter(value);
  }

  function toggleSeverity(value: string) {
    setSeverityFilter((current) =>
      current === value ? "" : value
    );
  }

  function toggleStage(value: string) {
    setStageFilter((current) =>
      current === value ? "" : value
    );

    setSubStageFilter("");
  }

  function toggleSubStage(value: string) {
    setSubStageFilter((current) =>
      current === value ? "" : value
    );
  }

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Live incident and workflow overview"
        actions={
          <>
            <button
              className="btn"
              onClick={load}
            >
              Refresh
            </button>

            <Link
              className="btn primary"
              href="/report"
            >
              + Report Incident
            </Link>
          </>
        }
      />

      <section className="dashboard-command-workspace">
        {/* ==================================================
            LEFT SIDE
            ================================================== */}

        <div className="dashboard-left-pane">

          <div className="dashboard-section-heading">
            <div>
              <span className="eyebrow dark">
                Live incident overview
              </span>

              <h2>Incident summary</h2>
            </div>

            <span className="dashboard-live-indicator">
              <i />
              Live
            </span>
          </div>

          {/* ================================================
              COMPACT KPI FILTER CARDS
              ================================================ */}

          <div className="dashboard-summary-grid">

            <button
              type="button"
              className={`dashboard-summary-card total ${
                statusFilter === "" ? "active" : ""
              }`}
              onClick={() => selectStatus("")}
            >
              <span className="summary-card-top">
                <span>Total incidents</span>
                <i />
              </span>

              <strong>{stats.total}</strong>

              <small>All reported risks</small>
            </button>

            <button
              type="button"
              className={`dashboard-summary-card open ${
                statusFilter === "open" ? "active" : ""
              }`}
              onClick={() => selectStatus("open")}
            >
              <span className="summary-card-top">
                <span>Open</span>
                <i />
              </span>

              <strong>{stats.open}</strong>

              <small>Requires attention</small>
            </button>

            <button
              type="button"
              className={`dashboard-summary-card progress ${
                statusFilter === "in_progress"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                selectStatus("in_progress")
              }
            >
              <span className="summary-card-top">
                <span>In progress</span>
                <i />
              </span>

              <strong>{stats.progress}</strong>

              <small>Being handled</small>
            </button>

            <button
              type="button"
              className={`dashboard-summary-card resolved ${
                statusFilter === "resolved"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                selectStatus("resolved")
              }
            >
              <span className="summary-card-top">
                <span>Resolved</span>
                <i />
              </span>

              <strong>{stats.resolved}</strong>

              <small>Closed incidents</small>
            </button>

          </div>

          {/* ================================================
              COMPACT FILTER GROUPS
              ================================================ */}

          <div className="dashboard-filter-strip">

            <div className="dashboard-filter-group">
              <span className="dashboard-filter-label">
                Severity
              </span>

              <div className="dashboard-chip-row">

                <button
                  type="button"
                  className={`dashboard-filter-chip critical ${
                    severityFilter === "critical"
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    toggleSeverity("critical")
                  }
                >
                  Critical
                  <b>{severityCounts.critical}</b>
                </button>

                <button
                  type="button"
                  className={`dashboard-filter-chip high ${
                    severityFilter === "high"
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    toggleSeverity("high")
                  }
                >
                  High
                  <b>{severityCounts.high}</b>
                </button>

                <button
                  type="button"
                  className={`dashboard-filter-chip medium ${
                    severityFilter === "medium"
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    toggleSeverity("medium")
                  }
                >
                  Medium
                  <b>{severityCounts.medium}</b>
                </button>

                <button
                  type="button"
                  className={`dashboard-filter-chip low ${
                    severityFilter === "low"
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    toggleSeverity("low")
                  }
                >
                  Low
                  <b>{severityCounts.low}</b>
                </button>

              </div>
            </div>

            <div className="dashboard-filter-group">
              <span className="dashboard-filter-label">
                Stage
              </span>

              <div className="dashboard-chip-row">

                <button
                  type="button"
                  className={`dashboard-stage-chip ${
                    stageFilter === "Threat"
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    toggleStage("Threat")
                  }
                >
                  Threat
                  <b>{stats.threat}</b>
                </button>

                <button
                  type="button"
                  className={`dashboard-stage-chip ${
                    stageFilter === "Action Plan"
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    toggleStage("Action Plan")
                  }
                >
                  Action Plan
                  <b>{stats.action}</b>
                </button>

              </div>
            </div>

          </div>

          {/* ================================================
              WORKFLOW POSITION
              ================================================ */}

          <div className="dashboard-workflow-heading">
            <div>
              <span className="dashboard-filter-label">
                Workflow position
              </span>

              <span className="dashboard-workflow-help">
                Select a workflow stage to filter the list and map
              </span>
            </div>

            {activeFilterCount > 0 && (
              <button
                type="button"
                className="dashboard-clear-filter"
                onClick={clearFilters}
              >
                Clear filters
              </button>
            )}
          </div>

          <div className="dashboard-workflow-grid">
            {subStageCounts.map((item) => (
              <button
                type="button"
                key={item.name}
                className={`dashboard-workflow-item ${
                  subStageFilter === item.name
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  toggleSubStage(item.name)
                }
              >
                <strong>{item.count}</strong>
                <span>{item.name}</span>
              </button>
            ))}
          </div>

          {/* ================================================
              INCIDENT QUEUE
              ================================================ */}

          <div className="dashboard-queue-heading">

            <div>
              <span className="eyebrow dark">
                Incident queue
              </span>

              <h3>
                {activeFilterCount
                  ? "Filtered incidents"
                  : "Active risk records"}
              </h3>
            </div>

            <div className="dashboard-queue-actions">
              <span className="record-count">
                {filtered.length} records
              </span>

              <Link
                href="/incidents"
                className="dashboard-view-all"
              >
                View all
              </Link>
            </div>

          </div>

          {loading ? (
            <div className="card empty">
              Loading incidents...
            </div>
          ) : filtered.length ? (
            <div className="incident-grid dashboard-incident-list">
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
                  selected={
                    incident.id === selectedId
                  }
                  onSelect={() =>
                    setSelectedId(incident.id)
                  }
                />
              ))}

            </div>
          ) : (
            <div className="dashboard-no-results">
              <strong>No incidents found</strong>

              <span>
                No incidents match the selected dashboard
                filters.
              </span>

              <button
                type="button"
                onClick={clearFilters}
              >
                Clear filters
              </button>
            </div>
          )}

        </div>

        {/* ==================================================
            RIGHT SIDE MAP
            ================================================== */}

        <aside className="incident-map-panel dashboard-map-panel">

          <div className="map-panel-head">
            <div>
              <span className="map-live-dot" />

              <span className="eyebrow dark">
                Live incident map
              </span>

              <h3>
                {selectedIncident
                  ? getPublicIncidentCode(
                      selectedIncident
                    )
                  : "Incident locations"}
              </h3>
            </div>

            <span className="mapped-count">
              {mappedIncidents.length} pins
            </span>
          </div>

          <div className="incident-map-shell">

            <LeafletMap
              center={mapCenter}
              zoom={
                selectedIncident &&
                hasValidCoordinates(selectedIncident)
                  ? 11
                  : 6
              }
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
                      className={`severity-dot ${String(
                        selectedIncident.severity
                      )}`}
                    />

                    <strong>
                      {selectedIncident.title}
                    </strong>

                  </div>

                  <span
                    className={`badge ${selectedIncident.status}`}
                  >
                    {getShortStatusLabel(
                      selectedIncident.status
                    )}
                  </span>
                </div>

                <p>
                  {selectedIncident.stage || "Threat"}
                  {" - "}
                  {selectedIncident.sub_stage ||
                    "Reported"}
                </p>

                <div className="map-selection-location">
                  <span></span>

                  <span>
                    {selectedArea
                      ? `${selectedArea.subRegion} / ${selectedArea.name}`
                      : selectedIncident.city ||
                        "Location not classified"}
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
                Select an incident from the dashboard
                to inspect its map location.
              </p>
            )}

          </div>

        </aside>

      </section>
    </>
  );
}


