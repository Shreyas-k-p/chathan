import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'MANAGER' | 'WAITER' | 'KITCHEN';
  restaurantId?: string; // Link to the restaurant node
  token: string;
  profilePhoto?: string; 
}

interface AuthState {
  user: User | null;
  token: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      logout: () => {
          set({ user: null, token: null });
          localStorage.removeItem('scan4serve-auth-token');
      },
    }),
    {
      name: 'scan4serve-auth-hub',
    }
  )
);
