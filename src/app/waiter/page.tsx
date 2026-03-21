'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRestaurantStore, playAlertSound, Order } from '@/store/useRestaurantStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tablet, Bell, CheckSquare, MessageSquare, Clock, Signal, Zap, Activity, Volume2, Cake, Heart, Gift, FileText, Printer, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const EventIcon = ({ type }: { type: string }) => {
    switch (type) {
        case 'Birthday': return <Cake size={12} />;
        case 'Anniversary': return <Heart size={12} />;
        case 'Party': return <Gift size={12} />;
        default: return <Zap size={12} />;
    }
};

const StatCard = ({ icon: Icon, label, value, trend, color }: any) => (
  <Card className="border-none shadow-2xl bg-zinc-900/50 backdrop-blur-xl ring-1 ring-white/10 p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] group hover:scale-[1.05] transition-all duration-700 overflow-hidden relative active:scale-95">
    <div className={`absolute top-0 right-0 w-32 h-32 ${color} opacity-10 blur-[60px] group-hover:opacity-30 transition-opacity`} />
    <div className="flex justify-between items-start relative z-10">
      <div className={`p-4 rounded-xl md:rounded-2xl ${color} bg-opacity-20 flex items-center justify-center transform group-hover:-rotate-12 transition-transform shadow-lg shadow-black/50`}>
        <Icon className={`${color.replace('bg-', 'text-')} w-6 h-6 md:w-8 md:h-8`} />
      </div>
      <Badge variant="outline" className="border-zinc-700 text-zinc-500 font-black px-3 py-1 flex items-center gap-2 text-[7px] md:text-[8px] tracking-[0.2em] md:tracking-[0.3em] italic rounded-full shadow-lg">
        Active
      </Badge>
    </div>
    <div className="mt-8 relative z-10">
      <p className="text-[9px] md:text-[10px] font-black uppercase text-zinc-600 tracking-[0.3em] md:tracking-[0.4em] italic mb-3 md:mb-4">{label}</p>
      <h3 className="text-3xl md:text-5xl font-black text-white tracking-widest uppercase italic drop-shadow-md">{value}</h3>
      <p className="text-[9px] md:text-[10px] text-indigo-400 font-black uppercase tracking-widest mt-4 italic">{trend}</p>
    </div>
  </Card>
);

