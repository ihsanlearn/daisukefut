"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import Link from "next/link";
import { authApi } from "@/lib/api/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

const signupSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  phone: z.string().optional(),
  password: z.string().min(6, "Password minimal 6 karakter"),
  password_confirmation: z.string(),
}).refine((data) => data.password === data.password_confirmation, {
  message: "Password tidak cocok",
  path: ["password_confirmation"],
});

type SignupForm = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { setAuth } = useAuthStore();

  const { register, handleSubmit, formState: { errors } } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
  });
  
  const onSubmit = async (data: SignupForm) => {
    setIsLoading(true);
    try {
      // Hardcode role to customer
      const payload = { ...data, role: "customer" as const };
      const { message, user } = await authApi.register(payload);
      setAuth(user);
      toast.success("Akun pelanggan berhasil dibuat!");
      router.push("/");
    } catch (error: unknown) {
      const axiosErr = error as any;
      const resData = axiosErr?.response?.data;
      const message = typeof resData?.message === "string"
        ? resData.message
        : resData?.errors
        ? Object.values(resData.errors).flat().join(", ")
        : "Registrasi gagal, coba lagi.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">daisukefut</CardTitle>
          <CardDescription>Mendaftar sebagai Pelanggan</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input id="name" placeholder="John Doe" {...register("name")} />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="email@campus.ac.id" {...register("email")} />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">No. HP (opsional)</Label>
              <Input id="phone" type="tel" placeholder="08xxxxxxxxxx" {...register("phone")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" {...register("password")} />
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password_confirmation">Konfirmasi Password</Label>
              <Input id="password_confirmation" type="password" placeholder="••••••••" {...register("password_confirmation")} />
              {errors.password_confirmation && <p className="text-sm text-destructive">{errors.password_confirmation.message}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Mendaftar...</>
              ) : "Daftar"}
            </Button>

            <div className="flex flex-col gap-2 mt-4 text-center text-sm">
              <p className="text-muted-foreground">
                Sudah punya akun?{" "}
                <Link href="/login" className="text-primary hover:underline font-medium">Masuk</Link>
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
                Ingin mendaftarkan kantinmu?{" "}
                <Link href="/signup/canteen" className="text-primary hover:underline font-medium">Daftar sebagai Kantin</Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
