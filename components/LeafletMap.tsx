"use client";

import { useEffect, useRef, useState } from "react";
import type { SiraIncident } from "@/types/incident";
import {
  getPublicIncidentCode,
  getShortStatusLabel,
} from "@/types/incident";
import { inferSiraArea } from "@/lib/siraAreas";
import { loadLeaflet } from "@/lib/leafletLoader";

type Point = { latitude: number; longitude: number };

type Props = {
  center: Point;
  zoom?: number;
  incidents?: SiraIncident[];
  selected?: Point | null;
  interactivePin?: boolean;
  onPinChange?: (point: Point) => void;
  compact?: boolean;
  selectedIncidentId?: string | null;
  onIncidentSelect?: (incidentId: string) => void;
};

const PAKISTAN_BOUNDS: [[number, number], [number, number]] = [
  [23.3, 60.5],
  [37.3, 77.8],
];

export default function LeafletMap({
  center,
  zoom = 6,
  incidents = [],
  selected,
  interactivePin = false,
  onPinChange,
  compact = false,
  selectedIncidentId = null,
  onIncidentSelect,
}: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerLayerRef = useRef<any>(null);
  const incidentMarkersRef = useRef<Map<string, any>>(new Map());
  const pinRef = useRef<any>(null);
  const onPinRef = useRef(onPinChange);
  const interactiveRef = useRef(interactivePin);
  const onIncidentSelectRef = useRef(onIncidentSelect);
  const selectedIdRef = useRef(selectedIncidentId);
  const selectedMarkerIdRef = useRef<string | null>(null);
  const [ready, setReady] = useState(false);
  const [markersVersion, setMarkersVersion] = useState(0);

  onPinRef.current = onPinChange;
  interactiveRef.current = interactivePin;
  onIncidentSelectRef.current = onIncidentSelect;
  selectedIdRef.current = selectedIncidentId;

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!hostRef.current || mapRef.current) return;

      const L = await loadLeaflet();
      if (cancelled || !hostRef.current) return;

      const map = L.map(hostRef.current, {
        scrollWheelZoom: true,
        minZoom: 5,
        maxBounds: PAKISTAN_BOUNDS,
        maxBoundsViscosity: 0.7,
        zoomControl: true,
      }).setView([center.latitude, center.longitude], zoom);

      const street = L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          maxZoom: 19,
          attribution: "© OpenStreetMap contributors",
        }
      );

      const satellite = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          maxZoom: 19,
          attribution: "Tiles © Esri",
        }
      );

      street.addTo(map);
      L.control
        .layers(
          { Standard: street, Satellite: satellite },
          undefined,
          { position: "bottomright", collapsed: true }
        )
        .addTo(map);

      markerLayerRef.current = L.markerClusterGroup({
        iconCreateFunction: clusterIcon(L),
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
        spiderfyOnMaxZoom: true,
        spiderfyDistanceMultiplier: 1.4,
        spiderLegPolylineOptions: { weight: 1.5, color: "#1267e8", opacity: 0.6 },
        chunkedLoading: true,
        removeOutsideVisibleBounds: true,
        // Smaller merge radius when zoomed in so city groups split into streets.
        maxClusterRadius: (z: number) => (z <= 8 ? 50 : z <= 12 ? 45 : 35),
      }).addTo(map);

      map.on("click", (event: any) => {
        if (!interactiveRef.current) return;
        onPinRef.current?.({
          latitude: event.latlng.lat,
          longitude: event.latlng.lng,
        });
      });

      mapRef.current = map;
      setReady(true);
      setTimeout(() => map.invalidateSize(), 60);
    })();

    return () => {
      cancelled = true;
      setReady(false);
      incidentMarkersRef.current.clear();
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!selectedIncidentId) {
      map.setView([center.latitude, center.longitude], zoom, { animate: true });
    }
  }, [center.latitude, center.longitude, zoom, ready, selectedIncidentId]);

  // Build markers only when the incident list changes; selection is handled
  // separately so picking an incident doesn't rebuild every cluster.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const map = mapRef.current;
      const layer = markerLayerRef.current;
      if (!map || !layer) return;

      const L = await loadLeaflet();
      if (cancelled) return;

      layer.clearLayers();
      incidentMarkersRef.current.clear();
      selectedMarkerIdRef.current = null;

      const markers: any[] = [];
      const points: [number, number][] = [];

      incidents.forEach((incident) => {
        const lat = Number(incident.latitude);
        const lng = Number(incident.longitude);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

        const severity = severityKey(incident.severity);
        const marker = L.marker([lat, lng], {
          icon: incidentIcon(L, severity, false),
          riseOnHover: true,
          siraSeverity: severity,
        }).bindPopup(() => incidentPopup(incident), {
          closeButton: false,
          offset: [0, -4],
        });

        marker.on("click", () => {
          onIncidentSelectRef.current?.(incident.id);
        });

        markers.push(marker);
        points.push([lat, lng]);
        incidentMarkersRef.current.set(incident.id, marker);
      });

      // Bulk add is far faster than adding markers one by one.
      layer.addLayers(markers);
      setMarkersVersion((version) => version + 1);

      if (!selectedIdRef.current && points.length > 1) {
        const bounds = L.latLngBounds(points);
        if (bounds.isValid()) {
          map.fitBounds(bounds.pad(0.18), { maxZoom: 10, animate: true });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [incidents, ready]);

  useEffect(() => {
    let cancelled = false;
    let cleanupRef: (() => void) | null = null;

    (async () => {
      const map = mapRef.current;
      const layer = markerLayerRef.current;
      if (!map || !layer) return;

      const L = await loadLeaflet();
      if (cancelled) return;

      const previousId = selectedMarkerIdRef.current;
      if (previousId && previousId !== selectedIncidentId) {
        const previous = incidentMarkersRef.current.get(previousId);
        previous?.setIcon(
          incidentIcon(L, previous.options.siraSeverity, false)
        );
      }
      selectedMarkerIdRef.current = null;

      if (!selectedIncidentId) return;
      const marker = incidentMarkersRef.current.get(selectedIncidentId);
      if (!marker) return;

      marker.setIcon(incidentIcon(L, marker.options.siraSeverity, true));
      selectedMarkerIdRef.current = selectedIncidentId;

      // Not using the plugin's zoomToShowLayer(): it leaves a moveend listener
      // behind when the marker never shows, and that listener crashes
      // ("'_leaflet_id' in undefined") once markers are rebuilt. Every
      // listener registered here is removed in the effect cleanup instead.
      let steps = 0;
      const openWhenSpiderfied = () => {
        if (!cancelled && layer.hasLayer(marker)) marker.openPopup();
      };

      const reveal = () => {
        if (cancelled || !layer.hasLayer(marker)) return;

        const parent = layer.getVisibleParent(marker);
        if (parent === marker) {
          marker.openPopup();
          return;
        }
        if (!parent) return;

        // Still inside a cluster: zoom into it a few times, then fan it out.
        if (steps < 4 && map.getZoom() < map.getMaxZoom()) {
          steps += 1;
          map.once("moveend", reveal);
          parent.zoomToBounds({ padding: [40, 40] });
        } else {
          layer.once("spiderfied", openWhenSpiderfied);
          parent.spiderfy();
        }
      };
      cleanupRef = () => {
        map.off("moveend", reveal);
        layer.off("spiderfied", openWhenSpiderfied);
      };

      map.once("moveend", reveal);
      map.flyTo(marker.getLatLng(), Math.max(map.getZoom(), 11), {
        animate: true,
        duration: 0.65,
      });
    })();

    return () => {
      cancelled = true;
      cleanupRef?.();
    };
  }, [selectedIncidentId, markersVersion, ready]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const map = mapRef.current;
      if (!map) return;

      const L = await loadLeaflet();
      if (cancelled) return;

      if (!selected) {
        if (pinRef.current) map.removeLayer(pinRef.current);
        pinRef.current = null;
        return;
      }

      const icon = L.divIcon({
        className: "",
        html: `<div style="width:22px;height:22px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:#1267e8;border:4px solid white;box-shadow:0 4px 12px rgba(15,23,42,.42)"></div>`,
        iconSize: [27, 27],
        iconAnchor: [13, 25],
      });

      if (!pinRef.current) {
        pinRef.current = L.marker(
          [selected.latitude, selected.longitude],
          { icon, draggable: interactivePin }
        ).addTo(map);

        pinRef.current.on("dragend", (event: any) => {
          const point = event.target.getLatLng();
          onPinRef.current?.({
            latitude: point.lat,
            longitude: point.lng,
          });
        });
      } else {
        pinRef.current.setLatLng([selected.latitude, selected.longitude]);

        if (interactivePin) pinRef.current.dragging?.enable();
        else pinRef.current.dragging?.disable();
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selected?.latitude, selected?.longitude, interactivePin, ready]);

  return (
    <div
      ref={hostRef}
      className={compact ? "map-canvas compact" : "map-canvas"}
    />
  );
}

