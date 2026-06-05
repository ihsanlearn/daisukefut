import apiClient from "./client";
import { LoginResponse } from "@/types/user";
import { SignupPayload } from "@/types/auth";

export const authApi = {
  getCsrf: async () => {
    return await apiClient.get('/sanctum/csrf-cookie', {
      baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8001'
    });
  },

  login: async (email: string, password: string): Promise<LoginResponse> => {
    await authApi.getCsrf();
    const { data } = await apiClient.post<LoginResponse>("/v1/auth/login", {
      email,
      password,
    });

    if (typeof window !== "undefined" && data.user?.role) {
      document.cookie = `user_role=${data.user.role}; path=/; max-age=86400; SameSite=Lax`;
    }

    return data;
  },
  
  logout: async () => {
    await apiClient.post("/v1/auth/logout");
    if (typeof window !== "undefined") {
      document.cookie = "user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
  },
  
  register: async (payload: SignupPayload) => {
    await authApi.getCsrf();
    const { data } = await apiClient.post("/v1/auth/register", payload);
    if (typeof window !== "undefined" && data.user?.role) {
      document.cookie = `user_role=${data.user.role}; path=/; max-age=86400; SameSite=Lax`;
    }
    return data;
  },
  
  me: async () => {
    const { data } = await apiClient.get("/v1/auth/me");
    return data;
  },
};
