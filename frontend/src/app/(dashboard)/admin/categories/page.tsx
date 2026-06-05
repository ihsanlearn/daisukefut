"use client";

import { useEffect, useState } from "react";
import { categoryApi, Category } from "@/lib/api/category";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Tag } from "lucide-react";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: "", icon: "" });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await categoryApi.list();
      setCategories(data);
    } catch {
      toast.error("Gagal memuat kategori");
    } finally {
      setIsLoading(false);
    }
  };

  const openCreate = () => {
    setSelected(null);
    setForm({ name: "", icon: "" });
    setIsDialogOpen(true);
  };

  const openEdit = (cat: Category) => {
    setSelected(cat);
    setForm({ name: cat.name, icon: cat.icon ?? "" });
    setIsDialogOpen(true);
  };

  const openDelete = (cat: Category) => {
    setSelected(cat);
    setIsDeleteOpen(true);
  };

  const handleSave = async () => {
    if (!form.name) {
      toast.error("Nama kategori wajib diisi");
      return;
    }
    setIsSaving(true);
    try {
      if (selected) {
        const updated = await categoryApi.update(selected.id, { name: form.name, icon: form.icon || undefined });
        setCategories((prev) => prev.map((c) => c.id === updated.id ? updated : c));
        toast.success("Kategori diupdate!");
      } else {
        const created = await categoryApi.create({ name: form.name, icon: form.icon || undefined });
        setCategories((prev) => [...prev, created]);
        toast.success("Kategori ditambahkan!");
      }
      setIsDialogOpen(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.detail ?? "Gagal menyimpan kategori");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    try {
      await categoryApi.delete(selected.id);
      setCategories((prev) => prev.filter((c) => c.id !== selected.id));
      toast.success("Kategori dihapus!");
      setIsDeleteOpen(false);
    } catch {
      toast.error("Gagal menghapus kategori");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Kelola Kategori</h1>
          <p className="text-muted-foreground">{categories.length} kategori terdaftar</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" /> Tambah Kategori
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Tag className="h-4 w-4" /> Daftar Kategori
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-16" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {categories.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/10">
                  <div className="flex items-center gap-2">
                    {cat.icon && <span className="text-xl">{cat.icon}</span>}
                    <span className="font-medium text-sm">{cat.name}</span>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(cat)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => openDelete(cat)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selected ? "Edit Kategori" : "Tambah Kategori"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nama Kategori *</Label>
              <Input placeholder="Makanan" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Icon (emoji)</Label>
              <Input placeholder="🍱" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} />
              {form.icon && <p className="text-3xl">{form.icon}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Batal</Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Menyimpan..." : selected ? "Update" : "Tambah"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Kategori</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Yakin hapus kategori <span className="font-semibold text-foreground">{selected?.icon} {selected?.name}</span>?
            Menu yang menggunakan kategori ini akan kehilangan kategorinya.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Batal</Button>
            <Button variant="destructive" onClick={handleDelete}>Hapus</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
