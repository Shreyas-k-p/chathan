'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRestaurantStore, Staff } from '@/store/useRestaurantStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Users, UserPlus, ShieldCheck, Mail, Trash2, Camera, Star } from 'lucide-react';
import { toast } from 'sonner';

export default function StaffManagementPage() {
  const { user } = useAuthStore();
  const { staff, addStaff, removeStaff, syncMatrix } = useRestaurantStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newStaff, setNewStaff] = useState({ name: '', email: '', role: 'waiter' as any, password: '' });

  useEffect(() => { syncMatrix(); }, []);

  const canAddSubManager = user?.role === 'SUPER_ADMIN' || user?.role === 'MANAGER';

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaff.name || !newStaff.email || !newStaff.password) return toast.error('Incomplete staff dossier (missing fields or key).');
    
    if (newStaff.role === 'restaurant_admin' && !canAddSubManager) {
        return toast.error('Security Violation: Unauthorized to commission Sub-Manager level nodes.');
    }

    const member: Staff & { password?: string } = {
      id: `s-${Date.now()}`,
      ...newStaff,
      status: 'offline'
    };
    
    addStaff(member);
    setIsAdding(false);
    setNewStaff({ name: '', email: '', role: 'waiter', password: '' });
    toast.success(`${member.name} registered to platform network.`);
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-1000 pb-32">
      <header className="border-b border-zinc-800/50 pb-12 flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase italic flex items-center gap-6">
            <Users size={32} className="text-indigo-500 md:w-16 md:h-16" />
            Staff Registry
          </h1>
          <p className="text-indigo-400 font-black uppercase text-[10px] tracking-[0.4em] mt-4 flex items-center gap-3 italic">
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" /> Personnel Matrix Management v1.2
          </p>
        </div>
        <Button 
            onClick={() => setIsAdding(!isAdding)}
            className="w-full md:w-auto bg-white hover:bg-zinc-200 text-black h-16 px-10 rounded-2xl font-black uppercase tracking-widest italic transition-all active:scale-95 shadow-2xl"
        >
            <UserPlus size={20} className="mr-3" /> {isAdding ? 'Abort Entry' : 'Enlist Personnel'}
        </Button>
      </header>

      {isAdding && (
          <Card className="border-none shadow-2xl bg-zinc-900/40 backdrop-blur-xl ring-1 ring-white/10 p-10 rounded-[3rem] max-w-2xl mx-auto mb-16 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/10 blur-[60px]" />
              <form onSubmit={handleAdd} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[9px] uppercase font-black text-zinc-600 tracking-widest italic ml-1">Full Name</label>
                            <Input value={newStaff.name} onChange={e => setNewStaff({...newStaff, name: e.target.value})} placeholder="Operator X" className="bg-zinc-800/40 border-none h-14 rounded-xl px-6 font-bold text-white shadow-inner" />
                        </div>
                        <div className="space-y-2">
                             <label className="text-[9px] uppercase font-black text-zinc-600 tracking-widest italic ml-1">Role Permission</label>
                             <select 
                                value={newStaff.role} 
                                onChange={e => setNewStaff({...newStaff, role: e.target.value as any})}
                                className="w-full bg-zinc-800/40 border-none h-14 rounded-xl px-6 font-bold text-white shadow-inner appearance-none cursor-pointer focus:ring-1 focus:ring-indigo-500/20"
                             >
                                <option value="waiter">Waiter</option>
                                <option value="kitchen">Kitchen</option>
                                {canAddSubManager && <option value="restaurant_admin">Sub-Manager</option>}
                             </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="space-y-2">
                             <label className="text-[9px] uppercase font-black text-zinc-600 tracking-widest italic ml-1">Registry Email</label>
                             <Input value={newStaff.email} type="email" onChange={e => setNewStaff({...newStaff, email: e.target.value})} placeholder="node@scan4serve.com" className="bg-zinc-800/40 border-none h-14 rounded-xl px-6 font-bold text-white shadow-inner" />
                         </div>
                         <div className="space-y-2">
                             <label className="text-[9px] uppercase font-black text-zinc-600 tracking-widest italic ml-1">Master Login Key</label>
                             <Input value={newStaff.password} type="password" onChange={e => setNewStaff({...newStaff, password: e.target.value})} placeholder="Initial Passphrase" className="bg-zinc-800/40 border-none h-14 rounded-xl px-6 font-bold text-white shadow-inner" />
                         </div>
                    </div>
                    <Button type="submit" className="w-full h-16 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest rounded-2xl active:scale-95 transition-all text-sm shadow-xl shadow-indigo-600/20">
                         Verify & Commission Node
                    </Button>
              </form>
          </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {staff.map((member) => (
          <Card key={member.id} className="border-none shadow-2xl bg-[#0e0e0e]/80 backdrop-blur-3xl ring-1 ring-white/5 p-8 rounded-[3rem] group hover:scale-[1.02] transition-all duration-500 hover:ring-indigo-500/20 overflow-hidden relative">
            <div className="flex items-center gap-6 mb-8">
                <div className="w-20 h-20 rounded-[2rem] bg-zinc-800 flex items-center justify-center font-black text-2xl text-indigo-400 ring-1 ring-white/5 shadow-inner overflow-hidden">
                    {member.profilePhoto ? <img src={member.profilePhoto} className="w-full h-full object-cover" /> : member.name[0].toUpperCase()}
                </div>
                <div>
                   <h3 className="text-xl font-black text-white uppercase italic tracking-tighter truncate">{member.name}</h3>
                   <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="bg-indigo-600/10 border-indigo-500/20 text-indigo-400 font-black text-[7px] uppercase tracking-widest px-3 py-1 rounded-full italic">{member.role.replace('_', ' ')}</Badge>
                      <div className={`w-2 h-2 rounded-full ${member.status === 'online' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-zinc-800'}`} />
                   </div>
                </div>
            </div>
            
            <div className="space-y-4 pt-6 border-t border-white/5">
                <div className="flex items-center gap-3 text-zinc-600 group-hover:text-zinc-400 transition-colors">
                    <Mail size={16} />
                    <span className="text-[10px] font-black uppercase italic tracking-widest truncate">{member.email}</span>
                </div>
                <div className="flex items-center gap-3 text-zinc-600">
                    <ShieldCheck size={16} />
                    <span className="text-[10px] font-black uppercase italic tracking-widest">Access: Node Level 2</span>
                </div>
            </div>

            <div className="mt-8 flex gap-3">
                {canAddSubManager && (
                    <Button onClick={async () => {
                         const newKey = window.prompt("Enter new master login key for " + member.name + ":");
                         if (!newKey) return;
                         try {
                           const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
                           const res = await fetch(`${apiUrl}/staff/reset/${member.id}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ newPassword: newKey }) });
                           if (res.ok) toast.success(`Login key manually reset for ${member.name}`);
                           else toast.error('Matrix failure: Unable to reset key');
                         } catch (e) { toast.error('Connection error.'); }
                    }} variant="ghost" className="flex-1 h-12 bg-zinc-900 hover:bg-zinc-800 text-indigo-400 hover:text-indigo-300 rounded-xl font-black uppercase text-[9px] tracking-widest italic transition-all ring-1 ring-indigo-500/20">Reset Login Key</Button>
                )}
                {((member.role as string) !== 'super_admin' && (member.role as string) !== 'SUPER_ADMIN') && (
                    <Button 
                        onClick={() => {
                            removeStaff(member.id);
                            toast.warning('Node decommissioned from registry.');
                        }}
                        variant="ghost" 
                        className="w-12 h-12 bg-rose-500/5 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl transition-all"
                    >
                         <Trash2 size={18} />
                    </Button>
                )}
            </div>
            
            {((member.role as string) === 'manager' || (member.role as string) === 'restaurant_admin' || (member.role as string) === 'SUB_MANAGER' || (member.role as string) === 'MANAGER') && (
                <div className="absolute top-4 right-4">
                    <Star size={16} className="text-amber-500/20" fill="currentColor" />
                </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
