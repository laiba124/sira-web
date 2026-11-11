"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import Icon, { type IconName } from "@/components/mobile/Icon";
import { IncidentClusterMap } from "@/components/mobile/MobileMaps";
import { formatCount, statusKey, type StatusKey } from "@/components/mobile/shared";
import { listIncidents } from "@/lib/incidents";
import {
  getSiraDistricts,
  getSiraRegion,
  getSiraRegionName,
  getSiraSubRegionBounds,
  inferSiraArea,
  normalizeSiraAreaText,
  SIRA_REGIONS,
  SIRA_SUBREGIONS,
  type SiraAreaBounds,
  type SiraDistrict,
  type SiraSubRegion,
} from "@/lib/siraAreas";
import type { SiraIncident } from "@/types/incident";

type FilterMode = "region" | "subregion" | "district" | null;
type StatusFilter = "all" | StatusKey;
type Option = { key: string; title: string; subtitle: string; icon: IconName; selected: boolean; onSelect: () => void };

export default function MobileMap() {
  const [incidents, setIncidents] = useState<SiraIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [panelOpen, setPanelOpen] = useState(true);
  const [filterMode, setFilterMode] = useState<FilterMode>(null);
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState<string | null>(null);
  const [subRegion, setSubRegion] = useState<string | null>(null);
  const [district, setDistrict] = useState<SiraDistrict | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [resetKey, setResetKey] = useState(0);

  useEffect(() => {
    listIncidents()
      .then(setIncidents)
      .catch((e) => setError(e?.message || "Map could not load."))
      .finally(() => setLoading(false));
  }, []);

  const classified = useMemo(() => incidents.map((incident) => ({ incident, area: inferSiraArea(incident) })), [incidents]);

  const visible = useMemo(
    () =>
      classified
        .filter(({ area }) => {
          if (district) {
            return (
              normalizeSiraAreaText(area?.subRegion) === normalizeSiraAreaText(district.subRegion) &&
              normalizeSiraAreaText(area?.name) === normalizeSiraAreaText(district.name)
            );
          }
          if (subRegion) return normalizeSiraAreaText(area?.subRegion) === normalizeSiraAreaText(subRegion);
          if (region) return normalizeSiraAreaText(getSiraRegionName(area?.subRegion)) === normalizeSiraAreaText(region);
          return true;
        })
        .map(({ incident }) => incident),
    [classified, district, subRegion, region]
  );

  const mapIncidents = useMemo(
    () => (statusFilter === "all" ? visible : visible.filter((i) => statusKey(i.status) === statusFilter)),
    [visible, statusFilter]
  );

  const counts = useMemo(() => {
    const result = { open: 0, in_progress: 0, resolved: 0 };
    visible.forEach((i) => {
      result[statusKey(i.status)] += 1;
    });
    return result;
  }, [visible]);

  const focusArea = useMemo<SiraAreaBounds | null>(() => {
    if (district) return district;
    if (subRegion) return getSiraSubRegionBounds(subRegion);
    if (region) return getSiraRegion(region);
    return null;
  }, [district, subRegion, region]);

  const areaLabel = district ? `${district.name}, ${district.subRegion}` : subRegion ?? (region ? `${region} Region` : "");
  const hasFilter = Boolean(region || subRegion || district || statusFilter !== "all");

  function close() {
    setFilterMode(null);
    setSearch("");
  }
  function selectRegion(name: string | null) {
    setRegion(name);
    setSubRegion(null);
    setDistrict(null);
    close();
  }
  function selectSubRegion(item: SiraSubRegion | null) {
    if (item) setRegion(getSiraRegionName(item.name));
    setSubRegion(item?.name ?? null);
    setDistrict(null);
    close();
  }
  function selectDistrict(item: SiraDistrict | null) {
    setDistrict(item);
    close();
  }
  function openFilter(mode: Exclude<FilterMode, null>) {
    if (mode === "district" && !subRegion) {
      window.alert("Select SubRegion first.\nChoose a SubRegion before selecting its District.");
      return;
    }
    setSearch("");
    setFilterMode(mode);
  }
  function resetAll() {
    if (hasFilter) {
      setRegion(null);
      setSubRegion(null);
      setDistrict(null);
      setStatusFilter("all");
    } else {
      setResetKey((k) => k + 1);
    }
  }
  function toggleStatus(status: StatusKey) {
    setStatusFilter((current) => (current === status ? "all" : status));
  }

  const options = useMemo<Option[]>(() => {
    const q = normalizeSiraAreaText(search);
    if (filterMode === "region") {
      return SIRA_REGIONS.filter((item) => normalizeSiraAreaText(item.name).includes(q)).map((item) => ({
        key: item.name,
        title: item.name,
        subtitle: `${item.subRegions.length} SubRegions • ${item.districtCount} districts`,
        icon: "globe",
        selected: normalizeSiraAreaText(region) === normalizeSiraAreaText(item.name),
        onSelect: () => selectRegion(item.name),
      }));
    }
    if (filterMode === "subregion") {
      const list = region ? getSiraRegion(region)?.subRegions ?? [] : SIRA_SUBREGIONS;
      return list
        .filter((item) => normalizeSiraAreaText(item.name).includes(q))
        .map((item) => ({
          key: item.name,
          title: item.name,
          subtitle: `${item.districts.length} districts`,
          icon: "layers",
          selected: normalizeSiraAreaText(subRegion) === normalizeSiraAreaText(item.name),
          onSelect: () => selectSubRegion(item),
        }));
    }
    if (filterMode === "district") {
      return getSiraDistricts(subRegion)
        .filter((item) => normalizeSiraAreaText(`${item.name} ${item.province}`).includes(q))
        .map((item) => ({
          key: `${item.subRegion}-${item.name}`,
          title: item.name,
          subtitle: item.province,
          icon: "location",
          selected:
            normalizeSiraAreaText(district?.name) === normalizeSiraAreaText(item.name) &&
            normalizeSiraAreaText(district?.subRegion) === normalizeSiraAreaText(item.subRegion),
          onSelect: () => selectDistrict(item),
        }));
    }
    return [];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterMode, search, region, subRegion, district]);

  const allOption =
    filterMode === "region"
      ? { title: "All Regions", subtitle: "Show all Fiber Risk markers", selected: !region, onSelect: () => selectRegion(null) }
      : filterMode === "subregion"
        ? {
            title: "All SubRegions",
            subtitle: region ? `Show all of the ${region} Region` : "Show all Fiber Risk markers",
            selected: !subRegion,
            onSelect: () => selectSubRegion(null),
          }
        : { title: "All Districts", subtitle: `Show all districts in ${subRegion}`, selected: !district, onSelect: () => selectDistrict(null) };

  const modalTitle = filterMode === "region" ? "Select Region" : filterMode === "subregion" ? "Select SubRegion" : "Select District";
  const modalSubtitle =
    filterMode === "region"
      ? "The map will filter and zoom to the selected Region"
      : filterMode === "subregion"
        ? region
          ? `SubRegions in the ${region} Region`
          : "The map will filter and zoom to the selected SubRegion"
        : `Districts tagged under ${subRegion ?? "the selected SubRegion"}`;

  return (
    <div className="m-map-screen">
      {panelOpen ? (
        <div className="m-map-panel">
          <div className="m-filter-row">
            <FilterButton icon="globe" value={region ?? "Region"} active={Boolean(region)} onClick={() => openFilter("region")} />
            <FilterButton icon="layers" value={subRegion ?? "SubRegion"} active={Boolean(subRegion)} onClick={() => openFilter("subregion")} />
            <FilterButton icon="location" value={district?.name ?? "District"} active={Boolean(district)} disabled={!subRegion} onClick={() => openFilter("district")} />
            <button type="button" className={hasFilter ? "m-reset-btn is-active" : "m-reset-btn"} aria-label="Reset filters and map view" onClick={resetAll}>
              <Icon name="refresh" size={14} color={hasFilter ? "#ffffff" : "#1267e8"} />
            </button>
          </div>
          <div className="m-map-stats">
            <MapStat label="Total Incidents" value={visible.length} color="#1267e8" tint="#eff6ff" icon active={statusFilter === "all"} onClick={() => setStatusFilter("all")} />
            <MapStat label="Open" value={counts.open} color="#dc2626" tint="#fef2f2" active={statusFilter === "open"} onClick={() => toggleStatus("open")} />
            <MapStat label="In Progress" value={counts.in_progress} color="#ea580c" tint="#fff7ed" active={statusFilter === "in_progress"} onClick={() => toggleStatus("in_progress")} />
            <MapStat label="Resolved" value={counts.resolved} color="#16a34a" tint="#f0fdf4" active={statusFilter === "resolved"} onClick={() => toggleStatus("resolved")} />
          </div>
        </div>
      ) : null}

      <div className="m-map-wrap">
        {loading ? (
          <div className="m-map-loading">
            <div className="spinner" />
            <span>Loading Fiber Risk map...</span>
          </div>
        ) : error ? (
          <div className="m-map-loading">
            <span>Map could not load: {error}</span>
          </div>
        ) : (
          <IncidentClusterMap incidents={mapIncidents} focusArea={focusArea} resetKey={resetKey} />
        )}

        <button
          type="button"
          className="m-panel-toggle"
          aria-label={panelOpen ? "Hide filters and show full map" : "Show filters"}
          onClick={() => setPanelOpen((open) => !open)}
        >
          <Icon name={panelOpen ? "expand" : "options"} size={21} color="#0f172a" />
        </button>

        {!panelOpen && areaLabel ? (
          <div className="m-area-chip">
            <Icon name="funnel" size={12} color="#1267e8" />
            <span>{areaLabel}</span>
          </div>
        ) : null}

        <div className="m-legend-bar">
          <span>
            <i className="m-dot" style={{ background: "#dc2626" }} />
            Open ({formatCount(counts.open)})
          </span>
          <b />
          <span>
            <i className="m-dot" style={{ background: "#f97316" }} />
            In Progress ({formatCount(counts.in_progress)})
          </span>
          <b />
          <span>
            <i className="m-dot" style={{ background: "#16a34a" }} />
            Resolved ({formatCount(counts.resolved)})
          </span>
        </div>

        <Link href="/report" className="m-fab m-fab-map" aria-label="Report a new incident">
          <Icon name="add" size={30} color="#ffffff" strokeWidth={2.4} />
        </Link>
      </div>

      {filterMode ? (
        <div className={filterMode === "region" ? "m-modal-backdrop" : "m-modal-backdrop is-top"} onClick={close}>
          <div className="m-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="m-modal-head">
              <div>
                <h3>{modalTitle}</h3>
                <p>{modalSubtitle}</p>
              </div>
              <button type="button" className="m-modal-close" aria-label="Close" onClick={close}>
                <Icon name="close" size={22} color="#334155" />
              </button>
            </div>

            {filterMode !== "region" ? (
              <label className="m-search m-search-modal">
                <Icon name="search" size={19} color="#64748b" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={filterMode === "subregion" ? "Search SubRegion..." : "Search District..."}
                  autoCorrect="off"
                  enterKeyHint="search"
                />
                {search ? (
                  <button type="button" aria-label="Clear search" onClick={() => setSearch("")}>
                    <Icon name="closeCircle" size={19} color="#94a3b8" />
                  </button>
                ) : null}
              </label>
            ) : (
              <div style={{ height: 10 }} />
            )}

            <div className="m-modal-list">
              <button type="button" className={allOption.selected ? "m-area-row is-selected" : "m-area-row"} onClick={allOption.onSelect}>
                <span className="m-area-icon is-all">
                  <Icon name="globe" size={20} color="#1267e8" />
                </span>
                <span className="m-area-text">
                  <strong>{allOption.title}</strong>
                  <small>{allOption.subtitle}</small>
                </span>
              </button>
              {options.length === 0 ? (
                <div className="m-empty">
                  <Icon name="search" size={30} color="#94a3b8" />
                  <span>No matching area found</span>
                </div>
              ) : (
                options.map((item) => (
                  <button key={item.key} type="button" className={item.selected ? "m-area-row is-selected" : "m-area-row"} onClick={item.onSelect}>
                    <span className="m-area-icon">
                      <Icon name={item.icon} size={19} color="#1267e8" />
                    </span>
                    <span className="m-area-text">
                      <strong>{item.title}</strong>
                      <small>{item.subtitle}</small>
                    </span>
                    <Icon name={item.selected ? "checkCircle" : "chevronRight"} size={item.selected ? 21 : 18} color={item.selected ? "#1267e8" : "#94a3b8"} />
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function FilterButton({ icon, value, active, disabled, onClick }: { icon: IconName; value: string; active: boolean; disabled?: boolean; onClick: () => void }) {
  return (
    <button type="button" className={active ? "m-filter-btn is-active" : "m-filter-btn"} disabled={disabled} onClick={onClick}>
      <Icon name={icon} size={14} color="#1267e8" />
      <span>{value}</span>
      <Icon name="chevronDown" size={12} color="#64748b" />
    </button>
  );
}

function MapStat({
  label,
  value,
  color,
  tint,
  icon,
  active,
  onClick,
}: {
  label: string;
  value: number;
  color: string;
  tint: string;
  icon?: boolean;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="m-map-stat"
      aria-pressed={active}
      style={{ background: tint, borderColor: active ? color : "transparent" }}
      onClick={onClick}
    >
      <span className="m-map-stat-top">
        {icon ? <Icon name="layers" size={12} color={color} /> : <i className="m-dot" style={{ background: color }} />}
        <strong style={{ color }}>{formatCount(value)}</strong>
      </span>
      <small>{label}</small>
    </button>
  );
}
