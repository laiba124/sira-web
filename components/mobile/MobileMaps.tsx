"use client";

import { useEffect, useRef } from "react";

import { loadLeaflet } from "@/lib/leafletLoader";
import type { SiraAreaBounds } from "@/lib/siraAreas";
import type { SiraIncident } from "@/types/incident";
import { openIncidentDetails, statusKey } from "@/components/mobile/shared";

const PK_CENTER: [number, number] = [30.3753, 69.3451];
const STATUS_COLORS = { open: "#dc2626", in_progress: "#f97316", resolved: "#16a34a" } as const;

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function addBaseLayers(L: any, map: any, position: string) {
  const street = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "© OpenStreetMap contributors",
  });
  const satellite = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    { maxZoom: 19, attribution: "Tiles © Esri" }
  );
  street.addTo(map);
  L.control.layers({ Map: street, Satellite: satellite }, undefined, { position, collapsed: true }).addTo(map);
}

// ---- Incident map with status clusters ----------------------------------------

function clusterIcon(L: any) {
  return (cluster: any) => {
    const children = cluster.getAllChildMarkers();
    const tally = { open: 0, in_progress: 0, resolved: 0 };
    children.forEach((m: any) => {
      tally[m.options.siraStatus as keyof typeof tally] += 1;
    });
    const total = children.length;
    const a = (tally.open / total) * 360;
    const b = a + (tally.in_progress / total) * 360;
    const ring = `conic-gradient(${STATUS_COLORS.open} 0deg ${a}deg, ${STATUS_COLORS.in_progress} ${a}deg ${b}deg, ${STATUS_COLORS.resolved} ${b}deg 360deg)`;
    const label = String(total).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    const size = Math.round(Math.min(64, Math.max(34, 34 + 8 * Math.log10(total))));
    const font = label.length >= 5 ? 12 : label.length === 4 ? 13 : 14;
    return L.divIcon({
      className: "m-cluster",
      iconSize: [size, size],
      html: `<div class="m-cluster-ring" style="background:${ring}"><div class="m-cluster-core" style="font-size:${font}px">${label}</div></div>`,
    });
  };
}

