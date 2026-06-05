import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  LogOut, Upload, TrendingUp, Apple, Activity, Loader2,
  Target, Flame, Beef, Wheat, Droplets,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { UploadMealDialog } from "@/components/UploadMealDialog";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TodayStats {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  mealsLogged: number;
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
}

// ─── Derive macro targets from calories (30/40/30 split) ──────────────────────
// Protein: 30% of cals → cals * 0.30 / 4 cal-per-gram
// Carbs:   40% of cals → cals * 0.40 / 4 cal-per-gram
// Fat:     30% of cals → cals * 0.30 / 9 cal-per-gram

function deriveMacroTargets(targetCalories: number) {
  return {
    protein: Math.round((targetCalories * 0.30) / 4),  // grams
    carbs:   Math.round((targetCalories * 0.40) / 4),   // grams
    fat:     Math.round((targetCalories * 0.30) / 9),   // grams
  };
}

// ─── Progress bar color helper ────────────────────────────────────────────────

function progressColor(pct: number): string {
  if (pct > 105) return "bg-red-500";
  if (pct >= 90) return "bg-amber-500";
  return "bg-primary";
}

function progressTextColor(pct: number): string {
  if (pct > 105) return "text-red-400";
  if (pct >= 90) return "text-amber-400";
  return "text-primary";
}

// ─── Component ────────────────────────────────────────────────────────────────

