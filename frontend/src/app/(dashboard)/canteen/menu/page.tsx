"use client";

import { useEffect, useState } from "react";
import { useMyCanteen } from "@/hooks/useMyCanteen";
import { useCategories } from "@/hooks/useCategories";
import { menuApi } from "@/lib/api/menu";
import { uploadApi } from "@/lib/api/upload";
import { MenuItem } from "@/types/menu";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Pencil, Trash2, Search, UtensilsCrossed } from "lucide-react";

const emptyForm = {
  name: "",
  description: "",
  price: "",
  image_url: "",
  category_id: "",
  is_available: true,
};

export default function MenuPage() {
  const { canteen, isLoading: canteenLoading } = useMyCanteen();
  const { categories, isLoading: categoriesLoading } = useCategories();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [initialForm, setInitialForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!canteen) return;
    setIsLoading(true);
    menuApi.list(canteen.id, undefined, true)
      .then(setItems)
      .catch(() => toast.error("Gagal memuat menu"))
      .finally(() => setIsLoading(false));
  }, [canteen]);

  const filtered = items.filter((item) => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === "all" || String(item.category_id) === categoryFilter;
    return matchSearch && matchCategory;
  });

  const openCreate = () => {
    const freshForm = { ...emptyForm, category_id: "none" };
    setSelectedItem(null);
    setForm(freshForm);
    setInitialForm(freshForm);
    setIsDialogOpen(true);
  };

  const openEdit = (item: MenuItem) => {
    const editForm = {
      name: item.name,
      description: item.description ?? "",
      price: String(item.price),
      image_url: item.image_url ?? "",
      category_id: item.category_id ? String(item.category_id) : "none",
      is_available: item.is_available,
    };
    setSelectedItem(item);
    setForm(editForm);
    setInitialForm(editForm);
    setIsDialogOpen(true);
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      const isChanged = JSON.stringify(form) !== JSON.stringify(initialForm);
      if (isChanged || isUploading) {
        const confirmResult = window.confirm(
          isUploading
            ? "Gambar sedang diunggah. Yakin ingin menutup dan membatalkan?"
            : "Ada perubahan yang belum disimpan. Yakin ingin menutup?"
        );
        if (!confirmResult) return;
      }
      setIsDialogOpen(false);
    } else {
      setIsDialogOpen(true);
    }
  };

  const openDelete = (item: MenuItem) => {
    setSelectedItem(item);
    setIsDeleteDialogOpen(true);
  };

  const handleSave = async () => {
    if (!canteen) return;
    if (!form.name || !form.price) {
      toast.error("Nama dan harga wajib diisi");
      return;
    }

    setIsSaving(true);

    try {
      const payload = {
        name: form.name,
        description: form.description || undefined,
        price: Number(form.price),
        image_url: form.image_url || undefined,
        category_id: form.category_id && form.category_id !== "none" ? Number(form.category_id) : null,
        is_available: form.is_available,
      };

      if (selectedItem) {
        const updated = await menuApi.update(canteen.id, selectedItem.id, payload);
        setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
        toast.success("Menu berhasil diupdate!");
      } else {
        const created = await menuApi.create(canteen.id, payload);
        setItems((prev) => [...prev, created]);
        toast.success("Menu berhasil ditambahkan!");
      }
      setIsDialogOpen(false);
    } catch {
      toast.error("Gagal menyimpan menu");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!canteen || !selectedItem) return;
    try {
      await menuApi.delete(canteen.id, selectedItem.id);
      setItems((prev) => prev.filter((i) => i.id !== selectedItem.id));
      toast.success("Menu berhasil dihapus!");
      setIsDeleteDialogOpen(false);
    } catch {
      toast.error("Gagal menghapus menu");
    }
  };

  const handleToggleAvailable = async (item: MenuItem) => {
    if (!canteen) return;
    try {
      const updated = await menuApi.update(canteen.id, item.id, { is_available: !item.is_available });
      setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
      toast.success(`Menu ${updated.is_available ? "diaktifkan" : "dinonaktifkan"}`);
    } catch {
      toast.error("Gagal mengubah status menu");
    }
  };

  const getCategoryName = (category_id?: number) => {
    if (!category_id) return null;
    return categories.find((c) => c.id === category_id);
  };

  if (canteenLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-40" />)}
        </div>
      </div>
    );
  }

  if (!canteen) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4 text-center">
        <UtensilsCrossed className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Kamu belum punya kantin</h2>
        <p className="text-muted-foreground">Hubungi admin untuk mendaftarkan kantinmu.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Menu — {canteen.name}</h1>
          <p className="text-muted-foreground">{items.length} item terdaftar</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" /> Tambah Menu
        </Button>
      </div>

      {/* Filter */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Cari menu..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kategori</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>
                {c.icon} {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Menu Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-40" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
          <UtensilsCrossed className="h-10 w-10 mb-2" />
          <p>Belum ada menu</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((item) => {
            const cat = getCategoryName(item.category_id);
            return (
              <Card key={item.id} className={`overflow-hidden transition-all hover:shadow-md ${!item.is_available ? "opacity-60" : ""}`}>
                <div className="flex h-full">
                  {/* Left Side: Image */}
                  <div className="w-32 sm:w-36 shrink-0 bg-muted/50 relative border-r">
                    {item.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground/30">
                        <UtensilsCrossed className="h-10 w-10" />
                      </div>
                    )}
                  </div>

                  {/* Right Side: Content */}
                  <CardContent className="flex flex-1 flex-col justify-between p-4">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold line-clamp-1" title={item.name}>{item.name}</p>
                        {cat && (
                          <Badge variant="secondary" className="text-[10px] uppercase font-medium tracking-wider shrink-0 px-2 py-0.5 rounded-full">
                            {cat.icon} {cat.name}
                          </Badge>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">
                          {item.description}
                        </p>
                      )}
                    </div>

                    <div className="mt-4">
                      <p className="text-[15px] font-bold text-primary">Rp {item.price.toLocaleString("id-ID")}</p>
                      <div className="flex items-center justify-between border-t border-border pt-3 mt-3">
                        <div className="flex items-center gap-2">
                          <Switch checked={item.is_available} onCheckedChange={() => handleToggleAvailable(item)} className="scale-75 origin-left" />
                          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                            {item.is_available ? "Tersedia" : "Habis"}
                          </span>
                        </div>
                        <div className="flex gap-0.5 -mr-2">
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => openEdit(item)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive/80 hover:text-destructive hover:bg-destructive/10" onClick={() => openDelete(item)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedItem ? "Edit Menu" : "Tambah Menu"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nama Menu *</Label>
              <Input placeholder="Nasi Goreng Spesial" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Deskripsi</Label>
              <Textarea placeholder="Deskripsi menu..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Harga (Rp) *</Label>
                <Input type="number" placeholder="15000" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Kategori</Label>
                <Select
                  value={form.category_id || "none"}
                  onValueChange={(val) => setForm({ ...form, category_id: val })}
                  disabled={categoriesLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={categoriesLoading ? "Memuat..." : "Pilih Kategori"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Tanpa Kategori</SelectItem>
                    {categories.length > 0 ? (
                      categories.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.icon} {c.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="empty" disabled>Belum ada kategori</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Gambar Menu</Label>
              <Input
                type="file"
                accept="image/*"
                disabled={isUploading}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    try {
                      setIsUploading(true);
                      const loadingToast = toast.loading("Mengunggah gambar...");
                      const res = await uploadApi.uploadImage(file, "menu");
                      setForm({ ...form, image_url: res.url });
                      toast.dismiss(loadingToast);
                      toast.success("Gambar berhasil diunggah");
                    } catch {
                      toast.dismiss();
                      toast.error("Gagal mengunggah gambar");
                    } finally {
                      setIsUploading(false);
                    }
                  }
                }}
              />
              {isUploading && <p className="text-sm text-muted-foreground animate-pulse mt-2">Sedang mengunggah...</p>}
              {form.image_url && !isUploading && (
                <div className="text-sm text-muted-foreground mt-2">
                  Gambar saat ini:{" "}
                  <a href={form.image_url} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                    Lihat Gambar
                  </a>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.is_available} onCheckedChange={(val) => setForm({ ...form, is_available: val })} />
              <Label>Tersedia</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => handleDialogClose(false)}>Batal</Button>
            <Button onClick={handleSave} disabled={isSaving || isUploading}>
              {isSaving ? "Menyimpan..." : selectedItem ? "Update" : "Tambah"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Menu</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Yakin ingin menghapus <span className="font-semibold text-foreground">{selectedItem?.name}</span>? Tindakan ini tidak bisa dibatalkan.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Batal</Button>
            <Button variant="destructive" onClick={handleDelete}>Hapus</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
