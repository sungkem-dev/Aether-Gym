/**
 * AuthContext.tsx — Global Authentication Context
 *
 * Provides: user, session, role, isMember, isMembershipLoading, refreshMembership
 *
 * KEY DESIGN DECISIONS:
 * ─────────────────────
 * 1. Two-phase loading:
 *    `loading`           = Supabase session is being resolved (blocks all route guards)
 *    `membershipLoading` = /api/payment/status fetch is in-flight (blocks MemberRoute only)
 *
 *    This prevents the race condition where MemberRoute evaluates `isMember=false`
 *    while the status fetch is still pending — causing a false redirect to /pricing.
 *
 * 2. refreshMembership() returns a Promise<boolean> so callers (e.g. Payment.tsx)
 *    can await it and know whether membership is now active before navigating.
 */
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

// ─── Types ────────────────────────────────────────────────────────────────────

interface MembershipStatus {
  role: "guest" | "member" | "admin";
  is_active_member: boolean;
  target_calories: number;
  membership: {
    plan_name: string;
    end_date: string;
    status: string;
  } | null;
}

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  accessToken: string | null;
  role: "guest" | "member" | "admin";
  isMember: boolean;
  isAdmin: boolean;
  membershipStatus: MembershipStatus | null;
  /** True while Supabase session is being resolved on mount */
  loading: boolean;
  /** True while /api/payment/status fetch is in-flight */
  membershipLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  /**
   * Re-fetches membership status from the backend.
   * Returns true if the user is now an active member.
   */
  refreshMembership: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [membershipLoading, setMembershipLoading] = useState(false);
  const [membershipStatus, setMembershipStatus] = useState<MembershipStatus | null>(null);

  // Fetch membership/role status from our backend.
  // Returns the parsed status so callers can inspect it immediately.
  const fetchMembershipStatus = useCallback(async (token: string): Promise<MembershipStatus | null> => {
    setMembershipLoading(true);
    try {
      const res = await fetch("/api/payment/status", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const status = data.data as MembershipStatus;
        setMembershipStatus(status);
        return status;
      }
      return null;
    } catch {
      console.warn("[Auth] Could not fetch membership status (offline?)");
      return null;
    } finally {
      setMembershipLoading(false);
    }
  }, []);

  useEffect(() => {
    // Phase 1: resolve existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.access_token) {
        fetchMembershipStatus(session.access_token);
      } else {
        setMembershipStatus(null);
      }
      setLoading(false);
    });

    // Phase 2: keep in sync with auth state changes (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.access_token) {
        fetchMembershipStatus(session.access_token);
      } else {
        setMembershipStatus(null);
        setMembershipLoading(false);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchMembershipStatus]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signUp = async (email: string, password: string, name: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setMembershipStatus(null);
    setMembershipLoading(false);
  };

  /**
   * Refreshes the membership status from the backend.
   * Called by Payment.tsx after a successful Midtrans payment.
   * Returns true if the user is NOW an active member.
   */
  const refreshMembership = useCallback(async (): Promise<boolean> => {
    const token = (await supabase.auth.getSession()).data.session?.access_token;
    if (!token) return false;
    const status = await fetchMembershipStatus(token);
    return status?.is_active_member ?? false;
  }, [fetchMembershipStatus]);

  const role = membershipStatus?.role ?? "guest";

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        accessToken: session?.access_token ?? null,
        role,
        isMember: membershipStatus?.is_active_member ?? false,
        isAdmin: role === "admin",
        membershipStatus,
        loading,
        membershipLoading,
        signIn,
        signUp,
        signOut,
        refreshMembership,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error(
      "useAuthContext must be used inside <AuthProvider>. Wrap your app in App.tsx."
    );
  }
  return ctx;
}
