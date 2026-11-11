"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

import Icon from "@/components/mobile/Icon";
import { formatCount, statusKey } from "@/components/mobile/shared";
import { fetchAllRows } from "@/lib/fetchAllRows";
import { getSiraRegionName, inferSiraArea, SIRA_REGIONS } from "@/lib/siraAreas";
import { supabase } from "@/lib/supabase";

type Row = {
  id: string;
  status: string | null;
  severity: string | null;
  latitude: number | null;
  longitude: number | null;
  city: string | null;
  address_text: string | null;
};

type Classified = {
  status: "open" | "in_progress" | "resolved";
  severity: "critical" | "high" | "medium" | "low";
  region: string;
  subRegion: string;
  district: string;
};

type Segment = { key: string; label: string; count: number; color: string };

const SEVERITY = [
  { key: "critical", label: "Critical", color: "#e35d5d" },
  { key: "high", label: "High", color: "#f4a261" },
  { key: "medium", label: "Medium", color: "#f2cc60" },
  { key: "low", label: "Low", color: "#7cc8a4" },
] as const;

const REGION_PALETTE = ["#2a78d6", "#eb6834", "#1baf7a"];
const REGION_NAMES = SIRA_REGIONS.map((item) => item.name);
const REGION_COLOR: Record<string, string> = Object.fromEntries(
  REGION_NAMES.map((name, index) => [name, REGION_PALETTE[index] ?? "#94a3b8"])
);
const UNMAPPED = "Unmapped";
const BAR = "#2a78d6";

function pct(part: number, total: number) {
  if (!total) return "0%";
  const value = (part / total) * 100;
  return `${value < 10 && value > 0 ? value.toFixed(1) : Math.round(value)}%`;
}

function severityKey(severity: string | null): Classified["severity"] {
  if (severity === "critical" || severity === "high" || severity === "low") return severity;
  return "medium";
}

