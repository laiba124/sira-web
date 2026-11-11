"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { useAuth } from "@/context/AuthContext";
import Icon from "@/components/mobile/Icon";
import LocationPickerCard from "@/components/mobile/LocationPickerCard";
import { inferSiraArea } from "@/lib/siraAreas";
import { uploadIncidentPhotos } from "@/lib/photoStorage";
import { supabase } from "@/lib/supabase";

const SEVERITIES = ["low", "medium", "high", "critical"] as const;
const DEFAULT_LAT = 33.6844;
const DEFAULT_LNG = 73.0479;
const MAX_PHOTOS = 2;

// Where the pin came from: still the placeholder, a GPS fix, or placed by hand.
type LocationSource = "default" | "gps" | "manual";
type Outcome = { title: string; text: string; another: boolean } | null;

export default function MobileReport() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [latitude, setLatitude] = useState(DEFAULT_LAT);
  const [longitude, setLongitude] = useState(DEFAULT_LNG);
  const [source, setSource] = useState<LocationSource>("default");
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [gpsBusy, setGpsBusy] = useState(false);
  const [gpsMessage, setGpsMessage] = useState("");
  const [severity, setSeverity] = useState<(typeof SEVERITIES)[number]>("high");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [support, setSupport] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [outcome, setOutcome] = useState<Outcome>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  const area = useMemo(() => inferSiraArea({ latitude, longitude, address_text: address }), [latitude, longitude, address]);

  useEffect(() => {
    const urls = photos.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [photos]);

  function wipeForm() {
    setSeverity("high");
    setTitle("");
    setDescription("");
    setAddress("");
    setSupport("");
    setPhotos([]);
    setError("");
  }

  // Clears the form and captures the current GPS, like the Android app.
  function refreshNewIncident() {
    wipeForm();
    setLatitude(DEFAULT_LAT);
    setLongitude(DEFAULT_LNG);
    setSource("default");
    setAccuracy(null);
    setGpsMessage("");
    if (!("geolocation" in navigator)) {
      setGpsMessage("This browser cannot share your location. Open the location picker and drag the pin to the incident location.");
      return;
    }
    setGpsBusy(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setAccuracy(position.coords.accuracy ?? null);
        setSource("gps");
        setGpsBusy(false);
      },
      (problem) => {
        setGpsBusy(false);
        setGpsMessage(
          problem.code === 1
            ? "Location permission was denied. Allow location for this site, or drag the pin on the map to the incident location."
            : "GPS signal not found. Move to an open area and tap Refresh, or drag the pin on the map to the incident location."
        );
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 5 * 60 * 1000 }
    );
  }

  useEffect(() => {
    refreshNewIncident();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function addPhotos(list: FileList | null) {
    if (!list?.length) return;
    if (photos.length >= MAX_PHOTOS) {
      window.alert(`You can attach up to ${MAX_PHOTOS} images. Remove one to add another.`);
      return;
    }
    setPhotos((current) => [...current, ...Array.from(list)].slice(0, MAX_PHOTOS));
  }

  async function submit() {
    setError("");
    if (!title.trim()) return setError("Please add a short incident title.");
    if (!user) return setError("Please login before reporting an incident.");
    if (!profile) return setError("Please logout and login again so your profile can be loaded.");
    if (source === "default") {
      return setError("GPS has not been captured yet. Tap Refresh to get your GPS, or drag the pin on the map to the incident location.");
    }

    setSubmitting(true);
    const { data, error: insertError } = await supabase
      .from("sira_incidents")
      .insert({
        incident_type: "fiber_network_risk",
        severity,
        title: title.trim(),
        description: description.trim() || null,
        latitude,
        longitude,
        address_text: address.trim() || "GPS selected location",
        city: area?.name ?? null,
        support_required: support.trim() || null,
        reported_by_name: profile.full_name || user.email?.split("@")[0] || "User",
        reported_by_job_title: profile.job_title || profile.role || null,
        reported_by_company: profile.company || null,
        reported_by_phone: profile.mobile_number || null,
        reporter_user_id: user.id,
        status: "open",
        photo_urls: [],
      })
      .select("*")
      .single();

    if (insertError) {
      setSubmitting(false);
      setError("Submit failed: " + insertError.message);
      return;
    }

    try {
      if (photos.length) {
        const urls = await uploadIncidentPhotos(data.id, photos);
        const { error: updateError } = await supabase
          .from("sira_incidents")
          .update({ photo_urls: urls })
          .eq("id", data.id)
          .eq("incident_type", "fiber_network_risk")
          .eq("reporter_user_id", user.id);
        if (updateError) throw updateError;
      }
      setOutcome({ title: "Incident submitted", text: "Your incident has been saved successfully.", another: true });
    } catch (uploadError: any) {
      // The row already exists; clear the form so it is not submitted twice.
      setOutcome({
        title: "Saved without photos",
        text:
          "The incident was saved, but the photos could not upload" +
          (uploadError?.message ? " (" + uploadError.message + ")" : "") +
          ". You can open it from Incidents later.",
        another: false,
      });
    } finally {
      setSubmitting(false);
      refreshNewIncident();
    }
  }

  const gpsLine = gpsBusy
    ? "Getting GPS location..."
    : source === "default"
      ? "GPS not captured. Tap Refresh or drag the pin"
      : `${source === "gps" ? "GPS" : "Pin"}: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}${accuracy ? ` (±${Math.round(accuracy)} m)` : ""}`;

  return (
    <div className="m-page m-form-page">
      <h1 className="m-big-title">Report Incident</h1>
      <p className="m-big-sub">GPS is captured automatically. Add the incident details and submit.</p>

      <button type="button" className="m-refresh-wide" disabled={gpsBusy} onClick={refreshNewIncident}>
        {gpsBusy ? <span className="m-spin-sm" /> : <Icon name="refresh" size={21} color="#ffffff" />}
        {gpsBusy ? "Fetching current GPS..." : "Clear Form & Fetch GPS"}
      </button>

      <div className="m-gps-box">
        <Icon name="locate" size={18} color="#1267e8" />
        <div>
          <div className="m-gps-text">{gpsLine}</div>
          {!gpsBusy && source !== "default" && area ? (
            <div className="m-gps-area">
              {area.subRegion} • {area.name}
            </div>
          ) : null}
        </div>
      </div>
      {gpsMessage ? <div className="m-warn">{gpsMessage}</div> : null}

      <section className="m-form-card">
        <h2 className="m-form-title">Reporter</h2>
        <div className="m-profile-box">
          <Icon name="personCircle" size={34} color="#1267e8" />
          <div>
            <strong>{profile?.full_name ?? "Loading profile..."}</strong>
            <span>{profile?.job_title || profile?.role || "Job title not provided"}</span>
            <span>{(profile?.company ?? "Company") + " • " + (profile?.mobile_number ?? "Mobile")}</span>
          </div>
        </div>
      </section>

      <LocationPickerCard
        latitude={latitude}
        longitude={longitude}
        onChange={(p) => {
          setLatitude(p.latitude);
          setLongitude(p.longitude);
          setSource("manual");
          setAccuracy(null);
          setGpsMessage("");
          if (p.label) setAddress(p.label.slice(0, 140));
        }}
      />

      <section className="m-form-card">
        <h2 className="m-form-title">Incident Type</h2>
        <div className="m-fixed-type">
          <span className="m-fixed-type-icon">
            <Icon name="network" size={23} color="#ffffff" />
          </span>
          <div>
            <strong>FR • Fiber Network Risk</strong>
            <span>SIRA currently records proactive fiber-risk incidents only.</span>
          </div>
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
        <h2 className="m-form-title">Incident Details</h2>
        <input className="m-input" placeholder="Title e.g. Fiber risk near PTCL long haul" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={160} />
        <textarea className="m-input m-textarea" placeholder="Description / notes" value={description} onChange={(e) => setDescription(e.target.value)} />
        <input className="m-input" placeholder="Location label e.g. G-11 Markaz" value={address} onChange={(e) => setAddress(e.target.value)} />
        <textarea
          className="m-input m-textarea-lg"
          placeholder="Support Required e.g. Fiber team visit, cable spare, transmission support"
          value={support}
          onChange={(e) => setSupport(e.target.value)}
        />
      </section>

      <section className="m-form-card">
        <div className="m-form-head-row">
          <h2 className="m-form-title">Images</h2>
          <span className="m-photo-count">
            {photos.length}/{MAX_PHOTOS}
          </span>
        </div>
        <div className="m-image-btns">
          <button type="button" className="m-image-btn" onClick={() => cameraRef.current?.click()}>
            <Icon name="camera" size={22} color="#1267e8" />
            Take photo
          </button>
          <button type="button" className="m-image-btn" onClick={() => galleryRef.current?.click()}>
            <Icon name="images" size={22} color="#1267e8" />
            Gallery
          </button>
        </div>
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          hidden
          onChange={(e) => {
            addPhotos(e.target.files);
            e.target.value = "";
          }}
        />
        <input
          ref={galleryRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => {
            addPhotos(e.target.files);
            e.target.value = "";
          }}
        />
        {previews.length ? (
          <div className="m-photo-strip">
            {previews.map((url, index) => (
              <div key={url} className="m-photo-item">
                <img src={url} alt={`Selected image ${index + 1}`} />
                <button type="button" aria-label="Remove image" onClick={() => setPhotos((current) => current.filter((_, i) => i !== index))}>
                  <Icon name="close" size={14} color="#ffffff" />
                </button>
              </div>
            ))}
          </div>
        ) : null}
      </section>

      {error ? <div className="m-error">{error}</div> : null}

      <button type="button" className="m-submit" onClick={submit} disabled={submitting || gpsBusy}>
        {submitting ? (
          <span className="m-spin-sm" />
        ) : (
          <>
            <Icon name="upload" size={23} color="#ffffff" />
            Submit Incident
          </>
        )}
      </button>

      {outcome ? (
        <div className="m-dialog-backdrop">
          <div className="m-dialog">
            <h3>{outcome.title}</h3>
            <p>{outcome.text}</p>
            <div className="m-dialog-actions">
              {outcome.another ? (
                <button type="button" className="m-btn-cancel" onClick={() => setOutcome(null)}>
                  Report another
                </button>
              ) : null}
              <button type="button" className="m-btn-save" onClick={() => router.replace("/incidents")}>
                View Incidents
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
