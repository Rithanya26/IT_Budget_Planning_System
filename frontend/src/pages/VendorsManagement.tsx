import { useState, useEffect } from "react";
import { apiService } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Vendor {
  id: number;
  name: string;
  contact_email?: string;
  annual_contract_value?: number;
  contract_start_date?: string;
  contract_end_date?: string;
}

export default function VendorsManagement() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [annualValue, setAnnualValue] = useState("");
  const [contractStart, setContractStart] = useState("");
  const [contractEnd, setContractEnd] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      const data = await apiService.getVendors();
      setVendors(Array.isArray(data) ? data : []);
    } catch {
      setVendors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const reset = () => {
    setName("");
    setContactEmail("");
    setAnnualValue("");
    setContractStart("");
    setContractEnd("");
    setEditId(null);
  };

  const openAdd = () => {
    reset();
    setOpen(true);
  };

  const openEdit = (v: Vendor) => {
    setEditId(v.id);
    setName(v.name);
    setContactEmail(v.contact_email ?? "");
    setAnnualValue(v.annual_contract_value != null ? String(v.annual_contract_value) : "");
    setContractStart(v.contract_start_date ?? "");
    setContractEnd(v.contract_end_date ?? "");
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) {
        await apiService.updateVendor(editId, {
          name: name.trim(),
          contact_email: contactEmail.trim() || undefined,
          annual_contract_value: annualValue ? Number(annualValue) : undefined,
          contract_start_date: contractStart || undefined,
          contract_end_date: contractEnd || undefined,
        });
      } else {
        await apiService.createVendor({
          name: name.trim(),
          contact_email: contactEmail.trim() || undefined,
          annual_contract_value: annualValue ? Number(annualValue) : undefined,
          contract_start_date: contractStart || undefined,
          contract_end_date: contractEnd || undefined,
        });
      }
      setOpen(false);
      reset();
      await load();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (deleteId == null) return;
    try {
      await apiService.deleteVendor(deleteId);
      setDeleteId(null);
      await load();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Vendors</h1>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
          <DialogTrigger asChild>
            <Button onClick={openAdd}>
              <Plus className="h-4 w-4 mr-1" /> Add Vendor
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editId ? "Edit" : "Add"} Vendor</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Contact Email</Label>
                <Input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Annual Contract Value ($)</Label>
                <Input type="number" value={annualValue} onChange={(e) => setAnnualValue(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Contract Start Date</Label>
                <Input type="date" value={contractStart} onChange={(e) => setContractStart(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Contract End Date</Label>
                <Input type="date" value={contractEnd} onChange={(e) => setContractEnd(e.target.value)} />
              </div>
              <Button type="submit" className="w-full">{editId ? "Update" : "Create"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Vendors</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Annual Value</TableHead>
                  <TableHead>Contract End</TableHead>
                  <TableHead className="w-24"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vendors.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell className="font-medium">{v.name}</TableCell>
                    <TableCell>{v.contact_email ?? "—"}</TableCell>
                    <TableCell>{v.annual_contract_value != null ? `$${Number(v.annual_contract_value).toLocaleString()}` : "—"}</TableCell>
                    <TableCell>{v.contract_end_date ?? "—"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(v)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(v.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteId != null} onOpenChange={(v) => !v && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Vendor</AlertDialogTitle>
            <AlertDialogDescription>Are you sure? This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={handleDelete}>
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