export function IncidentClusterMap({
  incidents,
  focusArea,
  resetKey,
}: {
  incidents: SiraIncident[];
  focusArea: SiraAreaBounds | null;
  resetKey: number;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const layerRef = useRef<any>(null);
  const pointsRef = useRef<[number, number][]>([]);
  const focusRef = useRef(focusArea);
  focusRef.current = focusArea;

  function fitView() {
    const map = mapRef.current;
    if (!map) return;
    const points = pointsRef.current;
    const area = focusRef.current;
    if (points.length > 1) map.fitBounds(points, { padding: [40, 40], maxZoom: area ? 14 : 15 });
    else if (points.length === 1) map.setView(points[0], 14);
    else if (area) map.fitBounds([[area.south, area.west], [area.north, area.east]], { padding: [40, 40], maxZoom: 13 });
    else map.setView(PK_CENTER, 5);
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = await loadLeaflet();
      if (cancelled || !hostRef.current || mapRef.current) return;
      const map = L.map(hostRef.current, { zoomControl: false, attributionControl: false, preferCanvas: true }).setView(PK_CENTER, 5);
      L.control.attribution({ position: "bottomleft" }).addTo(map);
      L.control.zoom({ position: "bottomright" }).addTo(map);
      addBaseLayers(L, map, "bottomright");
      layerRef.current = L.markerClusterGroup({
        iconCreateFunction: clusterIcon(L),
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
        spiderfyOnMaxZoom: true,
        spiderLegPolylineOptions: { weight: 1.5, color: "#1267e8", opacity: 0.6 },
        chunkedLoading: true,
        maxClusterRadius: (zoom: number) => (zoom <= 8 ? 50 : zoom <= 12 ? 45 : 35),
        spiderfyDistanceMultiplier: 1.4,
      }).addTo(map);
      map.on("popupopen", (event: any) => {
        const button = event.popup.getElement()?.querySelector("[data-incident]");
        if (button) button.onclick = () => openIncidentDetails(button.getAttribute("data-incident"));
      });
      mapRef.current = map;
      setTimeout(() => map.invalidateSize(), 120);
      renderMarkers(L);
    })();
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function renderMarkers(L: any) {
    const layer = layerRef.current;
    if (!layer) return;
    layer.clearLayers();
    const markers: any[] = [];
    const points: [number, number][] = [];
    incidentsRef.current.forEach((item) => {
      const lat = Number(item.latitude);
      const lng = Number(item.longitude);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
      const status = statusKey(item.status);
      const color = STATUS_COLORS[status];
      const label = status === "resolved" ? "Resolved" : status === "in_progress" ? "In Progress" : "Open";
      const marker = L.marker([lat, lng], {
        siraStatus: status,
        icon: L.divIcon({
          className: "",
          iconSize: [22, 22],
          iconAnchor: [11, 11],
          popupAnchor: [0, -10],
          html: `<div class="m-pin" style="background:${color}"></div>`,
        }),
      });
      marker.bindPopup(
        `<div class="m-popup-status" style="background:${color}">${label}</div>` +
          `<div class="m-popup-title">${escapeHtml(item.title || "Fiber Risk Incident")}</div>` +
          `<div class="m-popup-line">${escapeHtml(item.address_text || item.city || "GPS selected location")}</div>` +
          `<div class="m-popup-line">${escapeHtml(`${item.reported_by_name || "Field User"} • ${item.reported_by_company || "Company"}`)}</div>` +
          (item.reported_by_phone ? `<div class="m-popup-line">${escapeHtml(item.reported_by_phone)}</div>` : "") +
          `<button type="button" class="m-popup-button" data-incident="${escapeHtml(item.id)}">View incident</button>`
      );
      markers.push(marker);
      points.push([lat, lng]);
    });
    layer.addLayers(markers);
    pointsRef.current = points;
    fitView();
  }

  const incidentsRef = useRef(incidents);
  incidentsRef.current = incidents;

  useEffect(() => {
    if (!mapRef.current) return;
    let cancelled = false;
    loadLeaflet().then((L) => {
      if (!cancelled) renderMarkers(L);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incidents, focusArea]);

  useEffect(() => {
    if (resetKey) fitView();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  return <div ref={hostRef} className="m-map-canvas" />;
}

// ---- Single pin map (incident detail, location picker) ------------------------

type Point = { latitude: number; longitude: number };

export function PinMap({
  latitude,
  longitude,
  color = "#1267e8",
  label,
  editable = false,
  interactive = true,
  zoom = 15,
  controlsPosition = "topright",
  offsetBottom = 0,
  locateKey = 0,
  onChange,
}: {
  latitude: number;
  longitude: number;
  color?: string;
  label?: string;
  editable?: boolean;
  interactive?: boolean;
  zoom?: number;
  controlsPosition?: "topright" | "bottomright";
  /** Pixels at the bottom covered by a panel; the pin is centred above it. */
  offsetBottom?: number;
  locateKey?: number;
  onChange?: (point: Point) => void;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const offsetRef = useRef(offsetBottom);
  offsetRef.current = offsetBottom;

  function centre(lat: number, lng: number, z?: number, animate = true) {
    const map = mapRef.current;
    if (!map) return;
    const targetZoom = z ?? map.getZoom();
    const point = map.project([lat, lng], targetZoom).add([0, offsetRef.current / 2]);
    const target = map.unproject(point, targetZoom);
    if (animate) map.flyTo(target, targetZoom, { duration: 0.6 });
    else map.setView(target, targetZoom);
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = await loadLeaflet();
      if (cancelled || !hostRef.current || mapRef.current) return;
      const map = L.map(hostRef.current, {
        zoomControl: false,
        attributionControl: false,
        dragging: interactive,
        touchZoom: interactive,
        scrollWheelZoom: interactive,
        doubleClickZoom: interactive,
        boxZoom: interactive,
        keyboard: interactive,
        tap: interactive,
      }).setView([latitude, longitude], zoom);
      if (interactive) {
        addBaseLayers(L, map, controlsPosition);
        L.control.zoom({ position: controlsPosition }).addTo(map);
      } else {
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }).addTo(map);
      }

      const icon = editable
        ? L.divIcon({
            className: "",
            iconSize: [28, 28],
            iconAnchor: [14, 26],
            html: `<div class="m-drop-pin" style="background:${color}"></div>`,
          })
        : L.divIcon({
            className: "",
            iconSize: [60, 60],
            iconAnchor: [30, 30],
            html: `<div class="m-focus"><div class="m-focus-pulse" style="background:${color}"></div><div class="m-focus-dot" style="background:${color}"></div></div>`,
          });
      const marker = L.marker([latitude, longitude], { icon, draggable: editable && interactive }).addTo(map);
      if (label) marker.bindTooltip(escapeHtml(label), { permanent: true, direction: "top", offset: [0, editable ? -24 : -16], className: "m-tag" });
      if (editable && interactive) {
        marker.on("dragend", () => {
          const p = marker.getLatLng();
          onChangeRef.current?.({ latitude: p.lat, longitude: p.lng });
        });
        map.on("click", (event: any) => {
          marker.setLatLng(event.latlng);
          onChangeRef.current?.({ latitude: event.latlng.lat, longitude: event.latlng.lng });
        });
      }
      markerRef.current = marker;
      mapRef.current = map;
      setTimeout(() => {
        map.invalidateSize();
        centre(latitude, longitude, zoom, false);
      }, 120);
    })();
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Follow position changes made outside the map (GPS, search result).
  useEffect(() => {
    const marker = markerRef.current;
    if (!marker) return;
    const current = marker.getLatLng();
    if (Math.abs(current.lat - latitude) < 1e-7 && Math.abs(current.lng - longitude) < 1e-7) return;
    marker.setLatLng([latitude, longitude]);
    centre(latitude, longitude, Math.max(mapRef.current.getZoom(), 15));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latitude, longitude]);

  // Re-centre when the covering panel opens or closes.
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.invalidateSize();
      centre(latitude, longitude);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offsetBottom]);

  useEffect(() => {
    if (locateKey && mapRef.current) centre(latitude, longitude, 17);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locateKey]);

  return <div ref={hostRef} className="m-map-canvas" />;
}
