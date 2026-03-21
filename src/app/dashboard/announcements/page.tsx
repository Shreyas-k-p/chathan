'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRestaurantStore, Announcement } from '@/store/useRestaurantStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Bell, ShieldAlert, Users, MessageSquare, Send, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const getBadgeColor = (type: string) => {
    switch (type) {
        case 'critical': return 'bg-rose-600/20 text-rose-400 border-rose-500/30';
        case 'staff': return 'bg-indigo-600/20 text-indigo-400 border-indigo-500/30';
        default: return 'bg-zinc-800 text-zinc-400 border-zinc-700/50';
    }
};

export default function AnnouncementsPage() {
  const { user } = useAuthStore();
  const { announcements, addAnnouncement, syncMatrix } = useRestaurantStore();
  const [newMsg, setNewMsg] = useState({ title: '', content: '', type: 'general' as any });

  useEffect(() => { syncMatrix(); }, []);

  const canManage = ['manager', 'restaurant_admin', 'super_admin'].includes(user?.role || '');

  const handlePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsg.title || !newMsg.content) return toast.error('Announcement payload incomplete.');
    
    const announcement: Announcement = {
      id: `a-${Date.now()}`,
      ...newMsg,
      author: user?.role === 'manager' ? 'MANAGER' : user?.role === 'super_admin' ? 'SYSTEM ADM' : 'COORD',
      time: 'Just now'
    };
    
    addAnnouncement(announcement);
    setNewMsg({ title: '', content: '', type: 'general' });
    toast.success('Broadcast transmitted to all staff nodes.');
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-1000">
      <header className="border-b border-zinc-800/50 pb-12">
        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase italic flex items-center gap-6">
          <Bell size={32} className="text-indigo-500 md:w-16 md:h-16" />
          Event Stream
        </h1>
        <div className="text-indigo-400 font-black uppercase text-[10px] tracking-[0.4em] mt-4 flex items-center gap-3 italic">
          <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" /> Critical Staff Updates Registry
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {canManage && (
            <div className="lg:col-span-5">
                <Card className="border-none shadow-2xl bg-zinc-900/50 backdrop-blur-xl ring-1 ring-white/10 p-10 rounded-[2.5rem] sticky top-32 overflow-hidden relative active:scale-95 group transition-transform">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/10 blur-[60px]" />
                    <CardHeader className="p-0 pb-8 border-b border-white/5 mb-8">
                        <CardTitle className="text-2xl font-black text-white tracking-widest uppercase italic border-l-4 border-indigo-600 pl-4">Deploy Broadcast</CardTitle>
                    </CardHeader>
                    <form onSubmit={handlePost} className="space-y-6">
                        <div className="space-y-3">
                            <label className="text-[10px] uppercase font-black text-zinc-600 tracking-widest italic ml-1">Type Node</label>
                            <div className="grid grid-cols-3 gap-3">
                                {['general', 'staff', 'critical'].map(t => (
                                    <Button key={t} type="button" onClick={() => setNewMsg({...newMsg, type: t})} variant={newMsg.type === t ? 'default' : 'outline'} className={`rounded-xl h-10 text-[8px] font-black uppercase tracking-widest italic uppercase transition-all ${newMsg.type === t ? 'bg-white text-black' : 'border-zinc-800 text-zinc-600'}`}>{t}</Button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] uppercase font-black text-zinc-600 tracking-widest italic ml-1">Registry Title</label>
                            <Input value={newMsg.title} onChange={e => setNewMsg({...newMsg, title: e.target.value})} placeholder="e.g. Protocol Shift" className="bg-zinc-800/40 border-none h-14 rounded-xl px-6 font-bold text-white shadow-inner italic" />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] uppercase font-black text-zinc-600 tracking-widest italic ml-1">Registry Payload</label>
                            <textarea value={newMsg.content} onChange={e => setNewMsg({...newMsg, content: e.target.value})} placeholder="Detailed mission specs..." className="w-full bg-zinc-800/40 border-none rounded-xl p-6 h-32 font-bold text-sm italic text-white shadow-inner focus:ring-1 focus:ring-indigo-500/30 no-scrollbar" />
                        </div>
                        <Button type="submit" className="w-full h-16 bg-white hover:bg-zinc-200 text-black font-black uppercase tracking-widest rounded-2xl active:scale-95 transition-all text-sm gap-4 shadow-xl shadow-white/5">
                            <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> COMMAND BCAST
                        </Button>
                    </form>
                </Card>
            </div>
        )}

        <div className={canManage ? 'lg:col-span-7 space-y-8 pb-32' : 'lg:col-span-12 max-w-4xl mx-auto space-y-8 w-full pb-32'}>
            {announcements.length === 0 ? (
                <div className="py-40 text-center opacity-20 border-2 border-dashed border-zinc-800 rounded-[3rem]">
                    <MessageSquare size={48} className="mx-auto mb-6" />
                    <p className="font-black uppercase tracking-[0.5em] italic">Stream Registry Empty</p>
                </div>
            ) : announcements.map((a) => (
                <Card key={a.id} className="border-none shadow-2xl bg-zinc-950/40 backdrop-blur-3xl ring-1 ring-white/5 p-8 md:p-10 rounded-[2.5rem] md:rounded-[3rem] group hover:ring-indigo-500/20 transition-all hover:bg-zinc-900/40 relative overflow-hidden">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-3">
                             <div className={`w-3 h-3 rounded-full ${a.type === 'critical' ? 'bg-rose-500 animate-ping' : a.type === 'staff' ? 'bg-indigo-500' : 'bg-emerald-500'}`} />
                             <Badge variant="outline" className={`px-4 py-1.5 rounded-full font-black uppercase text-[8px] tracking-[0.3em] italic ${getBadgeColor(a.type)}`}>{a.type}</Badge>
                        </div>
                        <span className="text-[9px] font-black uppercase text-zinc-700 tracking-widest italic">{a.time}</span>
                    </div>
                    <div>
                        <h4 className="text-xl md:text-3xl font-black text-white uppercase italic tracking-tighter mb-4 group-hover:text-indigo-400 transition-colors drop-shadow-md">{a.title}</h4>
                        <p className="text-zinc-500 text-sm md:text-base leading-relaxed italic font-bold uppercase tracking-tight">{a.content}</p>
                    </div>
                    <div className="mt-8 pt-8 border-t border-zinc-800/30 flex justify-between items-center px-2">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center font-black text-[10px] text-zinc-500 italic">ID</div>
                            <span className="text-[10px] font-black uppercase text-zinc-600 tracking-widest italic">{a.author} NODE</span>
                        </div>
                        <CheckCircle2 size={18} className="text-zinc-800 group-hover:text-emerald-500 transition-colors" />
                    </div>
                </Card>
            ))}
        </div>
      </div>
    </div>
  );
}
