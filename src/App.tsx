import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// ── Auth ─────────────────────────────────────────────────────────────────────
import { AuthProvider } from "@/contexts/AuthContext";
import {
  ProtectedRoute,
  MemberRoute,
  GuestRoute,
} from "@/components/ProtectedRoute";
import { AdminRoute } from "@/components/AdminRoute";

// ── Pages ────────────────────────────────────────────────────────────────────
import Index        from "./pages/Index";
import Login        from "./pages/Login";
import Register     from "./pages/Register";
import Pricing      from "./pages/Pricing";
import Payment      from "./pages/Payment";
import Dashboard    from "./pages/Dashboard";
import LogFoodManual from "./pages/LogFoodManual";
import Statistics   from "./pages/Statistics";
import { ProfileSettings } from "./pages/ProfileSettings";
import { AdminDashboard } from "./pages/AdminDashboard";
import { AdminLogin } from "./pages/AdminLogin";
import NotFound     from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Don't retry on 401/403 errors (auth errors should be handled at the component level)
      retry: (failureCount, error) => {
        if (error instanceof Error && error.message.includes("401")) return false;
        return failureCount < 2;
      },
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        {/*
          AuthProvider wraps the entire router so every page has access to
          auth state via useAuthContext() or the useAuth() shim.
        */}
        <AuthProvider>
          <Routes>
            {/* ── Public routes — anyone can access ─────────────────────── */}
            <Route path="/"        element={<Index />} />
            <Route path="/pricing" element={<Pricing />} />

            {/* ── Guest-only routes — redirect away if already logged in ── */}
            <Route path="/login"    element={<GuestRoute><Login /></GuestRoute>} />
            <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

            {/* ── Checkout — must be logged in, but no membership required  */}
            {/* (you need to pay to GET a membership, so no MemberRoute here) */}
            <Route path="/payment" element={<ProtectedRoute><Payment /></ProtectedRoute>} />

            {/* ── Member-protected routes — must be logged in AND have      */}
            {/* an active membership; otherwise redirects to /pricing        */}
            <Route
              path="/dashboard"
              element={<MemberRoute><Dashboard /></MemberRoute>}
            />
            <Route
              path="/log-food-manual"
              element={<MemberRoute><LogFoodManual /></MemberRoute>}
            />
            <Route
              path="/statistics"
              element={<MemberRoute><Statistics /></MemberRoute>}
            />
            <Route
              path="/profile"
              element={<ProtectedRoute><ProfileSettings /></ProtectedRoute>}
            />

            {/* ── Admin route ─────────────────────────────────────────────── */}
            <Route 
              path="/admin-login" 
              element={<AdminLogin />} 
            />
            <Route 
              path="/admin-dashboard" 
              element={<AdminRoute><AdminDashboard /></AdminRoute>} 
            />

            {/* ── Catch-all 404 ─────────────────────────────────────────── */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
