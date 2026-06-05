import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, isAdmin, membershipLoading } = useAuth();

  // Wait for both initial auth load AND the subsequent membership status fetch
  if (loading || membershipLoading) {
    return <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <p className="text-muted-foreground text-sm">Verifying administrator access...</p>
    </div>;
  }

  // Double check the user is an admin using the validated context flag
  if (!user || !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
