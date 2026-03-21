'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuthStore } from '@/store/useAuthStore';
import { useRestaurantStore, ManagedRestaurant } from '@/store/useRestaurantStore';
import { TrendingUp, Users, ShoppingCart, DollarSign, ArrowUpRight, ArrowDownRight, Clock, ShieldCheck, Activity, Plus, Store, User, Phone, MapPin, Globe, ChevronRight, Navigation, Edit3, Trash2, Info, AlertTriangle, Map } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import MapSelector from './MapSelector';

const StatCard = ({ icon: Icon, label, value, trend, trendUp, color }: any) => (
  <Card className="border-none shadow-2xl bg-zinc-900/50 backdrop-blur-xl ring-1 ring-white/10 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] group hover:scale-[1.02] transition-all duration-500 overflow-hidden relative active:scale-95">
    <div className={`absolute top-0 right-0 w-32 h-32 ${color} opacity-10 blur-[60px] group-hover:opacity-30 transition-opacity`} />
    <div className="flex justify-between items-start relative z-10">
      <div className={`p-4 rounded-2xl ${color} bg-opacity-20 flex items-center justify-center transform group-hover:rotate-6 transition-transform shadow-lg`}>
        <Icon className={`${color.replace('bg-', 'text-')} w-6 h-6`} />
      </div>
      <Badge variant="outline" className={`${trendUp ? 'border-emerald-500 text-emerald-400' : 'border-rose-500 text-rose-400'} font-black px-3 py-1 flex items-center gap-1 text-[10px] tracking-widest italic rounded-full shadow-lg transition-transform group-hover:scale-110`}>
        {trendUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
        {trend}
      </Badge>
    </div>
    <div className="mt-8 relative z-10">
      <p className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.3em] italic mb-3">{label}</p>
      <h3 className="text-3xl md:text-4xl font-black text-white tracking-tighter uppercase italic drop-shadow-md">{value}</h3>
    </div>
  </Card>
);

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { orders, menuItems, managedRestaurants, addManagedRestaurant, updateManagedRestaurant, syncMatrix } = useRestaurantStore();
  const [newRestaurant, setNewRestaurant] = useState({ name: '', managerName: '', mobile: '', location: '', managerEmail: '', managerPassword: '' });
  const [editingRestaurant, setEditingRestaurant] = useState<ManagedRestaurant | null>(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState<ManagedRestaurant | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [mapTarget, setMapTarget] = useState<'create' | 'edit'>('create');

  useEffect(() => { syncMatrix(); }, []);

  const handleCreateRestaurant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRestaurant.name || !newRestaurant.managerName) return toast.error('Registry Payload Incomplete');
    const restaurant: ManagedRestaurant = { id: `r-${Date.now()}`, ...newRestaurant, status: 'active', createdAt: 'Recently Deployed', valuation: '₹0', staffCount: 0 };
    addManagedRestaurant(restaurant);
    setNewRestaurant({ name: '', managerName: '', mobile: '', location: '', managerEmail: '', managerPassword: '' });
    setIsCreateOpen(false);
    toast.success('SYNC: New Restaurant Node Active');
  };

  const handleUpdateRestaurant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRestaurant) return;
    updateManagedRestaurant(editingRestaurant.id, editingRestaurant);
    setIsEditOpen(false);
    toast.success('SYNC: Node Protocol Revised');
  };

  const openInGoogleMaps = (location: string) => {
    if (!location) return;
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`, '_blank');
  };

  const handleMapSelect = (address: string) => {
    if (mapTarget === 'create') {
      setNewRestaurant({ ...newRestaurant, location: address });
    } else if (mapTarget === 'edit' && editingRestaurant) {
      setEditingRestaurant({ ...editingRestaurant, location: address });
    }
  };

  if (user?.role === 'SUPER_ADMIN') {
      return (
        <div className="space-y-12 animate-in fade-in duration-1000 p-8 md:p-12">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-zinc-800/50 pb-12">
                <div>
                    <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase italic flex items-center gap-6">
                        <Globe size={48} className="text-indigo-500" />
                        SaaS Matrix <Badge className="bg-emerald-500 font-bold ml-4">LIVE NODE</Badge>
                    </h1>
                    <div className="text-indigo-400 font-black uppercase text-[10px] tracking-[0.4em] mt-4 flex items-center gap-3 italic">
                        <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" /> Network Core Active • {managedRestaurants.length} Nodes Online
                    </div>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger render={<Button className="h-16 px-8 bg-white hover:bg-zinc-200 text-black font-black uppercase italic tracking-widest rounded-2xl active:scale-95 transition-all shadow-2xl flex items-center gap-4 border-none cursor-pointer" />}>
                        <Plus size={24} /> Add Restaurant Node
                    </DialogTrigger>
                    <DialogContent className="bg-black border-zinc-800 ring-1 ring-white/10 rounded-[2.5rem] p-10 max-w-xl">
                        <DialogHeader className="pb-8 border-b border-zinc-900 mb-8">
                            <DialogTitle className="text-3xl font-black text-white uppercase italic tracking-tighter flex items-center gap-4">Asset Onboarding</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreateRestaurant} className="space-y-6">
                            <div className="space-y-4">
                                <Input value={newRestaurant.name} onChange={e => setNewRestaurant({...newRestaurant, name: e.target.value})} placeholder="Restaurant Key Name" className="bg-zinc-900 border-none h-14 pl-6 rounded-xl text-white font-black italic shadow-inner" />
                                <div className="grid grid-cols-2 gap-4">
                                    <Input value={newRestaurant.managerName} onChange={e => setNewRestaurant({...newRestaurant, managerName: e.target.value})} placeholder="Node Manager Name" className="bg-zinc-900 border-none h-14 pl-6 rounded-xl text-white font-black italic shadow-inner" />
                                    <Input value={newRestaurant.mobile} onChange={e => setNewRestaurant({...newRestaurant, mobile: e.target.value})} placeholder="Secure Phone" className="bg-zinc-900 border-none h-14 pl-6 rounded-xl text-white font-black italic shadow-inner" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <Input value={newRestaurant.managerEmail as string} onChange={e => setNewRestaurant({...newRestaurant, managerEmail: e.target.value})} placeholder="Manager Login Email" type="email" className="bg-zinc-900 border-none h-14 pl-6 rounded-xl text-white font-black italic shadow-inner" />
                                    <Input value={newRestaurant.managerPassword as string} onChange={e => setNewRestaurant({...newRestaurant, managerPassword: e.target.value})} placeholder="Initial Password" type="password" className="bg-zinc-900 border-none h-14 pl-6 rounded-xl text-white font-black italic shadow-inner" />
                                </div>
                                <div className="relative flex gap-2">
                                    <Input value={newRestaurant.location} onChange={e => setNewRestaurant({...newRestaurant, location: e.target.value})} placeholder="Location" className="bg-zinc-900 border-none h-14 pl-6 rounded-xl text-white font-black italic shadow-inner flex-1" />
                                    <Button type="button" onClick={() => { setMapTarget('create'); setIsMapOpen(true); }} variant="outline" className="h-14 w-14 rounded-xl border-zinc-800 bg-zinc-900 text-indigo-400 hover:text-white shrink-0"><Map size={20}/></Button>
                                </div>
                            </div>
                            <Button type="submit" className="w-full h-16 bg-white text-black hover:bg-zinc-100 font-black uppercase italic tracking-widest rounded-2xl active:scale-95 transition-all text-sm gap-4">COMMIT DEPLOYMENT & GENERATE LOGIN</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-32">
                {managedRestaurants.map((res) => (
                    <Card key={res.id} className="border-none shadow-2xl bg-zinc-900/40 backdrop-blur-3xl ring-1 ring-white/5 p-8 rounded-[3rem] group hover:scale-[1.03] transition-all duration-500 hover:ring-indigo-500/20 overflow-hidden relative">
                         <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 blur-[60px] group-hover:bg-indigo-600/10 transition-colors" />
                         <div className="flex justify-between items-start mb-8 relative z-10">
                            <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-black text-2xl shadow-xl ring-1 ring-indigo-500/20 italic transform group-hover:rotate-6 transition-transform">
                                {res.name[0]}
                            </div>
                            <div className="flex gap-2">
                                <Button size="icon" variant="ghost" className="w-10 h-10 rounded-xl bg-white/5 text-zinc-400 hover:text-indigo-400 hover:bg-zinc-800/50 transition-all" onClick={() => { setEditingRestaurant(res); setIsEditOpen(true); }}><Edit3 size={16} /></Button>
                                <Badge variant="outline" className="bg-emerald-500/10 border-emerald-500/20 text-emerald-400 text-[8px] font-black uppercase px-3 py-1 rounded-full italic shadow-sm">{res.status}</Badge>
                            </div>
                         </div>
                         <div className="relative z-10 cursor-pointer" onClick={() => { setSelectedRestaurant(res); setIsDetailOpen(true); }}>
                            <h3 className="text-2xl font-black text-white tracking-tighter uppercase italic truncate mb-4 drop-shadow-lg">{res.name}</h3>
                            <div className="space-y-3 opacity-80">
                                <p className="text-[10px] font-black text-zinc-400 uppercase italic tracking-widest flex items-center gap-2 group-hover:text-zinc-200 transition-colors">
                                    <User size={12} className="text-indigo-400" /> {res.managerName}
                                </p>
                                <p className="text-[10px] font-black text-zinc-400 uppercase italic tracking-widest flex items-center gap-2 group-hover:text-zinc-200 transition-colors">
                                    <MapPin size={12} className="text-indigo-400" /> {res.location}
                                </p>
                            </div>
                         </div>
                         <div className="mt-8 pt-8 border-t border-white/5 flex justify-between items-center relative z-10 transition-colors group-hover:border-indigo-500/20">
                            <div className="flex flex-col">
                                <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest italic mb-1">Asset valuation</span>
                                <span className="text-xs font-black text-emerald-400 italic font-mono">{res.valuation}</span>
                            </div>
                            <Button variant="ghost" size="sm" className="text-[9px] font-black uppercase italic text-zinc-500 hover:text-white flex items-center gap-2 h-auto p-0" onClick={() => { setSelectedRestaurant(res); setIsDetailOpen(true); }}>
                                Full Metrics <ChevronRight size={14} />
                            </Button>
                         </div>
                    </Card>
                ))}
            </div>

            {/* Matrix Edit Protocol */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="bg-[#0a0a0a] border-zinc-800 ring-1 ring-white/10 rounded-[2.5rem] p-10 max-w-xl">
                    <DialogHeader className="pb-8 border-b border-zinc-900 mb-8">
                        <DialogTitle className="text-3xl font-black text-white uppercase italic tracking-tighter flex items-center gap-4">
                            <Edit3 size={24} className="text-indigo-500" /> Revision Mode
                        </DialogTitle>
                    </DialogHeader>
                    {editingRestaurant && (
                        <form onSubmit={handleUpdateRestaurant} className="space-y-8">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest italic ml-1">Entity ID</label>
                                    <Input value={editingRestaurant.name} onChange={e => setEditingRestaurant({...editingRestaurant, name: e.target.value})} className="bg-zinc-900 border-none h-14 pl-6 rounded-xl text-white font-black italic shadow-inner" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest italic ml-1">Node Connectivity</label>
                                    <select value={editingRestaurant.status} onChange={e => setEditingRestaurant({...editingRestaurant, status: e.target.value as any})} className="w-full bg-zinc-900 border-none h-14 px-6 rounded-xl text-white font-black italic shadow-inner outline-none">
                                        <option value="active">Active Sync</option>
                                        <option value="pending">Standby Mode</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest italic ml-1">Principal Manager</label>
                                <Input value={editingRestaurant.managerName} onChange={e => setEditingRestaurant({...editingRestaurant, managerName: e.target.value})} className="bg-zinc-900 border-none h-14 pl-6 rounded-xl text-white font-black italic shadow-inner" />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest italic ml-1">Node Location</label>
                                    <div className="relative flex gap-2">
                                        <Input value={editingRestaurant.location} onChange={e => setEditingRestaurant({...editingRestaurant, location: e.target.value})} className="bg-zinc-900 border-none h-14 pl-6 rounded-xl text-white font-black italic shadow-inner flex-1" />
                                        <Button type="button" onClick={() => { setMapTarget('edit'); setIsMapOpen(true); }} variant="outline" className="h-14 w-14 rounded-xl border-zinc-800 bg-zinc-900 text-indigo-400 hover:text-white shrink-0"><Map size={20}/></Button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest italic ml-1">Current Valuation</label>
                                    <Input value={editingRestaurant.valuation} onChange={e => setEditingRestaurant({...editingRestaurant, valuation: e.target.value})} className="bg-zinc-900 border-none h-14 pl-6 rounded-xl text-white font-black italic shadow-inner" />
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <Button type="submit" className="flex-1 h-16 bg-white text-black hover:bg-zinc-200 font-black uppercase italic tracking-widest rounded-2xl active:scale-95 transition-all shadow-2xl">SYCHRONIZE CORE</Button>
                                <Button type="button" variant="ghost" className="w-16 h-16 rounded-2xl text-rose-500 hover:bg-rose-500/10 transition-all border border-rose-500/20 shadow-xl" onClick={() => toast.error('PROTOCOL: Node Deletion Restricted')}>
                                    <Trash2 size={24} />
                                </Button>
                            </div>
                        </form>
                    )}
                </DialogContent>
            </Dialog>

            {/* Global Map Selector Dialog */}
            <Dialog open={isMapOpen} onOpenChange={setIsMapOpen}>
                <DialogContent className="max-w-4xl p-0 bg-transparent border-none shadow-none ring-0 overflow-hidden">
                    <MapSelector 
                        onSelect={handleMapSelect} 
                        onClose={() => setIsMapOpen(false)} 
                        initialLocation={mapTarget === 'create' ? newRestaurant.location : editingRestaurant?.location}
                    />
                </DialogContent>
            </Dialog>

            {/* Full Node Immersion View */}
            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                <DialogContent className="bg-[#050505] border-zinc-800 ring-1 ring-white/10 rounded-[3rem] p-0 overflow-hidden max-w-2xl">
                    {selectedRestaurant && (
                        <div className="animate-in fade-in slide-in-from-bottom-10 duration-700">
                            <div className="h-56 bg-gradient-to-br from-indigo-950/50 to-black relative flex items-center justify-center border-b border-white/5">
                                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517248135467-4c7ed9d42177?auto=format&fit=crop&w=800&q=80')] opacity-10 bg-cover bg-center" />
                                <div className="absolute top-8 right-8 flex gap-2">
                                    <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30 uppercase italic px-5 py-2 rounded-full font-black text-[10px] tracking-widest shadow-2xl backdrop-blur-xl">MATRIX NODE: {selectedRestaurant.id.split('-').pop()?.toUpperCase()}</Badge>
                                </div>
                                <div className="text-center relative z-10">
                                    <div className="w-24 h-24 rounded-[2.5rem] bg-white text-black flex items-center justify-center font-black text-5xl shadow-[0_0_50px_rgba(255,255,255,0.15)] italic mx-auto mb-6 transform hover:rotate-12 transition-transform">{selectedRestaurant.name[0]}</div>
                                    <h2 className="text-5xl font-black text-white tracking-tighter uppercase italic drop-shadow-2xl">{selectedRestaurant.name}</h2>
                                    <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.5em] mt-3 italic">Autonomous Operational Hub</p>
                                </div>
                            </div>
                            <div className="p-10 space-y-12">
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="bg-zinc-900/40 p-8 rounded-[2.2rem] border border-white/[0.03] shadow-inner group/stat hover:border-emerald-500/20 transition-all">
                                        <div className="flex justify-between items-center mb-4">
                                            <p className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.4em] italic">Net valuation</p>
                                            <TrendingUp size={14} className="text-emerald-500" />
                                        </div>
                                        <p className="text-4xl font-black text-emerald-400 italic font-mono drop-shadow-[0_0_15px_rgba(16,185,129,0.3)] group-hover:scale-110 transition-transform origin-left">{selectedRestaurant.valuation || '₹0'}</p>
                                    </div>
                                    <div className="bg-zinc-900/40 p-8 rounded-[2.2rem] border border-white/[0.03] shadow-inner group/stat hover:border-indigo-500/20 transition-all">
                                        <div className="flex justify-between items-center mb-4">
                                            <p className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.4em] italic">Personnel deploy</p>
                                            <Users size={14} className="text-indigo-500" />
                                        </div>
                                        <p className="text-4xl font-black text-indigo-400 italic font-mono drop-shadow-[0_0_15_rgba(99,102,241,0.3)] group-hover:scale-110 transition-transform origin-left">{selectedRestaurant.staffCount || 0}</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    {[
                                        { label: 'Managed By', value: selectedRestaurant.managerName, icon: User },
                                        { label: 'Secure Contact', value: selectedRestaurant.mobile, icon: Phone },
                                        { label: 'SaaS Registry', value: selectedRestaurant.status.toUpperCase(), icon: Globe },
                                    ].map((row, i) => (
                                        <div key={i} className="flex items-center justify-between p-6 bg-zinc-900/20 rounded-3xl border border-white/[0.02] hover:bg-zinc-900/40 transition-all group">
                                            <div className="flex items-center gap-6">
                                                <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-indigo-400 group-hover:text-white transition-colors">
                                                    <row.icon size={18} />
                                                </div>
                                                <span className="text-zinc-500 font-black uppercase italic text-[10px] tracking-widest">{row.label}</span>
                                            </div>
                                            <div className="text-white font-black uppercase italic tracking-tight">{row.value}</div>
                                        </div>
                                    ))}
                                    <div className="flex items-center justify-between p-6 bg-zinc-900/20 rounded-3xl border border-white/[0.02] hover:bg-zinc-900/40 transition-all group">
                                        <div className="flex items-center gap-6">
                                            <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-emerald-400">
                                                <MapPin size={18} />
                                            </div>
                                            <span className="text-zinc-500 font-black uppercase italic text-[10px] tracking-widest">Node Location</span>
                                        </div>
                                        <Button variant="ghost" className="h-10 text-emerald-400 hover:text-white hover:bg-emerald-500/10 rounded-xl text-[10px] font-black uppercase italic tracking-widest gap-3" onClick={() => openInGoogleMaps(selectedRestaurant.location)}>
                                            {selectedRestaurant.location.toUpperCase()} <Navigation size={14} />
                                        </Button>
                                    </div>
                                </div>
                                <div className="pt-10 border-t border-white/5 pb-6">
                                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest italic text-center mb-8">Isolated Menu Core (Current Assets)</p>
                                    <div className="flex flex-wrap gap-3 justify-center">
                                        {menuItems.filter(i => i.restaurantId === selectedRestaurant.id).map((item) => (
                                            <Badge key={item._id} className="bg-zinc-900 border-white/[0.05] text-zinc-500 px-5 py-2.5 font-black uppercase italic rounded-xl hover:text-white hover:border-indigo-500/30 transition-all cursor-default">
                                                {item.name} <span className="ml-2 text-[8px] opacity-40 font-mono">₹{item.price}</span>
                                            </Badge>
                                        ))}
                                        {menuItems.filter(i => i.restaurantId === selectedRestaurant.id).length === 0 && (
                                            <div className="flex flex-col items-center gap-4 opacity-30 p-8">
                                                <AlertTriangle size={32} />
                                                <p className="text-[10px] text-zinc-500 italic font-black uppercase tracking-[0.3em]">No Active Digital Assets Registered</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
      );
  }

  const mockLogs = [
    { id: 1, action: 'Order Deployed', staff: 'Chef Raj', time: '2m ago', status: 'success' },
    { id: 2, action: 'Vault Sync', staff: 'System Admin', time: '15m ago', status: 'neutral' },
    { id: 3, action: 'Price Matrix Update', staff: 'Manager Anjali', time: '1h ago', status: 'warning' }
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-1000 p-8 md:p-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-zinc-800/50 pb-8 md:pb-12">
        <div>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase italic flex items-center gap-4">
            <Activity size={32} className="text-indigo-500 md:w-12 md:h-12" />
            Live Dashboard
          </h1>
          <div className="text-indigo-400 font-black uppercase text-[10px] tracking-[0.4em] mt-3 flex items-center gap-2 italic">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Operational Telemetry Sync Active
          </div>
        </div>
        <div className="flex gap-4">
          <Badge variant="outline" className="bg-zinc-800/50 border-zinc-700 text-zinc-400 font-black text-[8px] md:text-[10px] px-6 h-10 md:h-12 flex items-center italic rounded-full shadow-2xl">Session Key: DEV-ALPHA-01</Badge>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        <StatCard icon={DollarSign} label="Daily Revenue" value={`₹${orders.reduce((s,o) => s + (o.total || 0), 0) + 42000}`} trend="+12.5%" trendUp={true} color="bg-indigo-600" />
        <StatCard icon={ShoppingCart} label="Order Count" value={orders.length + 180} trend="+4.2%" trendUp={true} color="bg-emerald-600" />
        <StatCard icon={Users} label="Daily Flux" value="3,204" trend="-0.8%" trendUp={false} color="bg-indigo-600" />
        <StatCard icon={TrendingUp} label="Net Valuation" value="₹89.2k" trend="+18.4%" trendUp={true} color="bg-indigo-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 pt-8">
        <Card className="border-none shadow-2xl bg-zinc-900/50 backdrop-blur-xl ring-1 ring-white/10 p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] overflow-hidden relative">
          <CardHeader className="px-0 pt-0 pb-8 md:pb-10 border-b border-zinc-800/50 mb-8 md:mb-10 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-2xl md:text-3xl font-black text-white tracking-tighter uppercase italic">Ledger Registry</CardTitle>
              <CardDescription className="text-zinc-500 font-black uppercase text-[10px] tracking-widest mt-2 italic">Recent Transaction Log</CardDescription>
            </div>
          </CardHeader>
          <div className="space-y-4 md:space-y-6">
            {orders.slice(0, 5).map((tx) => (
              <div key={tx._id} className="flex items-center justify-between p-4 md:p-6 bg-zinc-800/20 rounded-[1.5rem] md:rounded-[2rem] border border-zinc-700/30 hover:border-indigo-500/50 transition-all hover:bg-zinc-800/40 group cursor-pointer">
                <div className="flex items-center gap-4 md:gap-6">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-zinc-700 flex items-center justify-center font-black text-xs text-indigo-400 shadow-inner italic flex-shrink-0">TX</div>
                  <div className="min-w-0">
                    <h4 className="font-black text-white uppercase italic tracking-tight text-sm md:text-base truncate">Table {tx.tableId}</h4>
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mt-0.5 md:mt-1 italic">{tx.items.length} Items Indexed</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-lg md:text-xl font-black text-emerald-400 italic">₹{tx.total}</p>
                  <p className="text-[9px] md:text-[10px] font-black text-zinc-600 uppercase italic mt-1">{tx.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="border-none shadow-2xl bg-zinc-900/50 backdrop-blur-xl ring-1 ring-white/10 p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] overflow-hidden relative">
          <CardHeader className="px-0 pt-0 pb-8 md:pb-10 border-b border-zinc-800/50 mb-8 md:mb-10">
            <CardTitle className="text-2xl md:text-3xl font-black text-white tracking-tighter uppercase italic">Event Stream</CardTitle>
            <CardDescription className="text-zinc-500 font-black uppercase text-[10px] tracking-widest mt-2 italic">Global Staff Audit Node</CardDescription>
          </CardHeader>
          <div className="space-y-6">
            {mockLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-4 md:gap-6 group hover:translate-x-2 transition-transform cursor-pointer">
                <div className="relative mt-1">
                  <div className={`w-3 h-3 rounded-full shadow-2xl ${log.status === 'success' ? 'bg-indigo-500' : log.status === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'} shadow-[0_0_15px_rgba(99,102,241,0.5)]`} />
                  <div className="absolute top-3 left-[5.5px] w-[1px] h-16 bg-zinc-800 group-last:hidden" />
                </div>
                <div className="flex-1 pb-6 group-last:pb-0">
                  <div className="flex justify-between items-start">
                    <p className="text-xs font-black text-zinc-300 uppercase italic tracking-widest group-hover:text-indigo-400 transition-colors uppercase">{log.action}</p>
                    <span className="text-[9px] md:text-[10px] font-black text-zinc-600 border border-zinc-800/50 px-3 py-1 rounded-full uppercase italic">{log.time}</span>
                  </div>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase mt-2 italic">Initiated by: {log.staff}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
