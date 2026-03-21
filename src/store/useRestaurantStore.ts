import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Order {
  _id: string;
  tableId: string;
  status: 'pending' | 'preparing' | 'ready' | 'served' | 'cancelled';
  items: { name: string; quantity: number; price: number; instructions?: string }[];
  specialEvent?: string; // e.g. Birthday, Anniversary
  time: string;
  total: number;
}

export interface MenuItem {
  _id: string;
  restaurantId?: string; // Multi-tenant link
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  category: string;
  isVeg: boolean;
  isAvailable: boolean;
}

export interface Table {
  _id: string;
  tableNumber: number;
  active: boolean;
  ordersCount: number;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  author: string;
  time: string;
  type: 'general' | 'critical' | 'staff';
}

export interface Staff {
  id: string;
  name: string;
  role: 'restaurant_admin' | 'manager' | 'sub_manager' | 'waiter' | 'kitchen';
  email: string;
  profilePhoto?: string;
  status: 'online' | 'offline';
}

export interface ManagedRestaurant {
  id: string;
  name: string;
  managerName: string;
  mobile: string;
  location: string;
  status: 'active' | 'pending';
  createdAt: string;
  valuation?: string;
  staffCount?: number;
}

interface RestaurantState {
  orders: Order[];
  menuItems: MenuItem[];
  tables: Table[];
  announcements: Announcement[];
  staff: Staff[];
  managedRestaurants: ManagedRestaurant[];

  addOrder: (order: Order) => void;
  updateOrderStatus: (id: string, status: Order['status']) => void;
  cancelOrder: (id: string) => void;
  removeItemFromOrder: (orderId: string, itemName: string) => void; 
  addMenuItem: (item: MenuItem) => void;
  deleteMenuItem: (id: string) => void;
  toggleMenuItemAvailability: (id: string) => void;
  addTable: (table: Table) => void;
  updateTableStatus: (id: string, active: boolean) => void;
  deleteTable: (id: string) => void;
  addAnnouncement: (announcement: Announcement) => void;
  addStaff: (member: Staff) => void;
  removeStaff: (id: string) => void;
  updateStaffPhoto: (id: string, photo: string) => void;
  addManagedRestaurant: (restaurant: ManagedRestaurant) => void;
  updateManagedRestaurant: (id: string, updates: Partial<ManagedRestaurant>) => void;
  syncMatrix: () => Promise<void>;
}

// Global Alert Sync
export const playAlertSound = () => {
    try {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.play().catch(e => console.log('Staff Node: Audio sync wait'));
    } catch (e) { console.error('Staff Node: Alert Error', e); }
};

export const useRestaurantStore = create<RestaurantState>()(
  persist(
    (set, get) => ({
      orders: [],
      menuItems: [],
      tables: [],
      announcements: [],
      staff: [],
      managedRestaurants: [],

      addOrder: (order) => { set((state) => ({ orders: [order, ...state.orders] })); playAlertSound(); },
      updateOrderStatus: (id, status) => set((state) => ({ orders: state.orders.map(o => o._id === id ? { ...o, status } : o) })),
      cancelOrder: (id) => set((state) => ({ orders: state.orders.map(o => o._id === id ? { ...o, status: 'cancelled' as const } : o) })),
      removeItemFromOrder: (orderId, itemName) => set((state) => ({ orders: state.orders.map(o => o._id === orderId ? { ...o, items: o.items.filter(i => i.name !== itemName), total: o.total - (o.items.find(i => i.name === itemName)?.price || 0) } : o) })),
      addMenuItem: (item) => set((state) => ({ menuItems: [item, ...state.menuItems] })),
      deleteMenuItem: (id) => set((state) => ({ menuItems: state.menuItems.filter(i => i._id !== id) })),
      toggleMenuItemAvailability: (id) => set((state) => ({ menuItems: state.menuItems.map(i => i._id === id ? { ...i, isAvailable: !i.isAvailable } : i) })),
      addTable: (table) => set((state) => ({ tables: [...state.tables, table] })),
      updateTableStatus: (id, active) => set((state) => ({ tables: state.tables.map(t => t._id === id ? { ...t, active } : t) })),
      deleteTable: (id) => set((state) => ({ tables: state.tables.filter(t => t._id !== id) })),
      addAnnouncement: (announcement) => set((state) => ({ announcements: [announcement, ...state.announcements] })),
      addStaff: (member) => set((state) => ({ staff: [member, ...state.staff] })),
      removeStaff: (id) => set((state) => ({ staff: state.staff.filter(s => s.id !== id) })),
      updateStaffPhoto: (id, profilePhoto) => set((state) => ({ staff: state.staff.map(s => s.id === id ? { ...s, profilePhoto } : s) })),
      addManagedRestaurant: (restaurant) => set((state) => ({ managedRestaurants: [restaurant, ...state.managedRestaurants] })),
      updateManagedRestaurant: (id, updates) => set((state) => ({ managedRestaurants: state.managedRestaurants.map(r => r.id === id ? { ...r, ...updates } : r) })),

      syncMatrix: async () => {
        const apiUrl = 'http://localhost:5000';
        try {
          const resData = await fetch(`${apiUrl}/restaurants`).then(r => r.json());
          if (Array.isArray(resData)) set({ managedRestaurants: resData.map(r => ({ ...r, id: r._id || r.id })) });
          const orderData = await fetch(`${apiUrl}/orders`).then(r => r.json());
          if (Array.isArray(orderData)) set({ orders: orderData });
        } catch (e) { console.error('Matrix Hub: Sync Terminal Failure', e); }
      }
    }),
    {
      name: 'scan4serve-matrix-vault-v11'
    }
  )
);
