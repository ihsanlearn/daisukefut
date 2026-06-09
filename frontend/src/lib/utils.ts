import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number | string | any): string {
  const num = typeof price === "number" ? price : parseFloat(price || "0");
  if (isNaN(num)) return "Rp0,00";
  return "Rp" + num.toLocaleString("id-ID", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
