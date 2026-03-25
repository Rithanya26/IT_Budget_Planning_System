import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getDeptTotalSpent } from "@/data/mockData";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil } from "lucide-react";

export default function DepartmentManagement() {
  const { departments, addDepartment, updateDepartment, expenses } = useApp();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [budget, setBudget] = useState("");

  const reset = () => { setName(""); setBudget(""); setEditId(null); };
  const openAdd = () => { reset(); setOpen(true); };
  const openEdit = (id: string) => {
    const d = departments.find((x) => x.id === id);
    if (d) { setName(d.name); setBudget(d.budget.toString()); setEditId(id); setOpen(true); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) {
        await updateDepartment(editId, { name, budget: Number(budget) });
      } else {
        await addDepartment({ name, budget: Number(budget) });
      }
      setOpen(false);
      reset();
    } catch (error) {
      console.error("Failed to save department", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Departments</h1>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
          <DialogTrigger asChild>
            <Button onClick={openAdd}><Plus className="h-4 w-4 mr-1" /> Add Department</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editId ? "Edit" : "Add"} Department</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Department Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Annual Budget ($)</Label>
                <Input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full">{editId ? "Update" : "Create"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">All Departments</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Spent</TableHead>
                <TableHead>Remaining</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {departments.map((d) => {
                const spent = getDeptTotalSpent(expenses, d.id);
                const pct = ((spent / d.budget) * 100).toFixed(0);
                return (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium">{d.name}</TableCell>
                    <TableCell>${d.budget.toLocaleString()}</TableCell>
                    <TableCell>${spent.toLocaleString()}</TableCell>
                    <TableCell>${(d.budget - spent).toLocaleString()}</TableCell>
                    <TableCell>
                      <span className={Number(pct) >= 100 ? "text-destructive font-semibold" : Number(pct) >= 80 ? "text-[hsl(var(--warning))] font-semibold" : "text-foreground"}>
                        {pct}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => openEdit(d.id)}><Pencil className="h-4 w-4" /></Button>
                    </TableCell>
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
