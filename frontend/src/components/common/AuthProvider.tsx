"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import { authApi } from "@/lib/api/auth";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, setAuth, clearAuth } = useAuthStore();

  useEffect(() => {
    if (user) return;

    // Refresh CSRF cookie first, then check auth status
    authApi.getCsrf()
      .then(() => authApi.me())
      .then((data) => setAuth(data))
      .catch(() => {
        clearAuth();
      });
  }, []);

  return <>{children}</>;
}
