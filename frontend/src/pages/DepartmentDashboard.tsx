import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { getDeptTotalSpent, getDeptExpenses, getMonthlyBreakdown, type Expense } from "@/data/mockData";
import { DollarSign, TrendingUp, TrendingDown, Percent, AlertTriangle, Plus, Filter, Trash2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import GradientStatCard from "@/components/GradientStatCard";
import CategoryBadge from "@/components/CategoryBadge";
import ActivityTimeline from "@/components/ActivityTimeline";

export default function DepartmentDashboard() {
  const { currentUser, departments, expenses, categories, addExpense, deleteExpense } = useApp();
  const dept = departments.find((d) => d.id === currentUser?.deptId);
  const [showForm, setShowForm] = useState(false);
  const [category, setCategory] = useState<string>(categories[0]?.name || "IT Personnel Costs");
  const [amount, setAmount] = useState("");
  const [month, setMonth] = useState("2025-10");
  const [description, setDescription] = useState("");
  const [filterCat, setFilterCat] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date" | "amount">("date");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  if (!dept || !currentUser) return <p className="p-6 text-muted-foreground">No department assigned.</p>;

  const spent = getDeptTotalSpent(expenses, dept.id);
  const remaining = dept.budget - spent;
  const pct = (spent / dept.budget) * 100;
  let deptExp = getDeptExpenses(expenses, dept.id);

  if (filterCat !== "all") deptExp = deptExp.filter((e) => e.category === filterCat);
  deptExp = [...deptExp].sort((a, b) => sortBy === "date" ? b.month.localeCompare(a.month) : b.amount - a.amount);

  const monthlyData = getMonthlyBreakdown(expenses, dept.id);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addExpense({ deptId: dept.id, category, amount: Number(amount), month, description });
      setShowForm(false);
      setAmount(""); 
      setDescription("");
      setCategory(categories[0]?.name || "IT Personnel Costs");
    } catch (error) {
      console.error("Error adding expense:", error);
      alert("Failed to add expense. Please try again.");
    }
  };

  const handleDeleteClick = (expenseId: string) => {
    setDeleteTargetId(expenseId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteTargetId) {
      try {
        await deleteExpense(deleteTargetId);
        setDeleteDialogOpen(false);
        setDeleteTargetId(null);
      } catch (error) {
        console.error("Failed to delete expense:", error);
        alert("Failed to delete expense. Please try again.");
      }
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">{dept.name} Dashboard</h1>

      {/* Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <GradientStatCard icon={DollarSign} label="Budget" value={`$${dept.budget.toLocaleString()}`} colorIndex={0} delay={0} />
        <GradientStatCard icon={TrendingUp} label="Total Spent" value={`$${spent.toLocaleString()}`} colorIndex={1} delay={80} />
        <GradientStatCard icon={TrendingDown} label="Remaining" value={`$${remaining.toLocaleString()}`} colorIndex={4} delay={160} />
        <GradientStatCard icon={Percent} label="Usage" value={`${pct.toFixed(0)}%`} colorIndex={pct >= 80 ? 2 : 5} delay={240} />
      </div>

      {/* Budget Progress */}
      <Card className="animate-fade-up" style={{ animationDelay: "280ms" }}>
        <CardContent className="pt-6 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Budget Usage</span>
            <span className={`font-semibold ${pct >= 100 ? "text-destructive" : pct >= 80 ? "text-warning" : "text-foreground"}`}>{pct.toFixed(1)}%</span>
          </div>
          <Progress value={Math.min(pct, 100)} className={pct >= 100 ? "[&>div]:bg-destructive" : pct >= 80 ? "[&>div]:bg-warning" : ""} />
        </CardContent>
      </Card>

      {/* Alerts */}
      {pct >= 80 && (
        <Card className={`animate-fade-up ${pct >= 100 ? "border-destructive/30 bg-destructive/5" : "border-warning/30 bg-warning/5"}`}>
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className={`h-5 w-5 ${pct >= 100 ? "text-destructive" : "text-warning"}`} />
            <span className="text-sm font-medium">{pct >= 100 ? "Over budget! Please review expenses." : "Warning: 80%+ of budget used."}</span>
          </CardContent>
        </Card>
      )}

      {/* Add Expense */}
      <div className="flex justify-end">
        <Button onClick={() => setShowForm(!showForm)} className="bg-gradient-to-r from-[hsl(262,60%,55%)] to-[hsl(290,60%,60%)] hover:opacity-90 border-0 text-white">
          <Plus className="h-4 w-4 mr-1" /> Add Expense
        </Button>
      </div>
      {showForm && (
        <Card className="animate-fade-up">
          <CardHeader><CardTitle className="text-base">New Expense</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Amount ($)</Label>
                <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} min="0.01" step="0.01" placeholder="0.00" required />
              </div>
              <div className="space-y-2">
                <Label>Month</Label>
                <Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g., Monthly service" required />
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" className="w-full" disabled={!amount || !month || !description}>Add Expense</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Monthly Trend Chart */}
      <Card className="animate-fade-up" style={{ animationDelay: "320ms" }}>
        <CardHeader><CardTitle className="text-base">Monthly Expense Trend</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", color: "hsl(var(--foreground))" }} />
              <Line type="monotone" dataKey="total" stroke="hsl(173,58%,45%)" strokeWidth={3} dot={{ fill: "hsl(338,65%,55%)", r: 5, strokeWidth: 2, stroke: "hsl(var(--card))" }} activeDot={{ r: 7, fill: "hsl(262,60%,55%)" }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Expense History with Filters */}
      <Card className="animate-fade-up" style={{ animationDelay: "380ms" }}>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle className="text-base">Expense History</CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={filterCat} onValueChange={setFilterCat}>
                  <SelectTrigger className="w-[200px] h-8 text-xs">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((c) => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as "date" | "amount")}>
                <SelectTrigger className="w-[120px] h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">By Date</SelectItem>
                  <SelectItem value="amount">By Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Month</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deptExp.map((e) => (
                <TableRow key={e.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="text-muted-foreground">{e.month}</TableCell>
                  <TableCell><CategoryBadge category={e.category} /></TableCell>
                  <TableCell>{e.description}</TableCell>
                  <TableCell className="font-semibold">${e.amount.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDeleteClick(e.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Expense</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this expense? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Activity Timeline */}
      <div className="animate-fade-up" style={{ animationDelay: "440ms" }}>
        <ActivityTimeline expenses={getDeptExpenses(expenses, dept.id)} />
      </div>
    </div>
  );
}
