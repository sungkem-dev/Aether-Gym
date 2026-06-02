/**
 * useAuth.ts — backward-compatible re-export
 *
 * This file re-exports `useAuthContext` as `useAuth` so that existing
 * components (Dashboard, Login, UploadMealDialog, etc.) that import
 * `useAuth` continue to work without changes.
 *
 * All new components should import directly from @/contexts/AuthContext.
 */
export { useAuthContext as useAuth } from "@/contexts/AuthContext";
