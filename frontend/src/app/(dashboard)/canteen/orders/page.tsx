"use client";

import { useEffect, useState, useCallback } from "react";
import { Order, OrderStatus } from "@/types/order";
import { paymentApi } from "@/lib/api/payment";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  RefreshCw, Search, ChefHat, Bike, CheckCircle, XCircle,
  PackageCheck, Clock, MapPin, FileText, ShoppingBag, ImageIcon, Loader2,
} from "lucide-react";
import apiClient from "@/lib/api/client";

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
};

type CanteenAction = {
  label: string;
  variant: "default" | "outline" | "secondary";
  nextStatus?: OrderStatus;
  icon?: React.ReactNode;
};

const CANTEEN_ACTIONS: Record<string, CanteenAction> = {
  confirmed:  { label: "Mulai Masak",       variant: "default",  nextStatus: "preparing", icon: <ChefHat className="h-3.5 w-3.5 mr-1" /> },
  preparing:  { label: "Siap Antar",         variant: "default",  nextStatus: "delivering", icon: <Bike className="h-3.5 w-3.5 mr-1" /> },
  delivering: { label: "Konfirmasi Tiba",    variant: "outline",  nextStatus: "delivered", icon: <CheckCircle className="h-3.5 w-3.5 mr-1" /> },
};

const STATUS_BADGE: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  waiting_for_payment: { label: "Menunggu Pembayaran", variant: "outline" },
  pending:    { label: "Menunggu Verifikasi", variant: "destructive" },
  confirmed:  { label: "Dikonfirmasi", variant: "secondary" },
  preparing:  { label: "Dimasak",      variant: "secondary" },
  delivering: { label: "Diantar",      variant: "default" },
  delivered:  { label: "Selesai",      variant: "default" },
  cancelled:  { label: "Dibatalkan",   variant: "outline" },
};

