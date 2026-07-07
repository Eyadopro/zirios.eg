import { create } from "zustand";
import { persist } from "zustand/middleware";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const res = await fetch(`${API}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
            credentials: "include",
          });
          if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || "Login failed");
          }
          const data = await res.json();
          set({ user: data.user, accessToken: data.accessToken, isLoading: false });
        } catch (e) {
          set({ isLoading: false });
          throw e;
        }
      },

      register: async (name, email, password) => {
        set({ isLoading: true });
        try {
          const res = await fetch(`${API}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password }),
            credentials: "include",
          });
          if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || "Registration failed");
          }
          const data = await res.json();
          set({ user: data.user, accessToken: data.accessToken, isLoading: false });
        } catch (e) {
          set({ isLoading: false });
          throw e;
        }
      },

      logout: async () => {
        try {
          await fetch(`${API}/auth/logout`, {
            method: "POST",
            credentials: "include",
          });
        } catch {
          // ignore network errors on logout
        }
        set({ user: null, accessToken: null });
      },

      refreshToken: async () => {
        try {
          const res = await fetch(`${API}/auth/refresh`, {
            method: "POST",
            credentials: "include",
          });
          if (res.ok) {
            const data = await res.json();
            set({ accessToken: data.accessToken });
          }
        } catch {
          set({ user: null, accessToken: null });
        }
      },

      setUser: (user) => set({ user }),
    }),
    {
      name: "zirios-auth",
      partialize: (state) => ({ user: state.user, accessToken: state.accessToken }),
    }
  )
);
