"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useAuth } from "@/context/AuthContext";
import Icon, { type IconName } from "@/components/mobile/Icon";
import { formatCount } from "@/components/mobile/shared";
import { fetchAllRows } from "@/lib/fetchAllRows";
import { getFunctionErrorMessage } from "@/lib/functionError";
import { isStrongPassword, PASSWORD_POLICY_TEXT } from "@/lib/passwordPolicy";
import { supabase } from "@/lib/supabase";

type MyStats = { total: number; open: number; resolved: number };

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "S";
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

export default function MobileMore() {
  const router = useRouter();
  const { user, profile, refreshProfile, signOut } = useAuth();
  const [stats, setStats] = useState<MyStats | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [dialog, setDialog] = useState<"job" | "password" | null>(null);

  const email = String(user?.email ?? "").trim();
  const name = profile?.full_name || "SIRA User";
  const currentJob = profile?.job_title || profile?.role || "";

  useEffect(() => {
    if (!user?.id) return;
    let active = true;
    (async () => {
      const { data, error } = await fetchAllRows<{ status: string | null }>((from, to) =>
        supabase
          .from("sira_incidents")
          .select("id, status")
          .eq("incident_type", "fiber_network_risk")
          .eq("reporter_user_id", user.id)
          .order("id")
          .range(from, to)
      );
      if (!active || error) return;
      const rows = data ?? [];
      setStats({
        total: rows.length,
        resolved: rows.filter((r) => r.status === "resolved").length,
        open: rows.filter((r) => r.status !== "resolved" && r.status !== "in_progress" && r.status !== "under_review").length,
      });
    })();
    // Admin status comes from the server; every admin action is still checked there.
    supabase.functions
      .invoke<{ isAdmin?: boolean }>("sira-user-admin", { body: { action: "admin-status" } })
      .then(({ data, error }) => active && setIsAdmin(!error && data?.isAdmin === true))
      .catch(() => active && setIsAdmin(false));
    return () => {
      active = false;
    };
  }, [user?.id]);

  async function logout() {
    if (!window.confirm("Log out?\nYou will need to sign in again to use SIRA.")) return;
    await signOut();
    router.replace("/auth");
  }

  return (
    <div className="m-page m-more">
      <div className="m-profile-card">
        <div className="m-cover" />
        <div className="m-avatar-ring">
          <div className="m-avatar">{initials(name)}</div>
        </div>
        <div className="m-profile-name">{name}</div>
        <div className="m-profile-role">{currentJob || "Add your job title"}</div>
        {profile?.company ? (
          <span className="m-company-pill">
            <Icon name="business" size={12} color="#1267e8" />
            {profile.company}
          </span>
        ) : null}
        <div className="m-profile-stats">
          <Stat label="Reported" value={stats?.total} />
          <i />
          <Stat label="Open" value={stats?.open} />
          <i />
          <Stat label="Resolved" value={stats?.resolved} />
        </div>
      </div>

      <div className="m-section-label">Account</div>
      <div className="m-group">
        <Row icon="person" label="Full name" value={name} />
        <Row icon="mail" label="Email" value={email || "Not available"} />
        <Row icon="call" label="Mobile" value={profile?.mobile_number || "Not added"} />
        <Row icon="business" label="Company" value={profile?.company || "Not set"} />
        <Row icon="briefcase" label="Job title" value={currentJob || "Add"} onPress={() => setDialog("job")} />
        <Row icon="key" label="Password" value="Change" onPress={() => setDialog("password")} />
      </div>

      <div className="m-section-label">App</div>
      <div className="m-group">
        {isAdmin ? (
          <Link href="/admin/users" className="m-row is-link">
            <span className="m-row-icon">
              <Icon name="shield" size={17} color="#1267e8" />
            </span>
            <span className="m-row-label">Admin Console</span>
            <span className="m-row-value is-link">Manage users</span>
            <Icon name="chevronRight" size={16} color="#94a3b8" />
          </Link>
        ) : null}
        <Row icon="info" label="Version" value="1.0.0" />
      </div>

      <button type="button" className="m-logout" onClick={logout}>
        <Icon name="logout" size={19} color="#dc2626" />
        Log out
      </button>

      <p className="m-footer">SIRA · Smart Incident Reporting</p>

      {dialog === "job" ? (
        <JobDialog
          initial={currentJob}
          onClose={() => setDialog(null)}
          onSave={async (value) => {
            if (!user?.id || !profile) return "Profile unavailable. Please log out and log in again.";
            const { error } = await supabase.from("sira_user_profiles").update({ job_title: value, role: value }).eq("id", user.id);
            if (error) return error.message;
            // Keep the reporter's job title on earlier incidents in step.
            const { error: incidentError } = await supabase
              .from("sira_incidents")
              .update({ reported_by_job_title: value })
              .eq("incident_type", "fiber_network_risk")
              .eq("reporter_user_id", user.id);
            await refreshProfile();
            if (incidentError) window.alert("Your job title was saved, but older incidents could not be updated: " + incidentError.message);
            return null;
          }}
        />
      ) : null}

      {dialog === "password" ? <PasswordDialog onClose={() => setDialog(null)} /> : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value?: number }) {
  return (
    <div className="m-profile-stat">
      <strong>{value === undefined ? "–" : formatCount(value)}</strong>
      <span>{label}</span>
    </div>
  );
}

function Row({ icon, label, value, onPress }: { icon: IconName; label: string; value: string; onPress?: () => void }) {
  const content = (
    <>
      <span className="m-row-icon">
        <Icon name={icon} size={17} color="#1267e8" />
      </span>
      <span className="m-row-label">{label}</span>
      <span className={onPress ? "m-row-value is-link" : "m-row-value"}>{value}</span>
      {onPress ? <Icon name="chevronRight" size={16} color="#94a3b8" /> : null}
    </>
  );
  return onPress ? (
    <button type="button" className="m-row is-link" onClick={onPress}>
      {content}
    </button>
  ) : (
    <div className="m-row">{content}</div>
  );
}

function JobDialog({ initial, onClose, onSave }: { initial: string; onClose: () => void; onSave: (value: string) => Promise<string | null> }) {
  const [value, setValue] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) {
      setError("Please enter your job title or designation.");
      return;
    }
    setSaving(true);
    const problem = await onSave(trimmed);
    setSaving(false);
    if (problem) setError(problem);
    else onClose();
  }

  return (
    <div className="m-dialog-backdrop" onClick={() => !saving && onClose()}>
      <form className="m-dialog" onClick={(e) => e.stopPropagation()} onSubmit={save}>
        <h3>Job title</h3>
        <p>Shown on your profile and on incidents you have reported.</p>
        {error ? <div className="m-error">{error}</div> : null}
        <input className="m-input" value={value} onChange={(e) => setValue(e.target.value)} placeholder="e.g. Network Engineer" autoCapitalize="words" autoFocus />
        <div className="m-dialog-actions">
          <button type="button" className="m-btn-cancel" disabled={saving} onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="m-btn-save" disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}

