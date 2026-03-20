import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'restaurant_admin' | 'manager' | 'sub_manager' | 'waiter' | 'kitchen';
  restaurant?: {
    _id: string;
    name: string;
    slug: string;
  };
  token: string;
}

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      logout: () => set({ user: null }),
    }),
    {
      name: 'scan4serve-auth',
    }
  )
);
