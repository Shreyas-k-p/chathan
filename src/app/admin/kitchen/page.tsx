'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, CookingPot, ShoppingBasket, Play, Check, XCircle, Activity, Zap, UtensilsCrossed } from 'lucide-react';
import { toast } from 'sonner';

export default function KitchenDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await fetch('http://localhost:5000/orders');
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error('Kitchen Sync Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const syncInterval = setInterval(fetchOrders, 3000); // 3-second mission sync
    return () => clearInterval(syncInterval);
  }, []);

  const updateStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`http://localhost:5000/order/status/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      
      if (data) {
        toast.success(`KITCHEN SYNC: Order ${status.toLowerCase()}`);
        fetchOrders();
      }
    } catch (err) {
      toast.error('Mission Transition Failure');
    }
  };

  const statusColors: Record<string, string> = {
    'PLACED': 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    'PREPARING': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    'READY': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    'SERVED': 'bg-zinc-800 text-zinc-500 border-zinc-700',
    'CANCELLED': 'bg-rose-500/10 text-rose-400 border-rose-500/20'
  };

  const filteredOrders = orders.filter(o => o.status !== 'CANCELLED' && o.status !== 'SERVED');

  if (loading) return <div className="flex h-screen items-center justify-center bg-[#050505] font-black text-indigo-500 uppercase tracking-widest italic animate-pulse text-2xl">KITCHEN: SYNCING...</div>;

  return (
    <div className="p-6 md:p-12 space-y-12 animate-in fade-in duration-1000 grayscale-[0.2]">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-zinc-800/50 pb-12">
        <div className="min-w-0">
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase italic flex items-center gap-6">
            <CookingPot size={48} className="text-indigo-500 md:w-16 md:h-16 shrink-0" />
            Kitchen Core
          </h1>
          <div className="text-indigo-400 font-black uppercase text-[10px] tracking-[0.4em] mt-4 flex items-center gap-3 italic">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" /> Node Production Active • {filteredOrders.length} Tasks in Hub
          </div>
        </div>
        <div className="flex gap-4">
            <Badge variant="outline" className="bg-zinc-900 border-zinc-800 text-zinc-500 font-black px-6 h-12 flex items-center italic rounded-full shadow-2xl uppercase tracking-widest text-[10px]">Registry ID: KITCHEN-ALPHA-HUB</Badge>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 pb-32">
        {filteredOrders.map((order) => (
          <Card key={order._id} className="border-none shadow-2xl bg-[#0e0e0e] backdrop-blur-3xl ring-1 ring-white/10 rounded-[2.5rem] md:rounded-[3.1rem] overflow-hidden group hover:scale-[1.03] transition-all duration-500 flex flex-col hover:ring-indigo-500/30">
            <div className="p-8 md:p-10 border-b border-white/5 bg-zinc-900/10 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest italic block mb-1">Origin Node</span>
                <p className="text-3xl font-black text-white italic uppercase tracking-tighter overflow-hidden">TABLE {order.tableId}</p>
              </div>
              <Badge className={`${statusColors[order.status]} uppercase font-black italic px-4 py-2 border rounded-xl text-[9px] tracking-widest shadow-2xl`}>
                {order.status}
              </Badge>
            </div>
            
            <CardContent className="p-8 md:p-10 flex-1 flex flex-col">
              <div className="space-y-6 flex-1">
                {order.items.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between items-center group/item p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center font-black text-lg italic shadow-2xl transition-transform group-hover/item:rotate-12">{item.qty}</div>
                      <span className="text-zinc-300 font-black uppercase italic tracking-tight text-sm md:text-base group-hover/item:text-white transition-colors">{item.name}</span>
                    </div>
                    <UtensilsCrossed size={16} className="text-zinc-800 group-hover/item:text-indigo-500 transition-colors" />
                  </div>
                ))}
              </div>

              <div className="mt-12 space-y-4">
                <div className="flex items-center justify-between text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-4 pl-1">
                   Mission Transition Control
                </div>
                <div className="grid grid-cols-2 gap-4">
                   {order.status === 'PLACED' && (
                     <Button onClick={() => updateStatus(order._id, 'PREPARING')} className="w-full h-14 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase italic tracking-widest rounded-2xl transition-all shadow-2xl active:scale-95 text-[9px] gap-2"><Play size={14} fill="currentColor"/> Begin Production</Button>
                   )}
                   {order.status === 'PREPARING' && (
                     <Button onClick={() => updateStatus(order._id, 'READY')} className="w-full h-14 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase italic tracking-widest rounded-2xl transition-all shadow-2xl active:scale-95 text-[9px] gap-2"><CheckCircle2 size={14}/> Release to Waiter</Button>
                   )}
                   {order.status === 'READY' && (
                     <Button onClick={() => updateStatus(order._id, 'SERVED')} className="w-full h-14 bg-zinc-800 hover:bg-white hover:text-black text-white font-black uppercase italic tracking-widest rounded-2xl transition-all shadow-2xl active:scale-95 text-[9px] gap-2 col-span-2 shadow-emerald-500/10"><Check size={14}/> Node Served</Button>
                   )}
                   {order.status === 'PLACED' && (
                     <Button onClick={() => updateStatus(order._id, 'CANCELLED')} variant="outline" className="h-14 border-zinc-800 bg-transparent text-rose-500 hover:bg-rose-500/10 font-black uppercase italic tracking-widest rounded-2xl transition-all text-[9px] gap-2"><XCircle size={14}/> Abort Seq.</Button>
                   )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredOrders.length === 0 && (
           <div className="col-span-full py-60 text-center border-2 border-dashed border-zinc-800 rounded-[3rem] opacity-20">
              <Zap size={64} className="mx-auto mb-8 text-zinc-600 animate-pulse" />
              <p className="font-black uppercase tracking-[0.5em] italic text-sm">Matrix Idle: Global Production Registry Clear</p>
           </div>
        )}
      </div>
    </div>
  );
}
