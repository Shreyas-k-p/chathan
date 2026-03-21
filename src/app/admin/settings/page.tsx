'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Settings, Save, X, Globe, Bell, Shield, Wallet } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    name: 'Shreyas Kitchen',
    slug: 'shreyas-kitchen',
    phone: '+91 9876543210',
    email: 'shreyas5710kp@gmail.com',
    currency: 'INR',
    tax: 5,
  });

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      <header className="border-b border-border pb-8 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-foreground tracking-tighter uppercase italic">System Registry</h1>
          <p className="text-muted-foreground font-bold uppercase text-[10px] tracking-[0.3em] mt-2 italic">Global Operational Parameters</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-slate-950 text-white font-black rounded-xl h-12 px-8 uppercase italic tracking-widest shadow-xl">
          <Save size={20} className="mr-2" /> Commit Changes
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <Card className="border-none shadow-2xl bg-card text-card-foreground ring-1 ring-border rounded-[2rem] overflow-hidden group">
          <CardHeader className="bg-muted/50 p-8 border-b border-border">
            <CardTitle className="text-xl font-black uppercase italic tracking-tight flex items-center gap-3">
              <Globe size={24} className="text-indigo-500" />
              Tenant Identity
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest italic pl-1">Restaurant Name</label>
              <Input value={settings.name} className="bg-muted border-none h-12 rounded-xl font-bold" />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest italic pl-1">Unique Slug</label>
              <Input value={settings.slug} disabled className="bg-muted border-none h-12 rounded-xl font-bold opacity-50" />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest italic pl-1">Support Email</label>
              <Input value={settings.email} className="bg-muted border-none h-12 rounded-xl font-bold" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-2xl bg-card text-card-foreground ring-1 ring-border rounded-[2rem] overflow-hidden group">
          <CardHeader className="bg-muted/50 p-8 border-b border-border">
            <CardTitle className="text-xl font-black uppercase italic tracking-tight flex items-center gap-3">
              <Bell size={24} className="text-amber-500" />
              Real-time Feeds
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="flex justify-between items-center p-4 bg-muted/30 rounded-2xl border border-border">
              <span className="font-black text-[10px] uppercase italic text-foreground tracking-widest">Order Push Notifications</span>
              <div className="w-12 h-6 bg-indigo-600 rounded-full relative shadow-inner cursor-pointer">
                <div className="absolute top-1 right-1 w-4 h-4 bg-white rounded-full shadow-lg" />
              </div>
            </div>
            <div className="flex justify-between items-center p-4 bg-muted/30 rounded-2xl border border-border">
              <span className="font-black text-[10px] uppercase italic text-foreground tracking-widest">Kitchen Alerts (Sound)</span>
              <div className="w-12 h-6 bg-slate-300 rounded-full relative shadow-inner cursor-pointer">
                <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-lg" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-2xl bg-slate-950 p-10 ring-1 ring-white/10 text-white overflow-hidden relative group rounded-[2rem]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-bl-[100px]" />
          <CardHeader className="px-0 pt-0 pb-8 flex items-start justify-between border-b border-white/5 mb-10">
            <div>
              <CardTitle className="text-3xl font-black tracking-tighter uppercase italic flex items-center gap-3">
                <Shield size={28} className="text-rose-500" />
                Security Hub
              </CardTitle>
            </div>
          </CardHeader>
          <div className="space-y-8">
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
              <span className="text-slate-400 italic">Auth Mode</span>
              <span className="text-white italic">JWT v4.0 (Active)</span>
            </div>
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
              <span className="text-slate-400 italic">Encryption</span>
              <span className="text-white italic">AES-256 (Global)</span>
            </div>
            <Button variant="outline" className="w-full h-14 bg-white/5 border-white/10 hover:bg-white/10 text-white font-black uppercase italic tracking-widest rounded-xl">
              Rotate Global Keys
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
