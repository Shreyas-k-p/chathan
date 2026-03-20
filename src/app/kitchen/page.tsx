'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '@/store/useAuthStore';
import { socket, connectSocket } from '@/lib/socket';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Bell, Clock, ChefHat, CheckSquare, XCircle, AlertTriangle } from 'lucide-react';

export default function KitchenPage() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    if (user?.restaurant?._id) {
      connectSocket(user.restaurant._id);
      fetchOrders();

      socket.on('new_order', (data) => {
        setOrders(prev => [data.data, ...prev]);
        toast.info('🍴 New Order Received!', { duration: 10000 });
      });

      socket.on('cancel_requested', ({ orderId, message }) => {
        setOrders(prev => prev.map(o => o._id === orderId ? { ...o, cancelRequested: true } : o));
        toast.warning(message, { duration: 10000 });
      });

      return () => {
        socket.off('new_order');
        socket.off('cancel_requested');
      };
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/v1/orders?restaurantId=${user?.restaurant?._id}`, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      setOrders(res.data.data);
    } catch (err) {
      toast.error('Failed to load orders.');
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await axios.put(`http://localhost:5000/api/v1/orders/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      setOrders(orders.map(o => o._id === id ? { ...o, status } : o));
      toast.success(`Order marked as ${status}`);
    } catch (err) {
      toast.error('Status update failed.');
    }
  };

  const handleCancel = async (id: string, approve: boolean) => {
    try {
      await axios.post(`http://localhost:5000/api/v1/orders/${id}/cancel-response`, { approve }, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      setOrders(orders.map(o => o._id === id ? { 
        ...o, 
        status: approve ? 'cancelled' : o.status,
        cancelRequested: false,
        cancelStatus: approve ? 'approved' : 'rejected'
      } : o));
      toast.success(approve ? 'Order successfully cancelled.' : 'Cancel request rejected.');
    } catch (err) {
      toast.error('Failed to process cancel request.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'placed': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'accepted': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'preparing': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'ready': return 'bg-green-100 text-green-700 border-green-200';
      case 'served': return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const activeOrders = orders.filter(o => 
    activeTab === 'pending' ? ['placed', 'accepted', 'preparing'].includes(o.status) :
    activeTab === 'ready' ? o.status === 'ready' : 
    activeTab === 'completed' ? ['served', 'completed', 'cancelled'].includes(o.status) : true
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end border-b pb-8 border-indigo-100">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic drop-shadow-sm">Kitchen Display</h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-2 flex items-center gap-2">
            <Bell size={12} className="text-indigo-500" /> Live Connection Operational
          </p>
        </div>
        <Tabs defaultValue="pending" className="w-[450px]" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 bg-slate-100 border-b border-indigo-50 p-1 h-12 shadow-inner rounded-xl">
            <TabsTrigger value="pending" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md font-black uppercase text-[10px] tracking-widest transition-all italic">Active</TabsTrigger>
            <TabsTrigger value="ready" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md font-black uppercase text-[10px] tracking-widest transition-all italic">Ready</TabsTrigger>
            <TabsTrigger value="completed" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md font-black uppercase text-[10px] tracking-widest transition-all italic">History</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {activeOrders.map(order => (
          <Card key={order._id} className="overflow-hidden border-none shadow-xl hover:shadow-2xl transition-all duration-300 ring-1 ring-slate-200 flex flex-col group h-full">
            <CardHeader className="bg-slate-50 border-b p-6 flex flex-row justify-between items-start space-y-0 group-hover:bg-indigo-50/30 transition-colors">
              <div>
                <CardTitle className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">Table {order.tableId?.tableNumber || 'N/A'}</CardTitle>
                <CardDescription className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">#ORD-{order._id.slice(-6)}</CardDescription>
              </div>
              <Badge className={`${getStatusColor(order.status)} border-2 px-3 py-1 font-black uppercase text-[10px] tracking-widest rounded-lg`}>{order.status}</Badge>
            </CardHeader>
            <CardContent className="p-8 flex-1">
              <ul className="space-y-4 m-0 p-0 list-none">
                {order.items.map((item: any, idx: number) => (
                  <li key={idx} className="flex justify-between items-center group/item border-b border-slate-100 pb-2 last:border-none">
                    <div className="flex gap-4 items-center">
                      <span className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-black text-lg shadow-lg group-hover/item:scale-110 transition-transform">{item.quantity}</span>
                      <span className="font-bold text-slate-800 uppercase tracking-tight text-lg">{item.name}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
            
            <CardFooter className="bg-white border-t p-6 gap-3 mt-auto">
              {order.cancelRequested ? (
                <div className="w-full space-y-4 animate-bounce">
                  <div className="flex items-center gap-2 text-red-600 font-black uppercase text-xs tracking-tighter bg-red-50 p-3 rounded-xl border-2 border-red-200 shadow-sm">
                    <AlertTriangle size={16} /> <span>Cancel Request Received!</span>
                  </div>
                  <div className="flex gap-3 h-12">
                    <Button onClick={() => handleCancel(order._id, true)} className="flex-1 bg-red-600 hover:bg-red-700 font-bold uppercase italic rounded-xl shadow-lg h-full">Approve</Button>
                    <Button onClick={() => handleCancel(order._id, false)} variant="outline" className="flex-1 font-bold uppercase italic border-2 rounded-xl h-full">Ignore</Button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-3 w-full h-14">
                  {order.status === 'placed' && (
                    <Button onClick={() => updateStatus(order._id, 'accepted')} className="flex-1 bg-indigo-600 hover:bg-slate-950 font-black uppercase italic tracking-widest rounded-xl shadow-xl shadow-indigo-200 transition-all active:scale-95 h-full">
                      <ChefHat size={20} className="mr-3" /> Start Cooking
                    </Button>
                  )}
                  {order.status === 'accepted' && (
                    <Button onClick={() => updateStatus(order._id, 'preparing')} className="flex-1 bg-indigo-600 hover:bg-slate-950 font-black uppercase italic tracking-widest rounded-xl transition-all h-full">Preparing...</Button>
                  )}
                  {order.status === 'preparing' && (
                    <Button onClick={() => updateStatus(order._id, 'ready')} className="flex-1 bg-green-600 hover:bg-green-700 font-black uppercase italic tracking-widest border-none text-white rounded-xl shadow-xl shadow-green-200 transition-all h-full">
                      <CheckSquare size={20} className="mr-3" /> Order Ready!
                    </Button>
                  )}
                  {order.status === 'ready' && (
                    <p className="text-center w-full text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2 italic animate-pulse">Waiting for Waiter Pickup...</p>
                  )}
                </div>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
