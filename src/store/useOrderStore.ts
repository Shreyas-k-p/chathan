import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
  instructions?: string; // e.g. Less spicy, Extra cheese
}

interface OrderState {
  cart: CartItem[];
  tableId: string | null;
  restaurantId: string | null;
  currentOrder: any | null;
  specialEvent: string; // e.g. Birthday, Anniversary, None
  
  // Actions
  setTable: (restaurantId: string, tableId: string) => void;
  addItem: (item: CartItem) => void;
  updateQty: (id: string, qty: number) => void;
  updateInstructions: (id: string, instructions: string) => void; // New
  setSpecialEvent: (event: string) => void; // New
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
      specialEvent: 'None',

      setTable: (restaurantId, tableId) => set({ restaurantId, tableId }),
      setSpecialEvent: (specialEvent) => set({ specialEvent }),
      
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

      updateInstructions: (id, instructions) => set((state) => ({
        cart: state.cart.map(i => i.menuItemId === id ? { ...i, instructions } : i)
      })),

      removeItem: (id) => set((state) => ({
        cart: state.cart.filter(i => i.menuItemId !== id)
      })),

      clearCart: () => set({ cart: [], specialEvent: 'None' }),
      setOrder: (order) => set({ currentOrder: order }),
    }),
    {
      name: 'scan4serve-cart-v2',
    }
  )
);
