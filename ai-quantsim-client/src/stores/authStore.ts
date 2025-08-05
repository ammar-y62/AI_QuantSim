// src/stores/authStore.ts
import { create } from "zustand";
import type { User } from "firebase/auth";

type AuthState = {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  isGuest: boolean;
  setIsAuthenticated: (val: boolean) => void;
  setIsLoading: (val: boolean) => void;
  setUser: (user: User | null) => void;
  setIsGuest: (val: boolean) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  isGuest: false,
  setIsAuthenticated: (val) => set({ isAuthenticated: val }),
  setIsLoading: (val) => set({ isLoading: val }),
  setUser: (user) => set({ user }),
  setIsGuest: (val) => set({ isGuest: val }),
}));
