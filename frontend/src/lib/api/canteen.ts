import apiClient from "./client";
import { Canteen } from "@/types/canteen";

export const canteenApi = {
  // Public routes (no auth prefix)
  list: async (): Promise<Canteen[]> => {
    const { data } = await apiClient.get("/v1/canteens");
    return data;
  },

  getById: async (id: number): Promise<Canteen> => {
    const { data } = await apiClient.get(`/v1/canteens/${id}`);
    return data;
  },

  // Authenticated routes (under /v1/auth/)
  my: async (): Promise<{ canteen: Canteen | null; message?: string }> => {
    const { data } = await apiClient.get("/v1/auth/canteens/my");
    return data;
  },

  create: async (payload: { name: string; description?: string; location?: string }) => {
    const { data } = await apiClient.post("/v1/auth/canteens", payload);
    return data;
  },

  update: async (id: number, payload: { name?: string; description?: string; location?: string; is_open?: boolean; image_url?: string; qris_image_url?: string }) => {
    const { data } = await apiClient.put(`/v1/auth/canteens/${id}`, payload);
    return data;
  },

  toggle: async (id: number) => {
    const { data } = await apiClient.patch(`/v1/auth/canteens/${id}/toggle`);
    return data;
  },

  destroy: async (id: number) => {
    const { data } = await apiClient.delete(`/v1/auth/canteens/${id}`);
    return data;
  },
};
