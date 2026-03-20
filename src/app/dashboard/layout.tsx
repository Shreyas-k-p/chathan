'use client';

import React from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LayoutDashboard, UtensilsCrossed, ClipboardList, Tablet, ShieldAlert, LogOut } from 'lucide-react';
import Link from 'next/link';

const SidebarItem = ({ href, icon: Icon, label, roles }: any) => {
  const { user } = useAuthStore();
  if (roles && !roles.includes(user?.role)) return null;

  return (
    <Link 
      href={href} 
      className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all font-medium"
    >
      <Icon size={20} />
      <span>{label}</span>
    </Link>
  );
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!user) router.push('/login');
  }, [user, router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-[280px] bg-slate-950 text-white p-6 flex-shrink-0 sticky top-0 h-screen flex flex-col border-r border-slate-800 shadow-xl">
        <div className="mb-10 px-2 group">
          <h2 className="text-2xl font-black text-indigo-500 tracking-tighter group-hover:text-indigo-400 transition-colors">Scan4Serve</h2>
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-1">SaaS Management Suite</p>
        </div>

        <nav className="flex-1">
          <ul className="flex flex-col gap-2 list-none m-0 p-0">
            <SidebarItem href="/dashboard" icon={LayoutDashboard} label="Live Overview" />
            <SidebarItem href="/kitchen" icon={ClipboardList} label="Kitchen Display" roles={['kitchen', 'manager', 'restaurant_admin', 'super_admin']} />
            <SidebarItem href="/waiter" icon={Tablet} label="Waiter Console" roles={['waiter', 'manager', 'restaurant_admin', 'super_admin']} />
            <SidebarItem href="/admin/menu" icon={UtensilsCrossed} label="Menu Management" roles={['manager', 'restaurant_admin', 'super_admin']} />
            <SidebarItem href="/admin/tables" icon={ShieldAlert} label="Table Logic" roles={['manager', 'restaurant_admin', 'super_admin']} />
          </ul>
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-800/50">
          <div className="flex items-center gap-3 mb-6 px-2">
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-sm shadow-inner ring-2 ring-indigo-500/20">
              {user.name?.[0].toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold truncate">{user.name}</p>
              <p className="text-[10px] text-slate-500 uppercase font-black">{user.role.replace('_', ' ')}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all group"
          >
            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-semibold">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto px-8 py-10">
        <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
          {children}
        </div>
      </main>
    </div>
  );
}
