import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getCategoryBreakdown } from "@/data/mockData";
import { AlertTriangle, Lightbulb, Monitor, TrendingDown, DollarSign, Pencil, Check, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import GradientStatCard from "@/components/GradientStatCard";

export default function OptimizationPage() {
  const { currentUser, departments, expenses, licenses, updateLicense } = useApp();
  const isAdmin = currentUser?.role === "admin";
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const deptIds = isAdmin ? departments.map((d) => d.id) : [currentUser?.deptId || ""];
  const relevantLicenses = licenses.filter((l) => deptIds.includes(l.deptId));

  // Flag high cloud costs (>3 months consistently high)
  const cloudAlerts: { dept: string; total: number }[] = [];
  departments.forEach((d) => {
    if (!deptIds.includes(d.id)) return;
    const catBreakdown = getCategoryBreakdown(expenses, d.id);
    const cloud = catBreakdown.find((c) => c.category === "Cloud");
    if (cloud && cloud.total > d.budget * 0.4) {
      cloudAlerts.push({ dept: d.name, total: cloud.total });
    }
  });

  // Unused licenses
  const unusedLicenses = relevantLicenses.filter((l) => l.totalPurchased - l.used > 3);
  const totalSavings = unusedLicenses.reduce((s, l) => s + (l.totalPurchased - l.used) * l.costPerLicense, 0);
  const totalWaste = relevantLicenses.reduce((s, l) => s + (l.totalPurchased - l.used) * l.costPerLicense, 0);
  const totalLicenseCost = relevantLicenses.reduce((s, l) => s + l.totalPurchased * l.costPerLicense, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Cost Optimization</h1>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <GradientStatCard icon={DollarSign} label="Total License Cost" value={`$${totalLicenseCost.toLocaleString()}`} colorIndex={0} delay={0} />
        <GradientStatCard icon={TrendingDown} label="Potential Savings" value={`$${totalSavings.toLocaleString()}`} subtitle="from unused licenses" colorIndex={5} delay={80} />
        <GradientStatCard icon={AlertTriangle} label="Wasted Spend" value={`$${totalWaste.toLocaleString()}`} subtitle="per year" colorIndex={2} delay={160} />
      </div>

      {/* Suggestions */}
      <Card className="border-primary/20 bg-primary/5 animate-fade-up" style={{ animationDelay: "200ms" }}>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-primary" /> Optimization Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {cloudAlerts.length > 0 && cloudAlerts.map((a) => (
            <div key={a.dept} className="flex items-start gap-2 text-sm rounded-lg bg-warning/10 p-3">
              <AlertTriangle className="h-4 w-4 mt-0.5 text-warning shrink-0" />
              <span><strong>{a.dept}</strong> has high cloud costs (${a.total.toLocaleString()}). Consider reviewing for under-utilized resources.</span>
            </div>
          ))}
          {unusedLicenses.length > 0 && (
            <div className="flex items-start gap-2 text-sm rounded-lg bg-primary/10 p-3">
              <Monitor className="h-4 w-4 mt-0.5 text-primary shrink-0" />
              <span>You have <strong>{unusedLicenses.reduce((s, l) => s + (l.totalPurchased - l.used), 0)}</strong> unused software licenses. Reducing them could save <strong>${totalSavings.toLocaleString()}/year</strong>.</span>
            </div>
          )}
          {cloudAlerts.length === 0 && unusedLicenses.length === 0 && (
            <p className="text-sm text-muted-foreground">No optimization suggestions at this time. Everything looks good! 🎉</p>
          )}
        </CardContent>
      </Card>

      {/* License Tracker */}
      <Card className="animate-fade-up" style={{ animationDelay: "280ms" }}>
        <CardHeader><CardTitle className="text-base">Software License Tracker</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Software</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Purchased</TableHead>
                <TableHead>Used</TableHead>
                <TableHead>Unused</TableHead>
                <TableHead>Utilization</TableHead>
                <TableHead>Cost/License</TableHead>
                <TableHead>Waste</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {relevantLicenses.map((l) => {
                const unused = l.totalPurchased - l.used;
                const waste = unused * l.costPerLicense;
                const utilPct = (l.used / l.totalPurchased) * 100;
                const isEditing = editingId === l.id;
                return (
                  <TableRow key={l.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium">{l.software}</TableCell>
                    <TableCell>{departments.find((d) => d.id === l.deptId)?.name}</TableCell>
                    <TableCell>{l.totalPurchased}</TableCell>
                    <TableCell>
                      {isEditing ? (
                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            min={0}
                            max={l.totalPurchased}
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="h-7 w-16 text-xs"
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 text-green-600"
                            onClick={() => {
                              const val = Math.min(Math.max(0, Number(editValue)), l.totalPurchased);
                              updateLicense(l.id, val);
                              setEditingId(null);
                            }}
                          >
                            <Check className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={() => setEditingId(null)}>
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span>{l.used}</span>
                          {(isAdmin || currentUser?.deptId === l.deptId) && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6 text-muted-foreground hover:text-primary"
                              onClick={() => { setEditingId(l.id); setEditValue(String(l.used)); }}
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className={unused > 3 ? "text-destructive font-semibold" : ""}>{unused}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 min-w-[100px]">
                        <Progress value={utilPct} className={`h-2 ${utilPct < 60 ? "[&>div]:bg-destructive" : utilPct < 80 ? "[&>div]:bg-warning" : "[&>div]:bg-success"}`} />
                        <span className="text-xs text-muted-foreground w-10">{utilPct.toFixed(0)}%</span>
                      </div>
                    </TableCell>
                    <TableCell>${l.costPerLicense}</TableCell>
                    <TableCell className={waste > 0 ? "text-destructive font-semibold" : ""}>${waste.toLocaleString()}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}