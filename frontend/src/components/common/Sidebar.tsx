"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { authApi } from "@/lib/api/auth";
import { toast } from "sonner";
import { useState } from "react";
import {
  LayoutDashboard, UtensilsCrossed, ShoppingCart,
  Truck, Users, LogOut, ChefHat, Loader2, Tag, UserCircle,
} from "lucide-react";

const navByRole = {
  admin: [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Kantin", href: "/admin/canteens", icon: UtensilsCrossed },
    { label: "Pengguna", href: "/admin/users", icon: Users },
    { label: "Kategori", href: "/admin/categories", icon: Tag },
  ],
  canteen: [
    { label: "Dashboard", href: "/canteen", icon: LayoutDashboard },
    { label: "Menu", href: "/canteen/menu", icon: ChefHat },
    { label: "Pesanan", href: "/canteen/orders", icon: ShoppingCart },
  ],
  customer: [
    { label: "Pesan", href: "/order", icon: ShoppingCart },
    { label: "Lacak", href: "/track", icon: Truck },
  ],
};

const roleBadgeLabel: Record<string, string> = {
  admin: "Admin",
  canteen: "Staff Kantin",
  customer: "Customer",
};

export default function Sidebar() {
  const { user, clearAuth } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const navItems = navByRole[user?.role ?? "customer"] ?? [];

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authApi.logout();
    } catch {}
    finally {
      clearAuth();
      toast.success("Berhasil keluar!");
      router.push("/login");
      setIsLoggingOut(false);
    }
  };

  return (
    <aside className="w-64 bg-background border-r flex flex-col min-h-screen">
      <div className="p-6 border-b">
        <h1 className="text-xl font-bold">inCampus Food</h1>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-sm text-muted-foreground truncate">{user?.name}</span>
          <Badge variant="secondary" className="text-xs">
            {roleBadgeLabel[user?.role ?? "customer"]}
          </Badge>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
              )}>
                <Icon className="h-4 w-4" />
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t space-y-1">
        <Link href="/profile">
          <div className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
            pathname === "/profile"
              ? "bg-primary text-primary-foreground"
              : "hover:bg-muted text-muted-foreground hover:text-foreground"
          )}>
            <UserCircle className="h-4 w-4" />
            Profil Saya
          </div>
        </Link>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground"
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
          {isLoggingOut ? "Keluar..." : "Keluar"}
        </Button>
      </div>
    </aside>
  );
}
