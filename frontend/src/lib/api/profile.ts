import apiClient from "./client";
import { User } from "@/types/user";

export const profileApi = {
  me: async (): Promise<User> => {
    const { data } = await apiClient.get("/v1/auth/me");
    return data;
  },

  update: async (payload: { name?: string; phone?: string }): Promise<User> => {
    const { data } = await apiClient.patch("/v1/auth/me", payload);
    return data;
  },

  changePassword: async (payload: { current_password: string; new_password: string }): Promise<void> => {
    await apiClient.post("/v1/auth/me/change-password", payload);
  },
};