function rank(items: Classified[], pick: (item: Classified) => string) {
  const counts = new Map<string, number>();
  items.forEach((item) => {
    const key = pick(item);
    if (key) counts.set(key, (counts.get(key) ?? 0) + 1);
  });
  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

export default function MobileDashboard() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [region, setRegion] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const load = useCallback(async () => {
    setError("");
    const { data, error: loadError } = await fetchAllRows<Row>((from, to) =>
      supabase
        .from("sira_incidents")
        .select("id, status, severity, latitude, longitude, city, address_text")
        .eq("incident_type", "fiber_network_risk")
        .order("id")
        .range(from, to)
    );
    if (loadError) setError(loadError.message);
    else setRows(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const classified = useMemo<Classified[]>(
    () =>
      rows.map((row) => {
        const area = inferSiraArea(row);
        return {
          status: statusKey(row.status),
          severity: severityKey(row.severity),
          region: area ? getSiraRegionName(area.subRegion) : UNMAPPED,
          subRegion: area?.subRegion ?? "",
          district: area?.name ?? "",
        };
      }),
    [rows]
  );

  const scoped = useMemo(() => (region ? classified.filter((item) => item.region === region) : classified), [classified, region]);
  const total = scoped.length;

  const stats = useMemo(() => {
    const status = { open: 0, in_progress: 0, resolved: 0 };
    const severity = { critical: 0, high: 0, medium: 0, low: 0 };
    scoped.forEach((item) => {
      status[item.status] += 1;
      severity[item.severity] += 1;
    });
    return { status, severity };
  }, [scoped]);

  const regionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    classified.forEach((item) => {
      counts[item.region] = (counts[item.region] ?? 0) + 1;
    });
    return counts;
  }, [classified]);

  const subRegions = useMemo(() => rank(scoped, (item) => item.subRegion), [scoped]);
  const districts = useMemo(() => rank(scoped, (item) => item.district).slice(0, 5), [scoped]);

  const severitySegments: Segment[] = SEVERITY.map((item) => ({ key: item.key, label: item.label, count: stats.severity[item.key], color: item.color }));
  const regionSegments: Segment[] = [
    ...REGION_NAMES.map((name) => ({ key: name, label: name, count: regionCounts[name] ?? 0, color: REGION_COLOR[name] })),
    ...(regionCounts[UNMAPPED] ? [{ key: UNMAPPED, label: UNMAPPED, count: regionCounts[UNMAPPED], color: "#94a3b8" }] : []),
  ];
  const visibleSubRegions = showAll ? subRegions : subRegions.slice(0, 5);
  const accent = region ? REGION_COLOR[region] ?? BAR : BAR;

  return (
    <div className="m-page">
      <div className="m-heading-row">
        <h1 className="m-h1">Dashboard</h1>
        <button
          type="button"
          className="m-square-btn"
          aria-label="Refresh dashboard"
          onClick={() => {
            setLoading(true);
            load();
          }}
        >
          <Icon name="refresh" size={18} color="#1267e8" />
        </button>
      </div>

      <div className="m-chip-row">
        <button type="button" className={!region ? "m-chip is-active" : "m-chip"} onClick={() => setRegion(null)}>
          All Regions
        </button>
        {REGION_NAMES.map((name) => (
          <button key={name} type="button" className={region === name ? "m-chip is-active" : "m-chip"} onClick={() => setRegion(region === name ? null : name)}>
            <i className="m-dot" style={{ background: REGION_COLOR[name] }} />
            {name}
          </button>
        ))}
      </div>

      {error ? <div className="m-error">Dashboard could not load: {error}</div> : null}

      {loading ? (
        <div className="m-loading">
          <div className="spinner" />
          <span>Loading dashboard...</span>
        </div>
      ) : (
        <>
          <div className="m-kpi-grid">
            <Kpi label="Total Incidents" value={total} color="#1267e8" />
            <Kpi label="Open" value={stats.status.open} color="#dc2626" />
            <Kpi label="In Progress" value={stats.status.in_progress} color="#ea580c" />
            <Kpi label="Resolved" value={stats.status.resolved} color="#16a34a" />
          </div>

          <Card title="Risk level">
            <div className="m-pie-row">
              <Donut segments={severitySegments} total={total}>
                <strong>{formatCount(total)}</strong>
                <span>incidents</span>
              </Donut>
              <div className="m-pie-legend">
                {severitySegments.map((item) => (
                  <div key={item.key} className="m-pie-legend-row">
                    <i className="m-dot" style={{ background: item.color }} />
                    <span>{item.label}</span>
                    <b>{formatCount(item.count)}</b>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {!region ? (
            <Card title="Regions">
              <div className="m-stack-bar">
                {regionSegments.some((s) => s.count > 0) ? (
                  regionSegments.filter((s) => s.count > 0).map((s) => <i key={s.key} style={{ flex: s.count, background: s.color }} />)
                ) : (
                  <i style={{ flex: 1, background: "#eef2f7" }} />
                )}
              </div>
              <div className="m-legend">
                {regionSegments.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    className="m-legend-row"
                    disabled={item.key === UNMAPPED}
                    onClick={() => item.key !== UNMAPPED && setRegion(item.key)}
                  >
                    <i className="m-dot" style={{ background: item.color }} />
                    <span>{item.label}</span>
                    <b>{formatCount(item.count)}</b>
                    <em>{pct(item.count, classified.length)}</em>
                  </button>
                ))}
              </div>
            </Card>
          ) : null}

          <Card title={region ? `${region} SubRegions` : "SubRegions"}>
            {subRegions.length ? (
              <>
                <div className="m-ranked">
                  {visibleSubRegions.map((item) => (
                    <div key={item.label}>
                      <div className="m-ranked-top">
                        <span>{item.label}</span>
                        <b>{formatCount(item.count)}</b>
                        <em>{pct(item.count, total)}</em>
                      </div>
                      <div className="m-ranked-track">
                        <i style={{ width: `${Math.max(2, (item.count / Math.max(1, subRegions[0].count)) * 100)}%`, background: accent }} />
                      </div>
                    </div>
                  ))}
                </div>
                {subRegions.length > 5 ? (
                  <button type="button" className="m-more-btn" onClick={() => setShowAll((v) => !v)}>
                    {showAll ? "Show less" : `Show all ${subRegions.length}`}
                    <Icon name={showAll ? "chevronUp" : "chevronDown"} size={14} color="#1267e8" />
                  </button>
                ) : null}
              </>
            ) : (
              <Empty />
            )}
          </Card>

          <Card title="Top districts">
            {districts.length ? (
              <div>
                {districts.map((item, index) => (
                  <div key={item.label} className="m-rank-row">
                    <span className="m-rank-badge" style={index === 0 ? { background: accent, color: "#fff" } : undefined}>
                      {index + 1}
                    </span>
                    <span className="m-rank-name">{item.label}</span>
                    <b>{formatCount(item.count)}</b>
                  </div>
                ))}
              </div>
            ) : (
              <Empty />
            )}
          </Card>
        </>
      )}
    </div>
  );
}

function Kpi({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="m-kpi">
      <div className="m-kpi-top">
        <i className="m-dot" style={{ background: color, width: 7, height: 7 }} />
        <span>{label}</span>
      </div>
      <strong>{formatCount(value)}</strong>
    </div>
  );
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="m-card">
      <h2 className="m-card-title">{title}</h2>
      {children}
    </section>
  );
}

// Severity donut drawn with a conic gradient and thin white gaps.
function Donut({ segments, total, children }: { segments: Segment[]; total: number; children: ReactNode }) {
  let angle = 0;
  const stops: string[] = [];
  if (total > 0) {
    segments
      .filter((s) => s.count > 0)
      .forEach((s, index, list) => {
        const sweep = (s.count / total) * 360;
        const gap = list.length > 1 ? 1 : 0;
        stops.push(`${s.color} ${angle + gap}deg ${angle + sweep}deg`);
        if (gap) stops.push(`#ffffff ${angle + sweep}deg ${angle + sweep + gap}deg`);
        angle += sweep;
      });
  }
  const background = stops.length ? `conic-gradient(${stops.join(", ")})` : "#eef2f7";
  return (
    <div className="m-donut" style={{ background }}>
      <div className="m-donut-core">{children}</div>
    </div>
  );
}

function Empty() {
  return (
    <div className="m-empty-small">
      <Icon name="map" size={22} color="#94a3b8" />
      <span>No area data yet</span>
    </div>
  );
}
