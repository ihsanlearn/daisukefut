"use client";

import { useEffect, useState } from "react";
import { categoryApi, Category } from "@/lib/api/category";

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    categoryApi.list()
      .then(setCategories)
      .finally(() => setIsLoading(false));
  }, []);

  return { categories, isLoading };
}