const Dashboard = () => {
  const navigate = useNavigate();
  const { accessToken, signOut, user } = useAuth();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [stats, setStats] = useState<TodayStats>({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    mealsLogged: 0,
    targetCalories: 2000,
    targetProtein: Math.round((2000 * 0.3) / 4),
    targetCarbs: Math.round((2000 * 0.4) / 4),
    targetFat: Math.round((2000 * 0.3) / 9),
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [recommendedFoods, setRecommendedFoods] = useState<any[]>([]);

  // ── Notification deduplication ──────────────────────────────────────────────
  // Tracks which toast types have already fired this session.
  // Prevents re-firing on every stats refetch.
  const firedToasts = useRef<Set<string>>(new Set());

  // ── Fetch today's aggregated nutrition ──────────────────────────────────────

  const fetchTodayStats = useCallback(async () => {
    if (!accessToken) return;

    setLoadingStats(true);
    try {
      const [analyticsRes, profileRes, masterFoodsRes] = await Promise.all([
        apiFetch("/api/diet/analytics?period=daily", {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
        apiFetch("/api/user/profile", {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
        apiFetch("/api/diet/master-foods?limit=50", {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      ]);

      const analyticsData = await analyticsRes.json();
      const profileData = await profileRes.json();
      const masterFoodsData = await masterFoodsRes.json();

      let newStats = { ...stats };

      if (analyticsRes.ok && analyticsData.summary) {
        const s = analyticsData.summary;
        newStats = {
          ...newStats,
          calories: s.total_calories,
          protein: s.total_protein,
          carbs: s.total_carbs,
          fat: s.total_fat,
          mealsLogged: s.data_points,
        };
      }

      if (profileRes.ok && profileData.data) {
        const p = profileData.data;
        newStats.targetCalories = p.daily_calories ?? p.target_calories ?? 2000;
        newStats.targetProtein = p.daily_protein ?? Math.round((newStats.targetCalories * 0.3) / 4);
        newStats.targetCarbs = p.daily_carbs ?? Math.round((newStats.targetCalories * 0.4) / 4);
        newStats.targetFat = p.daily_fat ?? Math.round((newStats.targetCalories * 0.3) / 9);
      }

      setStats(newStats);

      // Calculate recommendations if we have master foods
      if (masterFoodsRes.ok && masterFoodsData.data) {
        const remainingProtein = Math.max(0, newStats.targetProtein - newStats.protein);
        const remainingCarbs = Math.max(0, newStats.targetCarbs - newStats.carbs);
        const remainingFat = Math.max(0, newStats.targetFat - newStats.fat);

        // Sort foods by how well they fit remaining macros (simple distance metric)
        const foods = masterFoodsData.data;
        foods.sort((a: any, b: any) => {
          const scoreA = Math.abs(a.protein - remainingProtein) + Math.abs(a.carbs - remainingCarbs) + Math.abs(a.fat - remainingFat);
          const scoreB = Math.abs(b.protein - remainingProtein) + Math.abs(b.carbs - remainingCarbs) + Math.abs(b.fat - remainingFat);
          return scoreA - scoreB;
        });

        setRecommendedFoods(foods.slice(0, 3));
      }

      // ── Fire nutrition alert toasts ──────────────────────────────────────
      if (newStats.mealsLogged > 0) {
        const calPct = (newStats.calories / newStats.targetCalories) * 100;

        if (calPct > 105 && !firedToasts.current.has("exceeded")) {
          firedToasts.current.add("exceeded");
          toast.warning(
            "⚠️ You've exceeded your daily calorie target! Consider lighter meals for the rest of the day.",
            { duration: 8000 }
          );
        } else if (calPct >= 95 && calPct <= 105 && !firedToasts.current.has("goal-met")) {
          firedToasts.current.add("goal-met");
          toast.success(
            "🎉 Congratulations! You've met your daily nutritional goals!",
            { duration: 8000 }
          );
        }
      }
    } catch (err) {
      console.error("Failed to load dashboard stats:", err);
    } finally {
      setLoadingStats(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  useEffect(() => {
    fetchTodayStats();
  }, [fetchTodayStats]);

  const handleLogout = async () => {
    await signOut();
    toast.success("Logged out successfully");
    navigate("/");
  };

  // ── Derived values ─────────────────────────────────────────────────────────
  const macroTargets = {
    protein: stats.targetProtein,
    carbs: stats.targetCarbs,
    fat: stats.targetFat,
  };
  const caloriePct = stats.targetCalories > 0
    ? Math.round((stats.calories / stats.targetCalories) * 100)
    : 0;
  const proteinPct = macroTargets.protein > 0
    ? Math.round((stats.protein / macroTargets.protein) * 100)
    : 0;
  const carbsPct = macroTargets.carbs > 0
    ? Math.round((stats.carbs / macroTargets.carbs) * 100)
    : 0;
  const fatPct = macroTargets.fat > 0
    ? Math.round((stats.fat / macroTargets.fat) * 100)
    : 0;

  // ═══════════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════════

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Member Dashboard</h1>
              {user?.email && (
                <p className="text-xs text-muted-foreground">{user.email}</p>
              )}
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* DIET PLAN PROGRESS — Calorie Goal + Macros (Task 4)              */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <Card className="p-6 mb-8 animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold">Daily Diet Plan</h2>
            </div>
            {loadingStats && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          </div>

          {loadingStats ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* ── Calorie Goal Progress ────────────────────────────────────── */}
              <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Flame className="h-5 w-5 text-primary" />
                    <span className="font-semibold">Calorie Goal</span>
                  </div>
                  <span className={`text-sm font-bold ${progressTextColor(caloriePct)}`}>
                    {caloriePct}%
                  </span>
                </div>

                <div className="flex items-baseline gap-1 mb-3">
                  <span className="text-4xl font-bold">{stats.calories}</span>
                  <span className="text-lg text-muted-foreground">/ {stats.targetCalories}</span>
                  <span className="text-sm text-muted-foreground ml-1">kcal</span>
                </div>

                <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ease-out ${progressColor(caloriePct)}`}
                    style={{ width: `${Math.min(caloriePct, 100)}%` }}
                  />
                </div>

                {caloriePct > 100 && (
                  <p className="text-xs text-red-400 mt-2">
                    ⚠ {stats.calories - stats.targetCalories} kcal over target
                  </p>
                )}
                {caloriePct <= 100 && stats.mealsLogged > 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {stats.targetCalories - stats.calories} kcal remaining today
                  </p>
                )}
              </div>

              {/* ── Macro Targets Progress Bars ──────────────────────────────── */}
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  {
                    label: "Protein",
                    icon: Beef,
                    value: stats.protein,
                    target: macroTargets.protein,
                    pct: proteinPct,
                    color: "bg-blue-500",
                    textColor: "text-blue-400",
                    bgGradient: "from-blue-500/5 to-blue-500/10",
                  },
                  {
                    label: "Carbohydrates",
                    icon: Wheat,
                    value: stats.carbs,
                    target: macroTargets.carbs,
                    pct: carbsPct,
                    color: "bg-yellow-500",
                    textColor: "text-yellow-400",
                    bgGradient: "from-yellow-500/5 to-yellow-500/10",
                  },
                  {
                    label: "Fats",
                    icon: Droplets,
                    value: stats.fat,
                    target: macroTargets.fat,
                    pct: fatPct,
                    color: "bg-orange-500",
                    textColor: "text-orange-400",
                    bgGradient: "from-orange-500/5 to-orange-500/10",
                  },
                ].map(({ label, icon: Icon, value, target, pct, color, textColor, bgGradient }) => (
                  <div
                    key={label}
                    className={`rounded-xl p-4 bg-gradient-to-br ${bgGradient} border border-border/50`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${textColor}`} />
                        <span className="text-sm font-medium">{label}</span>
                      </div>
                      <span className={`text-xs font-bold ${pct > 105 ? "text-red-400" : textColor}`}>
                        {pct}%
                      </span>
                    </div>

                    <div className="text-2xl font-bold mb-2">
                      {value}g
                      <span className="text-sm font-normal text-muted-foreground ml-1">/ {target}g</span>
                    </div>

                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ease-out ${pct > 105 ? "bg-red-500" : color}`}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Macro split info */}
              <p className="text-xs text-muted-foreground text-center">
                Targets based on your {stats.targetCalories} kcal goal · 30% protein · 40% carbs · 30% fat
              </p>
            </div>
          )}
        </Card>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* STATS OVERVIEW CARDS                                              */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Calories card */}
          <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Daily Calories</h3>
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            {loadingStats ? (
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            ) : (
              <div className="space-y-2">
                <div className="text-3xl font-bold">
                  {stats.calories}
                  <span className="text-lg text-muted-foreground">/{stats.targetCalories}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${progressColor(caloriePct)}`}
                    style={{ width: `${Math.min(caloriePct, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">{caloriePct}% of daily target</p>
              </div>
            )}
          </Card>

          {/* Protein card */}
          <Card className="p-6 bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Protein Today</h3>
              <Apple className="h-5 w-5 text-secondary" />
            </div>
            {loadingStats ? (
              <Loader2 className="h-6 w-6 animate-spin text-secondary" />
            ) : (
              <>
                <div className="text-3xl font-bold">{stats.protein}g</div>
                <p className="text-sm text-muted-foreground mt-2">
                  Carbs: {stats.carbs}g · Fat: {stats.fat}g
                </p>
              </>
            )}
          </Card>

          {/* Meals card */}
          <Card className="p-6 bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Meals Today</h3>
              <Upload className="h-5 w-5 text-accent" />
            </div>
            {loadingStats ? (
              <Loader2 className="h-6 w-6 animate-spin text-accent" />
            ) : (
              <>
                <div className="text-3xl font-bold">{stats.mealsLogged}</div>
                <p className="text-sm text-muted-foreground mt-2">
                  {stats.mealsLogged === 0
                    ? "No meals logged yet"
                    : `${stats.mealsLogged} meal${stats.mealsLogged > 1 ? "s" : ""} logged`}
                </p>
              </>
            )}
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="p-6 mb-8 animate-slide-up">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-auto py-4 flex-col gap-2"
              onClick={() => setUploadDialogOpen(true)}
            >
              <Upload className="h-6 w-6" />
              <span>AI Food Scanner</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex-col gap-2"
              onClick={() => navigate("/log-food-manual")}
            >
              <Apple className="h-6 w-6" />
              <span>Log Food Manually</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex-col gap-2"
              onClick={() => navigate("/statistics")}
            >
              <TrendingUp className="h-6 w-6" />
              <span>View Statistics</span>
            </Button>
          </div>
        </Card>

        {/* Diet Recommendations */}
        <Card className="p-6 mb-8 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Target className="h-6 w-6 text-primary" />
              Diet Plan & Recommendations
            </h2>
            <Button variant="outline" onClick={() => navigate("/profile")}>
              Update TDEE Metrics
            </Button>
          </div>
          
          <div className="bg-muted p-4 rounded-lg mb-6 text-sm flex justify-between items-center">
            <div>
              <span className="font-semibold block mb-1">Your Customized Plan</span>
              <span className="text-muted-foreground block">
                {stats.targetCalories} kcal / day
              </span>
            </div>
            <div className="text-right">
              <span className="font-semibold block mb-1">Current Progress</span>
              <span className="text-muted-foreground block">
                {stats.targetCalories > stats.calories ? `${stats.targetCalories - stats.calories} kcal remaining` : `${stats.calories - stats.targetCalories} kcal over target`}
              </span>
            </div>
          </div>

          {recommendedFoods.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Recommended Foods for Your Remaining Macros</h3>
              <div className="grid md:grid-cols-3 gap-4">
                {recommendedFoods.map((food) => (
                  <Card key={food.id} className="p-4 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold mb-1">{food.name}</h4>
                      <p className="text-sm text-muted-foreground mb-2">{food.calories} kcal per {food.serving_size || "serving"}</p>
                    </div>
                    <div className="flex gap-2 text-xs">
                      <span className="bg-blue-500/10 text-blue-500 px-2 py-1 rounded">P: {food.protein}g</span>
                      <span className="bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded">C: {food.carbs}g</span>
                      <span className="bg-orange-500/10 text-orange-500 px-2 py-1 rounded">F: {food.fat}g</span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>

      <UploadMealDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onSuccess={fetchTodayStats}
      />
    </div>
  );
};

export default Dashboard;
