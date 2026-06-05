import apiClient from "./client";

export interface Category {
  id: number;
  name: string;
  icon?: string;
}

export const categoryApi = {
  list: async (): Promise<Category[]> => {
    const { data } = await apiClient.get("/v1/categories");
    return data;
  },

  create: async (payload: { name: string; icon?: string }): Promise<Category> => {
    const { data } = await apiClient.post("/v1/categories", payload);
    return data;
  },

  update: async (id: number, payload: { name?: string; icon?: string }): Promise<Category> => {
    const { data } = await apiClient.patch(`/v1/categories/${id}`, payload);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/v1/categories/${id}`);
  },
};
