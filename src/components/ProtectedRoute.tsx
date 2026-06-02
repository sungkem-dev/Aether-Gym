/**
 * ProtectedRoute.tsx — Route Guard Components
 *
 * Three guards:
 *
 *   <ProtectedRoute>
 *     → Must be logged in (Supabase session exists)
 *     → Redirects to /login if not authenticated
 *
 *   <MemberRoute>
 *     → Must be logged in AND have an active membership
 *     → Waits for BOTH session loading AND membership API fetch to settle
 *     → Redirects to /pricing if logged in but no active membership
 *     → Redirects to /login if not logged in at all
 *
 *   <GuestRoute>
 *     → Intended for /login and /register ONLY
 *     → If user is logged in AND is an active member → redirect to /dashboard
 *     → If user is logged in but NOT a member → allow through (they just registered
 *       and need to reach /pricing — don't create a redirect loop here)
 *
 * ─── The Race Condition Fix ───────────────────────────────────────────────────
 *   Without `membershipLoading`:
 *     1. Payment success → refreshMembership() starts fetch
 *     2. navigate("/dashboard") fires immediately
 *     3. MemberRoute renders → isMember is still false → redirect to /pricing
 *     4. User ends up back on pricing even though payment succeeded ❌
 *
 *   With `membershipLoading`:
 *     MemberRoute shows spinner until the fetch resolves, then evaluates isMember.
 *     Payment.tsx awaits refreshMembership() returning true before navigating.
 */
import { Navigate } from "react-router-dom";
import { useAuthContext } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";

// ─── Shared Loading Spinner ───────────────────────────────────────────────────
function AuthLoading({ message = "Checking session..." }: { message?: string }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground text-sm">{message}</p>
      </div>
    </div>
  );
}

// ─── ProtectedRoute: Login required ──────────────────────────────────────────
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuthContext();

  if (loading) return <AuthLoading />;
  if (!user) return <Navigate to="/login" replace />;

  return <>{children}</>;
}

// ─── MemberRoute: Active membership required ──────────────────────────────────
// Waits for BOTH session + membership status before making any decisions.
export function MemberRoute({ children }: { children: ReactNode }) {
  const { user, isMember, isAdmin, loading, membershipLoading } = useAuthContext();

  // Phase 1: Supabase session is still resolving
  if (loading) return <AuthLoading />;

  // Not logged in at all
  if (!user) return <Navigate to="/login" replace />;

  // Phase 2: Session confirmed but membership API call is still in-flight.
  // Show spinner instead of prematurely redirecting to /pricing.
  if (membershipLoading) return <AuthLoading message="Verifying membership..." />;

  // Admins always get in
  if (isAdmin) return <>{children}</>;

  // No active membership → send to pricing
  if (!isMember) return <Navigate to="/pricing" replace />;

  return <>{children}</>;
}

// ─── GuestRoute: Blocks access to /login and /register for authenticated users ─
// IMPORTANT: Only redirects away if the user IS a member.
// A logged-in user WITHOUT a membership (just registered) is allowed through
// so they can reach /register → /pricing without a loop.
export function GuestRoute({ children }: { children: ReactNode }) {
  const { user, isMember, isAdmin, loading, membershipLoading } = useAuthContext();

  if (loading) return <AuthLoading />;

  // Still fetching membership status — don't make redirect decisions yet
  if (user && membershipLoading) return <AuthLoading message="Loading your profile..." />;

  // Fully authenticated member → go to dashboard
  if (user && (isMember || isAdmin)) return <Navigate to="/dashboard" replace />;

  // Logged in but no membership → let them through to /register or /login
  // (they need to reach /pricing to complete membership purchase)
  // They will see the Navbar "Join Now" button pointing them to /pricing.

  return <>{children}</>;
}
