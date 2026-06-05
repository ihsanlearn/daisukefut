"use client";

import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api/admin";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Users, Search, ShieldCheck, UserX, UserCheck } from "lucide-react";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
}

const ROLE_BADGE: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  admin:    { label: "Admin",        variant: "default" },
  canteen:  { label: "Staff Kantin", variant: "secondary" },
  customer: { label: "Customer",     variant: "outline" },
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [newRole, setNewRole] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await adminApi.listUsers(roleFilter === "all" ? undefined : roleFilter);
      setUsers(data);
    } catch {
      toast.error("Gagal memuat pengguna");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = async (user: User) => {
    setIsProcessing(true);
    try {
      const updated = await adminApi.toggleUser(user.id);
      setUsers((prev) => prev.map((u) => u.id === updated.id ? updated : u));
      toast.success(`User ${updated.is_active ? "diaktifkan" : "dinonaktifkan"}`);
    } catch (error: any) {
      toast.error(error?.response?.data?.detail ?? "Gagal mengubah status");
    } finally {
      setIsProcessing(false);
    }
  };

  const openRoleDialog = (user: User) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setIsRoleDialogOpen(true);
  };

  const handleChangeRole = async () => {
    if (!selectedUser || newRole === selectedUser.role) {
      setIsRoleDialogOpen(false);
      return;
    }
    setIsProcessing(true);
    try {
      const updated = await adminApi.changeRole(selectedUser.id, newRole);
      setUsers((prev) => prev.map((u) => u.id === updated.id ? updated : u));
      toast.success(`Role ${updated.name} diubah ke ${updated.role}`);
      setIsRoleDialogOpen(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.detail ?? "Gagal mengubah role");
    } finally {
      setIsProcessing(false);
    }
  };

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Kelola Pengguna</h1>
        <p className="text-muted-foreground">{users.length} pengguna terdaftar</p>
      </div>

      {/* Filter */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Cari nama atau email..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Role</SelectItem>
            <SelectItem value="customer">Customer</SelectItem>
            <SelectItem value="canteen">Staff Kantin</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4" /> Daftar Pengguna
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-10 w-10 mx-auto mb-2" />
              <p>Tidak ada pengguna ditemukan</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((user) => {
                const badge = ROLE_BADGE[user.role];
                return (
                  <div key={user.id} className={`flex items-center justify-between p-3 rounded-lg border gap-4 ${!user.is_active ? "opacity-50 bg-muted/30" : "bg-muted/10"}`}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-sm">{user.name}</p>
                        <Badge variant={badge?.variant ?? "outline"} className="text-xs">
                          {badge?.label ?? user.role}
                        </Badge>
                        {!user.is_active && (
                          <Badge variant="destructive" className="text-xs">Nonaktif</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                      {user.phone && <p className="text-xs text-muted-foreground">{user.phone}</p>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs gap-1"
                        onClick={() => openRoleDialog(user)}
                      >
                        <ShieldCheck className="h-3.5 w-3.5" /> Role
                      </Button>
                      <Button
                        size="sm"
                        variant={user.is_active ? "destructive" : "default"}
                        className="h-8 text-xs gap-1"
                        onClick={() => handleToggle(user)}
                        disabled={isProcessing}
                      >
                        {user.is_active
                          ? <><UserX className="h-3.5 w-3.5" /> Nonaktifkan</>
                          : <><UserCheck className="h-3.5 w-3.5" /> Aktifkan</>
                        }
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Change Role Dialog */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ubah Role — {selectedUser?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">Role saat ini: <span className="font-medium text-foreground">{selectedUser?.role}</span></p>
            <Select value={newRole} onValueChange={setNewRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="customer">Customer</SelectItem>
                <SelectItem value="canteen">Staff Kantin</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRoleDialogOpen(false)}>Batal</Button>
            <Button onClick={handleChangeRole} disabled={isProcessing || newRole === selectedUser?.role}>
              {isProcessing ? "Menyimpan..." : "Ubah Role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
