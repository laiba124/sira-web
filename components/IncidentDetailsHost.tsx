"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

import { useAuth } from "@/context/AuthContext";
import { getIncident } from "@/lib/incidents";
import { inferSiraArea } from "@/lib/siraAreas";
import IncidentPhoto from "@/components/IncidentPhoto";
import { supabase } from "@/lib/supabase";
import { useIsMobile } from "@/lib/useIsMobile";
import MobileIncidentDetail from "@/components/mobile/screens/MobileIncidentDetail";

import type { SiraIncident } from "@/types/incident";

import {
  formatDateShort,
  getPublicIncidentCode,
  getShortStatusLabel,
} from "@/types/incident";

type HistoryRow = {
  id: string;
  stage: string;
  sub_stage: string;
  action_plan?: string | null;
  threat_details?: string | null;
  action_plan_details?: string | null;
  changed_by_username?: string | null;
  changed_at: string;
};

function coordinate(value: number) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "Not available";
  }

  return number.toFixed(5);
}

export default function IncidentDetailsHost() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const { user } = useAuth();

  const [incident, setIncident] =
    useState<SiraIncident | null>(null);

  const [history, setHistory] =
    useState<HistoryRow[]>([]);

  const [open, setOpen] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const requestId = useRef(0);

  // Phones show the Android-style details screen, which loads its own data.
  const isMobile = useIsMobile();
  const isMobileRef = useRef(isMobile);
  isMobileRef.current = isMobile;
  const [openId, setOpenId] =
    useState<string | null>(null);

  const closeModal = useCallback(() => {
    requestId.current += 1;

    setOpen(false);
    setOpenId(null);
    setIncident(null);
    setHistory([]);
    setError("");
    setLoading(false);
  }, []);

  const openIncident = useCallback(
    async (incidentId: string) => {
      if (!incidentId) return;

      const currentRequest = ++requestId.current;

      setOpenId(incidentId);

      if (isMobileRef.current) {
        setOpen(true);
        return;
      }

      setOpen(true);
      setLoading(true);
      setError("");
      setHistory([]);
      setIncident(null);

      try {
        const nextIncident =
          await getIncident(incidentId);

        if (requestId.current !== currentRequest) {
          return;
        }

        setIncident(nextIncident);

        const { data: historyData } =
          await supabase
            .from("sira_incident_stage_history")
            .select(
              "id,stage,sub_stage,action_plan,threat_details,action_plan_details,changed_by_username,changed_at"
            )
            .eq("incident_id", incidentId)
            .order("changed_at", {
              ascending: false,
            });

        if (requestId.current !== currentRequest) {
          return;
        }

        setHistory(
          (historyData || []) as HistoryRow[]
        );
      } catch (problem: unknown) {
        if (requestId.current !== currentRequest) {
          return;
        }

        setError(
          problem instanceof Error
            ? problem.message
            : "Incident details could not be loaded."
        );
      } finally {
        if (requestId.current === currentRequest) {
          setLoading(false);
        }
      }
    },
    []
  );

  // This event allows any React or Leaflet component to open
  // the same modal without routing to another page.
  useEffect(() => {
    function handleCustomEvent(event: Event) {
      const custom =
        event as CustomEvent<string>;

      if (custom.detail) {
        openIncident(custom.detail);
      }
    }

    window.addEventListener(
      "sira:open-incident-details",
      handleCustomEvent
    );

    return () => {
      window.removeEventListener(
        "sira:open-incident-details",
        handleCustomEvent
      );
    };
  }, [openIncident]);

  // Intercept all existing incident detail links application-wide.
  // This means old links do not have to be rewritten individually.
  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target =
        event.target instanceof Element
          ? event.target
          : null;

      const anchor =
        target?.closest("a[href]");

      if (!(anchor instanceof HTMLAnchorElement)) {
        return;
      }

      const href =
        anchor.getAttribute("href");

      if (!href) return;

      let url: URL;

      try {
        url = new URL(
          href,
          window.location.origin
        );
      } catch {
        return;
      }

      if (
        url.origin !== window.location.origin
      ) {
        return;
      }

      const match =
        url.pathname.match(
          /^\/incident\/([^/]+)\/?$/
        );

      if (!match) {
        return;
      }

      const incidentId =
        decodeURIComponent(match[1]);

      if (
        !incidentId ||
        incidentId === "edit"
      ) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      openIncident(incidentId);
    }

    // Capture phase is intentional.
    // It also catches links rendered inside Leaflet popups.
    document.addEventListener(
      "click",
      handleClick,
      true
    );

    return () => {
      document.removeEventListener(
        "click",
        handleClick,
        true
      );
    };
  }, [openIncident]);

  // Support old/deep links redirected as:
  // /incidents?incident=<id>
  useEffect(() => {
    const requestedIncident =
      searchParams.get("incident");

    if (!requestedIncident) {
      return;
    }

    openIncident(requestedIncident);

    router.replace(pathname, {
      scroll: false,
    });
  }, [
    pathname,
    router,
    searchParams,
    openIncident,
  ]);

  // Escape closes the modal.
  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    function handleEscape(
      event: KeyboardEvent
    ) {
      if (event.key === "Escape") {
        closeModal();
      }
    }

    window.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [open, closeModal]);

  if (!open) {
    return null;
  }

  if (isMobile) {
    return openId ? (
      <MobileIncidentDetail
        key={openId}
        incidentId={openId}
        onClose={closeModal}
      />
    ) : null;
  }

  const area =
    incident
      ? inferSiraArea(incident)
      : null;

  const location =
    incident
      ? area
        ? area.subRegion + " / " + area.name
        : incident.city ||
          incident.address_text ||
          "Location not classified"
      : "";

  const isOwner = Boolean(
    user?.id &&
    incident?.reporter_user_id === user.id
  );

  return (
    <div
      className="sira-modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          closeModal();
        }
      }}
    >
      <section
        className="sira-details-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sira-incident-modal-title"
      >
        <header className="sira-modal-header">
          <div className="sira-modal-heading">
            <span className="sira-modal-eyebrow">
              Incident details
            </span>

            {incident ? (
              <>
                <div className="sira-modal-title-line">
                  <h2 id="sira-incident-modal-title">
                    {incident.title}
                  </h2>

                  <span className="sira-modal-code">
                    {getPublicIncidentCode(
                      incident
                    )}
                  </span>
                </div>

                <div className="sira-modal-badges">
                  <span
                    className={
                      "badge " +
                      String(
                        incident.severity
                      )
                    }
                  >
                    {String(
                      incident.severity
                    ).toUpperCase()}
                  </span>

                  <span
                    className={
                      "badge " +
                      String(
                        incident.status
                      )
                    }
                  >
                    {getShortStatusLabel(
                      incident.status
                    )}
                  </span>
                </div>
              </>
            ) : (
              <h2 id="sira-incident-modal-title">
                Incident
              </h2>
            )}
          </div>

          <button
            type="button"
            className="sira-modal-close"
            onClick={closeModal}
            aria-label="Close incident details"
          >
            X
          </button>
        </header>

        <div className="sira-modal-body">
          {loading ? (
            <div className="sira-modal-loading">
              <div className="spinner" />
              <span>
                Loading incident details...
              </span>
            </div>
          ) : error ? (
            <div className="notice error">
              {error}
            </div>
          ) : incident ? (
            <>
              <div className="sira-modal-summary-grid">
                <div className="sira-detail-stat">
                  <span>Stage</span>
                  <strong>
                    {incident.stage ||
                      "Threat"}
                  </strong>
                </div>

                <div className="sira-detail-stat">
                  <span>Sub-stage</span>
                  <strong>
                    {incident.sub_stage ||
                      "Reported"}
                  </strong>
                </div>

                <div className="sira-detail-stat">
                  <span>Reported</span>
                  <strong>
                    {formatDateShort(
                      incident.created_at
                    )}
                  </strong>
                </div>

                <div className="sira-detail-stat">
                  <span>Location</span>
                  <strong>
                    {location}
                  </strong>
                </div>
              </div>

              <div className="sira-modal-section-grid">
                <section className="sira-modal-section">
                  <h3>
                    Incident information
                  </h3>

                  <div className="sira-detail-table">
                    <div>
                      <span>Reporter</span>
                      <strong>
                        {incident.reported_by_name ||
                          "Not provided"}
                      </strong>
                    </div>

                    <div>
                      <span>Job title</span>
                      <strong>
                        {incident.reported_by_job_title ||
                          "Not provided"}
                      </strong>
                    </div>

                    <div>
                      <span>Company</span>
                      <strong>
                        {incident.reported_by_company ||
                          "Not provided"}
                      </strong>
                    </div>

                    <div>
                      <span>Phone</span>
                      <strong>
                        {incident.reported_by_phone ||
                          "Not provided"}
                      </strong>
                    </div>

                    <div>
                      <span>Latitude</span>
                      <strong>
                        {coordinate(
                          incident.latitude
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>Longitude</span>
                      <strong>
                        {coordinate(
                          incident.longitude
                        )}
                      </strong>
                    </div>
                  </div>
                </section>

                <section className="sira-modal-section">
                  <h3>
                    Workflow information
                  </h3>

                  <div className="sira-detail-table">
                    <div>
                      <span>Stage</span>
                      <strong>
                        {incident.stage ||
                          "Threat"}
                      </strong>
                    </div>

                    <div>
                      <span>Sub-stage</span>
                      <strong>
                        {incident.sub_stage ||
                          "Reported"}
                      </strong>
                    </div>

                    <div>
                      <span>Action plan</span>
                      <strong>
                        {incident.action_plan ||
                          "Not selected"}
                      </strong>
                    </div>
                  </div>
                </section>
              </div>

              <section className="sira-modal-section">
                <h3>Description</h3>

                <p className="sira-detail-copy">
                  {incident.description ||
                    "No description provided."}
                </p>
              </section>

              <div className="sira-modal-section-grid">
                <section className="sira-modal-section">
                  <h3>
                    Threat details
                  </h3>

                  <p className="sira-detail-copy">
                    {incident.threat_details ||
                      "No threat details provided."}
                  </p>
                </section>

                <section className="sira-modal-section">
                  <h3>
                    Action plan details
                  </h3>

                  <p className="sira-detail-copy">
                    {incident.action_plan_details ||
                      "No action plan details provided."}
                  </p>
                </section>
              </div>

              <section className="sira-modal-section">
                <h3>Support required</h3>

                <p className="sira-detail-copy">
                  {incident.support_required ||
                    "No support request provided."}
                </p>
              </section>

              <section className="sira-modal-section">
                <h3>Address</h3>

                <p className="sira-detail-copy">
                  {incident.address_text ||
                    location}
                </p>
              </section>

              {incident.photo_urls &&
                incident.photo_urls.length >
                  0 && (
                  <section className="sira-modal-section">
                    <h3>
                      Incident pictures
                    </h3>

                    <div className="sira-modal-photos">
                      {incident.photo_urls
                        .slice(0, 4)
                        .map((url) => (
                          <IncidentPhoto
                            key={url}
                            url={url}
                            alt="Incident evidence"
                            link
                          />
                        ))}
                    </div>
                  </section>
                )}

              <section className="sira-modal-section">
                <div className="sira-modal-section-title">
                  <h3>
                    Workflow audit history
                  </h3>

                  <span>
                    {history.length} changes
                  </span>
                </div>

                {history.length ? (
                  <div className="sira-modal-history">
                    {history.map((item) => {
                      const isThreatStage =
                        item.stage === "Threat";

                      const isActionPlanStage =
                        item.stage === "Action Plan";

                      const stageDetails =
                        isThreatStage
                          ? item.threat_details
                          : isActionPlanStage
                            ? item.action_plan_details
                            : null;

                      return (
                        <div
                          className="sira-history-row"
                          key={item.id}
                        >
                          <div className="sira-history-content">
                            <div className="sira-history-heading">
                              <div>
                                <strong>
                                  {item.stage +
                                    " - " +
                                    item.sub_stage}
                                </strong>

                                <span className="sira-history-user">
                                  {item.changed_by_username ||
                                    "SIRA user"}
                                </span>
                              </div>

                              <time>
                                {formatDateShort(
                                  item.changed_at
                                )}
                              </time>
                            </div>

                            {isActionPlanStage &&
                              item.action_plan && (
                                <div className="sira-history-detail-block">
                                  <span className="sira-history-detail-label">
                                    Action Plan
                                  </span>

                                  <p>
                                    {item.action_plan}
                                  </p>
                                </div>
                              )}

                            {stageDetails && (
                              <div className="sira-history-detail-block">
                                <span className="sira-history-detail-label">
                                  {isThreatStage
                                    ? "Threat Details"
                                    : "Stage Details"}
                                </span>

                                <p>
                                  {stageDetails}
                                </p>
                              </div>
                            )}

                            {!stageDetails &&
                              !(
                                isActionPlanStage &&
                                item.action_plan
                              ) && (
                                <p className="sira-history-no-detail">
                                  No additional stage details were recorded.
                                </p>
                              )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="sira-detail-copy">
                    No workflow history found.
                  </p>
                )}
              </section>
            </>
          ) : null}
        </div>

        <footer className="sira-modal-footer">
          <button
            type="button"
            className="btn"
            onClick={closeModal}
          >
            Close
          </button>

          {incident && isOwner && (
            <Link
              href={
                "/incident/edit/" +
                incident.id
              }
              className="btn primary"
              onClick={closeModal}
            >
              Edit incident
            </Link>
          )}
        </footer>
      </section>
    </div>
  );
}