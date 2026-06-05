"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Order } from "@/types/order";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  RefreshCw, Search, PackageCheck, Clock, ShoppingBag, ArrowRight, CreditCard
} from "lucide-react";
import { orderApi } from "@/lib/api/order";
import Link from "next/link";

const STATUS_BADGE: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  waiting_for_payment: { label: "Menunggu Pembayaran", variant: "destructive" },
  pending:    { label: "Menunggu Konfirmasi", variant: "outline" },
  confirmed:  { label: "Dikonfirmasi", variant: "secondary" },
  preparing:  { label: "Dimasak",      variant: "secondary" },
  delivering: { label: "Diantar",      variant: "default" },
  delivered:  { label: "Selesai",      variant: "default" },
  cancelled:  { label: "Dibatalkan",   variant: "outline" },
};

const STATUS_TABS = [
  { value: "all",        label: "Semua" },
  { value: "active",     label: "Aktif" },
  { value: "history",    label: "Riwayat" },
];

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `${diff}dtk lalu`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}j lalu`;
  return new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

export default function CustomerOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("active");
  const [search, setSearch] = useState("");

  const fetchOrders = useCallback(async () => {
    try {
      const data = await orderApi.myOrders();
      data.sort((a, b) => new Date(b.ordered_at).getTime() - new Date(a.ordered_at).getTime());
      setOrders(data);
    } catch {
      toast.error("Gagal memuat pesanan");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // Auto refresh 30 detik
  useEffect(() => {
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const filtered = orders.filter((o) => {
    const matchSearch =
      String(o.id).includes(search) ||
      o.items.some((i) => i.menu_item.name.toLowerCase().includes(search.toLowerCase()));

    if (!matchSearch) return false;

    if (statusFilter === "active") {
      return ["waiting_for_payment", "pending", "confirmed", "preparing", "delivering"].includes(o.status);
    }
    if (statusFilter === "history") {
      return ["delivered", "cancelled"].includes(o.status);
    }

    return true;
  });

  const activeCount = orders.filter(o => ["waiting_for_payment", "pending", "confirmed", "preparing", "delivering"].includes(o.status)).length;
  const historyCount = orders.filter(o => ["delivered", "cancelled"].includes(o.status)).length;
  const countMap: Record<string, number> = {
    all: orders.length,
    active: activeCount,
    history: historyCount,
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pesanan Saya</h1>
          <p className="text-muted-foreground">Lacak pesanan aktif atau lihat riwayat belanjamu.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/order">
            <Button size="sm" className="hidden sm:flex rounded-full">
              Pesan Baru <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
          <Button size="icon" variant="outline" onClick={fetchOrders} className="rounded-full">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${
              statusFilter === tab.value
                ? "bg-primary text-white shadow-md shadow-primary/20 scale-105"
                : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 border border-transparent"
            }`}
          >
            {tab.label}
            <span className={`text-xs rounded-full px-2 py-0.5 font-bold ${
              statusFilter === tab.value ? "bg-white/20" : "bg-background shadow-sm border"
            }`}>
              {countMap[tab.value] || 0}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cari pesanan berdasarkan ID atau nama menu..."
          className="pl-9 rounded-full bg-muted/50 border-transparent focus-visible:bg-background"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="space-y-4 shadow-sm">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 rounded-[2rem]" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-muted/20 border border-dashed rounded-[2rem]">
          <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
             <PackageCheck className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold text-foreground">Tidak Ada Pesanan</h3>
          <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
            {statusFilter === "active" ? "Wah, kamu belum ada pesanan aktif nih. Coba eksplor menu lezat hari ini!" : "Tidak ada pesanan yang sesuai dengan filter saat ini."}
          </p>
          <Link href="/order" className="mt-6">
             <Button className="rounded-full shadow-lg shadow-primary/20 px-8">Mulai Pesan Sekarang</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((order) => {
            const badge = STATUS_BADGE[order.status];

            return (
              <Card
                key={order.id}
                className="group overflow-hidden rounded-3xl border-transparent bg-muted/30 hover:border-primary/20 hover:shadow-lg transition-all duration-300"
              >
                <CardContent className="p-5 md:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Left: Info */}
                    <div className="flex-1 min-w-0 space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={badge.variant} className="text-xs">{badge.label}</Badge>
                        <span className="font-mono font-bold text-sm text-muted-foreground">ORDER #{order.id}</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium bg-background px-2 py-1 rounded-md border shadow-sm">
                          <Clock className="h-3 w-3" /> {timeAgo(order.ordered_at)}
                        </span>
                      </div>

                      {/* Items Preview */}
                      <div className="flex flex-wrap items-center gap-1.5 text-sm font-medium">
                        {order.items.slice(0, 3).map((item) => (
                           <span key={item.id} className="bg-background border shadow-sm px-2.5 py-1 rounded-full text-foreground flex items-center gap-1">
                              {item.menu_item.name} <span className="text-xs text-muted-foreground">×{item.quantity}</span>
                           </span>
                        ))}
                        {order.items.length > 3 && (
                           <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full font-bold">
                              +{order.items.length - 3} lagi
                           </span>
                        )}
                      </div>

                    </div>

                    {/* Right: Price & Action */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 shrink-0 sm:pl-4 sm:border-l border-border/50">
                       <div className="text-left sm:text-right">
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Total Belanja</p>
                          <p className="font-black text-xl text-foreground">Rp {order.total_price.toLocaleString("id-ID")}</p>
                       </div>
                      {order.status === "waiting_for_payment" ? (
                        <Button
                          size="sm"
                          variant="destructive"
                          className="rounded-full font-bold px-6 shadow-sm"
                          onClick={() => router.push(`/customer/payment?order_id=${order.id}`)}
                        >
                          <CreditCard className="h-4 w-4 mr-2" /> Bayar Sekarang
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="secondary"
                          className="rounded-full font-bold px-6 shadow-sm group-hover:bg-primary group-hover:text-white transition-colors"
                          onClick={() => router.push(`/customer/track?order_id=${order.id}`)}
                        >
                          <ShoppingBag className="h-4 w-4 mr-2" /> Detail
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

    </div>
  );
}
