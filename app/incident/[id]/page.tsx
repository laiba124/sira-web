"use client";

import { useEffect } from "react";
import {
  useParams,
  useRouter,
} from "next/navigation";

export default function IncidentDetailRedirect() {
  const params =
    useParams<{ id: string }>();

  const router =
    useRouter();

  useEffect(() => {
    const incidentId =
      String(params?.id || "");

    if (!incidentId) {
      router.replace("/incidents");
      return;
    }

    router.replace(
      "/incidents?incident=" +
        encodeURIComponent(incidentId)
    );
  }, [params, router]);

  return (
    <div className="card empty">
      Opening incident details...
    </div>
  );
}