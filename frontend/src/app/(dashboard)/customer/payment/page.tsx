"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { paymentApi, PaymentDetails } from "@/lib/api/payment";
import { Payment } from "@/types/payment";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  QrCode, Upload, CheckCircle, Clock, XCircle, Loader2,
  ShoppingBag, AlertCircle, ArrowLeft, ImageIcon, RefreshCw,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: "Menunggu Bukti Pembayaran", color: "bg-amber-500/15 text-amber-700 border-amber-200", icon: <Clock className="h-4 w-4" /> },
  waiting_verification: { label: "Menunggu Verifikasi Kantin", color: "bg-blue-500/15 text-blue-700 border-blue-200", icon: <Clock className="h-4 w-4" /> },
  paid: { label: "Pembayaran Diverifikasi", color: "bg-green-500/15 text-green-700 border-green-200", icon: <CheckCircle className="h-4 w-4" /> },
  rejected: { label: "Bukti Ditolak — Upload Ulang", color: "bg-red-500/15 text-red-700 border-red-200", icon: <XCircle className="h-4 w-4" /> },
  failed: { label: "Pembayaran Gagal", color: "bg-red-500/15 text-red-700 border-red-200", icon: <XCircle className="h-4 w-4" /> },
};

function PaymentPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("order_id");

  const [details, setDetails] = useState<PaymentDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Format file harus JPG, PNG, atau WEBP");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File terlalu besar (maks 5MB)");
      return;
    }

    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  useEffect(() => {
    if (!orderId) {
      router.replace("/customer/orders");
      return;
    }
    loadPayment();
  }, [orderId]);

  const loadPayment = async () => {
    try {
      const data = await paymentApi.getByOrder(Number(orderId));
      setDetails(data);
    } catch {
      toast.error("Gagal memuat data pembayaran");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File terlalu besar (maks 5MB)");
      return;
    }
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleUploadProof = async () => {
    if (!selectedFile || !details?.payment) return;
    setIsUploading(true);
    try {
      const updated = await paymentApi.uploadProof(details.payment.id, selectedFile);
      setDetails((prev) => prev ? { ...prev, payment: updated } : prev);
      setSelectedFile(null);
      setPreview(null);
      toast.success("Bukti pembayaran berhasil dikirim!");
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.response?.data?.error || "Gagal mengupload bukti";
      toast.error(msg);
      console.error(error?.response?.data);
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
        <Skeleton className="h-32" />
      </div>
    );
  }

  if (!details || !details.payment) {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-xl font-bold">Pembayaran tidak ditemukan</h2>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/customer/orders")}>
          Lihat Pesanan
        </Button>
      </div>
    );
  }

  const { payment, order, qris_image_url } = details;
  const status = statusConfig[payment.status] || statusConfig.pending;
  const canUpload = payment.status === "pending" || payment.status === "rejected";

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push("/customer/orders")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Pembayaran QRIS</h1>
          <p className="text-muted-foreground text-sm">Pesanan #{order.id}</p>
        </div>
      </div>

      {/* Status */}
      <div className={`flex items-center gap-3 p-4 rounded-xl border ${status.color}`}>
        {status.icon}
        <span className="text-sm font-semibold">{status.label}</span>
        {payment.status === "waiting_verification" && (
          <Button variant="ghost" size="icon" className="ml-auto h-7 w-7" onClick={loadPayment}>
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShoppingBag className="h-4 w-4" /> Ringkasan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {order.items?.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>{item.menu_item?.name} <span className="text-muted-foreground">x{item.quantity}</span></span>
                <span>{formatPrice(item.subtotal)}</span>
              </div>
            ))}
            <div className="border-t pt-2 flex justify-between font-bold text-lg">
              <span>Total</span>
              <span className="text-primary">{formatPrice(payment.amount)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* QRIS Code */}
      {canUpload && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <QrCode className="h-4 w-4" /> Scan QRIS untuk Bayar
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            {qris_image_url ? (
              <div className="bg-white p-4 rounded-xl border-2 border-dashed border-primary/30">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qris_image_url}
                  alt="QRIS Code"
                  className="w-64 h-64 object-contain"
                />
              </div>
            ) : (
              <div className="w-64 h-64 bg-muted/50 rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-muted-foreground">
                <QrCode className="h-12 w-12 mb-2 opacity-30" />
                <p className="text-sm font-medium">QRIS belum tersedia</p>
                <p className="text-xs">Hubungi kantin</p>
              </div>
            )}
            <p className="text-xs text-muted-foreground text-center max-w-xs">
              Buka aplikasi e-wallet / m-banking, scan kode QRIS di atas, dan bayar sebesar <strong>{formatPrice(payment.amount)}</strong>
            </p>
          </CardContent>
        </Card>
      )}

      {/* Upload Proof */}
      {canUpload && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Upload className="h-4 w-4" /> Upload Bukti Pembayaran
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {payment.status === "rejected" && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                <strong>Bukti ditolak.</strong> Silakan upload ulang bukti pembayaran yang valid.
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileSelect}
              className="hidden"
            />

            {preview ? (
              <div 
                className={`relative border-2 border-dashed rounded-xl p-2 transition-all duration-300 ${
                  isDragging ? "border-primary bg-primary/5 scale-[1.01]" : "border-transparent"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt="Preview" className="w-full max-h-64 object-contain rounded-lg border" />
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-4 right-4 shadow-sm"
                  onClick={() => { setSelectedFile(null); setPreview(null); }}
                >
                  Ganti
                </Button>
                {isDragging && (
                  <div className="absolute inset-0 bg-background/80 backdrop-blur-[1px] rounded-xl flex flex-col items-center justify-center pointer-events-none">
                    <Upload className="h-10 w-10 text-primary animate-bounce mb-2" />
                    <p className="text-sm font-semibold text-primary">Lepaskan untuk mengganti gambar</p>
                  </div>
                )}
              </div>
            ) : (
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
                  isDragging 
                    ? "border-primary bg-primary/10 scale-[1.02] shadow-md shadow-primary/5" 
                    : "border-muted-foreground/25 hover:border-primary/50 hover:bg-primary/5"
                }`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className={`transition-transform duration-300 ${isDragging ? "scale-105" : ""}`}>
                  <Upload className={`h-10 w-10 mx-auto mb-3 transition-colors ${
                    isDragging ? "text-primary animate-pulse" : "text-muted-foreground/50"
                  }`} />
                  <p className={`text-sm font-medium transition-colors ${isDragging ? "text-primary font-semibold" : "text-muted-foreground"}`}>
                    {isDragging ? "Lepaskan file di sini" : "Tarik & Lepaskan atau Klik untuk upload bukti"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WEBP (maks 5MB)</p>
                </div>
              </div>
            )}

            <Button
              className="w-full"
              disabled={!selectedFile || isUploading}
              onClick={handleUploadProof}
            >
              {isUploading
                ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Mengupload...</>
                : <><Upload className="h-4 w-4 mr-2" /> Kirim Bukti Pembayaran</>
              }
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Proof Already Uploaded */}
      {payment.proof_image_url && payment.status !== "pending" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ImageIcon className="h-4 w-4" /> Bukti Pembayaran
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={payment.proof_image_url}
              alt="Bukti Pembayaran"
              className="w-full max-h-64 object-contain rounded-lg border"
            />
          </CardContent>
        </Card>
      )}

      {/* Payment Verified */}
      {payment.status === "paid" && (
        <div className="text-center py-4">
          <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-3" />
          <h3 className="text-lg font-bold">Pembayaran Berhasil!</h3>
          <p className="text-sm text-muted-foreground mt-1">Pesanan kamu sedang diproses oleh kantin.</p>
          <Button className="mt-4" onClick={() => router.push("/customer/orders")}>
            Lihat Pesanan
          </Button>
        </div>
      )}
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="max-w-lg mx-auto space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-muted rounded" />
        <div className="h-64 bg-muted rounded" />
        <div className="h-32 bg-muted rounded" />
      </div>
    }>
      <PaymentPageContent />
    </Suspense>
  );
}
