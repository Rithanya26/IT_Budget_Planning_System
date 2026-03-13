import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { apiService } from "@/services/api";
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
  const [generating, setGenerating] = useState(false);

  const depts = isAdmin ? departments : departments.filter((d) => d.id === currentUser?.deptId);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await apiService.getAdminDashboard();
        if (cancelled) return;
        const nextMonth = (data as any).forecast_next_month_by_department ?? {};
        const nextYear = (data as any).forecast_next_year_by_department ?? {};
        const combined: Record<string, { nextMonth?: number; nextYear?: number }> = {};
        depts.forEach((d) => {
          combined[d.id] = { nextMonth: nextMonth[d.id], nextYear: nextYear[d.id] };
        });
        setApiForecasts(combined);
      } catch {
        if (!cancelled) setApiForecasts({});
      }
    };
    load();
    return () => { cancelled = true; };
  }, [depts.map((d) => d.id).join(","), expenses.length]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await apiService.generateForecasts();
      const data = await apiService.getAdminDashboard();
      const nextMonth = (data as any).forecast_next_month_by_department ?? {};
      const nextYear = (data as any).forecast_next_year_by_department ?? {};
      const combined: Record<string, { nextMonth?: number; nextYear?: number }> = {};
      depts.forEach((d) => {
        combined[d.id] = { nextMonth: nextMonth[d.id], nextYear: nextYear[d.id] };
      });
      setApiForecasts(combined);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Expense Forecasting</h1>
          <p className="text-muted-foreground text-sm">Linear regression predictions from historical monthly spending.</p>
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
        const nextMonth = apiF?.nextMonth ?? forecast.nextMonth;
        const yearly = apiF?.nextYear ?? forecast.yearly;
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <GradientStatCard icon={TrendingUp} label="Predicted Next Month" value={`$${Number(nextMonth).toLocaleString()}`} colorIndex={1} />
                <GradientStatCard icon={Calendar} label="Next Year Budget Estimate" value={`$${Number(yearly).toLocaleString()}`} colorIndex={3} />
              </div>

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
