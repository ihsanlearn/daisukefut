export type PaymentMethod = "qris";
export type PaymentStatus = "pending" | "waiting_verification" | "paid" | "failed" | "expired" | "rejected";

export interface Payment {
  id: number;
  order_id: number;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  proof_image_url?: string;
  paid_at?: string;
  created_at: string;
}
