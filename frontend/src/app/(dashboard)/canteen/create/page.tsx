"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { canteenApi } from "@/lib/api/canteen";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UtensilsCrossed, MapPin, FileText, Loader2, Store } from "lucide-react";

const createCanteenSchema = z.object({
  name: z.string().min(2, "Nama kantin minimal 2 karakter").max(100, "Nama terlalu panjang"),
  description: z.string().max(500, "Deskripsi terlalu panjang").optional(),
  location: z.string().max(200, "Lokasi terlalu panjang").optional(),
});

type CreateCanteenForm = z.infer<typeof createCanteenSchema>;

export default function CreateCanteenPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateCanteenForm>({
    resolver: zodResolver(createCanteenSchema),
  });

  const onSubmit = async (data: CreateCanteenForm) => {
    setIsLoading(true);
    try {
      await canteenApi.create({
        name: data.name,
        description: data.description || undefined,
        location: data.location || undefined,
      });
      toast.success("Kantin berhasil dibuat! Selamat datang.");
      router.push("/canteen");
    } catch (error: any) {
      const resData = error?.response?.data;
      const msg =
        typeof resData?.message === "string"
          ? resData.message
          : resData?.errors
          ? Object.values(resData.errors).flat().join(", ")
          : "Gagal membuat kantin, coba lagi.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-lg space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20">
              <Store className="h-10 w-10 text-primary" />
            </div>
          </div>
          <h1 className="text-2xl font-bold">Daftarkan Kantinmu</h1>
          <p className="text-muted-foreground text-sm">
            Isi informasi dasar kantinmu. Kamu bisa mengubahnya kapan saja.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <UtensilsCrossed className="h-4 w-4" />
              Informasi Kantin
            </CardTitle>
            <CardDescription>
              Informasi ini akan ditampilkan kepada pelanggan saat memilih kantin.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">
                  Nama Kantin <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Contoh: Kantin Bu Sari"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-xs text-destructive">{errors.name.message}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                  Deskripsi
                  <span className="text-xs text-muted-foreground font-normal">(opsional)</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="Contoh: Menyediakan makanan berat dan minuman segar dengan harga terjangkau."
                  rows={3}
                  {...register("description")}
                />
                {errors.description && (
                  <p className="text-xs text-destructive">{errors.description.message}</p>
                )}
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location" className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                  Lokasi
                  <span className="text-xs text-muted-foreground font-normal">(opsional)</span>
                </Label>
                <Input
                  id="location"
                  placeholder="Contoh: Gedung A, Lantai 1"
                  {...register("location")}
                />
                {errors.location && (
                  <p className="text-xs text-destructive">{errors.location.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading} size="lg">
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Membuat kantin...
                  </>
                ) : (
                  <>
                    <Store className="h-4 w-4 mr-2" />
                    Buat Kantin
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Setelah kantin dibuat, kamu akan diarahkan ke dashboard untuk mulai mengelola menu dan pesanan.
        </p>
      </div>
    </div>
  );
}
