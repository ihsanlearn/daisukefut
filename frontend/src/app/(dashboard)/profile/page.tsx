"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { profileApi } from "@/lib/api/profile";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Phone, Mail, Shield, KeyRound, Loader2, Save } from "lucide-react";

const ROLE_LABEL: Record<string, string> = {
  admin: "Administrator",
  canteen: "Staff Kantin",
  customer: "Customer",
};

export default function ProfilePage() {
  const { user, setAuth } = useAuthStore();

  const [profileForm, setProfileForm] = useState({ name: "", phone: "" });
  const [passwordForm, setPasswordForm] = useState({ current_password: "", new_password: "", confirm_password: "" });
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  useEffect(() => {
    profileApi.me()
      .then((data) => {
        setProfileForm({ name: data.name, phone: data.phone ?? "" });
      })
      .finally(() => setIsLoadingProfile(false));
  }, []);

  const handleUpdateProfile = async () => {
    if (!profileForm.name) {
      toast.error("Nama tidak boleh kosong");
      return;
    }
    setIsSavingProfile(true);
    try {
      const updated = await profileApi.update({
        name: profileForm.name,
        phone: profileForm.phone || undefined,
      });
      // Update auth store juga
      if (user) {
        setAuth({ ...user, name: updated.name });
      }
      toast.success("Profil berhasil diupdate!");
    } catch {
      toast.error("Gagal mengupdate profil");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.current_password || !passwordForm.new_password) {
      toast.error("Semua field password wajib diisi");
      return;
    }
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast.error("Konfirmasi password tidak cocok");
      return;
    }
    if (passwordForm.new_password.length < 6) {
      toast.error("Password baru minimal 6 karakter");
      return;
    }
    setIsSavingPassword(true);
    try {
      await profileApi.changePassword({
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      });
      setPasswordForm({ current_password: "", new_password: "", confirm_password: "" });
      toast.success("Password berhasil diubah!");
    } catch (error: any) {
      const msg = typeof error?.response?.data?.detail === "string"
        ? error.response.data.detail
        : "Gagal mengubah password";
      toast.error(msg);
    } finally {
      setIsSavingPassword(false);
    }
  };

  if (isLoadingProfile) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Profil Saya</h1>
        <p className="text-muted-foreground">Kelola informasi akun kamu.</p>
      </div>

      {/* Account Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="h-4 w-4" /> Informasi Akun
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Read-only info */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
            <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-sm font-medium">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
            <Shield className="h-4 w-4 text-muted-foreground shrink-0" />
            <div className="flex items-center gap-2">
              <div>
                <p className="text-xs text-muted-foreground">Role</p>
                <p className="text-sm font-medium">{ROLE_LABEL[user?.role ?? "customer"]}</p>
              </div>
              <Badge variant="secondary" className="text-xs">
                {user?.role}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Editable fields */}
          <div className="space-y-2">
            <Label>Nama Lengkap</Label>
            <Input
              placeholder="Nama lengkap"
              value={profileForm.name}
              onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-1">
              <Phone className="h-3.5 w-3.5" /> No. HP
            </Label>
            <Input
              placeholder="08xxxxxxxxxx"
              value={profileForm.phone}
              onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
            />
          </div>
          <Button onClick={handleUpdateProfile} disabled={isSavingProfile} className="w-full">
            {isSavingProfile
              ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Menyimpan...</>
              : <><Save className="h-4 w-4 mr-2" /> Simpan Perubahan</>
            }
          </Button>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <KeyRound className="h-4 w-4" /> Ubah Password
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Password Saat Ini</Label>
            <Input
              type="password"
              placeholder="••••••••"
              value={passwordForm.current_password}
              onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Password Baru</Label>
            <Input
              type="password"
              placeholder="••••••••"
              value={passwordForm.new_password}
              onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Konfirmasi Password Baru</Label>
            <Input
              type="password"
              placeholder="••••••••"
              value={passwordForm.confirm_password}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
            />
            {passwordForm.confirm_password && passwordForm.new_password !== passwordForm.confirm_password && (
              <p className="text-xs text-destructive">Password tidak cocok</p>
            )}
          </div>
          <Button
            onClick={handleChangePassword}
            disabled={isSavingPassword}
            variant="outline"
            className="w-full"
          >
            {isSavingPassword
              ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Mengubah...</>
              : <><KeyRound className="h-4 w-4 mr-2" /> Ubah Password</>
            }
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
