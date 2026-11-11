"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";

import { useAuth } from "@/context/AuthContext";
import Icon, { type IconName } from "@/components/mobile/Icon";
import { PinMap } from "@/components/mobile/MobileMaps";
import {
  formatDateTime,
  publicCode,
  severityColor,
  severityLabel,
  STATUS_LOOK,
  statusKey,
  useIncidentPhotoUrl,
} from "@/components/mobile/shared";
import { storagePathFromIncidentPhoto } from "@/lib/photoStorage";
import { supabase } from "@/lib/supabase";
import type { SiraIncident } from "@/types/incident";

type Comment = { id: string; incident_id: string; user_id: string; username: string; comment_text: string; created_at: string };

// Share of the screen the map keeps above the fully opened panel.
const MAP_SHARE_WHEN_OPEN = 0.3;

function notifyChanged() {
  window.dispatchEvent(new Event("sira:incidents-changed"));
}

export default function MobileIncidentDetail({ incidentId, onClose }: { incidentId: string; onClose: () => void }) {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [incident, setIncident] = useState<SiraIncident | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);
  const [statusMenu, setStatusMenu] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [posting, setPosting] = useState(false);
  const [preview, setPreview] = useState<number | null>(null);
  const [locateKey, setLocateKey] = useState(0);

  const currentUserId = user?.id ?? null;
  const username = String(
    profile?.full_name || user?.user_metadata?.full_name || (user?.email ? user.email.split("@")[0] : null) || "User"
  );

  const loadComments = useCallback(async (id: string) => {
    const { data } = await supabase
      .from("sira_incident_comments")
      .select("id, incident_id, user_id, username, comment_text, created_at")
      .eq("incident_id", id)
      .order("created_at", { ascending: true });
    setComments((data ?? []) as Comment[]);
    setCommentsLoading(false);
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    (async () => {
      const { data, error: loadError } = await supabase
        .from("sira_incidents")
        .select("*")
        .eq("id", incidentId)
        .eq("incident_type", "fiber_network_risk")
        .maybeSingle();
      if (!active) return;
      if (loadError) setError(loadError.message);
      else if (!data) setError("Incident not found");
      else {
        setIncident(data as SiraIncident);
        loadComments(incidentId);
      }
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [incidentId, loadComments]);

  // Lock the page behind the overlay.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  const isOwner = Boolean(currentUserId && incident?.reporter_user_id && currentUserId === incident.reporter_user_id);

  async function updateStatus(next: string) {
    setStatusMenu(false);
    if (!incident || !currentUserId) return;
    if (!isOwner) return window.alert("Only the user who uploaded this incident can update it.");
    setUpdating(true);
    const { error: updateError } = await supabase
      .from("sira_incidents")
      .update({ status: next })
      .eq("id", incident.id)
      .eq("incident_type", "fiber_network_risk")
      .eq("reporter_user_id", currentUserId);
    setUpdating(false);
    if (updateError) return window.alert("Status update failed: " + updateError.message);
    setIncident({ ...incident, status: next });
    notifyChanged();
  }

  async function deleteIncident() {
    if (!incident || !currentUserId || !isOwner) return;
    if (!window.confirm("Delete incident?\nThis action cannot be undone.")) return;
    setUpdating(true);
    try {
      const urls = (incident.photo_urls ?? []).map((u) => String(u ?? "").trim()).filter(Boolean);
      const paths = urls.map(storagePathFromIncidentPhoto);
      // Never delete the row while an image path is unknown, or the file is left behind.
      if (paths.some((p) => !p)) throw new Error("One or more image paths could not be identified. Incident deletion was stopped.");
      const unique = Array.from(new Set(paths as string[]));
      if (unique.length) {
        const { error: storageError } = await supabase.storage.from("incident-photos").remove(unique);
        if (storageError) throw new Error("Image cleanup failed: " + storageError.message);
      }
      const { error: deleteError, count } = await supabase
        .from("sira_incidents")
        .delete({ count: "exact" })
        .eq("id", incident.id)
        .eq("reporter_user_id", currentUserId);
      if (deleteError) throw deleteError;
      if (count === 0) throw new Error("The incident was not deleted. You may not be its uploader.");
      window.alert(unique.length ? "The incident and its attached images have been removed." : "The incident has been removed.");
      notifyChanged();
      onClose();
    } catch (problem) {
      window.alert("Delete failed: " + (problem instanceof Error ? problem.message : "An unexpected deletion error occurred."));
    } finally {
      setUpdating(false);
    }
  }

  async function postComment() {
    const text = commentText.trim();
    if (!incident || !currentUserId || !text) return;
    setPosting(true);
    const { data, error: postError } = await supabase
      .from("sira_incident_comments")
      .insert({ incident_id: incident.id, user_id: currentUserId, username, comment_text: text })
      .select("id, incident_id, user_id, username, comment_text, created_at")
      .single();
    setPosting(false);
    if (postError) return window.alert("Comment failed: " + postError.message);
    setComments((prev) => [...prev, data as Comment]);
    setCommentText("");
  }

  // ---- Bottom sheet ---------------------------------------------------------
  const rootRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);
  const peekRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [screenH, setScreenH] = useState(0);
  const [peekH, setPeekH] = useState(260);
  const [expanded, setExpanded] = useState(false);
  const [dragY, setDragY] = useState<number | null>(null);
  const dragStart = useRef<{ y: number; base: number; moved: boolean } | null>(null);

  useLayoutEffect(() => {
    function measure() {
      setScreenH(rootRef.current?.clientHeight ?? window.innerHeight);
      setPeekH((dragRef.current?.offsetHeight ?? 80) + (peekRef.current?.offsetHeight ?? 180) + 14);
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [incident, loading]);

  const sheetH = Math.max(0, screenH - screenH * MAP_SHARE_WHEN_OPEN);
  const collapsedY = Math.max(0, sheetH - peekH);
  const translate = dragY ?? (expanded ? 0 : collapsedY);
  const coveredByPanel = expanded ? sheetH : Math.min(peekH, sheetH);

  function snap(open: boolean) {
    setExpanded(open);
    setDragY(null);
    if (!open) scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }

  function onPointerDown(e: React.PointerEvent) {
    dragStart.current = { y: e.clientY, base: expanded ? 0 : collapsedY, moved: false };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent) {
    const start = dragStart.current;
    if (!start) return;
    const dy = e.clientY - start.y;
    if (Math.abs(dy) > 5) start.moved = true;
    if (start.moved) setDragY(Math.min(collapsedY, Math.max(0, start.base + dy)));
  }
  function onPointerUp(e: React.PointerEvent) {
    const start = dragStart.current;
    dragStart.current = null;
    if (!start) return;
    if (!start.moved) return snap(!expanded);
    const position = start.base + (e.clientY - start.y);
    snap(position < collapsedY / 2);
  }

  // ---- Render ---------------------------------------------------------------
  const lat = Number(incident?.latitude);
  const lng = Number(incident?.longitude);
  const hasCoords = Number.isFinite(lat) && Number.isFinite(lng);
  const look = STATUS_LOOK[statusKey(incident?.status)];
  const code = incident ? publicCode(incident) : "";
  const photos = (incident?.photo_urls ?? []).map((u) => String(u ?? "").trim()).filter(Boolean);

  if (loading || !incident) {
    return (
      <div className="m-detail" ref={rootRef}>
        <div className="m-detail-center">
          {loading ? (
            <>
              <div className="spinner" />
              <span>Loading incident...</span>
            </>
          ) : (
            <>
              <Icon name="alertCircle" size={36} color="#94a3b8" />
              <span>{error}</span>
              <button type="button" className="m-btn-save" style={{ padding: "0 22px" }} onClick={onClose}>
                Go back
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  const location = incident.address_text || incident.city || "GPS selected location";

  return (
    <div className="m-detail" ref={rootRef}>
      <div className="m-detail-map">
        {hasCoords ? (
          <PinMap latitude={lat} longitude={lng} color={look.color} label={code} zoom={16} offsetBottom={coveredByPanel} locateKey={locateKey} />
        ) : (
          <div className="m-detail-center">
            <Icon name="location" size={34} color="#94a3b8" />
            <span>No GPS location on this incident</span>
          </div>
        )}
      </div>

      <div className="m-detail-top">
        <button type="button" className="m-round-btn" aria-label="Back" onClick={onClose}>
          <Icon name="back" size={22} color="#0f172a" />
        </button>
        <span className="m-title-chip">
          <i className="m-dot" style={{ background: look.color }} />
          {code}
        </span>
        {hasCoords ? (
          <button type="button" className="m-round-btn m-locate-btn" aria-label="Centre on incident" onClick={() => setLocateKey((k) => k + 1)}>
            <Icon name="locate" size={20} color="#1267e8" />
          </button>
        ) : null}
      </div>

      <div
        className={dragY === null ? "m-sheet is-animated" : "m-sheet"}
        style={{ height: sheetH || "70%", transform: `translateY(${translate}px)` }}
      >
        <div
          ref={dragRef}
          className="m-sheet-drag"
          role="button"
          tabIndex={0}
          aria-label={expanded ? "Incident details, open. Tap to close." : "Incident details. Tap or swipe up to open."}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={() => {
            dragStart.current = null;
            snap(expanded);
          }}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && snap(!expanded)}
        >
          <div className="m-handle-area">
            <span className="m-handle" />
          </div>
          <div className="m-sheet-head">
            <span className="m-sheet-code">{code}</span>
            <span className="m-status-pill" style={{ background: look.tint, color: look.color }}>
              {look.label}
            </span>
            <span className="m-severity">
              <i className="m-dot" style={{ background: severityColor(incident.severity), width: 7, height: 7 }} />
              {severityLabel(incident.severity)}
            </span>
            <span style={{ marginLeft: "auto" }}>
              <Icon name={expanded ? "chevronDown" : "chevronUp"} size={20} color="#64748b" />
            </span>
          </div>
          <div className={expanded ? "m-sheet-title" : "m-sheet-title is-clamped"}>{incident.title || "Fiber Risk Incident"}</div>
        </div>

        <div ref={scrollRef} className="m-sheet-scroll" style={{ overflowY: expanded ? "auto" : "hidden" }}>
          <div ref={peekRef}>
            <div className="m-summary-row">
              <div className="m-summary-lines">
                <InfoLine icon="location" text={location} />
                {hasCoords ? <InfoLine icon="navigate" text={`${lat.toFixed(5)}, ${lng.toFixed(5)}`} /> : null}
                <InfoLine icon="person" text={`${incident.reported_by_name || "Field User"} • ${incident.reported_by_company || "Company"}`} />
                <InfoLine icon="time" text={formatDateTime(incident.created_at)} />
              </div>
              {photos[0] ? <Thumb url={photos[0]} onClick={() => setPreview(0)} /> : null}
            </div>
            <div className="m-actions">
              {hasCoords ? (
                <a className="m-secondary-btn" href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`} target="_blank" rel="noreferrer">
                  <Icon name="navigate" size={16} color="#1267e8" />
                  Directions
                </a>
              ) : null}
              {incident.reported_by_phone ? (
                <a className="m-secondary-btn" href={`tel:${incident.reported_by_phone}`} aria-label="Call reporter">
                  <Icon name="call" size={16} color="#1267e8" />
                  Call
                </a>
              ) : null}
            </div>
          </div>

          <Section icon="personCircle" title="Reporter">
            <DetailRow label="Name" value={incident.reported_by_name || "Field User"} />
            <DetailRow label="Job title" value={incident.reported_by_job_title || "Not provided"} />
            <DetailRow label="Company" value={incident.reported_by_company || "Not provided"} />
            <DetailRow label="Mobile" value={incident.reported_by_phone || "Not added"} />
            <DetailRow label="Reported" value={formatDateTime(incident.created_at)} />
            <DetailRow label="Updated" value={formatDateTime(incident.updated_at)} last />
          </Section>

          <Section icon="document" title="Description / Notes">
            <p className="m-body-text">{incident.description || "No additional notes added."}</p>
          </Section>

          {incident.support_required ? (
            <Section icon="construct" title="Support Required">
              <p className="m-body-text">{incident.support_required}</p>
            </Section>
          ) : null}

          <Section icon="images" title={`Attached Images (${photos.length})`}>
            {photos.length ? (
              <div className="m-photo-row">
                {photos.map((url, index) => (
                  <Photo key={`${url}-${index}`} url={url} onClick={() => setPreview(index)} />
                ))}
              </div>
            ) : (
              <p className="m-muted-small">No images attached.</p>
            )}
          </Section>

          <Section icon="settings" title="Manage">
            {isOwner ? (
              <>
                <div className="m-manage-row">
                  <button
                    type="button"
                    className="m-outline-btn"
                    disabled={updating}
                    onClick={() => {
                      onClose();
                      router.push(`/incident/edit/${incident.id}`);
                    }}
                  >
                    <Icon name="pencil" size={16} color="#1267e8" />
                    Edit
                  </button>
                  <button type="button" className="m-outline-btn" disabled={updating} onClick={() => setStatusMenu(true)}>
                    <Icon name="swap" size={16} color="#1267e8" />
                    Status
                  </button>
                  <button
                    type="button"
                    className="m-resolve-btn"
                    disabled={updating || statusKey(incident.status) === "resolved"}
                    onClick={() => updateStatus("resolved")}
                  >
                    {updating ? <span className="m-spin-sm" /> : <Icon name="checkCircle" size={17} color="#ffffff" />}
                    Resolve
                  </button>
                </div>
                <button type="button" className="m-delete-wide" disabled={updating} onClick={deleteIncident}>
                  <Icon name="trash" size={17} color="#dc2626" />
                  Delete Incident
                </button>
              </>
            ) : (
              <div className="m-notice">
                <Icon name="lock" size={16} color="#64748b" />
                <span>Only the uploader can edit, update or delete this incident.</span>
              </div>
            )}
          </Section>

          <Section icon="chat" title={`Comments (${comments.length})`}>
            {commentsLoading ? (
              <div className="m-spin-row">
                <span className="m-spin-sm is-blue" />
              </div>
            ) : comments.length === 0 ? (
              <p className="m-muted-small">No comments yet. Be the first to add an update.</p>
            ) : (
              <div className="m-comments">
                {comments.map((c) => (
                  <div key={c.id} className="m-comment">
                    <span className="m-comment-avatar">{c.username.slice(0, 1).toUpperCase()}</span>
                    <div>
                      <div className="m-comment-head">
                        <strong>{c.username}</strong>
                        <time>{formatDateTime(c.created_at)}</time>
                      </div>
                      <p>{c.comment_text}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="m-composer">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                maxLength={1000}
                rows={1}
                disabled={posting}
                onFocus={() => {
                  if (!expanded) snap(true);
                }}
              />
              <button type="button" aria-label="Post comment" disabled={!commentText.trim() || posting} onClick={postComment}>
                {posting ? <span className="m-spin-sm" /> : <Icon name="send" size={16} color="#ffffff" />}
              </button>
            </div>
          </Section>
          <div style={{ height: 24 }} />
        </div>
      </div>

      {statusMenu ? (
        <div className="m-dialog-backdrop" onClick={() => setStatusMenu(false)}>
          <div className="m-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>Update Status</h3>
            <p>Choose new status</p>
            <div className="m-status-options">
              <button type="button" onClick={() => updateStatus("open")}>Open</button>
              <button type="button" onClick={() => updateStatus("in_progress")}>In Progress</button>
              <button type="button" onClick={() => updateStatus("resolved")}>Resolved</button>
              <button type="button" className="is-cancel" onClick={() => setStatusMenu(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {preview !== null ? <Gallery photos={photos} start={preview} onClose={() => setPreview(null)} /> : null}
    </div>
  );
}

function InfoLine({ icon, text }: { icon: IconName; text: string }) {
  return (
    <div className="m-info-line">
      <Icon name={icon} size={15} color="#64748b" />
      <span>{text}</span>
    </div>
  );
}

function Section({ icon, title, children }: { icon: IconName; title: string; children: ReactNode }) {
  return (
    <section className="m-section">
      <div className="m-section-head">
        <Icon name={icon} size={18} color="#1267e8" />
        <h3>{title}</h3>
      </div>
      {children}
    </section>
  );
}

function DetailRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div className={last ? "m-detail-row is-last" : "m-detail-row"}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Thumb({ url, onClick }: { url: string; onClick: () => void }) {
  const src = useIncidentPhotoUrl(url);
  if (!src) return null;
  return (
    <button type="button" className="m-summary-thumb" onClick={onClick} aria-label="View image">
      <img src={src} alt="" />
    </button>
  );
}

function Photo({ url, onClick }: { url: string; onClick: () => void }) {
  const src = useIncidentPhotoUrl(url);
  return (
    <button type="button" className="m-photo" onClick={onClick} aria-label="View image">
      {src === undefined ? (
        <span className="m-spin-sm is-grey" />
      ) : src ? (
        <img src={src} alt="Incident evidence" />
      ) : (
        <span className="m-photo-fallback">
          <Icon name="images" size={24} color="#64748b" />
          Image unavailable
        </span>
      )}
    </button>
  );
}

// Full-screen viewer: swipe sideways between photos.
function Gallery({ photos, start, onClose }: { photos: string[]; start: number; onClose: () => void }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(start);

  useEffect(() => {
    const track = trackRef.current;
    if (track) track.scrollLeft = track.clientWidth * start;
  }, [start]);

  return (
    <div className="m-gallery" role="dialog" aria-modal="true" aria-label="Image viewer">
      <div className="m-gallery-top">
        <span>
          {index + 1} / {photos.length}
        </span>
        <button type="button" aria-label="Close" onClick={onClose}>
          <Icon name="close" size={24} color="#ffffff" />
        </button>
      </div>
      <div
        ref={trackRef}
        className="m-gallery-track"
        onScroll={(e) => {
          const el = e.currentTarget;
          setIndex(Math.round(el.scrollLeft / Math.max(1, el.clientWidth)));
        }}
      >
        {photos.map((url, i) => (
          <GallerySlide key={`${url}-${i}`} url={url} />
        ))}
      </div>
    </div>
  );
}

function GallerySlide({ url }: { url: string }) {
  const src = useIncidentPhotoUrl(url);
  return (
    <div className="m-gallery-slide">
      {src === undefined ? <span className="m-spin-sm" /> : src ? <img src={src} alt="Incident evidence" /> : <span>Image unavailable</span>}
    </div>
  );
}
