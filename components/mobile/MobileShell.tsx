"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useAuth } from "@/context/AuthContext";
import Icon, { type IconName } from "@/components/mobile/Icon";
import { countNewAlerts, markAlertsSeen } from "@/components/mobile/shared";

const BADGE_REFRESH_MS = 60 * 1000;

type NavItem = { href: string; label: string; title: string; subtitle: string; icon: IconName };

const NAV: NavItem[] = [
  { href: "/map", label: "Map", title: "Incident Map", subtitle: "View live fiber-risk incidents", icon: "map" },
  { href: "/dashboard", label: "Dashboard", title: "Incident Dashboard", subtitle: "Incident status, severity and areas", icon: "grid" },
  { href: "/incidents", label: "Incidents", title: "Incidents", subtitle: "Search and review reported incidents", icon: "list" },
  { href: "/report", label: "Report", title: "Report Incident", subtitle: "Create a new incident report", icon: "addCircle" },
  { href: "/alerts", label: "Alerts", title: "Alerts", subtitle: "Review notifications and updates", icon: "bell" },
  { href: "/more", label: "More", title: "More", subtitle: "Profile and application settings", icon: "more" },
];

function isActive(pathname: string, href: string) {
  if (href === "/incidents") return pathname === "/incidents" || pathname.startsWith("/incident/");
  return pathname === href || pathname.startsWith(href + "/");
}

export default function MobileShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [menuOpen, setMenuOpen] = useState(false);
  const [badge, setBadge] = useState(0);

  const onAlerts = pathname === "/alerts";
  // Screens opened on top of a tab show a back arrow instead of the menu.
  const showBack = pathname.startsWith("/incident/edit") || pathname.startsWith("/admin");

  useEffect(() => setMenuOpen(false), [pathname]);

  // Live alert badge; opening Alerts clears it.
  useEffect(() => {
    let active = true;
    async function refresh() {
      if (onAlerts) {
        markAlertsSeen();
        if (active) setBadge(0);
        return;
      }
      const count = await countNewAlerts(userId);
      if (active) setBadge(count);
    }
    refresh();
    const timer = setInterval(refresh, BADGE_REFRESH_MS);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [onAlerts, userId]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  function goBack() {
    if (window.history.length > 1) router.back();
    else router.replace("/incidents");
  }

  return (
    <div className="m-app">
      <header className="m-topbar">
        {showBack ? (
          <button type="button" className="m-topbar-btn m-topbar-back" onClick={goBack} aria-label="Go back">
            <Icon name="back" size={22} color="#1267e8" />
          </button>
        ) : (
          <button type="button" className="m-topbar-btn" onClick={() => setMenuOpen(true)} aria-label="Open navigation menu">
            <Icon name="menu" size={26} color="#0f172a" />
          </button>
        )}

        <div className="m-logo-circle">
          <Icon name="radio" size={20} color="#0e7490" />
        </div>

        <div className="m-brand">
          <strong>SIRA</strong>
          <span>Smart Incident Reporting</span>
        </div>

        <Link href="/alerts" className="m-topbar-icon" aria-label="Open alerts">
          <Icon name="bell" size={23} color="#0f172a" />
          {badge > 0 ? <span className="m-badge">{badge > 99 ? "99+" : badge}</span> : null}
        </Link>

        <Link href="/more" className="m-topbar-icon" aria-label="Open settings">
          <Icon name="settings" size={23} color="#0f172a" />
        </Link>
      </header>

      <main className="m-main">{children}</main>

      <nav className="m-tabs" aria-label="Main">
        {NAV.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={active ? "m-tab is-active" : "m-tab"}
              aria-current={active ? "page" : undefined}
            >
              <Icon name={item.icon} size={24} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {menuOpen ? (
        <div className="m-drawer-root" role="dialog" aria-modal="true" aria-label="Navigation">
          <button type="button" className="m-drawer-backdrop" aria-label="Close navigation menu" onClick={() => setMenuOpen(false)} />
          <aside className="m-drawer">
            <div className="m-drawer-head">
              <div className="m-drawer-logo">
                <Icon name="radio" size={28} color="#ffffff" />
              </div>
              <div className="m-drawer-brand">
                <strong>SIRA</strong>
                <span>Smart Incident Reporting</span>
              </div>
              <button type="button" className="m-drawer-close" onClick={() => setMenuOpen(false)} aria-label="Close navigation menu">
                <Icon name="close" size={22} color="#334155" />
              </button>
            </div>

            <div className="m-drawer-label">NAVIGATION</div>

            <div className="m-drawer-list">
              {NAV.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <Link key={item.href} href={item.href} className={active ? "m-drawer-item is-active" : "m-drawer-item"} onClick={() => setMenuOpen(false)}>
                    <span className="m-drawer-icon">
                      <Icon name={item.icon} size={22} />
                    </span>
                    <span className="m-drawer-text">
                      <strong>{item.title}</strong>
                      <small>{item.subtitle}</small>
                    </span>
                    <Icon name="chevronRight" size={19} color={active ? "#1267e8" : "#94a3b8"} />
                  </Link>
                );
              })}
            </div>

            <div className="m-drawer-footer">
              <Icon name="shield" size={19} color="#0f766e" />
              <span>Connected to the central SIRA Supabase database</span>
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
