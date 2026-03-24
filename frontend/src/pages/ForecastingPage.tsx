import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { apiService, type ForecastEvaluationRow } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getForecast, getMonthlyBreakdown } from "@/data/mockData";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { TrendingUp, Calendar, RefreshCw } from "lucide-react";
import GradientStatCard from "@/components/GradientStatCard";

export default function ForecastingPage() {
  const { currentUser, departments, expenses } = useApp();
  const isAdmin = currentUser?.role === "admin";
  const [apiForecasts, setApiForecasts] = useState<Record<string, { nextMonth?: number; nextYear?: number }>>({});
  const [evaluationByDept, setEvaluationByDept] = useState<Record<string, ForecastEvaluationRow>>({});
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const depts = isAdmin ? departments : departments.filter((d) => d.id === currentUser?.deptId);

  const mergeEvaluation = (rows: ForecastEvaluationRow[]) => {
    const next: Record<string, ForecastEvaluationRow> = {};
    rows.forEach((row) => {
      next[row.department_id] = row;
    });
    return next;
  };

  const loadForecastingData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashboardData, evaluationRows] = await Promise.all([
        apiService.getAdminDashboard(),
        isAdmin ? apiService.getForecastEvaluation() : apiService.getForecastEvaluation(currentUser?.deptId),
      ]);

      const nextMonth = (dashboardData as any).forecast_next_month_by_department ?? {};
      const nextYear = (dashboardData as any).forecast_next_year_by_department ?? {};
      const combined: Record<string, { nextMonth?: number; nextYear?: number }> = {};
      depts.forEach((d) => {
        combined[d.id] = { nextMonth: nextMonth[d.id], nextYear: nextYear[d.id] };
      });
      setApiForecasts(combined);
      setEvaluationByDept(mergeEvaluation(evaluationRows));
    } catch (err) {
      setApiForecasts({});
      setEvaluationByDept({});
      setError(err instanceof Error ? err.message : "Failed to load forecasting data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      await loadForecastingData();
      if (cancelled) return;
    };
    load();
    return () => { cancelled = true; };
  }, [depts.map((d) => d.id).join(","), expenses.length]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await apiService.generateForecasts(isAdmin ? undefined : currentUser?.deptId);
      await loadForecastingData();
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Expense Forecasting</h1>
          <p className="text-muted-foreground text-sm">Linear regression predictions with evaluation metrics (Actual, Predicted, MAPE, Accuracy).</p>
        </div>
        {isAdmin && (
          <Button size="sm" variant="outline" onClick={handleGenerate} disabled={generating}>
            <RefreshCw className={`h-4 w-4 mr-1 ${generating ? "animate-spin" : ""}`} />
            {generating ? "Generating…" : "Generate forecasts"}
          </Button>
        )}
      </div>

      {depts.map((dept, di) => {
        const forecast = getForecast(expenses, dept.id);
        const monthly = getMonthlyBreakdown(expenses, dept.id);
        const apiF = apiForecasts[dept.id];
        const evaluation = evaluationByDept[dept.id];
        const nextMonth = apiF?.nextMonth ?? forecast.nextMonth;
        const yearly = apiF?.nextYear ?? forecast.yearly;
        const actual = evaluation?.actual_expense;
        const predicted = evaluation?.predicted_expense ?? nextMonth;
        const mape = evaluation?.mape;
        const accuracy = evaluation?.accuracy;
        const forecastData = [
          ...monthly.map((m) => ({ ...m, type: "actual" })),
          { month: "Next", total: nextMonth, type: "forecast" },
        ];

        return (
          <Card key={dept.id} className="animate-fade-up" style={{ animationDelay: `${di * 100}ms` }}>
            <CardHeader>
              <CardTitle className="text-base">{dept.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <GradientStatCard icon={TrendingUp} label="Predicted Next Month" value={`$${Number(nextMonth).toLocaleString()}`} colorIndex={1} />
                <GradientStatCard icon={Calendar} label="Next Year Budget Estimate" value={`$${Number(yearly).toLocaleString()}`} colorIndex={3} />
                <GradientStatCard
                  icon={TrendingUp}
                  label="Actual Expense"
                  value={actual == null ? "N/A" : `$${Number(actual).toLocaleString()}`}
                  colorIndex={0}
                />
                <GradientStatCard
                  icon={TrendingUp}
                  label="Predicted Expense"
                  value={predicted == null ? "N/A" : `$${Number(predicted).toLocaleString()}`}
                  colorIndex={2}
                />
                <GradientStatCard
                  icon={TrendingUp}
                  label="MAPE (%)"
                  value={mape == null ? "N/A" : `${Number(mape).toFixed(2)}%`}
                  colorIndex={4}
                />
                <GradientStatCard
                  icon={TrendingUp}
                  label="Accuracy (%)"
                  value={accuracy == null ? "N/A" : `${Number(accuracy).toFixed(2)}%`}
                  colorIndex={5}
                />
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}
              {loading && <p className="text-sm text-muted-foreground">Loading forecast metrics...</p>}

              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={forecastData}>
                  <defs>
                    <linearGradient id={`grad-${dept.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(173,58%,45%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(173,58%,45%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", color: "hsl(var(--foreground))" }} />
                  <Area type="monotone" dataKey="total" stroke="hsl(173,58%,45%)" strokeWidth={2} fill={`url(#grad-${dept.id})`} dot={{ fill: "hsl(338,65%,55%)", r: 4, strokeWidth: 2, stroke: "hsl(var(--card))" }} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
