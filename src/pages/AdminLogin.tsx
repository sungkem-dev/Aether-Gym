import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { useAuthContext } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ShieldAlert, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export const AdminLogin = () => {
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading } = useAuthContext();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // If already logged in as admin, redirect to dashboard
  useEffect(() => {
    if (!authLoading && user && isAdmin) {
      navigate("/admin-dashboard", { replace: true });
    }
  }, [user, isAdmin, authLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      // 1. Authenticate user
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        throw new Error(authError.message);
      }

      const userId = authData.user?.id;
      if (!userId) {
        throw new Error("Authentication failed: User ID not found.");
      }

      // 2. Verify admin role in public.users table
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

      if (profileError) {
        throw new Error("Failed to verify user permissions.");
      }

      // 3. Routing logic based on role
      if (profile?.role === 'admin') {
        toast.success("Welcome back, Admin.");
        navigate("/admin-dashboard", { replace: true });
      } else {
        // Not an admin: revoke session and show error
        await supabase.auth.signOut();
        setErrorMsg("Access Denied: You are not an Admin.");
      }
    } catch (error: any) {
      setErrorMsg(error.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0a0f1c] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#cfb53b]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1c] flex flex-col items-center justify-center p-4 selection:bg-[#cfb53b] selection:text-white">
      {/* Decorative background blur */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 bg-blue-900/20 blur-[120px] rounded-full" />
        <div className="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 bg-[#cfb53b]/10 blur-[120px] rounded-full" />
      </div>

      <div className="w-full max-w-md z-10">
        <div className="flex justify-center mb-8">
          <div className="p-3 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
            <ShieldCheck className="w-10 h-10 text-[#cfb53b]" />
          </div>
        </div>

        <Card className="bg-[#111827]/80 backdrop-blur-md border-[#1f2937] shadow-2xl shadow-black/50 text-slate-200">
          <CardHeader className="space-y-3 pb-6 border-b border-white/5">
            <CardTitle className="text-2xl font-bold text-center tracking-tight text-white">
              Admin Portal - Aethergym
            </CardTitle>
            <CardDescription className="text-center text-slate-400">
              Enter your credentials to access the secure administrative dashboard.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-6">
            {errorMsg && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <p className="text-sm text-red-200 font-medium leading-relaxed">
                  {errorMsg}
                </p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2.5">
                <Label htmlFor="email" className="text-slate-300 font-medium">
                  Administrator Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="admin@aethergym.com"
                  className="bg-black/40 border-[#374151] text-white placeholder:text-slate-600 focus-visible:ring-[#cfb53b]/50 focus-visible:border-[#cfb53b]"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="password" className="text-slate-300 font-medium">
                  Secure Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  className="bg-black/40 border-[#374151] text-white placeholder:text-slate-600 focus-visible:ring-[#cfb53b]/50 focus-visible:border-[#cfb53b]"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full mt-2 h-11 bg-gradient-to-r from-[#b3982e] to-[#cfb53b] hover:from-[#cfb53b] hover:to-[#e6ce5c] text-[#0a0f1c] font-bold text-[15px] border-0 transition-all duration-300 shadow-[0_0_15px_rgba(207,181,59,0.2)] hover:shadow-[0_0_25px_rgba(207,181,59,0.4)]"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  "Authorize Access"
                )}
              </Button>
            </form>
          </CardContent>
          
          <CardFooter className="flex justify-center pb-6 pt-2">
            <button 
              onClick={() => navigate("/")}
              className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
            >
              &larr; Return to public site
            </button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};
