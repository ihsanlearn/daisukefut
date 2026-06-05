"use client";

import { useEffect, useState } from "react";
import { canteenApi } from "@/lib/api/canteen";
import { authApi } from "@/lib/api/auth";
import { Canteen } from "@/types/canteen";

export function useMyCanteen() {
  const [canteen, setCanteen] = useState<Canteen | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCanteen = async () => {
    try {
      // Ensure CSRF cookie is fresh before making the authenticated request
      await authApi.getCsrf();
      const res = await canteenApi.my();

      // Backend returns two possible shapes:
      // 1. No canteen: { message: '...', canteen: null }
      // 2. Has canteen: CanteenResource { id, name, is_open, ... }
      if (res.canteen === null && res.message) {
        setCanteen(null);
      } else if (res.canteen) {
        setCanteen(res.canteen);
      } else {
        // CanteenResource — the response itself IS the canteen object
        setCanteen(res as unknown as Canteen);
      }
    } catch {
      setCanteen(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCanteen();
  }, []);

  return { canteen, isLoading, error, setCanteen, refetch: fetchCanteen };
}
