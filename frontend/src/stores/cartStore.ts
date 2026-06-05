import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem } from "@/types/order";

interface CartState {
  canteenId: number | null;
  canteenName: string;
  items: CartItem[];
  addItem: (canteenId: number, canteenName: string, item: CartItem) => void;
  removeItem: (menuItemId: number) => void;
  updateQty: (menuItemId: number, qty: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      canteenId: null,
      canteenName: "",
      items: [],

      addItem: (canteenId, canteenName, item) => {
        const { items, canteenId: currentCanteenId } = get();
        // Reset cart kalau ganti kantin
        if (currentCanteenId && currentCanteenId !== canteenId) {
          set({ canteenId, canteenName, items: [item] });
          return;
        }
        const existing = items.find((i) => i.menu_item_id === item.menu_item_id);
        if (existing) {
          set({
            canteenId,
            canteenName,
            items: items.map((i) =>
              i.menu_item_id === item.menu_item_id
                ? { ...i, quantity: i.quantity + 1 }
                : i
            ),
          });
        } else {
          set({ canteenId, canteenName, items: [...items, item] });
        }
      },

      removeItem: (menuItemId) =>
        set((state) => ({
          items: state.items.filter((i) => i.menu_item_id !== menuItemId),
          canteenId: state.items.length === 1 ? null : state.canteenId,
        })),

      updateQty: (menuItemId, qty) =>
        set((state) => ({
          items:
            qty <= 0
              ? state.items.filter((i) => i.menu_item_id !== menuItemId)
              : state.items.map((i) =>
                  i.menu_item_id === menuItemId ? { ...i, quantity: qty } : i
                ),
        })),

      clearCart: () => set({ canteenId: null, canteenName: "", items: [] }),

      totalItems: () => get().items.reduce((a, b) => a + b.quantity, 0),
      totalPrice: () =>
        get().items.reduce((a, b) => a + b.price * b.quantity, 0),
    }),
    { name: "cart-storage" }
  )
);
