import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
  notes?: string;
}

interface OrderState {
  cart: CartItem[];
  tableId: string | null;
  restaurantId: string | null;
  currentOrder: any | null;
  
  // Actions
  setTable: (restaurantId: string, tableId: string) => void;
  addItem: (item: CartItem) => void;
  updateQty: (id: string, qty: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  setOrder: (order: any) => void;
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set) => ({
      cart: [],
      tableId: null,
      restaurantId: null,
      currentOrder: null,

      setTable: (restaurantId, tableId) => set({ restaurantId, tableId }),
      
      addItem: (item) => set((state) => {
        const existing = state.cart.find(i => i.menuItemId === item.menuItemId);
        if (existing) {
          return {
            cart: state.cart.map(i => i.menuItemId === item.menuItemId 
              ? { ...i, quantity: i.quantity + item.quantity } 
              : i)
          };
        }
        return { cart: [...state.cart, item] };
      }),

      updateQty: (id, qty) => set((state) => ({
        cart: state.cart.map(i => i.menuItemId === id ? { ...i, quantity: Math.max(0, qty) } : i).filter(i => i.quantity > 0)
      })),

      removeItem: (id) => set((state) => ({
        cart: state.cart.filter(i => i.menuItemId !== id)
      })),

      clearCart: () => set({ cart: [] }),
      setOrder: (order) => set({ currentOrder: order }),
    }),
    {
      name: 'scan4serve-cart',
    }
  )
);
