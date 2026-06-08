export type PaymentMethod = "qris" | "cod" | "midtrans";
export type PaymentStatus = "pending" | "waiting_verification" | "paid" | "failed" | "expired" | "rejected";

export interface Payment {
  id: number;
  order_id: number;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  proof_image_url?: string;
  paid_at?: string;
  expired_at?: string;
  snap_token?: string;
  payment_url?: string;
  midtrans_order_id?: string;
  created_at: string;
}
