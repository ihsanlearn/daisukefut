import apiClient from "./client";
import { MenuItem, MenuItemCreate, MenuItemUpdate } from "@/types/menu";

export const menuApi = {
  // Public: browse menu by canteen
  list: async (canteenId: number, category?: string, include_unavailable?: boolean): Promise<MenuItem[]> => {
    const { data } = await apiClient.get(`/v1/canteens/${canteenId}/menu`, {
      params: category ? { category, include_unavailable } : { include_unavailable },
    });
    return data;
  },

  // Authenticated: CRUD under /v1/auth/
  create: async (canteenId: number, payload: MenuItemCreate): Promise<MenuItem> => {
    const { data } = await apiClient.post(`/v1/auth/canteens/${canteenId}/menu`, payload);
    return data;
  },

  update: async (canteenId: number, itemId: number, payload: MenuItemUpdate): Promise<MenuItem> => {
    const { data } = await apiClient.put(`/v1/auth/canteens/${canteenId}/menu/${itemId}`, payload);
    return data;
  },

  delete: async (canteenId: number, itemId: number): Promise<void> => {
    await apiClient.delete(`/v1/auth/canteens/${canteenId}/menu/${itemId}`);
  },
};
