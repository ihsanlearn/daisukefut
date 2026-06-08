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
  Utensils,
  Menu
} from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "../ui/input";

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
  const path = usePathname();

  const navItems = navByRole[user?.role ?? "notLoggedIn"] ?? [];

  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/customer/order?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

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
        <Link href="/" className="flex items-center gap-1.5">
          <div className="bg-primary p-1 rounded-full">
            <Utensils className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold text-primary tracking-tight">inCampus</span>
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
          {path === "/" && user?.role === "customer" && (
            <div className="hidden md:flex items-center ml-8">
              <form onSubmit={handleSearchSubmit} className="relative group">
                <div className="relative flex items-center">
                  <Search className="absolute left-3 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    type="text"
                    placeholder="Cari makanan..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 h-10 rounded-full bg-muted/50 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary transition-all border-transparent"
                  />
                </div>
              </form>
            </div>
          )}
          
          <div className="h-8 w-px bg-border mx-2 hidden md:block"></div>

          {isAuthLoading ? (
            <div className="flex items-center gap-3">
              <div className="hidden md:flex flex-col items-end gap-1">
                <div className="h-3 w-20 bg-muted rounded animate-pulse"></div>
                <div className="h-3 w-12 bg-muted rounded animate-pulse"></div>
              </div>
              <div className="h-10 w-10 rounded-full bg-muted animate-pulse"></div>
            </div>
          ) : (
            <>
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

          {navItems.length > 0 && (
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-muted">
                    <Menu className="h-5 w-5 text-foreground" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[280px] p-6 rounded-l-[2rem] border-l border-border/50 flex flex-col justify-between">
                  <div className="space-y-6">
                    <SheetHeader className="text-left">
                      <SheetTitle className="flex items-center gap-2">
                        <div className="bg-primary p-1.5 rounded-full">
                          <Utensils className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-xl font-black text-primary tracking-tight">inCampus</span>
                      </SheetTitle>
                    </SheetHeader>

                    {/* Nav Links */}
                    <div className="flex flex-col gap-2 mt-4">
                      {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                              "px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-300 flex items-center gap-2",
                              isActive
                                ? "bg-primary text-white shadow-md shadow-primary/20 scale-[1.02]"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                          >
                            {item.label}
                          </Link>
                        );
                      })}
                    </div>
                  </div>

                  {/* Footer with Logout */}
                  {user && (
                    <div className="pt-6 border-t border-border/50">
                      <Button
                        variant="destructive"
                        className="w-full rounded-2xl font-bold py-5 flex items-center justify-center gap-2"
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                      >
                        <LogOut className="h-4 w-4" />
                        {isLoggingOut ? "Keluar..." : "Keluar Akun"}
                      </Button>
                    </div>
                  )}
                </SheetContent>
              </Sheet>
            </div>
          )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