type SeverityKey = "critical" | "high" | "medium" | "low";

const SEVERITY_COLORS: Record<SeverityKey, string> = {
  critical: "#dc2626",
  high: "#f97316",
  medium: "#eab308",
  low: "#16a34a",
};

const SEVERITY_ORDER: SeverityKey[] = ["critical", "high", "medium", "low"];

function severityKey(value: unknown): SeverityKey {
  const key = String(value || "medium").toLowerCase();
  return key in SEVERITY_COLORS ? (key as SeverityKey) : "medium";
}

function incidentIcon(L: any, severity: SeverityKey, selected: boolean) {
  return L.divIcon({
    className: "sira-marker-wrapper",
    html: `<div class="sira-marker ${selected ? "is-selected" : ""}" style="--marker-color:${SEVERITY_COLORS[severity]}"><span></span></div>`,
    iconSize: selected ? [38, 44] : [30, 36],
    iconAnchor: selected ? [19, 42] : [15, 34],
    popupAnchor: [0, -32],
  });
}

// Cluster bubble: ring split by the severity mix inside, white core with the
// count. Size grows with log(count) so 10 / 100 / 1,000 read differently.
function clusterIcon(L: any) {
  return (cluster: any) => {
    const children = cluster.getAllChildMarkers();
    const tally: Record<SeverityKey, number> = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    };
    children.forEach((m: any) => {
      tally[severityKey(m.options.siraSeverity)] += 1;
    });

    const total = children.length;
    let angle = 0;
    const stops = SEVERITY_ORDER.filter((key) => tally[key] > 0).map((key) => {
      const from = angle;
      angle += (tally[key] / total) * 360;
      return `${SEVERITY_COLORS[key]} ${from}deg ${angle}deg`;
    });

    const label = total.toLocaleString("en-US");
    const size = Math.round(Math.min(64, Math.max(34, 34 + 8 * Math.log10(total))));
    const font = label.length >= 5 ? 12 : label.length === 4 ? 13 : 14;

    return L.divIcon({
      className: "sira-cluster",
      iconSize: [size, size],
      html: `<div class="sira-cluster-ring" style="background:conic-gradient(${stops.join(", ")})"><div class="sira-cluster-core" style="font-size:${font}px">${label}</div></div>`,
    });
  };
}

function incidentPopup(incident: SiraIncident) {
  const area = inferSiraArea(incident);
  const location = area
    ? `${area.subRegion} / ${area.name}`
    : incident.city || "Location not classified";

  return `
    <div class="sira-popup">
      <div class="sira-popup-code">${escapeHtml(getPublicIncidentCode(incident))}</div>
      <strong>${escapeHtml(incident.title)}</strong>
      <div class="sira-popup-pills">
        <span>${escapeHtml(String(incident.severity || "medium").toUpperCase())}</span>
        <span>${escapeHtml(getShortStatusLabel(incident.status))}</span>
      </div>
      <p>${escapeHtml(String(incident.stage || "Threat"))} - ${escapeHtml(String(incident.sub_stage || "Reported"))}</p>
      <p>${escapeHtml(location)}</p>
      <a href="/incident/${encodeURIComponent(incident.id)}">Open incident details</a>
    </div>
  `;
}

function escapeHtml(value: string) {
  return value.replace(
    /[&<>'"]/g,
    (character) =>
      (
        {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          "'": "&#39;",
          '"': "&quot;",
        } as Record<string, string>
      )[character] || character
  );
}
