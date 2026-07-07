import { create } from "zustand";
import { persist } from "zustand/middleware";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

interface WishlistProduct {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  media: { url: string }[];
}

export interface WishlistItem {
  id: string;
  productId: string;
  product: WishlistProduct;
  createdAt: string;
}

interface WishlistState {
  items: WishlistItem[];
  isLoading: boolean;
  fetch: (token: string) => Promise<void>;
  add: (token: string, productId: string) => Promise<void>;
  remove: (token: string, id: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,

      fetch: async (token) => {
        set({ isLoading: true });
        try {
          const res = await fetch(`${API}/wishlist`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const items = await res.json();
            set({ items, isLoading: false });
          }
        } catch {
          // ignore
        } finally {
          set({ isLoading: false });
        }
      },

      add: async (token, productId) => {
        const res = await fetch(`${API}/wishlist`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ productId }),
        });
        if (res.ok) {
          const item = await res.json();
          set((state) => ({ items: [item, ...state.items] }));
        }
      },

      remove: async (token, id) => {
        const res = await fetch(`${API}/wishlist/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          set((state) => ({ items: state.items.filter((i) => i.id !== id) }));
        }
      },

      isInWishlist: (productId) => get().items.some((i) => i.productId === productId),
    }),
    {
      name: "zirios-wishlist",
      partialize: (state) => ({ items: state.items }),
    }
  )
);
