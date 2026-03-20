'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useOrderStore } from '@/store/useOrderStore';
import { ShoppingCart, Utensils, Search, Plus, Minus, X, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from '@/components/ui/sheet';
import { toast } from 'sonner';

export default function OrderPage({ searchParams }: { searchParams: { restaurantId: string; tableId: string } }) {
  const { restaurantId, tableId } = searchParams;
  const { cart, addItem, removeItem, updateQty, setTable, currentOrder, setOrder } = useOrderStore();
  const [menu, setMenu] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (restaurantId && tableId) {
      setTable(restaurantId, tableId);
      const fetchData = async () => {
        try {
          const [menuRes, catRes] = await Promise.all([
            axios.get(`http://localhost:5000/api/v1/menu/items?restaurantId=${restaurantId}`),
            axios.get(`http://localhost:5000/api/v1/menu/categories?restaurantId=${restaurantId}`)
          ]);
          setMenu(menuRes.data.data);
          setCategories(catRes.data.data);
        } catch (err) {
          toast.error('Failed to load menu. Please scan QR again.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [restaurantId, tableId, setTable]);

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const placeOrder = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/v1/orders', {
        restaurantId,
        tableId,
        items: cart,
        customerMetadata: { customerName: 'Table Guest' }
      });
      setOrder(res.data.data);
      toast.success('Order placed successfully! 🍽️');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Order failed');
    }
  };

  const requestCancel = async () => {
    try {
      const res = await axios.post(`http://localhost:5000/api/v1/orders/request-cancel/${currentOrder._id}`);
      setOrder(res.data.data);
      toast.info(res.data.message);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Cancel request failed');
    }
  };

  const filteredMenu = activeCategory === 'all' ? menu : menu.filter(i => i.categoryId === activeCategory);

  if (isLoading) return <div className="flex h-screen items-center justify-center font-bold text-slate-400">Scan4Serve: Loading Menu...</div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Dynamic Header */}
      <header className="sticky top-0 bg-white shadow-sm z-50 px-6 py-4 flex justify-between items-center border-b border-indigo-100">
        <h1 className="text-xl font-black text-indigo-600 tracking-tighter uppercase italic">Scan4Serve</h1>
        <Badge variant="outline" className="bg-indigo-50 border-indigo-200 text-indigo-700 font-bold px-3 py-1">Table {tableId}</Badge>
      </header>

      {/* Category Pills */}
      <div className="flex gap-3 overflow-x-auto px-6 py-6 no-scrollbar sticky top-[64px] bg-slate-50/80 backdrop-blur-md z-40 border-b border-slate-200/50">
        <Button 
          variant={activeCategory === 'all' ? 'default' : 'outline'} 
          className="rounded-full shadow-sm"
          onClick={() => setActiveCategory('all')}
        >All</Button>
        {categories.map(c => (
          <Button 
            key={c._id} 
            variant={activeCategory === c._id ? 'default' : 'outline'} 
            className="rounded-full shadow-sm whitespace-nowrap"
            onClick={() => setActiveCategory(c._id)}
          >{c.name}</Button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="px-6 space-y-4 max-w-2xl mx-auto py-4">
        {filteredMenu.map(item => (
          <Card key={item._id} className="overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300 group ring-1 ring-slate-200">
            <CardContent className="p-0 flex items-center h-[120px]">
              <div className="w-[120px] h-full bg-slate-200 relative overflow-hidden group-hover:scale-105 transition-transform">
                {item.imageUrl && <img src={item.imageUrl} alt={item.name} className="object-cover w-full h-full" />}
              </div>
              <div className="flex-1 p-4 flex flex-col justify-between h-full">
                <div>
                  <h3 className="font-bold text-slate-800 text-lg group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{item.name}</h3>
                  <p className="text-xs text-slate-500 line-clamp-1 italic">{item.description}</p>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xl font-black text-slate-900">${item.price.toFixed(2)}</span>
                  <Button 
                    size="icon" 
                    className="rounded-full bg-indigo-600 hover:bg-slate-950 shadow-lg"
                    onClick={() => addItem({ menuItemId: item._id, name: item.name, quantity: 1, price: item.price })}
                  >
                    <Plus size={20} />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Cart & Order Status Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/90 backdrop-blur-xl border-t border-indigo-100 z-[100] shadow-2xl">
        <div className="max-w-2xl mx-auto">
          {currentOrder ? (
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-black text-slate-400">Order Status</span>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-indigo-500 animate-pulse" />
                  <span className="font-bold text-slate-800 uppercase tracking-tighter">{currentOrder.status}</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                {currentOrder.status === 'placed' ? (
                  <Button variant="destructive" onClick={requestCancel} className="font-bold shadow-lg shadow-red-200 uppercase tracking-tight">Cancel Order</Button>
                ) : currentOrder.status === 'accepted' ? (
                  <Button variant="default" onClick={requestCancel} disabled={currentOrder.cancelRequested} className="bg-slate-900 font-bold uppercase tracking-tight">
                    {currentOrder.cancelRequested ? 'Cancel Pending' : 'Request Cancel'}
                  </Button>
                ) : (
                  <Badge className="bg-slate-100 text-slate-500 hover:bg-slate-100 border-none font-black uppercase text-[10px]">Preparation Started</Badge>
                )}
              </div>
            </div>
          ) : (
            <Sheet>
              <SheetTrigger render={
                <Button className="w-full bg-indigo-600 hover:bg-slate-950 h-16 text-lg font-black shadow-2xl shadow-indigo-300 transition-all active:scale-95 flex justify-between px-8 uppercase tracking-widest rounded-2xl">
                  <div className="flex items-center gap-3">
                    <ShoppingCart size={24} />
                    <span>Review {cart.length} items</span>
                  </div>
                  <span className="text-2xl">${total.toFixed(2)}</span>
                </Button>
              } />
              <SheetContent side="bottom" className="rounded-t-3xl border-none shadow-2xl h-[70vh] bg-slate-50">
                <SheetHeader className="pb-6 border-b border-indigo-100">
                  <SheetTitle className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">Your Selections</SheetTitle>
                </SheetHeader>
                <div className="py-8 space-y-6 max-h-[40vh] overflow-y-auto pr-2">
                  {cart.map(item => (
                    <div key={item.menuItemId} className="flex justify-between items-center group">
                      <div>
                        <p className="font-bold text-slate-800 uppercase tracking-tight group-hover:text-indigo-600 transition-colors uppercase">{item.name}</p>
                        <p className="text-sm text-slate-500 font-medium">${item.price.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-4 bg-white p-2 rounded-xl border border-slate-200 shadow-sm ring-1 ring-slate-100">
                        <Button variant="ghost" size="icon" onClick={() => updateQty(item.menuItemId, item.quantity - 1)} className="rounded-full hover:bg-slate-100 h-8 w-8"><Minus size={14} /></Button>
                        <span className="font-black text-lg text-indigo-600">{item.quantity}</span>
                        <Button variant="ghost" size="icon" onClick={() => updateQty(item.menuItemId, item.quantity + 1)} className="rounded-full hover:bg-slate-100 h-8 w-8"><Plus size={14} /></Button>
                      </div>
                    </div>
                  ))}
                </div>
                <SheetFooter className="mt-auto border-t border-indigo-100 pt-8 space-y-4">
                  <div className="flex justify-between text-2xl font-black text-slate-900 tracking-tighter italic uppercase">
                    <span>Total Estimate</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <Button onClick={placeOrder} className="w-full h-16 text-xl font-black bg-indigo-600 hover:bg-slate-950 rounded-2xl shadow-xl shadow-indigo-300 uppercase tracking-[0.2em] italic">Confirm Order</Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>
    </div>
  );
}
