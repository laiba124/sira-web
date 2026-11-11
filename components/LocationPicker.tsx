"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import LeafletMap from "@/components/LeafletMap";
import { SIRA_SUBREGIONS, getSiraDistricts, inferSiraArea } from "@/lib/siraAreas";

type Point = { latitude: number; longitude: number };
type Mode = "gps" | "area" | "pin";

export default function LocationPicker({ value, onChange, autoGps = true }: { value: Point; onChange: (point: Point, label?: string) => void; autoGps?: boolean }) {
  const [mode, setMode] = useState<Mode>("gps");
  const [gpsState, setGpsState] = useState<"idle"|"loading"|"ok"|"error">("idle");
  const [gpsMessage, setGpsMessage] = useState("");
  const [subRegion, setSubRegion] = useState("");
  const [district, setDistrict] = useState("");
  const requestedRef = useRef(false);
  const districts = useMemo(() => getSiraDistricts(subRegion), [subRegion]);
  const inferred = useMemo(() => inferSiraArea({ latitude: value.latitude, longitude: value.longitude }), [value]);

  function useGps() {
    setMode("gps");
    if (!("geolocation" in navigator)) {
      setGpsState("error"); setGpsMessage("This browser does not expose geolocation. Use SubRegion/District or drop the pin."); return;
    }
    setGpsState("loading"); setGpsMessage("Requesting current location...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const p = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
        const area = inferSiraArea(p);
        onChange(p, area ? `${area.subRegion} - ${area.name}` : "Current location");
        setSubRegion(area?.subRegion ?? ""); setDistrict(area?.name ?? "");
        setGpsState("ok"); setGpsMessage(`Location received (accuracy about ${Math.round(pos.coords.accuracy)} m). You can still move the pin.`);
      },
      (err) => { setGpsState("error"); setGpsMessage(err.code === 1 ? "Location permission was denied. Select SubRegion/District or drop a pin anywhere on the Pakistan map." : "Current location could not be determined. Select SubRegion/District or drop a pin."); setMode("area"); },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  }

  useEffect(() => {
    if (!autoGps || requestedRef.current) return;
    requestedRef.current = true;
    const timer = setTimeout(useGps, 250);
    return () => clearTimeout(timer);
  }, [autoGps]);

  function selectSubRegion(name: string) {
    setMode("area"); setSubRegion(name); setDistrict("");
    const sr = SIRA_SUBREGIONS.find(x => x.name === name);
    if (sr) onChange({ latitude: sr.latitude, longitude: sr.longitude }, sr.name);
  }
  function selectDistrict(name: string) {
    setMode("area"); setDistrict(name);
    const d = districts.find(x => x.name === name);
    if (d) onChange({ latitude: d.latitude, longitude: d.longitude }, `${d.subRegion} - ${d.name}`);
  }

  return <div className="card map-card">
    <div style={{padding:16}}>
      <div className="page-head" style={{marginBottom:10}}><div><h3 className="card-title" style={{margin:0}}>Incident Location</h3><p className="small muted" style={{margin:"4px 0 0"}}>GPS when available, with permanent manual fallback.</p></div><div className="segment"><button type="button" className={mode==="gps"?"active":""} onClick={useGps}>Current GPS</button><button type="button" className={mode==="area"?"active":""} onClick={()=>setMode("area")}>Area</button><button type="button" className={mode==="pin"?"active":""} onClick={()=>setMode("pin")}>Drop Pin</button></div></div>
      <div className="location-toolbar">
        <div className="field" style={{minWidth:190}}><label>SubRegion</label><select className="select" value={subRegion} onChange={e=>selectSubRegion(e.target.value)}><option value="">Select SubRegion</option>{SIRA_SUBREGIONS.map(sr=><option key={sr.name}>{sr.name}</option>)}</select></div>
        <div className="field" style={{minWidth:220}}><label>District</label><select className="select" value={district} onChange={e=>selectDistrict(e.target.value)} disabled={!subRegion}><option value="">Select District</option>{districts.map(d=><option key={d.name}>{d.name}</option>)}</select></div>
        <button type="button" className="btn" onClick={()=>setMode("pin")}>Enable manual pin</button>
      </div>
      {gpsMessage && <div className={gpsState==="error"?"location-note gps-error":gpsState==="ok"?"location-note gps-ok":"location-note"}>{gpsMessage}</div>}
      <div className="location-note"><b>Selected:</b> {value.latitude.toFixed(5)}, {value.longitude.toFixed(5)}{inferred ? ` - ${inferred.subRegion} - ${inferred.name}` : ""}</div>
    </div>
    <LeafletMap center={value} zoom={mode==="area" && !district ? 8 : 13} selected={value} interactivePin={mode==="pin" || mode==="gps"} onPinChange={(p)=>{setMode("pin"); const a=inferSiraArea(p); setSubRegion(a?.subRegion??""); setDistrict(a?.name??""); onChange(p,a?`${a.subRegion} - ${a.name}`:"Manual pin");}} compact />
  </div>;
}
