"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import Link from "next/link";
import { useAuthStore } from "@/stores/authStore";
import { authApi } from "@/lib/api/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

type LoginForm = z.infer<typeof loginSchema>;

const roleRedirect: Record<string, string> = {
  admin: "/admin",
  canteen: "/canteen",
  customer: "/",
};

export default function LoginPage() {
  const router = useRouter();

  const { setAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(data.email, data.password);
      setAuth(response.user);
      toast.success(`Selamat datang, ${response.user.name}!`);
      const redirect = roleRedirect[response.user.role] ?? "/";
      router.push(redirect);
    } catch (error: unknown) {
      const axiosErr = error as any;
      const data = axiosErr?.response?.data;
      const errorMsg = typeof data?.message === "string"
        ? data.message
        : data?.errors
        ? Object.values(data.errors).flat().join(", ")
        : "Login gagal, coba lagi.";
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">inCampus Food</CardTitle>
          <CardDescription>Masuk ke akun kamu</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@campus.ac.id"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Masuk...
                </>
              ) : (
                "Masuk"
              )}
            </Button>
            <div className="flex flex-col gap-2 mt-4 text-center text-sm">
              <p className="text-muted-foreground">
                Belum punya akun?{" "}
                <Link href="/signup" className="text-primary hover:underline font-medium">
                  Daftar sebagai Pelanggan
                </Link>
              </p>
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Atau</span>
                </div>
              </div>
              <p className="text-muted-foreground">
                Ingin membuka kantin?{" "}
                <Link href="/signup/canteen" className="text-primary hover:underline font-medium">
                  Daftar sebagai Kantin
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
