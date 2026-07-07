import { create } from "zustand";

export interface CartItem {
  variantId: string;
  productId: string;
  name: string;
  image: string;
  size: string;
  color: string;
  price: number; // cents
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  open: () => void;
  close: () => void;
  add: (item: CartItem) => void;
  remove: (variantId: string) => void;
  clear: () => void;
  setQuantity: (variantId: string, quantity: number) => void;
  subtotal: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),

  add: (item) =>
    set((state) => {
      const existing = state.items.find((i) => i.variantId === item.variantId);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.variantId === item.variantId ? { ...i, quantity: i.quantity + item.quantity } : i
          ),
          isOpen: true,
        };
      }
      return { items: [...state.items, item], isOpen: true };
    }),

  remove: (variantId) =>
    set((state) => ({ items: state.items.filter((i) => i.variantId !== variantId) })),
  clear: () => set({ items: [] }),

  setQuantity: (variantId, quantity) =>
    set((state) => ({
      items: state.items.map((i) => (i.variantId === variantId ? { ...i, quantity } : i)),
    })),

  subtotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
}));
