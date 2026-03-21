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
  _id?: string;
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
  managerPhoto?: string;
  _id?: string;
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
  removeManagedRestaurant: (id: string) => void;
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
      
      addMenuItem: async (item) => {
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
          const token = localStorage.getItem('matrix_token');
          const res = await fetch(`${apiUrl}/menu`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }, body: JSON.stringify(item) });
          const data = await res.json();
          if (res.ok) set((state) => ({ menuItems: [data, ...state.menuItems] }));
        } catch (e) {
            console.error(e);
            set((state) => ({ menuItems: [item, ...state.menuItems] })); // fallback
        }
      },
      deleteMenuItem: (id) => set((state) => ({ menuItems: state.menuItems.filter(i => i._id !== id) })),
      toggleMenuItemAvailability: (id) => set((state) => ({ menuItems: state.menuItems.map(i => i._id === id ? { ...i, isAvailable: !i.isAvailable } : i) })),
      
      addTable: (table) => set((state) => ({ tables: [...state.tables, table] })),
      updateTableStatus: (id, active) => set((state) => ({ tables: state.tables.map(t => t._id === id ? { ...t, active } : t) })),
      deleteTable: (id) => set((state) => ({ tables: state.tables.filter(t => t._id !== id) })),
      
      addAnnouncement: async (announcement) => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
            const token = localStorage.getItem('matrix_token');
            const res = await fetch(`${apiUrl}/announcements`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...((token) ? { 'Authorization': `Bearer ${token}` } : {}) }, body: JSON.stringify(announcement) });
            const data = await res.json();
            if (res.ok) set((state) => ({ announcements: [data, ...state.announcements] }));
        } catch (e) {
            set((state) => ({ announcements: [announcement, ...state.announcements] }));
        }
      },
      
      addStaff: async (member) => {
          try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
            const res = await fetch(`${apiUrl}/staff`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(member) });
            const data = await res.json();
            if (res.ok) set((state) => ({ staff: [data, ...state.staff] }));
          } catch(e) {
              set((state) => ({ staff: [member, ...state.staff] }));
          }
      },
      removeStaff: async (id) => {
          try {
              const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
              await fetch(`${apiUrl}/staff/${id}`, { method: 'DELETE' });
              set((state) => ({ staff: state.staff.filter(s => s._id !== id && s.id !== id) }));
          } catch(e) {}
      },
      updateStaffPhoto: async (id, profilePhoto) => {
          try {
              const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
              const res = await fetch(`${apiUrl}/staff/photo/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ profilePhoto }) });
              if (res.ok) set((state) => ({ staff: state.staff.map(s => (s._id === id || s.id === id) ? { ...s, profilePhoto } : s) }));
          } catch(e) {}
      },
      
      addManagedRestaurant: async (restaurant) => {
          try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
            // Strip out frontend mock properties so Mongo can auto-generate them
            const { id, createdAt, ...dbPayload } = restaurant; 
            const res = await fetch(`${apiUrl}/restaurants`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dbPayload) });
            const data = await res.json();
            if (res.ok) set((state) => ({ managedRestaurants: [{...data, id: data._id}, ...state.managedRestaurants] }));
          } catch(e) {}
      },
      updateManagedRestaurant: (id, updates) => set((state) => ({ managedRestaurants: state.managedRestaurants.map(r => r.id === id || r._id === id ? { ...r, ...updates } : r) })),
      removeManagedRestaurant: async (id) => {
          try {
              const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
              const res = await fetch(`${apiUrl}/restaurants/${id}`, { method: 'DELETE' });
              if (res.ok) set((state) => ({ managedRestaurants: state.managedRestaurants.filter(r => r.id !== id && r._id !== id) }));
          } catch(e) {}
      },

      syncMatrix: async () => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        
        try {
          const resData = await fetch(`${apiUrl}/restaurants`).then(r => r.json());
          if (Array.isArray(resData)) set({ managedRestaurants: resData.map(r => ({ ...r, id: r._id || r.id })) });
        } catch(e) { console.error('Matrix Hub: Failed to map Restaurants'); }
        
        try {
          const orderData = await fetch(`${apiUrl}/orders/ALL`).then(r => r.json());
          if (Array.isArray(orderData)) set({ orders: orderData });
        } catch(e) { console.error('Matrix Hub: Failed to map Orders'); }
        
        try {
          const menuData = await fetch(`${apiUrl}/menu/ALL`).then(r => r.json());
          if (Array.isArray(menuData)) set({ menuItems: menuData });
        } catch(e) { console.error('Matrix Hub: Failed to map Menu Items'); }
        
        try {
          const staffData = await fetch(`${apiUrl}/staff`).then(r => r.json());
          if (Array.isArray(staffData)) set({ staff: staffData.map(s => ({...s, id: s._id || s.id})) });
        } catch(e) { console.error('Matrix Hub: Failed to map Staff'); }
        
        try {
          const announcementsData = await fetch(`${apiUrl}/announcements`).then(r => r.json());
          if (Array.isArray(announcementsData)) set({ announcements: announcementsData });
        } catch(e) { console.error('Matrix Hub: Failed to map Announcements'); }
      }
    }),
    {
      name: 'scan4serve-matrix-vault-v12'
    }
  )
);
