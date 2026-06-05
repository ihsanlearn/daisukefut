import apiClient from "./client";
import { Order } from "@/types/order";

export const orderApi = {
  create: async (payload: {
    canteen_id: number;
    delivery_point_id: number;
    items: { menu_item_id: number; quantity: number; notes?: string }[];
    notes?: string;
  }): Promise<Order> => {
    const { data } = await apiClient.post("/v1/auth/orders", payload);
    return data;
  },

  myOrders: async (): Promise<Order[]> => {
    const { data } = await apiClient.get("/v1/auth/orders");
    return data;
  },

  getById: async (id: number): Promise<Order> => {
    const { data } = await apiClient.get(`/v1/auth/orders/${id}`);
    return data;
  },

  cancel: async (id: number): Promise<Order> => {
    const { data } = await apiClient.patch(`/v1/auth/orders/${id}/cancel`);
    return data;
  },
};
