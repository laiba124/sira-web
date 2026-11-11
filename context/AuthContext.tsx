"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type Profile = {
  id: string;
  full_name?: string | null;
  company?: string | null;
  mobile_number?: string | null;
  role?: string | null;
  job_title?: string | null;
  username?: string | null;
};

type AuthValue = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadProfile(nextUser: User | null) {
    if (!nextUser) {
      setProfile(null);
      return;
    }
    const { data } = await supabase.from("sira_user_profiles").select("*").eq("id", nextUser.id).maybeSingle();
    setProfile((data as Profile | null) ?? {
      id: nextUser.id,
      full_name: String(nextUser.user_metadata?.full_name ?? nextUser.email?.split("@")[0] ?? "User"),
      username: nextUser.email ?? null,
    });
  }

  async function refreshProfile() {
    await loadProfile(user);
  }

  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(async ({ data }) => {
      if (!mounted) return;
      setUser(data.user ?? null);
      await loadProfile(data.user ?? null);
      if (mounted) setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      const next = session?.user ?? null;
      setUser(next);
      await loadProfile(next);
      if (mounted) setLoading(false);
    });
    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthValue>(() => ({
    user,
    profile,
    loading,
    refreshProfile,
    signOut: async () => { await supabase.auth.signOut(); },
  }), [user, profile, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
