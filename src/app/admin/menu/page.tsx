'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRestaurantStore, MenuItem } from '@/store/useRestaurantStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Zap, Activity, X } from 'lucide-react';
import { toast } from 'sonner';

export default function MenuManagement() {
  const { user } = useAuthStore();
  const { menuItems, addMenuItem, deleteMenuItem, syncMatrix } = useRestaurantStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', price: 0, description: '', imageUrl: '', category: 'Main Course', isVeg: true });

  useEffect(() => { syncMatrix(); }, []);

  // Filter items by current restaurant node
  const filteredItems = menuItems.filter(i => i.restaurantId === user?.restaurant?._id);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name || !newItem.price) return toast.error('Registry fields incomplete');
    
    const item: MenuItem = { 
        ...newItem, 
        _id: `m-${Date.now()}`, 
        restaurantId: user?.restaurant?._id // Link to specific node
    };
    
    addMenuItem(item);
    setIsAdding(false);
    toast.success('Asset deployed to cloud registry.');
    setNewItem({ name: '', price: 0, description: '', imageUrl: '', category: 'Main Course', isVeg: true });
  };

  return (
    <div className="space-y-8 md:space-y-12 animate-in fade-in duration-1000 grayscale-[0.2]">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-zinc-800/50 pb-8 md:pb-12">
        <div className="min-w-0">
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase italic flex items-center gap-4">
            <Zap size={32} className="text-indigo-500 md:w-12 md:h-12 shrink-0" />
            Selection Engine
          </h1>
          <div className="text-indigo-400 font-black uppercase text-[10px] tracking-[0.4em] mt-3 flex items-center gap-2 italic">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" /> Digital Core Active • Node: {user?.restaurant?.name?.toUpperCase() || 'EXTERNAL'}
          </div>
        </div>
        <div className="flex">
          <Button 
            onClick={() => setIsAdding(true)} 
            className="w-full md:w-auto bg-white hover:bg-zinc-200 text-black font-black rounded-2xl h-12 md:h-16 px-8 md:px-12 uppercase italic tracking-widest hover:rotate-2 shadow-2xl active:scale-95 transition-all text-[10px] md:text-xs"
          >
            <Plus size={20} className="mr-2 md:mr-3" /> New Sequence
          </Button>
        </div>
      </header>

      {isAdding && (
        <Card className="border-none shadow-2xl bg-[#111] backdrop-blur-3xl ring-1 ring-white/10 p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] overflow-hidden">
          <CardHeader className="p-0 pb-8 md:pb-10 border-b border-white/5 mb-8 md:mb-10 text-center">
            <CardTitle className="text-2xl md:text-3xl font-black text-white tracking-tighter uppercase italic">Initializing Node Entry</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <form onSubmit={handleAddItem} className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
              <div className="space-y-3 md:space-y-4">
                <label className="text-[10px] uppercase font-black text-slate-500 tracking-[0.2em] italic ml-1">Asset Identity</label>
                <Input placeholder="Registry Name" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} className="bg-[#181818] border-none text-white h-14 md:h-16 rounded-xl md:rounded-2xl px-6 font-bold shadow-inner" />
              </div>
              <div className="space-y-3 md:space-y-4">
                <label className="text-[10px] uppercase font-black text-slate-500 tracking-[0.2em] italic ml-1">Valuation Threshold (₹)</label>
                <Input type="number" placeholder="450" value={newItem.price} onChange={e => setNewItem({...newItem, price: Number(e.target.value)})} className="bg-[#181818] border-none text-white h-14 md:h-16 rounded-xl md:rounded-2xl px-6 font-bold shadow-inner" />
              </div>
              <div className="space-y-3 md:space-y-4 md:col-span-2">
                <label className="text-[10px] uppercase font-black text-slate-500 tracking-[0.2em] italic ml-1">Visual Stream URL</label>
                <Input placeholder="Imgur/Unsplash Source" value={newItem.imageUrl} onChange={e => setNewItem({...newItem, imageUrl: e.target.value})} className="bg-[#181818] border-none text-white h-14 md:h-16 rounded-xl md:rounded-2xl px-6 font-bold shadow-inner" />
              </div>
              <div className="space-y-3 md:space-y-4 md:col-span-2">
                <label className="text-[10px] uppercase font-black text-slate-500 tracking-[0.2em] italic ml-1">Composite Summary</label>
                <textarea className="w-full bg-[#181818] border-none text-white rounded-xl md:rounded-2xl p-6 h-32 font-bold text-sm italic focus:ring-2 focus:ring-indigo-500/50 shadow-inner resize-none" placeholder="Aromatic profile synthesis..." value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} />
              </div>
              <div className="flex flex-col sm:flex-row gap-4 md:gap-6 md:col-span-2 pt-6">
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-black px-12 h-14 md:h-16 rounded-xl md:rounded-2xl uppercase italic tracking-widest shadow-2xl active:scale-95 transition-all w-full sm:w-auto">Commit Binary</Button>
                <Button type="button" variant="ghost" onClick={() => setIsAdding(false)} className="text-zinc-500 font-black uppercase italic tracking-widest h-14 md:h-16 px-8 hover:text-white transition-colors w-full sm:w-auto">Abort Sequence</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 pb-20">
        {filteredItems.map((item) => (
          <Card key={item._id} className="border-none shadow-2xl bg-[#0e0e0e] backdrop-blur-xl ring-1 ring-white/10 rounded-[2.5rem] md:rounded-[3rem] overflow-hidden group hover:scale-[1.02] transition-all duration-500 border-transparent hover:ring-indigo-500/30 flex flex-col">
            <div className="h-56 md:h-64 overflow-hidden relative grayscale-[0.2] group-hover:grayscale-0 transition-opacity">
              <img src={item.imageUrl || 'https://via.placeholder.com/400x200'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="" />
              <div className="absolute top-4 md:top-6 right-4 md:right-6">
                <Badge className={`${item.isVeg ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'} border-none font-black uppercase text-[8px] md:text-[10px] tracking-widest rounded-full py-2 px-4 shadow-2xl italic shadow-emerald-500/10`}>
                  {item.isVeg ? 'VEGETAL' : 'CARNIVAL'}
                </Badge>
              </div>
            </div>
            <CardContent className="p-8 md:p-10 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <h3 className="text-xl md:text-2xl font-black text-white tracking-tighter uppercase italic leading-none truncate drop-shadow-lg">{item.name}</h3>
                  <span className="text-2xl md:text-3xl font-black text-indigo-400 italic shrink-0 font-mono">₹{item.price}</span>
                </div>
                <p className="text-[11px] md:text-xs text-slate-500 leading-relaxed font-bold italic line-clamp-3 uppercase tracking-tight">{item.description}</p>
              </div>
              <div className="pt-8 md:pt-10 flex gap-4 mt-auto">
                <Button className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-black h-12 rounded-2xl uppercase italic tracking-widest text-[9px] shadow-lg transition-all border border-white/5 active:scale-95">Config Port</Button>
                <Button onClick={() => deleteMenuItem(item._id)} variant="ghost" className="w-12 h-12 rounded-2xl text-rose-500/20 hover:text-rose-400 hover:bg-rose-500/10 transition-all shrink-0">
                  <Trash2 size={24} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredItems.length === 0 && (
             <div className="col-span-full py-40 text-center border-2 border-dashed border-zinc-800 rounded-[3rem] opacity-20">
                <Activity size={48} className="mx-auto mb-6 text-zinc-600 animate-pulse" />
                <p className="font-black uppercase tracking-[0.4em] italic text-xs">Registry Empty for this node</p>
             </div>
        )}
      </div>
    </div>
  );
}
