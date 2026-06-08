"use client";

import { useEffect, useState, Suspense } from "react";
import { canteenApi } from "@/lib/api/canteen";
import { menuApi } from "@/lib/api/menu";
import { Canteen } from "@/types/canteen";
import { MenuItem } from "@/types/menu";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Search, ShoppingCart, Plus, Minus, Trash2, MapPin, UtensilsCrossed } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

function OrderPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [canteens, setCanteens] = useState<Canteen[]>([]);
  const [search, setSearch] = useState("");
  const [isLoadingCanteens, setIsLoadingCanteens] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setSearch(searchParams.get("search") || "");
  }, [searchParams]);

  const { canteenId, canteenName, items, addItem, removeItem, updateQty, clearCart } = useCartStore();

  // Derive these from `items` directly so they're reactive (using get()-based functions isn't)
  const cartCount = items.reduce((a, b) => a + b.quantity, 0);
  const cartTotal = items.reduce((a, b) => a + b.price * b.quantity, 0);

  useEffect(() => {
    canteenApi.list()
      .then(setCanteens)
      .catch(() => toast.error("Gagal memuat kantin"))
      .finally(() => setIsLoadingCanteens(false));
  }, []);

  const getQty = (id: number) => items.find((i) => i.menu_item_id === id)?.quantity ?? 0;

  const handleAdd = (item: MenuItem, canteen: Canteen) => {
    if (canteenId && canteenId !== canteen.id && items.length > 0) {
      const confirm = window.confirm(`Ganti kantin akan mengosongkan keranjang dari ${canteenName}. Lanjutkan?`);
      if (!confirm) return;
    }
    addItem(canteen.id, canteen.name, {
      menu_item_id: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
    });
  };

  const canteensWithMenus = canteens.map((canteen) => {
    const filteredItems = (canteen.menu_items || []).filter(
      (item) => item.is_available && item.name.toLowerCase().includes(search.toLowerCase())
    );
    return { ...canteen, menu_items: filteredItems };
  }).filter((c) => c.menu_items.length > 0);

  return (
    <div className="space-y-8">
      {/* Header and Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pesan Makanan</h1>
          <p className="text-muted-foreground mt-1">
            Temukan makanan favoritmu dari berbagai kantin.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Cari makanan..." className="pl-9 h-11 md:h-10 rounded-full bg-background" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          {isMounted && cartCount > 0 && (
            <Button onClick={() => setIsCartOpen(true)} className="relative rounded-full shadow-md font-semibold h-11 md:h-10 px-5">
              <ShoppingCart className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Keranjang</span>
              <Badge className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground hover:bg-destructive rounded-full h-5 w-5 flex items-center justify-center p-0 border-2 border-background text-[10px]">
                {cartCount}
              </Badge>
            </Button>
          )}
        </div>
      </div>

      {isLoadingCanteens ? (
        <div className="space-y-8">
          {[...Array(2)].map((_, idx) => (
             <div key={idx}>
               <Skeleton className="h-8 w-64 mb-4" />
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
               </div>
             </div>
          ))}
        </div>
      ) : canteensWithMenus.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground bg-muted/20 rounded-2xl border border-dashed mt-4">
          <UtensilsCrossed className="h-10 w-10 mb-3 text-muted-foreground/50" />
          <p className="font-medium">Tidak ada makanan yang ditemukan</p>
        </div>
      ) : (
        <div className="space-y-10 border-t pt-8">
          {canteensWithMenus.map((canteen) => (
            <div key={canteen.id} className="space-y-5">
              {/* Canteen Header */}
              <div className="flex items-center justify-between pb-2 border-b border-border/50">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                    <UtensilsCrossed className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold tracking-tight">{canteen.name}</h2>
                      <Badge variant={canteen.is_open ? "default" : "secondary"} className={`text-[10px] uppercase tracking-wider px-2 py-0 h-5 border-0 ${canteen.is_open ? 'bg-green-500/15 text-green-700' : ''}`}>
                        {canteen.is_open ? "Buka" : "Tutup"}
                      </Badge>
                    </div>
                    {canteen.location && (
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1 font-medium">
                        <MapPin className="h-3.5 w-3.5 text-primary/70" /> {canteen.location}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Menu Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {canteen.menu_items?.map((item) => {
                  const qty = getQty(item.id);
                  return (
                    <Card key={item.id} className={`overflow-hidden transition-all hover:shadow-md border-border/60 group ${!canteen.is_open ? "opacity-60 saturate-50 pointer-events-none" : ""}`}>
                      <div className="flex h-full">
                        {/* Image */}
                        <div className="w-28 sm:w-32 bg-muted/50 relative shrink-0 border-r border-border/50 overflow-hidden">
                          {item.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                              <UtensilsCrossed className="h-8 w-8" />
                            </div>
                          )}
                        </div>
                        
                        {/* Details */}
                        <CardContent className="flex flex-1 flex-col justify-between py-3 px-4">
                          <div>
                            <h4 className="font-bold text-sm leading-tight group-hover:text-primary transition-colors">{item.name}</h4>
                            {item.description && (
                              <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1.5 leading-relaxed">
                                {item.description}
                              </p>
                            )}
                          </div>
                          
                          <div className="mt-3 flex items-end justify-between">
                            <p className="font-bold text-primary">Rp {item.price.toLocaleString("id-ID")}</p>
                            
                            <div className="flex items-center gap-2">
                              {qty > 0 ? (
                                <div className="flex items-center gap-1 bg-muted/60 rounded-full p-1 border">
                                  <Button size="icon" variant="ghost" className="h-6 w-6 rounded-full hover:bg-background shadow-sm" onClick={() => updateQty(item.id, qty - 1)}>
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  <span className="w-6 text-center text-xs font-bold">{qty}</span>
                                  <Button size="icon" variant="ghost" className="h-6 w-6 rounded-full hover:bg-background shadow-sm text-primary" onClick={() => handleAdd(item, canteen)}>
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>
                              ) : (
                                <Button size="sm" variant="default" className="h-8 rounded-full px-4 text-xs font-semibold shadow-sm transition-transform active:scale-95" onClick={() => handleAdd(item, canteen)}>
                                  <Plus className="h-3.5 w-3.5 mr-1" /> Tambah
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cart Sheet */}
      <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Keranjang — {canteenName}</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col h-full px-5">
            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              {items.map((item) => (
                <div key={item.menu_item_id} className="flex items-center gap-3 p-3 rounded-lg border">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">Rp {item.price.toLocaleString("id-ID")}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => updateQty(item.menu_item_id, item.quantity - 1)}>
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-4 text-center text-sm">{item.quantity}</span>
                    <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => updateQty(item.menu_item_id, item.quantity + 1)}>
                      <Plus className="h-3 w-3" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => removeItem(item.menu_item_id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <SheetFooter className="flex-col gap-3 border-t pt-4">
              <div className="flex justify-between font-bold text-lg mb-2">
                <span>Total</span>
                <span className="text-primary">Rp {cartTotal.toLocaleString("id-ID")}</span>
              </div>
              <Button size="lg" className="w-full rounded-full font-semibold h-12 text-base" onClick={() => { setIsCartOpen(false); router.push("/customer/checkout"); }}>
                <ShoppingCart className="h-5 w-5 mr-2" /> Checkout Pembayaran
              </Button>
              <Button variant="ghost" className="w-full rounded-full text-destructive hover:bg-destructive/10" onClick={() => { clearCart(); setIsCartOpen(false); }}>
                Kosongkan Keranjang
              </Button>
            </SheetFooter>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default function OrderPage() {
  return (
    <Suspense fallback={
      <div className="space-y-8 animate-pulse">
        <div className="h-8 w-64 bg-muted rounded mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          <div className="h-28 bg-muted rounded-xl" />
          <div className="h-28 bg-muted rounded-xl" />
          <div className="h-28 bg-muted rounded-xl" />
        </div>
      </div>
    }>
      <OrderPageContent />
    </Suspense>
  );
}
