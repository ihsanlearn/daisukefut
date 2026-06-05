import apiClient from "./client";
import { DeliveryPoint } from "@/types/order";

export const deliveryPointApi = {
  list: async (): Promise<DeliveryPoint[]> => {
    const { data } = await apiClient.get("/v1/auth/delivery-points");
    return data;
  },

  create: async (payload: {
    name: string;
    address: string;
  }): Promise<DeliveryPoint> => {
    const { data } = await apiClient.post("/v1/auth/delivery-points", payload);
    return data;
  },

  update: async (id: number, payload: {
    name?: string;
    address?: string;
  }): Promise<DeliveryPoint> => {
    const { data } = await apiClient.patch(`/v1/auth/delivery-points/${id}`, payload);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/v1/auth/delivery-points/${id}`);
  },
};