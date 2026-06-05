"use client";

import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api/admin";
import { canteenApi } from "@/lib/api/canteen";
import { Canteen } from "@/types/canteen";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { UtensilsCrossed, Search, MapPin, ToggleLeft, ToggleRight } from "lucide-react";

export default function AdminCanteensPage() {
  const [canteens, setCanteens] = useState<Canteen[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [togglingId, setTogglingId] = useState<number | null>(null);

  useEffect(() => {
    adminApi.listCanteens()
      .then(setCanteens)
      .catch(() => toast.error("Gagal memuat kantin"))
      .finally(() => setIsLoading(false));
  }, []);

  const handleToggle = async (canteen: Canteen) => {
    setTogglingId(canteen.id);
    try {
      const updated = await canteenApi.toggle(canteen.id);
      setCanteens((prev) => prev.map((c) => c.id === updated.id ? updated : c));
      toast.success(`${updated.name} ${updated.is_open ? "dibuka" : "ditutup"}`);
    } catch {
      toast.error("Gagal mengubah status kantin");
    } finally {
      setTogglingId(null);
    }
  };

  const filtered = canteens.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.location?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Kelola Kantin</h1>
        <p className="text-muted-foreground">{canteens.length} kantin terdaftar</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Cari kantin..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <UtensilsCrossed className="h-4 w-4" /> Daftar Kantin
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <UtensilsCrossed className="h-10 w-10 mx-auto mb-2" />
              <p>Tidak ada kantin ditemukan</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((canteen) => (
                <div key={canteen.id} className="flex items-center justify-between p-4 rounded-lg border bg-muted/10 gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium">{canteen.name}</p>
                      <Badge variant={canteen.is_open ? "default" : "secondary"} className="text-xs">
                        {canteen.is_open ? "Buka" : "Tutup"}
                      </Badge>
                    </div>
                    {canteen.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{canteen.description}</p>
                    )}
                    {canteen.location && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" /> {canteen.location}
                      </div>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant={canteen.is_open ? "outline" : "default"}
                    className="gap-1.5 shrink-0"
                    onClick={() => handleToggle(canteen)}
                    disabled={togglingId === canteen.id}
                  >
                    {togglingId === canteen.id ? (
                      "..."
                    ) : canteen.is_open ? (
                      <><ToggleRight className="h-4 w-4" /> Tutup</>
                    ) : (
                      <><ToggleLeft className="h-4 w-4" /> Buka</>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
