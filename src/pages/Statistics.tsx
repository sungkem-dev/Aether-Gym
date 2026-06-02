import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useAuth } from "@/hooks/useAuth";

// ── Types ────────────────────────────────────────────────────────────────────

interface ChartDataPoint {
  label: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface AnalyticsSummary {
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  avg_calories: number;
  data_points: number;
}

interface AnalyticsResponse {
  success: boolean;
  period: string;
  summary: AnalyticsSummary;
  chart_data: ChartDataPoint[];
}

type Period = "daily" | "weekly" | "monthly";

// ── Component ────────────────────────────────────────────────────────────────

const Statistics = () => {
  const navigate = useNavigate();
  const { accessToken } = useAuth();

  const [period, setPeriod] = useState<Period>("weekly");
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Fetch analytics from backend ───────────────────────────────────────────
  const fetchAnalytics = useCallback(async () => {
    if (!accessToken) {
      setError("Please log in to view your statistics.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/diet/analytics?period=${period}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? `Server error: ${response.status}`);
      }

      setAnalytics(data as AnalyticsResponse);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load statistics.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [accessToken, period]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // ── Sub-components ─────────────────────────────────────────────────────────

  const PeriodButton = ({ value, label }: { value: Period; label: string }) => (
    <Button
      variant={period === value ? "default" : "outline"}
      size="sm"
      onClick={() => setPeriod(value)}
      className="transition-all"
    >
      {label}
    </Button>
  );

  const tooltipStyle = {
    backgroundColor: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "8px",
    color: "hsl(var(--foreground))",
  };

  const tickStyle = { fill: "hsl(var(--muted-foreground))", fontSize: 11 };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <Button variant="ghost" size="icon" onClick={fetchAnalytics} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">Diet Statistics</h1>
            <p className="text-muted-foreground">Track your nutrition progress over time</p>
          </div>
          {/* Period toggle */}
          <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
            <PeriodButton value="daily" label="Today" />
            <PeriodButton value="weekly" label="This Week" />
            <PeriodButton value="monthly" label="This Month" />
          </div>
        </div>

        {/* ── Error state ── */}
        {error && (
          <Card className="p-8 text-center animate-fade-in">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={fetchAnalytics} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" /> Try Again
            </Button>
          </Card>
        )}

        {/* ── Loading skeleton ── */}
        {loading && !error && (
          <div className="space-y-6 animate-pulse">
            {[1, 2].map((i) => (
              <Card key={i} className="p-6 h-80 bg-muted/30" />
            ))}
          </div>
        )}

        {/* ── Data ── */}
        {!loading && !error && analytics && (
          <div className="space-y-8">

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  label: "Avg Daily Calories",
                  value: `${analytics.summary.avg_calories}`,
                  unit: "kcal",
                  color: "text-primary",
                  bg: "from-primary/10 to-primary/5 border-primary/20",
                },
                {
                  label: "Total Protein",
                  value: `${analytics.summary.total_protein}`,
                  unit: "g",
                  color: "text-blue-400",
                  bg: "from-blue-500/10 to-blue-500/5 border-blue-500/20",
                },
                {
                  label: "Total Carbs",
                  value: `${analytics.summary.total_carbs}`,
                  unit: "g",
                  color: "text-yellow-400",
                  bg: "from-yellow-500/10 to-yellow-500/5 border-yellow-500/20",
                },
                {
                  label: "Total Fat",
                  value: `${analytics.summary.total_fat}`,
                  unit: "g",
                  color: "text-orange-400",
                  bg: "from-orange-500/10 to-orange-500/5 border-orange-500/20",
                },
              ].map(({ label, value, unit, color, bg }) => (
                <Card
                  key={label}
                  className={`p-4 bg-gradient-to-br ${bg} border animate-fade-in`}
                >
                  <h3 className="text-xs text-muted-foreground mb-1">{label}</h3>
                  <p className={`text-2xl font-bold ${color}`}>
                    {value}
                    <span className="text-sm font-normal ml-1">{unit}</span>
                  </p>
                </Card>
              ))}
            </div>

            {/* ── Macros Bar Chart ── */}
            <Card className="p-6 animate-fade-in">
              <h2 className="text-xl font-bold mb-2">
                Macronutrients Breakdown
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                {period === "daily" ? "Last 24 hours by hour" :
                 period === "weekly" ? "Last 7 days" : "Last 30 days"} — Protein, Carbs & Fat (grams)
              </p>

              {analytics.chart_data.every(d => d.calories === 0) ? (
                <div className="h-72 flex flex-col items-center justify-center text-muted-foreground">
                  <p className="text-4xl mb-3">🍽️</p>
                  <p className="font-medium">No food logged yet for this period</p>
                  <p className="text-sm mt-1">Upload a meal or log food to see your stats here</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.chart_data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="label" tick={tickStyle} />
                    <YAxis tick={tickStyle} unit="g" />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend />
                    <Bar dataKey="protein" name="Protein (g)" fill="#60a5fa" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="carbs"   name="Carbs (g)"   fill="#fbbf24" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="fat"     name="Fat (g)"     fill="#fb923c" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card>

            {/* ── Calories Bar Chart ── */}
            <Card className="p-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <h2 className="text-xl font-bold mb-2">Calorie Intake</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Total calories consumed per {period === "daily" ? "hour" : period === "weekly" ? "day" : "day"}
              </p>

              {analytics.chart_data.every(d => d.calories === 0) ? (
                <div className="h-72 flex items-center justify-center text-muted-foreground text-sm">
                  No data for this period yet.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.chart_data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="label" tick={tickStyle} />
                    <YAxis tick={tickStyle} unit=" kcal" />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(value) => [`${value} kcal`, "Calories"]}
                    />
                    <Bar
                      dataKey="calories"
                      name="Calories"
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card>

          </div>
        )}

        {/* ── Empty state (no data) ── */}
        {!loading && !error && analytics && analytics.summary.data_points === 0 && (
          <div className="text-center py-4 text-sm text-muted-foreground">
            <p>Logged <strong>{analytics.summary.data_points}</strong> food entries this period.</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => navigate("/dashboard")}
            >
              Go log a meal →
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Statistics;
