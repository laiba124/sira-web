"use client";

import { useState } from "react";

import Icon from "@/components/mobile/Icon";
import { PinMap } from "@/components/mobile/MobileMaps";

type Point = { latitude: number; longitude: number };
type SearchResult = { place_id: number; display_name: string; lat: string; lon: string };

// Same flow as the Android app: a small preview, and a full-screen picker
// to search a place, tap the map, drag the pin, or switch Map / Satellite.
export default function LocationPickerCard({
  latitude,
  longitude,
  onChange,
}: {
  latitude: number;
  longitude: number;
  onChange: (point: Point & { label?: string }) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  async function search(e?: React.FormEvent) {
    e?.preventDefault();
    const q = query.trim();
    if (!q) return;
    setSearching(true);
    setSearchError("");
    try {
      const url =
        "https://nominatim.openstreetmap.org/search?format=json&limit=8&countrycodes=pk&addressdetails=1&q=" + encodeURIComponent(q);
      const response = await fetch(url, { headers: { Accept: "application/json" } });
      const data = (await response.json()) as SearchResult[];
      setResults(Array.isArray(data) ? data : []);
      if (!data?.length) setSearchError("No matching place found.");
    } catch {
      setSearchError("Search failed. Check your connection, or tap the map instead.");
    } finally {
      setSearching(false);
    }
  }

  return (
    <section className="m-form-card">
      <h2 className="m-form-title" style={{ marginBottom: 2 }}>
        Incident Location
      </h2>
      <p className="m-form-sub">Default is phone GPS. Search or adjust only if needed.</p>

      <button type="button" className="m-preview-map" onClick={() => setOpen(true)} aria-label="Open location picker">
        <PinMap key={`${latitude.toFixed(5)}-${longitude.toFixed(5)}`} latitude={latitude} longitude={longitude} editable interactive={false} zoom={15} />
        <span className="m-preview-overlay">
          <Icon name="search" size={20} color="#ffffff" />
          Open location picker
        </span>
      </button>

      <button type="button" className="m-outline-wide" onClick={() => setOpen(true)}>
        <Icon name="map" size={20} color="#1267e8" />
        Search / adjust location
      </button>

      {open ? (
        <div className="m-picker" role="dialog" aria-modal="true" aria-label="Select incident location">
          <div className="m-picker-head">
            <div>
              <h3>Select Incident Location</h3>
              <p>Search, tap map, drag the pin, or switch Map / Satellite</p>
            </div>
            <button type="button" className="m-picker-done" onClick={() => setOpen(false)}>
              Done
            </button>
          </div>

          <form className="m-picker-search" onSubmit={search}>
            <label className="m-search">
              <Icon name="search" size={19} color="#64748b" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search area, city, road, landmark..." enterKeyHint="search" />
            </label>
            <button type="submit" className="m-go-btn" disabled={searching}>
              {searching ? "..." : "Go"}
            </button>
          </form>

          {searchError ? <div className="m-picker-msg">{searchError}</div> : null}
          {results.length ? (
            <div className="m-picker-results">
              {results.map((item) => (
                <button
                  key={item.place_id}
                  type="button"
                  onClick={() => {
                    onChange({ latitude: Number(item.lat), longitude: Number(item.lon), label: item.display_name.slice(0, 140) });
                    setResults([]);
                  }}
                >
                  <Icon name="location" size={16} color="#1267e8" />
                  <span>{item.display_name}</span>
                </button>
              ))}
            </div>
          ) : null}

          <div className="m-picker-map">
            <PinMap latitude={latitude} longitude={longitude} editable zoom={16} onChange={(p) => onChange(p)} />
            <div className="m-picker-hint">Search a place, tap the map, drag the pin, or switch Map / Satellite.</div>
          </div>

          <div className="m-picker-foot">
            <div className="m-picker-coords">
              <Icon name="locate" size={16} color="#1267e8" />
              {latitude.toFixed(5)}, {longitude.toFixed(5)}
            </div>
            <p>Changes are applied immediately. Press Done to return to the form.</p>
          </div>
        </div>
      ) : null}
    </section>
  );
}