export default function WaiterConsole() {
  const { orders, tables, updateOrderStatus, syncMatrix } = useRestaurantStore();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => { syncMatrix(); }, []);

  // Real-time synchronization listener
  const prevOrdersCount = useRef(orders.length);
  useEffect(() => {
    if (orders.length > prevOrdersCount.current) {
        const newOrder = orders[0];
        toast.info(`NODE ALERT: Table ${newOrder.tableId}`, {
            description: `New mission deployment detected. Check Call Ledger.`,
            duration: 8000
        });
        playAlertSound();
    }
    prevOrdersCount.current = orders.length;
  }, [orders]);

  const pendingTasks = orders.filter(o => o.status !== 'served' && o.status !== 'cancelled');

  const printBill = (order: Order) => {
    toast.success(`PRINTING RECEIPT: Table ${order.tableId}`, {
        description: `Mission valuation ₹${order.total} dispatched to Node Printer.`,
    });
  };

  return (
    <div className="space-y-12 md:space-y-16 animate-in fade-in duration-1000 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-zinc-800/50 pb-8 md:pb-16">
        <div className="min-w-0">
          <h1 className="text-4xl md:text-7xl font-black text-white tracking-tighter uppercase italic flex items-center gap-4 md:gap-6">
            <Tablet size={32} className="text-amber-500 md:w-14 md:h-14 shrink-0" />
            Waiter Hub
          </h1>
          <div className="text-indigo-400 font-black uppercase text-[10px] tracking-[0.4em] mt-3 flex items-center gap-6 italic">
            <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" /> Connectivity Sync v2.5
            </div>
            <div className="flex items-center gap-2 text-zinc-500 border-l border-zinc-800 pl-6">
                <Volume2 size={12} /> Audio Sync Native
            </div>
          </div>
        </div>
        <div className="flex">
           <Badge variant="outline" className="bg-zinc-800/50 border-zinc-700 text-indigo-400 font-black text-[8px] md:text-[10px] px-6 h-10 md:h-14 flex items-center italic rounded-full shadow-2xl tracking-[0.3em] whitespace-nowrap">NODE HUB 01</Badge>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-12">
        <StatCard icon={CheckSquare} label="Resolved" value={orders.filter(o => o.status === 'served').length} trend="100% Effectiveness" color="bg-indigo-600" />
        <StatCard icon={Clock} label="Avg Time" value="4.2m" trend="-12% Sync Latency" color="bg-indigo-600" />
        <StatCard icon={Bell} label="Open" value={pendingTasks.length.toString().padStart(2, '0')} trend="Level 1 Alert" color="bg-rose-500" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 md:gap-16 pt-12 md:pt-16 border-t border-zinc-800/30">
        <Card className="xl:col-span-8 border-none shadow-2xl bg-zinc-900/50 backdrop-blur-xl ring-1 ring-white/10 p-6 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden relative">
          <CardHeader className="px-0 pt-0 pb-8 md:pb-12 border-b border-white/5 mb-8 md:mb-12 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-2xl md:text-4xl font-black text-white tracking-tighter uppercase italic">Call Ledger</CardTitle>
              <CardDescription className="text-zinc-600 font-black uppercase text-[10px] tracking-widest mt-2 italic">Global Service Queue</CardDescription>
            </div>
          </CardHeader>
          <div className="space-y-6 md:space-y-8 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
            {pendingTasks.length === 0 ? (
               <div className="py-20 text-center opacity-30 border-2 border-dashed border-zinc-800 rounded-[3rem]">
                  <Activity size={48} className="mx-auto mb-4" />
                  <p className="font-black uppercase tracking-widest text-[9px] md:text-[10px]">Queue Standby</p>
               </div>
            ) : pendingTasks.map((task: any) => (
              <div key={task._id} className="flex flex-col gap-4 p-6 md:p-8 bg-zinc-800/20 rounded-[2rem] md:rounded-[2.5rem] border border-white/5 hover:bg-zinc-800/40 transition-all hover:ring-1 hover:ring-indigo-500/30 group">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 md:gap-8 min-w-0">
                    <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl md:rounded-3xl flex items-center justify-center font-black text-xl md:text-2xl shadow-2xl transition-transform group-hover:rotate-6 shrink-0 ${task.status === 'ready' ? 'bg-emerald-600 text-white animate-pulse' : task.status === 'preparing' ? 'bg-amber-600 text-white' : 'bg-indigo-600 text-white shadow-indigo-500/20'}`}>
                        {task.tableId}
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <h4 className="font-black text-white uppercase italic tracking-tight text-base md:text-xl truncate">
                                {task.status === 'ready' ? 'COLLECT READY' : task.status === 'preparing' ? 'KITCHEN ACTIVE' : 'NEW ORDER'}
                            </h4>
                            <Badge className={`${task.status === 'ready' ? 'bg-emerald-500' : task.status === 'preparing' ? 'bg-amber-500' : 'bg-indigo-500'} text-[7px] font-black h-4 px-1.5 flex items-center italic`}>
                                {task.status.toUpperCase()}
                            </Badge>
                            {task.specialEvent && (
                                <Badge className="bg-rose-500 text-[7px] font-black h-4 px-1.5 flex items-center gap-1 animate-pulse italic">
                                    <EventIcon type={task.specialEvent} /> {task.specialEvent}
                                </Badge>
                            )}
                        </div>
                        <p className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] mt-1 italic flex items-center gap-2">
                            {task.time} • ₹{task.total}
                        </p>
                    </div>
                    </div>
                    <div className="flex gap-2">
                        <Dialog>
                            <DialogTrigger render={<Button variant="ghost" className="hidden sm:flex items-center gap-2 text-[8px] font-black uppercase tracking-widest italic text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-xl" />}>
                                <FileText size={14}/> Bill
                            </DialogTrigger>
                            <DialogContent className="bg-black border-zinc-800 border-2 rounded-[2.5rem] p-8 md:p-12 max-w-lg">
                                <DialogHeader className="border-b border-zinc-900 pb-8 mb-8">
                                    <DialogTitle className="text-3xl font-black text-white tracking-widest uppercase italic flex items-center gap-4">
                                        <FileText size={24} className="text-emerald-500" />
                                        TABLE {task.tableId} BILL
                                    </DialogTitle>
                                </DialogHeader>
                                <div className="space-y-6">
                                    <div className="space-y-4">
                                        {task.items.map((item: any, i: number) => (
                                            <div key={i} className="flex justify-between items-center text-xs font-black uppercase italic tracking-tighter">
                                                <span className="text-zinc-500">{item.quantity}x {item.name}</span>
                                                <span className="text-white">₹{item.price * item.quantity}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="pt-6 border-t border-zinc-900 flex justify-between items-end">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-zinc-600 font-extrabold tracking-widest">TOTAL VALUATION</span>
                                            <span className="text-4xl font-black text-white italic tracking-tighter">₹{task.total}</span>
                                        </div>
                                        <Button onClick={() => printBill(task)} className="h-14 px-8 bg-white text-black font-black uppercase italic rounded-xl hover:bg-zinc-200 transition-all active:scale-95 flex gap-3">
                                            <Printer size={18} /> Print
                                        </Button>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                        {task.status === 'ready' && (
                            <Button 
                            onClick={() => {
                                updateOrderStatus(task._id, 'served');
                                toast.success('SERVICE LOGGED: Mission complete.');
                            }}
                            className="rounded-xl md:rounded-2xl px-6 md:px-10 h-10 md:h-14 font-black uppercase text-[10px] tracking-widest italic bg-white text-black hover:bg-emerald-500 hover:text-white transition-all shrink-0 shadow-2xl active:scale-95"
                            >Served</Button>
                        )}
                    </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="xl:col-span-4 border-none shadow-2xl bg-zinc-900/50 backdrop-blur-xl ring-1 ring-white/10 p-6 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden relative">
          <CardHeader className="px-0 pt-0 pb-8 md:pb-12 border-b border-white/5 mb-8 md:mb-12">
            <CardTitle className="text-2xl md:text-3xl font-black text-white tracking-tighter uppercase italic">Floor Matrix</CardTitle>
            <CardDescription className="text-zinc-600 font-black uppercase text-[10px] tracking-widest mt-2 italic">Live Node Hub</CardDescription>
          </CardHeader>
          <div className="grid grid-cols-2 gap-4 md:gap-6">
            {tables.map((t) => (
              <div key={t._id} className={`h-24 md:h-28 rounded-[1.5rem] border-2 flex flex-col items-center justify-center transition-all cursor-pointer group active:scale-95 ${t.ordersCount > 0 ? 'border-indigo-600 bg-indigo-600/10' : 'border-zinc-800 bg-zinc-900/30'}`}>
                <span className={`text-2xl md:text-3xl font-black italic transform group-hover:-rotate-12 transition-transform ${t.ordersCount > 0 ? 'text-indigo-400' : 'text-zinc-800'}`}>{t.tableNumber}</span>
                <span className={`text-[7px] md:text-[8px] font-black uppercase tracking-widest mt-1 ${t.ordersCount > 0 ? 'text-indigo-500' : 'text-zinc-800 opacity-40'}`}>{t.active ? 'OP' : 'MAINT'}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
