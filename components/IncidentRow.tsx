import Link from "next/link";
import type { KeyboardEvent } from "react";
import type { SiraIncident } from "@/types/incident";
import {
  formatDateShort,
  getPublicIncidentCode,
  getShortStatusLabel,
} from "@/types/incident";
import { inferSiraArea } from "@/lib/siraAreas";

type Props = {
  i: SiraIncident;
  variant?: "row" | "tile";
  selected?: boolean;
  onSelect?: () => void;
};

export default function IncidentRow({
  i,
  variant = "row",
  selected = false,
  onSelect,
}: Props) {
  const area = inferSiraArea(i);

  const location = area
    ? `${area.subRegion} / ${area.name}`
    : i.city || "Location not classified";

  const code = getPublicIncidentCode(i);

  /*
   * The incidents page still calls variant="tile".
   * It now renders a dense operational list row instead of a card.
   * This keeps the existing page/map logic unchanged.
   */
  if (variant === "tile") {
    const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onSelect?.();
      }
    };

    return (
      <article
        className={`incident-list-row ${selected ? "selected" : ""}`}
        role="button"
        tabIndex={0}
        aria-pressed={selected}
        onClick={onSelect}
        onKeyDown={handleKeyDown}
      >
        <div className="incident-list-badges incident-list-status">
          <span className={`badge ${i.severity}`}>
            {String(i.severity).toUpperCase()}
          </span>

          <span className={`badge ${i.status}`}>
            {getShortStatusLabel(i.status)}
          </span>
        </div>

        <div className="incident-list-primary">
          <div className="incident-list-title">
            <h3 title={i.title}>{i.title}</h3>
            <span className="incident-code">{code}</span>
          </div>
        </div>

        <div className="incident-list-workflow">
          <span className="incident-list-label">Workflow</span>

          <span className="workflow-chip">
            {i.stage || "Threat"}
            <b> - </b>
            {i.sub_stage || "Reported"}
          </span>
        </div>

        <div className="incident-list-location">
          <span className="incident-list-label">Location</span>
          <strong title={location}>{location}</strong>
        </div>

        <div className="incident-list-date">
          <span className="incident-list-label">Reported</span>
          <strong>{formatDateShort(i.created_at)}</strong>
        </div>

        <div className="incident-list-actions">
          <span className={`incident-map-state ${selected ? "active" : ""}`}>
            <span className="incident-map-state-dot" />
            {selected ? "On map" : "Locate"}
          </span>

          <Link
            href={`/incident/${i.id}`}
            className="incident-detail-link"
            onClick={(event) => event.stopPropagation()}
          >
            View
          </Link>
        </div>
      </article>
    );
  }

  return (
    <Link href={`/incident/${i.id}`} className="incident-card">
      <div>
        <div className="pill-row">
          <span className={`badge ${i.severity}`}>
            {String(i.severity).toUpperCase()}
          </span>

          <span className={`badge ${i.status}`}>
            {getShortStatusLabel(i.status)}
          </span>

          <span className="badge">
            {i.stage || "Threat"} - {i.sub_stage || "Reported"}
          </span>
        </div>

        <h3>{i.title}</h3>

        <p>
          {code} - {location} - {formatDateShort(i.created_at)}
        </p>
      </div>

      <div className="incident-row-action">View</div>
    </Link>
  );
}

