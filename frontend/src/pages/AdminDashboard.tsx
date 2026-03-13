import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { apiService } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getDeptTotalSpent } from "@/data/mockData";
import {
  DollarSign,
  TrendingDown,
  TrendingUp,
  Building2,
  AlertTriangle,
  FileWarning,
  Calendar,
  Lightbulb,
  RefreshCw,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import GradientStatCard from "@/components/GradientStatCard";
import ActivityTimeline from "@/components/ActivityTimeline";

const VIBRANT_COLORS = [
  "hsl(262,60%,55%)",
  "hsl(173,58%,45%)",
  "hsl(338,65%,55%)",
  "hsl(43,96%,56%)",
  "hsl(210,70%,55%)",
  "hsl(142,71%,45%)",
];

interface AdminDashboardData {
  total_allocated_budget?: number;
  total_actual_spending?: number;
  remaining_budget?: number;
  overall_utilization_percentage?: number;
  variance?: number;
  departments?: Array<{
    id: string;
    name: string;
    allocated_amount: number;
    spent: number;
    remaining: number;
    utilization_percentage: number;
    variance: number;
  }>;
  spending_by_category?: Array<{ category?: string; total: number }>;
  monthly_trends?: Array<{ month: string; total: number }>;
  forecast_next_month_by_department?: Record<string, number>;
  forecast_next_year_by_department?: Record<string, number>;
  license_expiry_alerts?: Array<{
    id: number;
    department_name?: string;
    software_name: string;
    expiry_date: string;
    renewal_cost?: number;
  }>;
  vendor_contract_expiry_alerts?: Array<{
    id: number;
    name: string;
    contract_end_date: string;
    annual_contract_value?: number;
  }>;
  optimization_suggestions?: Array<{ suggestion_text: string; created_at?: string }>;
}

export default function AdminDashboard() {
  const { departments, expenses, refreshData } = useApp();
  const [apiData, setApiData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [forecastLoading, setForecastLoading] = useState(false);
  const [optLoading, setOptLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        const data = await apiService.getAdminDashboard();
        if (!cancelled) setApiData(data);
      } catch {
        if (!cancelled) setApiData(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [departments.length, expenses.length]);

  const totalBudget = apiData?.total_allocated_budget ?? departments.reduce((s, d) => s + d.budget, 0);
  const totalSpent = apiData?.total_actual_spending ?? departments.reduce((s, d) => s + getDeptTotalSpent(expenses, d.id), 0);
  const remaining = apiData?.remaining_budget ?? totalBudget - totalSpent;
  const utilizationPct = apiData?.overall_utilization_percentage ?? (totalBudget ? (totalSpent / totalBudget) * 100 : 0);
  const variance = apiData?.variance ?? totalBudget - totalSpent;

  const deptSummaries = apiData?.departments ?? departments.map((d) => ({
    name: d.name,
    allocated_amount: d.budget,
    spent: getDeptTotalSpent(expenses, d.id),
  }));
  const barData = deptSummaries.map((d: { name: string; allocated_amount?: number; spent: number }) => ({
    name: d.name,
    Budget: d.allocated_amount ?? 0,
    Spent: d.spent,
  }));

  const pieData = departments.map((d) => ({
    name: d.name,
    value: getDeptTotalSpent(expenses, d.id),
  }));

  const alerts = departments
    .map((d) => {
      const spent = getDeptTotalSpent(expenses, d.id);
      const pct = d.budget ? (spent / d.budget) * 100 : 0;
      return { dept: d.name, pct, over: pct >= 100 };
    })
    .filter((a) => a.pct >= 80)
    .sort((a, b) => b.pct - a.pct);

  const handleGenerateForecasts = async () => {
    try {
      setForecastLoading(true);
      await apiService.generateForecasts();
      const data = await apiService.getAdminDashboard();
      setApiData(data);
    } finally {
      setForecastLoading(false);
    }
  };

  const handleGenerateOptimization = async () => {
    try {
      setOptLoading(true);
      await apiService.generateOptimization();
      const data = await apiService.getAdminDashboard();
      setApiData(data);
    } finally {
      setOptLoading(false);
    }
  };

  const forecastNextMonth = apiData?.forecast_next_month_by_department ?? {};
  const forecastNextYear = apiData?.forecast_next_year_by_department ?? {};
  const licenseAlerts = apiData?.license_expiry_alerts ?? [];
  const vendorAlerts = apiData?.vendor_contract_expiry_alerts ?? [];
  const optSuggestions = apiData?.optimization_suggestions ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
      <p className="text-muted-foreground text-sm">IT Budget Planning, Forecasting & Optimization</p>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <GradientStatCard icon={DollarSign} label="Total Allocated" value={`$${totalBudget.toLocaleString()}`} colorIndex={0} delay={0} />
        <GradientStatCard icon={TrendingUp} label="Total Spent" value={`$${totalSpent.toLocaleString()}`} colorIndex={1} delay={80} />
        <GradientStatCard icon={TrendingDown} label="Remaining" value={`$${remaining.toLocaleString()}`} colorIndex={4} delay={160} />
        <GradientStatCard icon={Building2} label="Utilization" value={`${utilizationPct.toFixed(1)}%`} colorIndex={3} delay={240} />
        <GradientStatCard icon={DollarSign} label="Variance" value={`$${variance.toLocaleString()}`} subtitle="Allocated − Actual" colorIndex={2} delay={280} />
      </div>

      {/* Budget Alerts */}
      {alerts.length > 0 && (
        <Card className="border-destructive/30 bg-destructive/5 animate-fade-up" style={{ animationDelay: "300ms" }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              Budget Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {alerts.map((a) => (
              <div
                key={a.dept}
                className={`text-sm px-3 py-2 rounded-lg ${a.over ? "bg-destructive/10 text-destructive" : "bg-warning/10 text-warning"}`}
              >
                <span className="font-medium">{a.dept}</span> — {a.pct.toFixed(0)}% of budget used
                {a.over ? " ⚠️ OVER BUDGET" : " ⚠️ Warning"}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* License & Vendor Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <FileWarning className="h-4 w-4 text-amber-600" />
              Software License Expiry (within 30 days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {licenseAlerts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No licenses expiring in the next 30 days.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {licenseAlerts.map((a) => (
                  <li key={a.id} className="flex justify-between items-start gap-2 rounded-lg bg-muted/50 p-2">
                    <span><strong>{a.software_name}</strong> — {a.department_name ?? "—"} · Expires {a.expiry_date}</span>
                    {a.renewal_cost != null && <span className="font-medium">${Number(a.renewal_cost).toLocaleString()}</span>}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
        <Card className="border-orange-500/30 bg-orange-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4 text-orange-600" />
              Vendor Contract Expiry (within 60 days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {vendorAlerts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No vendor contracts expiring in the next 60 days.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {vendorAlerts.map((a) => (
                  <li key={a.id} className="flex justify-between items-start gap-2 rounded-lg bg-muted/50 p-2">
                    <span><strong>{a.name}</strong> — Ends {a.contract_end_date}</span>
                    {a.annual_contract_value != null && <span className="font-medium">${Number(a.annual_contract_value).toLocaleString()}/yr</span>}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Forecasts */}
      <Card className="animate-fade-up">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Forecasts (next month & next year)
          </CardTitle>
          <Button size="sm" variant="outline" onClick={handleGenerateForecasts} disabled={forecastLoading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${forecastLoading ? "animate-spin" : ""}`} />
            {forecastLoading ? "Generating…" : "Generate"}
          </Button>
        </CardHeader>
        <CardContent>
          {Object.keys(forecastNextMonth).length === 0 && Object.keys(forecastNextYear).length === 0 ? (
            <p className="text-sm text-muted-foreground">Generate forecasts to see predicted next month expense and next year budget per department.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              {departments.map((d) => (
                <div key={d.id} className="rounded-lg border p-3 space-y-1">
                  <div className="font-medium">{d.name}</div>
                  <div>Next month: ${(forecastNextMonth[d.id] ?? 0).toLocaleString()}</div>
                  <div>Next year: ${(forecastNextYear[d.id] ?? 0).toLocaleString()}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Optimization Suggestions */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-primary" />
            Optimization Recommendations
          </CardTitle>
          <Button size="sm" variant="outline" onClick={handleGenerateOptimization} disabled={optLoading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${optLoading ? "animate-spin" : ""}`} />
            {optLoading ? "Generating…" : "Generate"}
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {optSuggestions.length === 0 ? (
            <p className="text-sm text-muted-foreground">Generate optimization to get AI-based suggestions (allocation, utilization, growth).</p>
          ) : (
            optSuggestions.slice(0, 10).map((s, i) => (
              <div key={i} className="text-sm rounded-lg bg-muted/50 p-3">
                {s.suggestion_text}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="animate-fade-up" style={{ animationDelay: "350ms" }}>
          <CardHeader>
            <CardTitle className="text-base">Budget vs Actual Spending</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", color: "hsl(var(--foreground))" }} />
                <Legend />
                <Bar dataKey="Budget" fill={VIBRANT_COLORS[4]} radius={[6, 6, 0, 0]} />
                <Bar dataKey="Spent" fill={VIBRANT_COLORS[2]} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="animate-fade-up" style={{ animationDelay: "400ms" }}>
          <CardHeader>
            <CardTitle className="text-base">Cost Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={50}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  strokeWidth={2}
                  stroke="hsl(var(--card))"
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={VIBRANT_COLORS[i % VIBRANT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", color: "hsl(var(--foreground))" }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="animate-fade-up" style={{ animationDelay: "450ms" }}>
        <ActivityTimeline expenses={expenses} departments={departments} />
      </div>
    </div>
  );
}