const STATUS_TABS = [
  { value: "all",        label: "Semua" },
  { value: "waiting_for_payment", label: "Menunggu Bayar" },
  { value: "pending",    label: "Verifikasi" },
  { value: "confirmed",  label: "Dikonfirmasi" },
  { value: "preparing",  label: "Dimasak" },
  { value: "delivering", label: "Diantar" },
  { value: "delivered",  label: "Selesai" },
];

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `${diff}d lalu`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}j lalu`;
  return new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

export default function CanteenOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [verifyingOrder, setVerifyingOrder] = useState<Order | null>(null);
  const [proofUrl, setProofUrl] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<number | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isLoadingProof, setIsLoadingProof] = useState(false);

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

  useEffect(() => {
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const handleAction = async (order: Order, action: CanteenAction) => {
    setUpdatingId(order.id);
    try {
      const updated = await canteenOrderApi.updateStatus(order.id, action.nextStatus!);
      setOrders((prev) => prev.map((o) => o.id === updated.id ? updated : o));
      if (selectedOrder?.id === updated.id) setSelectedOrder(updated);
      toast.success(`Pesanan #${order.id} diperbarui!`);
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Gagal update status";
      toast.error(msg);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleOpenVerify = async (order: Order) => {
    setVerifyingOrder(order);
    setIsLoadingProof(true);
    try {
      const details = await paymentApi.getByOrder(order.id);
      setProofUrl(details.payment?.proof_image_url || null);
      setPaymentId(details.payment?.id || null);
    } catch {
      toast.error("Gagal memuat bukti pembayaran");
    } finally {
      setIsLoadingProof(false);
    }
  };

  const handleVerify = async (action: "approve" | "reject") => {
    if (!paymentId) return;
    setIsVerifying(true);
    try {
      await paymentApi.verify(paymentId, action);
      toast.success(action === "approve" ? "Pembayaran diverifikasi!" : "Pembayaran ditolak");
      setVerifyingOrder(null);
      fetchOrders();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Gagal memverifikasi");
    } finally {
      setIsVerifying(false);
    }
  };

  const filtered = orders.filter((o) => {
    const matchSearch =
      String(o.id).includes(search) ||
      o.items.some((i) => i.menu_item.name.toLowerCase().includes(search.toLowerCase()));
    return matchSearch;
  });

  const countByStatus = orders.reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pesanan</h1>
          <p className="text-muted-foreground">{orders.length} pesanan total</p>
        </div>
        <Button size="sm" variant="outline" onClick={fetchOrders}>
          <RefreshCw className="h-4 w-4 mr-1" /> Refresh
        </Button>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${
              statusFilter === tab.value
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
            {tab.value !== "all" && countByStatus[tab.value] ? (
              <span className={`text-xs rounded-full px-1.5 py-0.5 ${
                statusFilter === tab.value ? "bg-white/20" : "bg-background"
              }`}>
                {countByStatus[tab.value]}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Cari nomor pesanan atau nama menu..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
          <PackageCheck className="h-10 w-10 mb-2" />
          <p className="text-sm">Tidak ada pesanan</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => {
            const action = CANTEEN_ACTIONS[order.status];
            const badge = STATUS_BADGE[order.status];
            const isUpdating = updatingId === order.id;
            const needsVerification = order.status === "pending";

            return (
              <Card
                key={order.id}
                className={`transition-all ${
                  needsVerification ? "border-amber-500/50 bg-amber-500/5" :
                  order.status === "waiting_for_payment" ? "border-purple-500/30 bg-purple-500/5" :
                  order.status === "preparing" ? "border-orange-500/30 bg-orange-500/5" :
                  order.status === "delivering" ? "border-blue-500/30 bg-blue-500/5" : ""
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    {/* Left */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-sm">#{order.id}</span>
                        {badge && <Badge variant={badge.variant} className="text-xs">{badge.label}</Badge>}
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {timeAgo(order.ordered_at)}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {order.items.map((item) => (
                          <span key={item.id} className="text-xs bg-muted px-2 py-0.5 rounded-full">
                            {item.menu_item.name} ×{item.quantity}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="font-semibold text-foreground text-sm">
                          Rp {Number(order.total_price).toLocaleString("id-ID")}
                        </span>
                        {order.notes && (
                          <span className="flex items-center gap-1 italic">
                            <FileText className="h-3 w-3" /> {order.notes}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      {/* Payment verification button for pending (waiting_verification) */}
                      {needsVerification && (
                        <Button
                          size="sm"
                          variant="default"
                          className="bg-amber-500 hover:bg-amber-600"
                          onClick={() => handleOpenVerify(order)}
                        >
                          <ImageIcon className="h-3.5 w-3.5 mr-1" /> Verifikasi Bukti
                        </Button>
                      )}

                      {/* Normal actions for confirmed/preparing/delivering */}
                      {action && (
                        <Button
                          size="sm"
                          variant={action.variant}
                          disabled={isUpdating}
                          onClick={() => handleAction(order, action)}
                        >
                          {isUpdating
                            ? <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                            : <>{action.icon}{action.label}</>
                          }
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs text-muted-foreground"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <ShoppingBag className="h-3.5 w-3.5 mr-1" /> Detail
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Pesanan <span className="font-mono">#{selectedOrder?.id}</span>
              {selectedOrder && STATUS_BADGE[selectedOrder.status] && (
                <Badge variant={STATUS_BADGE[selectedOrder.status].variant} className="text-xs">
                  {STATUS_BADGE[selectedOrder.status].label}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Item Pesanan</p>
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm p-2 rounded-lg bg-muted/30">
                    <span>{item.menu_item.name} <span className="text-muted-foreground">×{item.quantity}</span></span>
                    <span className="font-medium">Rp {Number(item.subtotal).toLocaleString("id-ID")}</span>
                  </div>
                ))}
                <div className="flex justify-between font-bold text-sm border-t pt-2">
                  <span>Total</span>
                  <span>Rp {Number(selectedOrder.total_price).toLocaleString("id-ID")}</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-muted/30 space-y-1">
                <p className="text-xs font-medium flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> Titik Antar
                </p>
                <p className="text-sm">Delivery Point #{selectedOrder.delivery_point_id}</p>
              </div>

              {selectedOrder.notes && (
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="text-xs font-medium flex items-center gap-1 mb-1">
                    <FileText className="h-3.5 w-3.5" /> Catatan
                  </p>
                  <p className="text-sm italic">{selectedOrder.notes}</p>
                </div>
              )}

              <div className="text-xs text-muted-foreground space-y-1">
                <p>Dipesan: {new Date(selectedOrder.ordered_at).toLocaleString("id-ID")}</p>
                {selectedOrder.delivered_at && (
                  <p>Tiba: {new Date(selectedOrder.delivered_at).toLocaleString("id-ID")}</p>
                )}
              </div>

              {CANTEEN_ACTIONS[selectedOrder.status] && (
                <Button
                  className="w-full"
                  variant={CANTEEN_ACTIONS[selectedOrder.status].variant}
                  disabled={updatingId === selectedOrder.id}
                  onClick={() => handleAction(selectedOrder, CANTEEN_ACTIONS[selectedOrder.status])}
                >
                  {updatingId === selectedOrder.id
                    ? <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    : CANTEEN_ACTIONS[selectedOrder.status].icon
                  }
                  {CANTEEN_ACTIONS[selectedOrder.status].label}
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Payment Verification Dialog */}
      <Dialog open={!!verifyingOrder} onOpenChange={(open) => !open && setVerifyingOrder(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" /> Verifikasi Pembayaran
              <span className="font-mono text-muted-foreground">#{verifyingOrder?.id}</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Order info */}
            <div className="p-3 rounded-lg bg-muted/30">
              <div className="flex justify-between text-sm">
                <span>Total Pembayaran</span>
                <span className="font-bold text-primary">Rp {verifyingOrder ? Number(verifyingOrder.total_price).toLocaleString("id-ID") : "0"}</span>
              </div>
            </div>

            {/* Proof Image */}
            <div>
              <p className="text-sm font-medium mb-2">Bukti Pembayaran</p>
              {isLoadingProof ? (
                <Skeleton className="w-full h-64 rounded-lg" />
              ) : proofUrl ? (
                <div className="border rounded-lg overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={proofUrl}
                    alt="Bukti Pembayaran"
                    className="w-full max-h-80 object-contain bg-white"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-lg text-muted-foreground">
                  <ImageIcon className="h-8 w-8 mb-2 opacity-30" />
                  <p className="text-sm">Belum ada bukti pembayaran</p>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="flex gap-2 sm:gap-2">
            <Button
              variant="destructive"
              className="flex-1"
              disabled={isVerifying || !proofUrl}
              onClick={() => handleVerify("reject")}
            >
              {isVerifying ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <XCircle className="h-4 w-4 mr-1" />}
              Tolak
            </Button>
            <Button
              className="flex-1"
              disabled={isVerifying || !proofUrl}
              onClick={() => handleVerify("approve")}
            >
              {isVerifying ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <CheckCircle className="h-4 w-4 mr-1" />}
              Verifikasi & Masak
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
