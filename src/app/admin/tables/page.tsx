'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, QrCode, Zap, Activity, Trash2 } from 'lucide-react';
import { useRestaurantStore } from '@/store/useRestaurantStore';
import { toast } from 'sonner';

export default function TablesPage() {
  const { tables, addTable, updateTableStatus, deleteTable, syncMatrix } = useRestaurantStore();

  useEffect(() => { syncMatrix(); }, []);

  const handleDeployTable = () => {
    const nextNum = tables.length > 0 ? Math.max(...tables.map(t => t.tableNumber)) + 1 : 1;
    const newTable = {
      _id: `t-${Date.now()}`,
      tableNumber: nextNum,
      active: true,
      ordersCount: 0
    };
    addTable(newTable);
    toast.success(`Matrix Node #${nextNum} Deployed!`);
  };

  return (
    <div className="space-y-12 md:space-y-16 animate-in fade-in duration-1000 pb-32">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 md:gap-12 border-b border-zinc-800/50 pb-8 md:pb-16">
        <div>
          <h1 className="text-4xl md:text-7xl font-black text-white tracking-tighter uppercase italic flex items-center gap-4 md:gap-6">
            <Zap size={32} className="text-indigo-500 md:w-14 md:h-14 shrink-0" />
            Table Logic
          </h1>
          <div className="text-indigo-400 font-black uppercase text-[9px] md:text-[10px] tracking-[0.3em] md:tracking-[0.4em] mt-3 flex items-center gap-3 italic">
            <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-emerald-500 animate-pulse" /> Spatial Floor Registry v4.5
          </div>
        </div>
        <Button 
          onClick={handleDeployTable}
          className="w-full md:w-auto bg-white hover:bg-zinc-200 text-black font-black rounded-[1.2rem] md:rounded-2xl h-12 md:h-16 px-8 md:px-12 uppercase italic tracking-widest shadow-2xl active:scale-95 transition-all text-[10px] md:text-xs"
        >
          <Plus size={20} className="mr-2 md:mr-3" /> Deploy Node
        </Button>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-12">
        {tables.map((table) => (
          <Card key={table._id} className="border-none shadow-2xl bg-zinc-900/50 backdrop-blur-xl ring-1 ring-white/10 rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden group hover:scale-[1.05] transition-all duration-700 hover:ring-indigo-500/30 active:scale-95">
            <CardHeader className="bg-zinc-800/20 p-10 md:p-12 flex items-center justify-center border-b border-white/5 relative overflow-hidden">
               <div className="absolute inset-0 bg-indigo-600/[0.02] -skew-y-12 transform scale-150" />
               <span className="relative z-10 text-6xl md:text-7xl font-black italic tracking-tighter text-indigo-500 drop-shadow-2xl">#{table.tableNumber}</span>
               <button 
                 onClick={() => deleteTable(table._id)}
                 className="absolute top-4 md:top-6 right-4 md:right-6 p-2 md:p-3 rounded-full bg-rose-500/10 text-rose-500 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity hover:bg-rose-500/20 shadow-2xl"
               >
                 <Trash2 size={16} />
               </button>
            </CardHeader>
            <CardContent className="p-8 md:p-10 space-y-6 md:space-y-8">
              <div className="flex justify-between items-center bg-zinc-800/30 p-3 md:p-4 rounded-xl md:rounded-[1.5rem] border border-white/5 shadow-inner">
                <span className="text-[9px] font-black uppercase text-zinc-600 tracking-[0.2em] italic ml-1">Node State</span>
                <button 
                  onClick={() => updateTableStatus(table._id, !table.active)}
                  className={`${table.active ? 'bg-emerald-600/20 text-emerald-400' : 'bg-rose-600/20 text-rose-400'} border-none font-black uppercase text-[8px] md:text-[9px] italic py-1.5 px-6 rounded-full shadow-lg transition-transform active:scale-90`}
                >
                  {table.active ? 'Operational' : 'Maintenance'}
                </button>
              </div>
              
              <div className="flex justify-between items-center text-[9px] md:text-[10px] font-black uppercase tracking-widest px-1">
                <div className="flex items-center gap-2 text-zinc-600">
                   <Activity size={12} /> <span className="italic">Telemetry</span>
                </div>
                <span className="text-white italic">{table.ordersCount} Open Sessions</span>
              </div>

              <div className="pt-4 flex gap-4">
                 <Button className="flex-1 rounded-xl md:rounded-2xl h-12 md:h-14 bg-zinc-800 hover:bg-zinc-700 text-white font-black uppercase text-[10px] tracking-widest italic border border-white/5 transition-all shadow-xl group/btn overflow-hidden">
                    <QrCode size={18} className="mr-3 group-hover/btn:rotate-12 transition-transform shrink-0" /> 
                    <span className="truncate">Sync QR</span>
                 </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        
        <button 
          onClick={handleDeployTable}
          className="flex flex-col items-center justify-center h-full min-h-[300px] md:min-h-[400px] border-4 border-dashed border-zinc-900 rounded-[2.5rem] md:rounded-[3.5rem] bg-zinc-900/5 hover:bg-zinc-800/20 transition-all group active:scale-95"
        >
            <Plus size={40} className="text-zinc-800 group-hover:text-indigo-500 transition-all group-hover:scale-125 md:w-12 md:h-12" />
            <p className="text-[10px] md:text-xs font-black uppercase text-zinc-800 group-hover:text-indigo-400 mt-6 tracking-[0.4em] italic text-center px-4">Add Matrix Node</p>
        </button>
      </div>
    </div>
  );
}
