"use client";

import { create } from "zustand";
import { User } from "@/types/user";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  setAuth: (user: User) => void;
  clearAuth: () => void;
  setAuthLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isAuthenticated: false,
  isAuthLoading: true, // starts true — assume loading until AuthProvider resolves
  setAuth: (user) => {
    set({ user, isAuthenticated: true, isAuthLoading: false });
    console.log(user)
  },
  clearAuth: () => {
    set({ user: null, isAuthenticated: false, isAuthLoading: false });
  },
  setAuthLoading: (loading) => {
    set({ isAuthLoading: loading });
  },
}));
