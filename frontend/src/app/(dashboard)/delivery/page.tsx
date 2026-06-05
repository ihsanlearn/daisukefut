"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Truck, MapPin, CheckCircle, Clock } from "lucide-react";

const stats = [
  { label: "Antrean Pengiriman", value: "5", icon: Truck, color: "text-blue-500" },
  { label: "Sedang Diantar", value: "1", icon: MapPin, color: "text-orange-500" },
  { label: "Selesai Hari Ini", value: "18", icon: CheckCircle, color: "text-green-500" },
  { label: "Rata-rata Waktu", value: "8m", icon: Clock, color: "text-purple-500" },
];

const deliveries = [
  { id: "#ORD-007", customer: "Ihsan R.", point: "Gedung A - Lt. 2", canteen: "Kantin A", status: "ready", items: 2 },
  { id: "#ORD-008", customer: "Budi S.", point: "Perpustakaan", canteen: "Kantin B", status: "delivering", items: 1 },
  { id: "#ORD-009", customer: "Siti A.", point: "Gedung C - Lt. 3", canteen: "Kantin A", status: "ready", items: 3 },
];

export default function DeliveryDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard Pengiriman</h1>
        <p className="text-muted-foreground">Kelola pengiriman pesanan ke titik kampus.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Delivery Queue */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Antrean Pengiriman
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {deliveries.map((delivery) => (
              <div key={delivery.id} className="flex items-center justify-between p-4 rounded-lg border bg-muted/20">
                <div className="flex items-center gap-4">
                  <MapPin className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-medium">{delivery.id}</span>
                      <Badge variant={delivery.status === "ready" ? "default" : "secondary"}>
                        {delivery.status === "ready" ? "Siap Antar" : "Sedang Diantar"}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium mt-1">{delivery.customer}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <MapPin className="h-3 w-3" />
                      {delivery.point} · {delivery.canteen} · {delivery.items} item
                    </div>
                  </div>
                </div>
                <div>
                  {delivery.status === "ready" && (
                    <Button size="sm">Ambil & Antar</Button>
                  )}
                  {delivery.status === "delivering" && (
                    <Button size="sm" variant="outline">Konfirmasi Tiba</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
