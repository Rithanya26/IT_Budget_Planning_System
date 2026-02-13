import { useApp } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDeptTotalSpent } from "@/data/mockData";
import { DollarSign, TrendingDown, TrendingUp, Building2, AlertTriangle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import GradientStatCard from "@/components/GradientStatCard";
import ActivityTimeline from "@/components/ActivityTimeline";

const VIBRANT_COLORS = [
  "hsl(262,60%,55%)", // purple
  "hsl(173,58%,45%)", // teal
  "hsl(338,65%,55%)", // pink
  "hsl(43,96%,56%)",  // amber
  "hsl(210,70%,55%)", // blue
  "hsl(142,71%,45%)", // green
];

export default function AdminDashboard() {
  const { departments, expenses } = useApp();

  const totalBudget = departments.reduce((s, d) => s + d.budget, 0);
  const totalSpent = departments.reduce((s, d) => s + getDeptTotalSpent(expenses, d.id), 0);
  const remaining = totalBudget - totalSpent;

  const barData = departments.map((d) => ({
    name: d.name,
    Budget: d.budget,
    Spent: getDeptTotalSpent(expenses, d.id),
  }));

  const pieData = departments.map((d) => ({
    name: d.name,
    value: getDeptTotalSpent(expenses, d.id),
  }));

  const alerts = departments
    .map((d) => {
      const spent = getDeptTotalSpent(expenses, d.id);
      const pct = (spent / d.budget) * 100;
      return { dept: d.name, pct, over: pct >= 100 };
    })
    .filter((a) => a.pct >= 80)
    .sort((a, b) => b.pct - a.pct);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <GradientStatCard icon={DollarSign} label="Total Budget" value={`$${totalBudget.toLocaleString()}`} colorIndex={0} delay={0} />
        <GradientStatCard icon={TrendingUp} label="Total Spent" value={`$${totalSpent.toLocaleString()}`} colorIndex={1} delay={80} />
        <GradientStatCard icon={TrendingDown} label="Remaining" value={`$${remaining.toLocaleString()}`} colorIndex={4} delay={160} />
        <GradientStatCard icon={Building2} label="Departments" value={departments.length.toString()} colorIndex={3} delay={240} />
      </div>

      {/* Alerts */}
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
              <div key={a.dept} className={`text-sm px-3 py-2 rounded-lg ${a.over ? "bg-destructive/10 text-destructive" : "bg-warning/10 text-warning"}`}>
                <span className="font-medium">{a.dept}</span> — {a.pct.toFixed(0)}% of budget used
                {a.over ? " ⚠️ OVER BUDGET" : " ⚠️ Warning"}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

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
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} innerRadius={50} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} strokeWidth={2} stroke="hsl(var(--card))">
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

      {/* Activity Timeline */}
      <div className="animate-fade-up" style={{ animationDelay: "450ms" }}>
        <ActivityTimeline expenses={expenses} departments={departments} />
      </div>
    </div>
  );
}
