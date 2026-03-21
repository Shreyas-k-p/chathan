'use client';

import React, { useEffect } from 'react';
import { useRestaurantStore } from '@/store/useRestaurantStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, Power, PackageCheck, PackageX, Activity } from 'lucide-react';
import { toast } from 'sonner';

export default function InventoryPage() {
  const { menuItems, toggleMenuItemAvailability, seed } = useRestaurantStore();

  useEffect(() => { seed(); }, []);

  const handleToggle = (id: string, name: string, currentState: boolean) => {
    toggleMenuItemAvailability(id);
    toast.info(`Availability sync: ${name} is now ${!currentState ? 'ACTIVE' : 'OFFLINE'}`);
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-1000">
      <header className="border-b border-zinc-800/50 pb-12 flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase italic flex items-center gap-6">
            <Package size={32} className="text-amber-500 md:w-16 md:h-16" />
            Inventory Node
          </h1>
          <div className="text-amber-400 font-black uppercase text-[10px] tracking-[0.4em] mt-4 flex items-center gap-3 italic">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" /> Asset Availability Registry
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {menuItems.map((item) => (
          <Card key={item._id} className={`border-none shadow-2xl transition-all duration-500 rounded-[2.5rem] overflow-hidden group relative ${item.isAvailable ? 'bg-zinc-900/40 ring-1 ring-white/5' : 'bg-red-950/10 ring-1 ring-red-500/20 opacity-80'}`}>
            <div className="h-48 overflow-hidden relative">
              <img src={item.imageUrl} className={`w-full h-full object-cover transition-all duration-1000 ${!item.isAvailable ? 'grayscale opacity-40 scale-110' : 'group-hover:scale-110'}`} alt="" />
              {!item.isAvailable && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="text-red-500 font-black text-2xl uppercase italic tracking-tighter rotate-12 bg-white/5 backdrop-blur-md px-6 py-2 rounded-xl ring-1 ring-red-500">SOLD OUT</span>
                  </div>
              )}
            </div>
            <CardContent className="p-8 space-y-6">
                <div className="flex justify-between items-start gap-4">
                    <h3 className="text-xl font-black text-white uppercase italic truncate">{item.name}</h3>
                    <Badge variant="outline" className={`font-black text-[8px] uppercase tracking-widest px-3 py-1 rounded-full italic ${item.isAvailable ? 'text-emerald-400 border-emerald-500/20' : 'text-red-400 border-red-500/20'}`}>
                        {item.isAvailable ? 'ACTIVE' : 'SYNC OFF'}
                    </Badge>
                </div>
                
                <Button 
                    onClick={() => handleToggle(item._id, item.name, item.isAvailable)}
                    className={`w-full h-14 rounded-2xl font-black uppercase italic tracking-widest text-[10px] transition-all active:scale-95 flex items-center gap-3 ${item.isAvailable ? 'bg-zinc-800 hover:bg-red-600 text-white' : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl shadow-emerald-500/10'}`}
                >
                    {item.isAvailable ? (
                        <><Power size={18} /> Flag as Sold Out</>
                    ) : (
                        <><Activity size={18} /> Restore Stock</>
                    )}
                </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
