"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { authApi } from "@/lib/api/auth";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, setAuth, clearAuth } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (user) return;

    // Refresh CSRF cookie first, then check auth status
    authApi.getCsrf()
      .then(() => authApi.me())
      .then((data) => {
        setAuth(data);
        if (typeof window !== "undefined" && data.role) {
          document.cookie = `user_role=${data.role}; path=/; max-age=86400; SameSite=Lax`;
        }
      })
      .catch(() => {
        clearAuth();
        if (typeof window !== "undefined") {
          // Clear cookie since session is invalid
          document.cookie = "user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
          
          // If on a protected route, redirect to login page
          const isPublic = pathname === "/";
          const isAuthRoute = ["/login", "/signup", "/signup/canteen"].includes(pathname);
          if (!isPublic && !isAuthRoute) {
            router.push("/login");
          }
        }
      });
  }, [pathname, router, user, setAuth, clearAuth]);

  return <>{children}</>;
}