function PasswordDialog({ onClose }: { onClose: () => void }) {
  const [current, setCurrent] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!current || !password || !confirm) return setError("Please complete all fields.");
    if (!isStrongPassword(password)) return setError(PASSWORD_POLICY_TEXT);
    if (password !== confirm) return setError("The two new passwords do not match.");
    if (password === current) return setError("The new password must be different from the current one.");
    setSaving(true);
    const { data, error: fnError } = await supabase.functions.invoke<{ ok?: boolean; message?: string }>("sira-user-admin", {
      body: { action: "change-password", currentPassword: current, password },
    });
    if (fnError || !data?.ok) {
      setSaving(false);
      setError(data?.message || (await getFunctionErrorMessage(fnError)) || "Password not changed. Please try again.");
      return;
    }
    await supabase.auth.refreshSession();
    setSaving(false);
    setDone(true);
  }

  const type = show ? "text" : "password";

  return (
    <div className="m-dialog-backdrop" onClick={() => !saving && onClose()}>
      <form className="m-dialog" onClick={(e) => e.stopPropagation()} onSubmit={save}>
        <h3>Change password</h3>
        {done ? (
          <>
            <p>Your new password is now active.</p>
            <div className="m-dialog-actions">
              <button type="button" className="m-btn-save" onClick={onClose}>
                Done
              </button>
            </div>
          </>
        ) : (
          <>
            <p>{PASSWORD_POLICY_TEXT}</p>
            {error ? <div className="m-error">{error}</div> : null}
            <input className="m-input" type={type} value={current} onChange={(e) => setCurrent(e.target.value)} placeholder="Current password" autoComplete="current-password" />
            <input className="m-input" type={type} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password" autoComplete="new-password" />
            <input className="m-input" type={type} value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Confirm new password" autoComplete="new-password" />
            <label className="m-check">
              <input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} /> Show passwords
            </label>
            <div className="m-dialog-actions">
              <button type="button" className="m-btn-cancel" disabled={saving} onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="m-btn-save" disabled={saving}>
                {saving ? "Saving..." : "Change"}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}
