"use client";

import { useEffect, useState } from "react";
import { adminApi, AdminStats } from "@/lib/api/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, UtensilsCrossed, ShoppingCart, ChefHat, TrendingUp, Activity } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    adminApi.stats()
      .then(setStats)
      .finally(() => setIsLoading(false));
  }, []);

  const statCards = stats ? [
    { label: "Total Pengguna", value: stats.total_users, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Total Kantin", value: stats.total_canteens, icon: UtensilsCrossed, color: "text-orange-500", bg: "bg-orange-500/10" },
    { label: "Total Pesanan", value: stats.total_orders, icon: ShoppingCart, color: "text-green-500", bg: "bg-green-500/10" },
    { label: "Pesanan Aktif", value: stats.active_orders, icon: Activity, color: "text-purple-500", bg: "bg-purple-500/10" },
    { label: "Total Menu", value: stats.total_menu_items, icon: ChefHat, color: "text-pink-500", bg: "bg-pink-500/10" },
  ] : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard Admin</h1>
        <p className="text-muted-foreground">Overview sistem inCampus Food Delivery.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {isLoading ? (
          [...Array(5)].map((_, i) => <Skeleton key={i} className="h-28" />)
        ) : (
          statCards.map((stat) => {
            const Icon = stat.icon;
            const card = (
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
            return card;
          })
        )}
      </div>

      {/* Role Distribution */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-4 w-4" /> Distribusi Pengguna
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Customer", value: stats.users_by_role.customer, color: "bg-blue-500", total: stats.total_users },
                { label: "Staff Kantin", value: stats.users_by_role.canteen, color: "bg-orange-500", total: stats.total_users },
                { label: "Admin", value: stats.users_by_role.admin, color: "bg-purple-500", total: stats.total_users },
              ].map((item) => (
                <div key={item.label} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-medium">{item.value}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all`}
                      style={{ width: item.total > 0 ? `${(item.value / item.total) * 100}%` : "0%" }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/admin/users">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Users className="h-4 w-4" /> Kelola Pengguna
                </Button>
              </Link>
              <Link href="/admin/canteens">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <UtensilsCrossed className="h-4 w-4" /> Kelola Kantin
                </Button>
              </Link>
              <Link href="/admin/categories">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <ChefHat className="h-4 w-4" /> Kelola Kategori
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
