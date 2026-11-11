"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import IncidentDetailsHost from "@/components/IncidentDetailsHost";
import MobileShell from "@/components/mobile/MobileShell";
import { useIsMobile } from "@/lib/useIsMobile";

const nav = [
  ["/map", "Map", "M"],
  ["/dashboard", "Dashboard", "D"],
  ["/incidents", "Incidents", "I"],
  ["/report", "Report", "+"],
  ["/alerts", "Alerts", "A"],
  ["/more", "More", "..."],
] as const;

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isMobile = useIsMobile();

  const publicPage = pathname === "/auth" || pathname === "/signup";

  useEffect(() => {
    if (!loading && !user && !publicPage) router.replace("/auth");
  }, [loading, user, publicPage, router]);

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!drawerOpen) return;

    const previousOverflow = document.body.style.overflow;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setDrawerOpen(false);
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [drawerOpen]);

  if (publicPage) return <>{children}</>;

  if (loading || !user) {
    return (
      <div className="center-screen">
        <div className="spinner" />
        <p>Loading SIRA...</p>
      </div>
    );
  }

  // Phones get the SIRA Android app layout (top bar, menu, bottom tabs).
  if (isMobile) {
    return (
      <>
        <MobileShell>{children}</MobileShell>
        <Suspense fallback={null}>
          <IncidentDetailsHost />
        </Suspense>
      </>
    );
  }

  return (
    <div className="shell sira-map-first-shell">
      <button
        type="button"
        className={`sira-menu-button ${drawerOpen ? "is-open" : ""}`}
        onClick={() => setDrawerOpen((open) => !open)}
        aria-label={drawerOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={drawerOpen}
        aria-controls="sira-navigation-drawer"
      >
        <span className="sira-menu-lines" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      </button>

      <button
        type="button"
        className={`sira-drawer-backdrop ${drawerOpen ? "is-open" : ""}`}
        onClick={() => setDrawerOpen(false)}
        aria-label="Close navigation menu"
        tabIndex={drawerOpen ? 0 : -1}
      />

      <aside
        id="sira-navigation-drawer"
        className={`sidebar sira-drawer ${drawerOpen ? "is-open" : ""}`}
        aria-hidden={!drawerOpen}
      >
        <div className="brand">
          <img src="/sira-icon.png" alt="SIRA" />
          <div>
            <strong>SIRA</strong>
            <span>Web Console</span>
          </div>
        </div>

        <nav>
          {nav.map(([href, label, icon]) => {
            const active =
              pathname === href ||
              (href === "/incidents" && pathname.startsWith("/incident"));

            return (
              <Link
                key={href}
                href={href}
                className={active ? "nav-item active" : "nav-item"}
                onClick={() => setDrawerOpen(false)}
              >
                <span className="nav-icon" aria-hidden="true">
                  {icon}
                </span>
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-user">
          <div className="avatar">
            {(profile?.full_name || user.email || "U").slice(0, 1).toUpperCase()}
          </div>
          <div>
            <strong>{profile?.full_name || "SIRA User"}</strong>
            <span>{profile?.job_title || profile?.role || user.email}</span>
          </div>
        </div>
      </aside>

      <main className="main-content">{children}</main>

      <Suspense fallback={null}>
        <IncidentDetailsHost />
      </Suspense>
    </div>
  );
}

