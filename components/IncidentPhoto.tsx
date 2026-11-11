"use client";

import { useEffect, useState } from "react";

import { resolveIncidentPhotoUrl } from "@/lib/photoStorage";

// Shows a private incident photo through a signed URL. With `link`, the image
// opens full size in a new tab.
export default function IncidentPhoto({ url, alt, link = false }: { url: string; alt: string; link?: boolean }) {
  const [src, setSrc] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    let active = true;
    setSrc(undefined);
    resolveIncidentPhotoUrl(url).then((signed) => {
      if (active) setSrc(signed);
    });
    return () => {
      active = false;
    };
  }, [url]);

  if (!src) {
    return <div className="small muted" style={{ padding: 12 }}>{src === undefined ? "Loading image..." : "Image unavailable"}</div>;
  }

  const image = <img src={src} alt={alt} />;
  return link ? (
    <a href={src} target="_blank" rel="noreferrer">
      {image}
    </a>
  ) : (
    image
  );
}
