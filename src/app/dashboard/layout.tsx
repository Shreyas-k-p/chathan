'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter, usePathname } from 'next/navigation';
import { 
    LayoutDashboard, 
    UtensilsCrossed, 
    ClipboardList, 
    Tablet, 
    ShieldAlert, 
    LogOut, 
    Menu as MenuIcon, 
    X, 
    Bell, 
    Package,
    Users,
    Camera,
    Upload
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { toast } from 'sonner';

const SidebarItem = ({ href, icon: Icon, label, roles, onClick }: any) => {
  const { user } = useAuthStore();
  const pathname = usePathname();
  const isActive = pathname === href;

  if (roles && !roles.includes(user?.role)) return null;

  return (
    <li className="list-none">
    <Link 
      href={href} 
      onClick={onClick}
      className={`flex items-center gap-4 px-6 py-5 rounded-2xl transition-all font-black uppercase text-[10px] tracking-[0.2em] italic ${
        isActive 
          ? 'bg-indigo-600/10 text-indigo-400 ring-1 ring-indigo-500/20 shadow-[0_0_25px_rgba(99,102,241,0.15)]' 
          : 'text-zinc-500 hover:text-white hover:bg-zinc-800/50'
      }`}
    >
      <Icon size={20} />
      <span>{label}</span>
    </Link>
    </li>
  );
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, setUser } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setUser({ ...user, profilePhoto: reader.result as string } as any);
            toast.success('SYNC: Biological Data Updated', {
                description: 'Profile image processed and deployed to all nodes.'
            });
        };
        reader.readAsDataURL(file);
    }
  };

  if (!user) return null;

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#080808]/50 backdrop-blur-3xl">
      <div className="mb-12 px-2 group">
        <Link href="/dashboard" className="flex items-center gap-4 hover:opacity-80 transition-opacity no-underline">
          <div className="w-12 h-12 bg-indigo-600 rounded-[1.3rem] flex items-center justify-center font-black text-2xl text-white shadow-2xl shadow-indigo-500/30 transform group-hover:rotate-12 transition-transform italic shrink-0">S</div>
          <div>
            <h2 className="text-3xl font-black tracking-tighter uppercase italic text-zinc-100 leading-none">Scan4Serve</h2>
            <p className="text-[9px] text-indigo-400 uppercase font-black tracking-[0.3em] mt-2 italic pl-0.5">SaaS Node Hub</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <ul className="flex flex-col gap-2 m-0 p-0">
          <SidebarItem href="/dashboard" icon={LayoutDashboard} label="Live Overview" roles={['MANAGER', 'SUPER_ADMIN']} onClick={() => setIsOpen(false)} />
          <SidebarItem href="/admin/kitchen" icon={ClipboardList} label="Kitchen Display" roles={['KITCHEN', 'MANAGER']} onClick={() => setIsOpen(false)} />
          <SidebarItem href="/waiter" icon={Tablet} label="Waiter Console" roles={['WAITER', 'MANAGER']} onClick={() => setIsOpen(false)} />
          
          <div className="my-4 border-t border-zinc-800/30 mx-4" />
          
          <SidebarItem href="/dashboard/inventory" icon={Package} label="Food Availability" roles={['KITCHEN', 'WAITER', 'MANAGER']} onClick={() => setIsOpen(false)} />
          <SidebarItem href="/dashboard/announcements" icon={Bell} label="Announcements" roles={['MANAGER', 'SUPER_ADMIN']} onClick={() => setIsOpen(false)} />
          
          <div className="my-4 border-t border-zinc-800/30 mx-4" />
          
          <SidebarItem href="/admin/menu" icon={UtensilsCrossed} label="Menu Engine" roles={['MANAGER']} onClick={() => setIsOpen(false)} />
          <SidebarItem href="/admin/tables" icon={ShieldAlert} label="Table Logic" roles={['MANAGER']} onClick={() => setIsOpen(false)} />
          <SidebarItem href="/admin/staff" icon={Users} label="Staff Management" roles={['MANAGER']} onClick={() => setIsOpen(false)} />
        </ul>
      </nav>

      <div className="mt-auto pt-8 border-t border-zinc-800/50 flex flex-col items-center">
        <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            className="hidden" 
        />
        
        <div className="w-full bg-zinc-900/40 p-6 rounded-[2.5rem] border border-zinc-800/50 shadow-2xl group/profile relative transition-all hover:bg-zinc-800/60 mb-6 flex flex-col items-center gap-4">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="w-24 h-24 md:w-28 md:h-28 rounded-3xl bg-zinc-800 flex items-center justify-center font-black text-2xl shadow-2xl ring-2 ring-zinc-700 text-indigo-400 overflow-hidden cursor-pointer relative transform hover:scale-105 transition-all"
          >
            {user.profilePhoto ? (
                <img src={user.profilePhoto} className="w-full h-full object-cover" alt={user.name} />
            ) : (
                user.name?.[0].toUpperCase()
            )}
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover/profile:opacity-100 transition-opacity">
                <Upload size={24} className="text-white mb-2 shadow-lg" />
                <span className="text-[8px] font-black uppercase text-white italic tracking-widest">Deploy Photo</span>
            </div>
          </div>
          <div className="text-center">
            <h4 className="text-sm font-black uppercase italic tracking-tight text-white">{user.name}</h4>
            <p className="text-[9px] text-indigo-500 uppercase font-black tracking-[0.3em] mt-1 italic">{user.role?.replace('_', ' ')} NODE</p>
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="w-full h-16 flex items-center gap-4 px-8 text-[10px] font-black uppercase italic tracking-[0.2em] text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-2xl transition-all group border border-transparent hover:border-rose-500/10"
        >
          <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span>Sign Out Node</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#050505] text-zinc-100 flex-col md:flex-row">
      <aside className="hidden md:flex w-[340px] bg-[#050505] text-zinc-100 p-8 flex-shrink-0 sticky top-0 h-screen flex-col border-r border-white-[0.05] z-50">
         <SidebarContent />
      </aside>

      <header className="md:hidden sticky top-0 bg-[#0a0a0a]/90 backdrop-blur-2xl border-b border-white/5 z-40 p-6 flex justify-between items-center shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-xl text-white shadow-xl italic">S</div>
          <h2 className="text-xl font-black tracking-tighter uppercase italic text-zinc-100">Scan4Serve</h2>
        </div>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger 
            render={
              <button className="flex items-center justify-center p-0 h-10 w-10 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors border-none bg-transparent cursor-pointer" />
            }
          >
            <MenuIcon size={28} />
          </SheetTrigger>
          <SheetContent side="left" className="w-[320px] bg-zinc-950 border-r border-white/5 p-8 flex flex-col">
             <SidebarContent />
          </SheetContent>
        </Sheet>
      </header>

      <main className="flex-1 overflow-y-auto px-6 md:px-12 py-10 md:py-16 bg-[#050505]">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
