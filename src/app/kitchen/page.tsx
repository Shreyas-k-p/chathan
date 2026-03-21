'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRestaurantStore, playAlertSound } from '@/store/useRestaurantStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Clock, ChefHat, X, Activity, Volume2, Info, Cake, Heart, Gift, Zap, Trash2, ChevronRight, ZapOff } from 'lucide-react';

const EventIcon = ({ type }: { type: string }) => {
    switch (type) {
        case 'Birthday': return <Cake size={14} className="text-rose-400" />;
        case 'Anniversary': return <Heart size={14} className="text-rose-400" />;
        case 'Party': return <Gift size={14} className="text-rose-400" />;
        default: return <Zap size={14} className="text-indigo-400" />;
    }
};

export default function KitchenPage() {
  const { orders, updateOrderStatus, removeItemFromOrder, syncMatrix } = useRestaurantStore();
  const [activeTab, setActiveTab] = useState('pending');
  
  // Real-time synchronization listener
  const prevOrdersCount = useRef(orders.length);
  useEffect(() => {
    if (orders.length > prevOrdersCount.current) {
        const newOrder = orders[0];
        toast.info(`NEW COMMAND DETECTED: Table ${newOrder.tableId}`, {
            description: `${newOrder.items.length} items logged for processing.`,
            duration: 8000
        });
        playAlertSound();
    }
    prevOrdersCount.current = orders.length;
  }, [orders]);

  useEffect(() => { syncMatrix(); }, []);

  const filteredOrders = orders.filter(o => o.status === activeTab);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-indigo-600/20 text-indigo-400 border-indigo-500/30';
      case 'preparing': return 'bg-amber-600/20 text-amber-400 border-amber-500/30';
      case 'ready': return 'bg-emerald-600/20 text-emerald-400 border-emerald-500/30';
      default: return 'bg-zinc-800 text-zinc-400';
    }
  };

  return (
    <div className="space-y-8 md:space-y-12 animate-in fade-in duration-1000 pb-20">
      <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-10 border-b border-zinc-800/50 pb-8 md:pb-12">
        <div>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase italic flex items-center gap-4">
            <ChefHat size={32} className="text-indigo-500 md:w-12 md:h-12" />
            Kitchen Core
          </h1>
          <div className="text-emerald-400 font-black uppercase text-[10px] tracking-[0.4em] mt-3 flex items-center gap-4 italic font-sans">
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Telemetry Active
            </div>
            <div className="flex items-center gap-2 text-zinc-500 border-l border-zinc-800 pl-4">
                <Volume2 size={12} /> Sync Audio Enabled
            </div>
          </div>
        </div>
        <Tabs defaultValue="pending" className="w-full xl:w-[650px]" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 bg-zinc-900/50 backdrop-blur-xl border border-white/5 p-1 h-12 md:h-16 rounded-[1rem] md:rounded-[1.5rem] shadow-2xl">
            <TabsTrigger value="pending" className="rounded-lg md:rounded-xl font-black uppercase text-[9px] md:text-[11px] tracking-widest italic data-[state=active]:bg-white data-[state=active]:text-black transition-all">Ordered</TabsTrigger>
            <TabsTrigger value="preparing" className="rounded-lg md:rounded-xl font-black uppercase text-[9px] md:text-[11px] tracking-widest italic data-[state=active]:bg-white data-[state=active]:text-black transition-all">Preparing</TabsTrigger>
            <TabsTrigger value="ready" className="rounded-lg md:rounded-xl font-black uppercase text-[9px] md:text-[11px] tracking-widest italic data-[state=active]:bg-white data-[state=active]:text-black transition-all">Ready</TabsTrigger>
          </TabsList>
        </Tabs>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-10">
        {filteredOrders.length === 0 ? (
          <div className="col-span-full py-24 md:py-40 text-center bg-zinc-900/10 rounded-[2.5rem] md:rounded-[4rem] border-2 border-dashed border-zinc-800/50 shadow-inner">
             <Activity size={48} className="mx-auto text-zinc-800 mb-6 animate-pulse md:w-16 md:h-16" />
             <p className="text-zinc-600 font-black uppercase tracking-[0.3em] md:tracking-[0.4em] text-[10px] md:text-xs italic px-6">Operational Registry Empty • {activeTab.toUpperCase()} Standby</p>
          </div>
        ) : (
          filteredOrders.map((order: any) => (
            <Card key={order._id} className="border-none shadow-2xl bg-[#0e0e0e]/80 backdrop-blur-xl ring-1 ring-white/10 rounded-[2.5rem] md:rounded-[3rem] overflow-hidden group hover:scale-[1.02] transition-all duration-500 hover:ring-indigo-500/30">
              <CardHeader className="p-6 md:p-10 border-b border-white/5 flex flex-row items-center justify-between pb-6 opacity-90 relative">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                      <div className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] italic">Node ID</div>
                      {order.specialEvent && (
                          <Badge variant="outline" className="bg-rose-500/10 border-rose-500/20 text-rose-400 text-[8px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1.5 italic animate-pulse shadow-sm">
                              <EventIcon type={order.specialEvent} /> {order.specialEvent}
                          </Badge>
                      )}
                  </div>
                  <CardTitle className="text-2xl md:text-3xl font-black text-white tracking-tighter uppercase italic truncate">#{order._id.slice(-4).toUpperCase()}</CardTitle>
                </div>
                <Badge className={`px-4 md:px-6 py-2 rounded-xl font-black uppercase text-[8px] md:text-[10px] tracking-widest italic shadow-2xl whitespace-nowrap ${getStatusColor(order.status)}`}>
                  {order.status === 'pending' ? 'ORDERED' : order.status.toUpperCase()}
                </Badge>
              </CardHeader>
              <CardContent className="p-6 md:p-10 space-y-6 md:space-y-8">
                <div className="flex justify-between items-center bg-zinc-800/20 p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border border-white/5 shadow-inner">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-indigo-600/10 text-indigo-400 flex items-center justify-center font-black text-xl shadow-lg ring-1 ring-indigo-500/20 italic">
                          T{order.tableId}
                        </div>
                        <span className="font-black text-[9px] uppercase tracking-[0.2em] text-zinc-500 italic hidden sm:inline">Target</span>
                    </div>
                    <div className="flex items-center gap-2 text-[9px] md:text-[10px] font-black text-white uppercase italic tracking-widest">
                        <Clock size={14} className="text-indigo-500 rotate-12" /> {order.time || 'NOW'}
                    </div>
                </div>
                <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                  {order.items.map((item: any, i: number) => (
                    <div key={i} className="flex flex-col group/item p-3 md:p-4 hover:bg-zinc-800/30 rounded-xl md:rounded-2xl transition-all border border-transparent hover:ring-1 hover:ring-white/5 gap-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <span className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-white text-black flex items-center justify-center font-black text-base md:text-lg shadow-2xl transform group-hover/item:rotate-12 transition-transform shrink-0">{item.quantity}</span>
                            <span className="font-black text-zinc-100 uppercase tracking-tight italic text-sm md:text-lg group-hover/item:text-indigo-400 transition-colors line-clamp-1">{item.name}</span>
                        </div>
                        <Button 
                            onClick={() => {
                                removeItemFromOrder(order._id, item.name);
                                toast.warning(`REMOVED: ${item.name} excised from mission.`);
                            }}
                            variant="ghost" 
                            size="icon" 
                            className="w-8 h-8 rounded-lg text-zinc-800 hover:text-rose-500 hover:bg-rose-500/10 transition-all opacity-0 group-hover/item:opacity-100"
                        >
                            <Trash2 size={14} />
                        </Button>
                      </div>
                      {item.instructions && (
                          <div className="flex items-start gap-3 bg-amber-500/5 p-3 rounded-lg border border-amber-500/10 shadow-sm">
                              <Info size={14} className="text-amber-500 shrink-0 mt-0.5" />
                              <p className="text-[10px] font-bold text-amber-200 uppercase italic tracking-tight leading-tight">{item.instructions}</p>
                          </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="pt-8 border-t border-white/5 flex gap-4 h-16 md:h-20">
                  {order.status === 'pending' && (
                    <Button onClick={() => updateOrderStatus(order._id, 'preparing')} className="flex-1 bg-white hover:bg-zinc-200 text-black font-black uppercase italic tracking-widest rounded-xl md:rounded-2xl shadow-2xl transition-all active:scale-95 text-[10px] md:text-xs group">
                        Accept Mission <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </Button>
                  )}
                  {order.status === 'preparing' && (
                    <Button onClick={() => updateOrderStatus(order._id, 'ready')} className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-white font-black uppercase italic tracking-widest rounded-xl md:rounded-2xl shadow-2xl shadow-emerald-500/20 transition-all active:scale-95 text-[10px] md:text-xs">
                        Signal Node Ready
                    </Button>
                  )}
                   <Button variant="ghost" className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl text-zinc-700 hover:text-rose-400 hover:bg-rose-500/10 transition-all shrink-0">
                    <ZapOff size={24} className="md:w-8 md:h-8" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
