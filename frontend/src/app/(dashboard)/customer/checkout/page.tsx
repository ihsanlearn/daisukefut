"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/stores/cartStore";
import { deliveryPointApi } from "@/lib/api/delivery-point";
import { orderApi } from "@/lib/api/order";
import { paymentApi } from "@/lib/api/payment";
import { DeliveryPoint } from "@/types/order";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MapPin, ShoppingBag, Loader2, CheckCircle,
  Plus, Trash2, QrCode,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

export default function CheckoutPage() {
  const router = useRouter();
  const { canteenId, canteenName, items, clearCart } = useCartStore();

  const cartTotal = items.reduce((a, b) => a + b.price * b.quantity, 0);

  const [deliveryPoints, setDeliveryPoints] = useState<DeliveryPoint[]>([]);
  const [selectedPointId, setSelectedPointId] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isOrdering, setIsOrdering] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSavingPoint, setIsSavingPoint] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const [newPoint, setNewPoint] = useState({ name: "", address: "" });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    if (!canteenId || items.length === 0) {
      router.replace("/customer/order");
      return;
    }
    loadDeliveryPoints();
  }, [isMounted]);

  const loadDeliveryPoints = async () => {
    try {
      const data = await deliveryPointApi.list();
      setDeliveryPoints(data);
      if (data.length > 0) setSelectedPointId(data[0].id);
    } catch {
      toast.error("Gagal memuat titik antar");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveNewPoint = async () => {
    if (!newPoint.name || !newPoint.address) {
      toast.error("Nama dan alamat wajib diisi");
      return;
    }
    setIsSavingPoint(true);
    try {
      const created = await deliveryPointApi.create({
        name: newPoint.name,
        address: newPoint.address,
      });
      setDeliveryPoints((prev) => [...prev, created]);
      setSelectedPointId(created.id);
      setIsAddOpen(false);
      setNewPoint({ name: "", address: "" });
      toast.success("Titik antar berhasil disimpan!");
    } catch {
      toast.error("Gagal menyimpan titik antar");
    } finally {
      setIsSavingPoint(false);
    }
  };

  const handleDeletePoint = async (id: number) => {
    try {
      await deliveryPointApi.delete(id);
      setDeliveryPoints((prev) => prev.filter((p) => p.id !== id));
      if (selectedPointId === id) setSelectedPointId(null);
      toast.success("Titik antar dihapus");
    } catch {
      toast.error("Gagal menghapus titik antar");
    }
  };

  const handleOrder = async () => {
    if (!selectedPointId) {
      toast.error("Pilih titik antar dulu!");
      return;
    }
    if (!canteenId) return;

    setIsOrdering(true);
    try {
      const order = await orderApi.create({
        canteen_id: canteenId,
        delivery_point_id: selectedPointId,
        items: items.map((i) => ({
          menu_item_id: i.menu_item_id,
          quantity: i.quantity,
          notes: i.notes,
        })),
        notes: notes || undefined,
      });

      await paymentApi.create(order.id);
      clearCart();
      toast.success("Pesanan dibuat! Lanjutkan pembayaran QRIS.");
      router.push(`/customer/payment?order_id=${order.id}`);
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Gagal membuat pesanan";
      toast.error(msg);
      setIsOrdering(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Checkout</h1>
        <p className="text-muted-foreground">Konfirmasi pesanan dari {canteenName}</p>
      </div>

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShoppingBag className="h-4 w-4" /> Ringkasan Pesanan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {isMounted && items.map((item) => (
            <div key={item.menu_item_id} className="flex justify-between text-sm">
              <span>{item.name} <span className="text-muted-foreground">x{item.quantity}</span></span>
              <span>{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
          <div className="border-t pt-2 flex justify-between font-bold">
            <span>Total</span>
            <span>{isMounted ? formatPrice(cartTotal) : "Rp0,00"}</span>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method — QRIS Only */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <QrCode className="h-4 w-4" /> Metode Pembayaran
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 rounded-lg border border-primary bg-primary/5 flex items-center gap-3">
            <QrCode className="h-6 w-6 text-primary" />
            <div>
              <p className="text-sm font-medium">Pembayaran QRIS</p>
              <p className="text-xs text-muted-foreground">Scan QRIS kantin dan upload bukti pembayaran</p>
            </div>
            <CheckCircle className="h-5 w-5 text-primary ml-auto" />
          </div>
        </CardContent>
      </Card>

      {/* Delivery Point */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="h-4 w-4" /> Titik Antar
            </CardTitle>
            <Button size="sm" variant="outline" onClick={() => setIsAddOpen(true)}>
              <Plus className="h-4 w-4 mr-1" /> Tambah
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-16" />)}
            </div>
          ) : deliveryPoints.length === 0 ? (
            <div className="text-center py-4 text-sm text-muted-foreground">
              Belum ada titik antar.{" "}
              <button onClick={() => setIsAddOpen(true)} className="text-primary underline">Tambah sekarang</button>
            </div>
          ) : (
            deliveryPoints.map((point) => (
              <div
                key={point.id}
                onClick={() => setSelectedPointId(point.id)}
                className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center gap-3 ${
                  selectedPointId === point.id
                    ? "border-primary bg-primary/5"
                    : "hover:border-muted-foreground"
                }`}
              >
                <div className={`p-2 rounded-full ${selectedPointId === point.id ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                  <MapPin className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{point.name}</p>
                  <p className="text-xs text-muted-foreground">{point.address}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={(e) => { e.stopPropagation(); handleDeletePoint(point.id); }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                  {selectedPointId === point.id && <CheckCircle className="h-5 w-5 text-primary ml-1" />}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader><CardTitle className="text-base">Catatan (opsional)</CardTitle></CardHeader>
        <CardContent>
          <Textarea placeholder="Contoh: tanpa sambal, tambah nasi..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={() => router.back()}>Kembali</Button>
        <Button
          className="flex-1"
          onClick={handleOrder}
          disabled={isOrdering || !selectedPointId}
        >
          {isOrdering
            ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Memproses...</>
            : "Pesan & Bayar QRIS"
          }
        </Button>
      </div>

      {/* Add Delivery Point Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Tambah Titik Antar</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nama Titik *</Label>
              <Input placeholder="Contoh: Meja Pojok Perpus" value={newPoint.name} onChange={(e) => setNewPoint({ ...newPoint, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Alamat / Lokasi *</Label>
              <Input placeholder="Contoh: Gedung A, Lantai 2, dekat lift" value={newPoint.address} onChange={(e) => setNewPoint({ ...newPoint, address: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>Batal</Button>
            <Button onClick={handleSaveNewPoint} disabled={isSavingPoint}>{isSavingPoint ? "Menyimpan..." : "Simpan"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
