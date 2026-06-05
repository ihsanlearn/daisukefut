"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useMyCanteen } from "@/hooks/useMyCanteen";
import { orderApi } from "@/lib/api/order";
import { Order, OrderStatus } from "@/types/order";
import { canteenApi } from "@/lib/api/canteen";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ShoppingCart, ChefHat, CheckCircle, Clock,
  AlertCircle, RefreshCw, UtensilsCrossed, PackageCheck, Bike,
  QrCode, Upload, Loader2,
} from "lucide-react";
import apiClient from "@/lib/api/client";
import { uploadApi } from "@/lib/api/upload";

const canteenOrderApi = {
  list: async (status?: string): Promise<Order[]> => {
    const { data } = await apiClient.get("/v1/auth/orders", {
      params: status && status !== "all" ? { status } : {},
    });
    return data;
  },
  updateStatus: async (orderId: number, status: OrderStatus): Promise<Order> => {
    const { data } = await apiClient.patch(`/v1/auth/orders/${orderId}/status`, { status });
    return data;
  },
  confirmAndCook: async (orderId: number): Promise<Order> => {
    const { data } = await apiClient.post(`/v1/auth/orders/${orderId}/confirm-and-cook`);
    return data;
  },
};

type CanteenAction = {
  label: string;
  variant: "default" | "outline";
  isConfirmAndCook?: boolean;
  nextStatus?: OrderStatus;
};

const CANTEEN_ACTIONS: Record<string, CanteenAction> = {
  pending:    { label: "Konfirmasi & Masak", variant: "default",  isConfirmAndCook: true },
  preparing:  { label: "Siap Antar",         variant: "default",  nextStatus: "delivering" },
  delivering: { label: "Konfirmasi Tiba",    variant: "outline",  nextStatus: "delivered" },
};

const STATUS_BADGE: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  waiting_for_payment: { label: "Belum Bayar",  variant: "destructive" },
  pending:    { label: "Menunggu",   variant: "destructive" },
  confirmed:  { label: "Dikonfirmasi", variant: "secondary" },
  preparing:  { label: "Dimasak",    variant: "secondary" },
  delivering: { label: "Diantar",    variant: "default" },
  delivered:  { label: "Selesai",    variant: "default" },
  cancelled:  { label: "Dibatal",    variant: "outline" },
};

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `${diff} detik lalu`;
  if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
  return `${Math.floor(diff / 3600)} jam lalu`;
}

