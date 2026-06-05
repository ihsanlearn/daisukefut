"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { cn } from "@/lib/utils";
import { authApi } from "@/lib/api/auth";
import { toast } from "sonner";
import {
  Search,
  ShoppingCart,
  User,
  LogOut,
  Utensils
} from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navByRole = {
  admin: [
    { label: "Dashboard", href: "/admin" },
    { label: "Kategori", href: "/admin/categories" },
    { label: "Users", href: "/admin/users" },
    { label: "Canteens", href: "/admin/canteens" },
  ],
  canteen: [
    { label: "Dashboard", href: "/canteen" },
    { label: "Menu", href: "/canteen/menu" },
    { label: "Pesanan", href: "/canteen/orders" },
  ],
  customer: [
    { label: "Pesan Makanan", href: "/customer/order" },
    { label: "Pesanan Saya", href: "/customer/orders" },
  ],
  notLoggedIn: []
};

export default function TopNavbar() {
  const { user, clearAuth, isAuthLoading } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const navItems = navByRole[user?.role ?? "notLoggedIn"] ?? [];

  console.log(user)

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authApi.logout();
    } catch {
      // Ignore API err
    } finally {
      clearAuth();
      toast.success("Berhasil keluar!");
      router.push("/login");
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/10 bg-background/70 backdrop-blur-xl">
      <div className="container mx-auto max-w-7xl px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-primary p-1.5 rounded-full">
            <Utensils className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-extrabold text-primary tracking-tight">inCampus</span>
        </Link>

        {/* Center Nav */}
        {!isAuthLoading && (
          <nav className="hidden md:flex items-center gap-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link 
                  key={item.href} 
                  href={item.href}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                    isActive 
                      ? "bg-primary/10 text-primary font-bold" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        )}

        <div className="flex items-center gap-4">
          <button className="text-muted-foreground hover:text-primary transition-colors">
            <Search className="h-5 w-5" />
          </button>
          <button className="text-muted-foreground hover:text-primary transition-colors relative">
            <ShoppingCart className="h-5 w-5" />
            <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-white ring-2 ring-white">
              2
            </span>
          </button>
          
          <div className="h-8 w-px bg-border mx-2 hidden md:block"></div>

          {isAuthLoading ? (
            /* Loading skeleton — prevents flash of "not logged in" */
            <div className="flex items-center gap-3">
              <div className="hidden md:flex flex-col items-end gap-1">
                <div className="h-3 w-20 bg-muted rounded animate-pulse"></div>
                <div className="h-3 w-12 bg-muted rounded animate-pulse"></div>
              </div>
              <div className="h-10 w-10 rounded-full bg-muted animate-pulse"></div>
            </div>
          ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-3 cursor-pointer group">
                {user && (
                  <div className="hidden md:flex flex-col items-end">
                    <span className="text-xs font-bold leading-none group-hover:text-primary transition-colors">{user.name}</span>
                    <span className="text-[10px] text-muted-foreground font-medium capitalize mt-1 border border-border px-1.5 py-0.5 rounded-sm">{user.role}</span>
                  </div>
                )}
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border border-primary/20 group-hover:border-primary/50 transition-colors">
                  <User className="h-5 w-5 text-primary" />
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 mt-2 p-4 rounded-xl border-border/50 shadow-xl">
              {user ? (
                <>
                  <div className="flex flex-col space-y-1 p-3 md:hidden">
                    <p className="text-sm font-bold leading-none">{user.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                  </div>
                  <DropdownMenuSeparator className="md:hidden" />
                  <DropdownMenuItem asChild className="cursor-pointer rounded-lg">
                    <Link href="/profile">Profil Pengguna</Link>
                  </DropdownMenuItem>
                  {user.role === 'admin' && (
                    <DropdownMenuItem asChild className="cursor-pointer rounded-lg">
                      <Link href="/admin">Dashboard Admin</Link>
                    </DropdownMenuItem>
                  )}
                  {user.role === 'canteen' && (
                    <DropdownMenuItem asChild className="cursor-pointer rounded-lg">
                      <Link href="/canteen">Dashboard Kantin</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} disabled={isLoggingOut} className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer rounded-lg font-medium">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Keluar</span>
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <div className="p-3">
                    <p className="text-sm font-semibold">Selamat Datang!</p>
                    <p className="text-xs text-muted-foreground mt-1">Masuk untuk memesan makanan.</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="cursor-pointer rounded-lg">
                    <Link href="/login">Masuk</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer rounded-lg">
                    <Link href="/signup">Daftar</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer rounded-lg bg-secondary">
                    <Link href="/signup/canteen">Daftar Mitra Kantin</Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
