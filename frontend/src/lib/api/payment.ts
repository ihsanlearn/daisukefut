import apiClient from "./client";
import { Payment } from "@/types/payment";
import { Order } from "@/types/order";
import { Canteen } from "@/types/canteen";

export interface PaymentDetails {
  payment: Payment;
  order: Order & { canteen?: Canteen };
  qris_image_url: string | null;
}

export const paymentApi = {
  create: async (order_id: number): Promise<Payment> => {
    const { data } = await apiClient.post("/v1/auth/payments", { order_id });
    return data;
  },

  getByOrder: async (orderId: number): Promise<PaymentDetails> => {
    const { data } = await apiClient.get(`/v1/auth/payments/${orderId}`);
    return data;
  },

  uploadProof: async (paymentId: number, file: File): Promise<Payment> => {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await apiClient.post(`/v1/auth/payments/${paymentId}/proof`, formData);
    return data;
  },

  verify: async (paymentId: number, action: "approve" | "reject", reason?: string): Promise<{ message: string; payment: Payment; order?: Order }> => {
    const { data } = await apiClient.patch(`/v1/auth/payments/${paymentId}/verify`, { action, reason });
    return data;
  },
};