export default function CanteenDashboard() {
  const router = useRouter();
  const { canteen, isLoading: canteenLoading, setCanteen } = useMyCanteen();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState<boolean | null>(null);
  const [isToggling, setIsToggling] = useState(false);
  const [isUploadingQris, setIsUploadingQris] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      const data = await canteenOrderApi.list(statusFilter);
      setOrders(data);
    } catch {
      toast.error("Gagal memuat pesanan");
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);
  useEffect(() => { if (canteen) setIsOpen(canteen.is_open); }, [canteen]);
  useEffect(() => {
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const handleAction = async (order: Order, action: CanteenAction) => {
    setUpdatingId(order.id);
    try {
      let updated: Order;
      if (action.isConfirmAndCook) {
        updated = await canteenOrderApi.confirmAndCook(order.id);
      } else {
        updated = await canteenOrderApi.updateStatus(order.id, action.nextStatus!);
      }
      setOrders((prev) => prev.map((o) => o.id === updated.id ? updated : o));
      toast.success(`Pesanan #${order.id} diperbarui!`);
    } catch (error: any) {
      const msg = typeof error?.response?.data?.detail === "string"
        ? error.response.data.detail : "Gagal update status";
      toast.error(msg);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleOpen = async () => {
    if (!canteen) return;
    setIsToggling(true);
    try {
      const res = await canteenApi.toggle(canteen.id);
      // Backend returns { message, canteen: CanteenResource }
      const updatedCanteen = res.canteen ?? res;
      setIsOpen(updatedCanteen.is_open);
      toast.success(`Kantin ${updatedCanteen.is_open ? "dibuka" : "ditutup"}`);
    } catch {
      toast.error("Gagal mengubah status kantin");
    } finally {
      setIsToggling(false);
    }
  };

  const stats = [
    { label: "Pesanan Aktif", value: orders.filter((o) => ["pending", "confirmed", "preparing"].includes(o.status)).length, icon: ShoppingCart, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Sedang Dimasak", value: orders.filter((o) => o.status === "preparing").length, icon: ChefHat, color: "text-orange-500", bg: "bg-orange-500/10" },
    { label: "Selesai Hari Ini", value: orders.filter((o) => o.status === "delivered").length, icon: CheckCircle, color: "text-green-500", bg: "bg-green-500/10" },
    { label: "Menunggu Bayar", value: orders.filter((o) => o.status === "waiting_for_payment").length, icon: Clock, color: "text-purple-500", bg: "bg-purple-500/10" },
  ];

  const handleUploadQris = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !canteen) return;
    setIsUploadingQris(true);
    try {
      const result = await uploadApi.uploadImage(file, "qris");
      await canteenApi.update(canteen.id, { qris_image_url: result.url });
      setCanteen({ ...canteen, qris_image_url: result.url });
      toast.success("QRIS berhasil diupload!");
    } catch {
      toast.error("Gagal mengupload QRIS");
    } finally {
      setIsUploadingQris(false);
      e.target.value = "";
    }
  };

  const activeOrders = orders.filter((o) =>
    statusFilter === "all"
      ? ["pending", "confirmed", "preparing", "delivering"].includes(o.status)
      : o.status === statusFilter
  );

  if (canteenLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!canteen) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4 text-center">
        <div className="p-4 rounded-2xl bg-muted border">
          <UtensilsCrossed className="h-12 w-12 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">Kamu belum punya kantin</h2>
          <p className="text-muted-foreground text-sm max-w-xs">
            Daftarkan kantinmu sekarang untuk mulai menerima pesanan dari pelanggan.
          </p>
        </div>
        <Button onClick={() => router.push("/canteen/create")} size="lg" className="gap-2">
          <UtensilsCrossed className="h-4 w-4" />
          Buat Kantin Sekarang
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{canteen.name}</h1>
          <p className="text-muted-foreground">{canteen.description ?? "Kelola pesanan dan menu kantinmu."}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            size="lg"
            onClick={handleToggleOpen}
            disabled={isToggling}
            className={`text-white px-4 ${isOpen ? "bg-green-500" : "bg-red-500"}`}
            >
            {isOpen ? "Tutup" : "Buka"}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                <div className={`p-1.5 rounded-md ${stat.bg}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* QRIS Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <QrCode className="h-4 w-4" /> QRIS Pembayaran
            </CardTitle>
            <label className="cursor-pointer">
              <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleUploadQris} disabled={isUploadingQris} />
              <Button size="sm" variant="outline" asChild disabled={isUploadingQris}>
                <span>
                  {isUploadingQris ? <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Mengupload...</> : <><Upload className="h-3 w-3 mr-1" /> {canteen.qris_image_url ? "Ganti" : "Upload"}</>}
                </span>
              </Button>
            </label>
          </div>
        </CardHeader>
        <CardContent>
          {canteen.qris_image_url ? (
            <div className="flex items-center gap-4">
              <div className="bg-white p-2 rounded-lg border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={canteen.qris_image_url} alt="QRIS" className="w-32 h-32 object-contain" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-600 flex items-center gap-1"><CheckCircle className="h-4 w-4" /> QRIS Aktif</p>
                <p className="text-xs text-muted-foreground mt-1">Pelanggan akan melihat kode ini saat checkout.</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <QrCode className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-medium">Belum ada QRIS</p>
              <p className="text-xs mt-1">Upload gambar QRIS agar pelanggan bisa bayar.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Orders */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Pesanan Masuk
            </CardTitle>
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Aktif</SelectItem>
                  <SelectItem value="pending">Menunggu</SelectItem>
                  <SelectItem value="preparing">Dimasak</SelectItem>
                  <SelectItem value="delivering">Diantar</SelectItem>
                  <SelectItem value="delivered">Selesai</SelectItem>
                  <SelectItem value="cancelled">Dibatalkan</SelectItem>
                </SelectContent>
              </Select>
              <Button size="sm" variant="outline" onClick={fetchOrders} className="h-8 w-8 p-0">
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24" />)}
            </div>
          ) : activeOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <PackageCheck className="h-10 w-10 mb-2" />
              <p className="text-sm">Tidak ada pesanan{statusFilter !== "all" ? " dengan status ini" : ""}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeOrders.map((order) => {
                const action = CANTEEN_ACTIONS[order.status];
                const badge = STATUS_BADGE[order.status];
                const isUpdating = updatingId === order.id;

                return (
                  <div key={order.id} className="flex items-center justify-between p-4 rounded-lg border bg-muted/20 gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-sm font-semibold">#{order.id}</span>
                        <Badge variant={badge.variant} className="text-xs">{badge.label}</Badge>
                        <span className="text-xs text-muted-foreground">{timeAgo(order.ordered_at)}</span>
                      </div>

                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {order.items.map((item) => (
                          <span key={item.id} className="text-xs bg-muted px-2 py-0.5 rounded-full">
                            {item.menu_item.name} ×{item.quantity}
                          </span>
                        ))}
                      </div>

                      {order.notes && (
                        <p className="text-xs text-muted-foreground mt-1 italic">📝 {order.notes}</p>
                      )}

                      <p className="text-xs font-medium mt-1.5">
                        Rp {order.total_price.toLocaleString("id-ID")}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      {action && (
                        <Button
                          size="sm"
                          variant={action.variant}
                          disabled={isUpdating}
                          onClick={() => handleAction(order, action)}
                        >
                          {isUpdating ? (
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <>
                              {action.nextStatus === "delivering" && <Bike className="h-3.5 w-3.5 mr-1" />}
                              {action.label}
                            </>
                          )}
                        </Button>
                      )}
                      {order.status === "delivered" && (
                        <Badge variant="default" className="text-xs gap-1">
                          <CheckCircle className="h-3 w-3" /> Selesai
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
