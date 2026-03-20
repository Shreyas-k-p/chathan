'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '@/store/useAuthStore';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { TrendingUp, Users, Wallet, BellRing, Utensils, TableIcon, Waves } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

const StatCard = ({ icon: Icon, label, value, trend, color, delay }: any) => (
  <Card className="border-none shadow-xl bg-white overflow-hidden group hover:scale-[1.02] transition-all duration-500 ring-1 ring-slate-100 flex flex-col justify-between h-full">
    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-8">
      <CardTitle className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] italic">{label}</CardTitle>
      <div className={`p-4 rounded-3xl ${color} bg-opacity-10 shadow-inner group-hover:scale-110 transition-transform`}>
        <Icon className={`h-6 w-6 ${color.replace('bg-', 'text-')}`} />
      </div>
    </CardHeader>
    <CardContent className="px-8 pb-10">
      <div className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">{value}</div>
      <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mt-2 bg-emerald-50 inline-block px-3 py-1 rounded-full border border-emerald-100 shadow-sm animate-pulse">{trend}</p>
    </CardContent>
  </Card>
);

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<any>(null);

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col gap-2 border-b border-indigo-100 pb-10">
        <h1 className="text-5xl font-black text-slate-950 tracking-tighter uppercase italic drop-shadow-md">Console Overview</h1>
        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em] flex items-center gap-3">
          <Waves size={14} className="text-indigo-500" /> Operational Insights for {user?.restaurant?.name || 'Scan4Serve Tenant'}
        </p>
      </header>

      <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={TrendingUp} label="Daily Sales" value="$4,281.50" trend="+12.5% vs yesterday" color="bg-indigo-600" />
        <StatCard icon={Wallet} label="Transaction Volume" value="124" trend="+8% vs yesterday" color="bg-emerald-600" />
        <StatCard icon={Users} label="Active Customers" value="48" trend="+24% vs yesterday" color="bg-rose-600" />
        <StatCard icon={TableIcon} label="Table Occupancy" value="18/24" trend="75% operational capacity" color="bg-amber-600" />
      </div>

      <div className="grid gap-10 grid-cols-1 lg:grid-cols-7">
        <Card className="lg:col-span-4 border-none shadow-2xl bg-white p-8 ring-1 ring-slate-100 overflow-hidden group">
          <CardHeader className="px-0 pt-0 pb-8 flex flex-row items-center justify-between border-b border-slate-100 mb-8">
            <div>
              <CardTitle className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">Recent Transactions</CardTitle>
              <CardDescription className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1 italic">Real-time ledger access</CardDescription>
            </div>
            <Badge variant="outline" className="bg-slate-50 border-slate-200 text-slate-500 font-black uppercase text-[10px] py-1 shadow-sm italic">SaaS Node Activated</Badge>
          </CardHeader>
          <Table>
            <TableHeader className="bg-slate-50/50 rounded-xl overflow-hidden">
              <TableRow className="border-none hover:bg-transparent px-4">
                <TableHead className="font-black uppercase text-[10px] tracking-widest text-slate-400 italic py-6">Order ID</TableHead>
                <TableHead className="font-black uppercase text-[10px] tracking-widest text-slate-400 italic py-6">Status</TableHead>
                <TableHead className="font-black uppercase text-[10px] tracking-widest text-slate-400 italic py-6 text-right">Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <TableRow key={i} className="border-none hover:bg-indigo-50/30 transition-colors group px-4">
                  <TableCell className="font-bold text-slate-800 py-6 uppercase tracking-tight text-sm">#ORD-{Math.random().toString(36).substr(2, 6).toUpperCase()}</TableCell>
                  <TableCell className="py-6">
                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none font-black uppercase text-[10px] rounded-lg py-1 italic">Success</Badge>
                  </TableCell>
                  <TableCell className="text-right py-6 font-black text-slate-900 text-lg tracking-tighter uppercase italic">${(Math.random() * 100).toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <Card className="lg:col-span-3 border-none shadow-2xl bg-slate-950 p-10 ring-1 ring-white/10 text-white overflow-hidden relative group">
          <div className="absolute top-[-20%] right-[-20%] w-[80%] h-[80%] bg-indigo-500 rounded-full blur-[150px] opacity-20 animate-pulse pointer-events-none" />
          <CardHeader className="px-0 pt-0 pb-8 flex items-start justify-between border-b border-white/5 mb-10">
            <div>
              <CardTitle className="text-3xl font-black tracking-tighter uppercase italic">Staff Activity</CardTitle>
              <CardDescription className="text-[10px] font-black uppercase tracking-widest text-indigo-400/60 mt-2 italic flex items-center gap-2 animate-pulse">
                <BellRing size={12} /> Live Audit Log
              </CardDescription>
            </div>
            <div className="w-12 h-12 bg-white text-black rounded-2xl flex items-center justify-center font-black text-xl shadow-2xl shadow-indigo-500/20 italic">A</div>
          </CardHeader>
          <div className="space-y-10">
            {[
              { type: 'Kitchen', event: 'Accepted order for Table 14', time: '2m' },
              { type: 'Waiter', event: 'Marked order ready for Table 5', time: '10m' },
              { type: 'Admin', event: 'Updated pricing for Menu Item #21', time: '1h' },
            ].map((activity, idx) => (
              <div key={idx} className="flex gap-6 group/item cursor-default">
                <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-xs font-black uppercase tracking-widest text-indigo-400 group-hover/item:bg-white group-hover/item:text-black transition-all shadow-inner">{activity.time}</div>
                <div>
                  <p className="font-bold text-indigo-50 pt-2 text-sm leading-relaxed uppercase tracking-tight italic">{activity.event}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 mt-2 group-hover/item:text-indigo-500 transition-colors uppercase">{activity.type} Engine Node</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-16 pt-10 border-t border-white/5 text-center">
             <p className="text-[10px] text-slate-700 font-bold uppercase tracking-[0.3em] group-hover:text-indigo-400 transition-colors italic">Scan4Serve Platform Performance Optimized v4.0</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
