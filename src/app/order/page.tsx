'use client';

import React, { useState, useEffect, use, useRef } from 'react';
import axios from 'axios';
import { useOrderStore } from '@/store/useOrderStore';
import { useRestaurantStore, playAlertSound } from '@/store/useRestaurantStore';
import { ShoppingCart, Utensils, Search, Plus, Minus, X, CheckCircle, Clock, Wifi, WifiOff, Star, Zap, Cake, Gift, Heart, Info, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from '@/components/ui/sheet';
import { toast } from 'sonner';

export default function OrderPage({ searchParams }: { searchParams: { restaurantId: string; tableId: string } }) {
  const { restaurantId, tableId } = searchParams;
  const { cart, addItem, clearCart, updateQty, updateInstructions, setTable, currentOrder, setOrder, specialEvent, setSpecialEvent } = useOrderStore();
  const { menuItems, orders, addOrder, cancelOrder, syncMatrix } = useRestaurantStore();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Live Order Listener to detect Kitchen modifications
  const liveOrder = orders.find(o => o._id === currentOrder?._id);
  const prevItemsCount = useRef(liveOrder?.items.length || 0);

  useEffect(() => {
    if (liveOrder && liveOrder.items.length < prevItemsCount.current) {
        // Item was removed by Kitchen (Sold Out)
        toast.error('GUEST NODE ALERT: Food Items Sold Out', {
            description: 'The kitchen has removed an unavailable item from your mission. Total valuation adjusted.',
            duration: 10000,
        });
        playAlertSound();
    }
    prevItemsCount.current = liveOrder?.items.length || 0;
  }, [liveOrder?.items.length]);

  useEffect(() => {
    syncMatrix();
    if (restaurantId && tableId) {
      setTable(restaurantId, tableId);
    }
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, [restaurantId, tableId, setTable]);

  const filteredMenu = menuItems.filter(i => !i.restaurantId || i.restaurantId === restaurantId);
  const categories = ['all', ...Array.from(new Set(filteredMenu.map(i => i.category)))];
  const displayedItems = activeCategory === 'all' ? filteredMenu : filteredMenu.filter(i => i.category === activeCategory);

  const total = cart.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

  // Real-time synchronization with Backend Matrix
  useEffect(() => {
    if (!currentOrder?._id) return;

    const syncInterval = setInterval(async () => {
      try {
        const res = await fetch(`http://localhost:5000/order/${currentOrder._id}`);
        const data = await res.json();
        
        if (data && data.status !== currentOrder?.status) {
          // Status has evolved in the Cloud Matrix
          setOrder(data);
          toast.info(`NODE TRANSITION: Order is now [${data.status}]`);
        }
      } catch (err) {
        console.error("Matrix Sync Error:", err);
      }
    }, 4000); // Poll for node status transitions

    return () => clearInterval(syncInterval);
  }, [currentOrder?._id, currentOrder?.status, setOrder]);

  const placeOrder = async () => {
    if (cart.length === 0) return toast.error('No assets in tray');
    
    try {
      const response = await fetch("http://localhost:5000/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableId: tableId || 'T01',
          items: cart.map(i => ({ name: i.name, quantity: i.quantity, price: i.price, instructions: i.instructions })),
          total: total,
          restaurantId: restaurantId
        })
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.error);

      // Successfully anchored in Matrix
      setOrder(data.order);
      clearCart();
      setIsSheetOpen(false);
      
      toast.success('SYNC: Order Deployed in Matrix', {
        description: 'Linked to Kitchen Hub. Hardware telemetry broadcasted.',
        duration: 5000,
      });
    } catch (err) {
      toast.error('Matrix Synchronization Failure. Check Backend Node.');
    }
  };

  const handleEditOrder = () => {
    if (!currentOrder) return;
    if (currentOrder.status !== 'PLACED') return toast.error('Edit Lock Engagement: Production Active');

    // Load items back to cart
    clearCart();
    currentOrder.items.forEach((item: any) => {
        const menuItem = menuItems.find(mi => mi.name === item.name);
        if (menuItem) {
          addItem({
            menuItemId: menuItem._id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            instructions: item.instructions
          });
        }
    });
    setOrder(null);
    toast.info('Mission re-loaded for editing.');
  };

  const handleCancelOrder = async () => {
    if (!currentOrder) return;
    
    try {
      const response = await fetch(`http://localhost:5000/order/cancel/${currentOrder._id}`, {
        method: "PUT"
      });
      const data = await response.json();
      
      if (data.success) {
        setOrder(null);
        toast.warning('COMMAND ABORTED: Order successfully cancelled across Matrix.');
      } else {
        toast.error(`ABORT FAILED: ${data.error}`);
      }
    } catch (err) {
      toast.error('Matrix Access Failure. System link broken.');
    }
  };

  if (isLoading) return <div className="flex h-screen items-center justify-center bg-[#050505] font-black text-indigo-500 uppercase tracking-widest italic animate-pulse text-2xl">SCAN4SERVE: SYNCING...</div>;

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 pb-32 font-sans overflow-x-hidden md:px-4 lg:px-8">
      <header className="sticky top-0 bg-[#0a0a0a]/80 backdrop-blur-3xl z-50 px-6 md:px-8 py-4 md:py-6 flex justify-between items-center border-b border-white/5 shadow-2xl">
         <div className="flex items-center gap-3 md:gap-4">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-white shadow-2xl">S</div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-white tracking-tighter uppercase italic leading-none">Scan</h1>
              <p className="text-[7px] md:text-[8px] font-black text-indigo-400 uppercase tracking-[0.4em] mt-1 italic">V4.5 HUB</p>
            </div>
        </div>
        <Badge variant="outline" className="bg-zinc-900 border-zinc-800 text-indigo-400 font-black px-3 md:px-4 py-1.5 md:py-2 flex items-center gap-2 italic rounded-full shadow-inner text-[10px]">
           <Zap size={14} fill="currentColor" /> TABLE {tableId || 'DEMO'}
        </Badge>
      </header>

      <div className="flex gap-4 overflow-x-auto px-6 md:px-8 py-4 md:py-6 no-scrollbar sticky top-[68px] md:top-[84px] bg-[#050505]/90 backdrop-blur-xl z-40 border-b border-white/5">
        {categories.map((c) => (
          <Button 
            key={c} 
            variant={activeCategory === c ? 'default' : 'outline'} 
            className={`rounded-xl h-10 px-6 font-black uppercase text-[8px] tracking-widest italic transition-all whitespace-nowrap ${activeCategory === c ? 'bg-white text-black' : 'border-zinc-800 text-zinc-400'}`}
            onClick={() => setActiveCategory(c)}
          >{c === 'all' ? 'Global' : c}</Button>
        ))}
      </div>

      <div className="px-6 md:px-8 space-y-4 md:space-y-6 max-w-2xl mx-auto py-6 md:py-8">
        {displayedItems.map((item: any) => (
          <Card key={item._id} className="border-none shadow-2xl bg-zinc-900/30 backdrop-blur-xl ring-1 ring-white/5 rounded-[1.5rem] overflow-hidden group hover:scale-[1.02] transition-all duration-700 flex flex-col sm:flex-row h-auto sm:h-36 md:h-44 active:scale-95">
            <div className="w-full sm:w-32 md:w-44 h-32 sm:h-full bg-zinc-800 relative overflow-hidden flex-shrink-0">
               <img src={item.imageUrl} alt={item.name} className="object-cover w-full h-full transition-all duration-1000 group-hover:scale-110" />
            </div>
            <CardContent className="p-4 md:p-6 flex-1 flex flex-col justify-between">
              <div className="flex justify-between items-start gap-4">
                  <div className="min-w-0">
                    <h3 className="text-lg md:text-xl font-black text-white tracking-tighter uppercase italic leading-none truncate">{item.name}</h3>
                    <p className="text-[9px] md:text-[10px] text-zinc-500 line-clamp-1 italic font-bold uppercase tracking-tight mt-1">{item.description}</p>
                  </div>
                  <span className="text-xl md:text-2xl font-black text-indigo-400 italic shrink-0">₹{item.price}</span>
              </div>
              <div className="flex justify-end pt-2">
                <Button 
                  size="icon" 
                  className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white hover:bg-zinc-200 text-black shadow-2xl active:scale-90"
                  onClick={() => {
                    addItem({ menuItemId: item._id, name: item.name, quantity: 1, price: item.price });
                    toast.info(`${item.name} Synced.`);
                  }}
                >
                  <Plus size={20} strokeWidth={3} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 md:p-6 bg-[#0a0a0a]/90 backdrop-blur-3xl border-t border-white/5 z-[100] shadow-[0_-20px_100px_rgba(0,0,0,0.8)]">
        <div className="max-w-2xl mx-auto">
          {currentOrder && currentOrder.status !== 'CANCELLED' ? (
            <div className={`flex items-center justify-between p-4 rounded-2xl shadow-2xl transition-all duration-1000 bg-zinc-900 ring-1 ring-white/10`}>
              <div className="flex flex-col gap-1">
                <span className="text-[8px] uppercase font-black text-zinc-600 tracking-[0.4em] italic pl-1">Registry Node</span>
                <div className="flex items-center gap-2">
                  <div className={`w-2 md:w-3 h-2 md:h-3 rounded-full animate-pulse shadow-2xl ${currentOrder.status === 'PLACED' ? 'bg-indigo-500' : currentOrder.status === 'PREPARING' ? 'bg-amber-500' : 'bg-emerald-500 shadow-emerald-500/50'}`} />
                  <span className="font-black text-white uppercase tracking-tighter text-xl md:text-2xl italic drop-shadow-md">{currentOrder.status === 'PLACED' ? 'ORDERED' : currentOrder.status.toUpperCase()}</span>
                </div>
              </div>
              <div className="flex gap-2">
                {currentOrder.status === 'PLACED' && (
                    <>
                        <Button onClick={handleEditOrder} variant="outline" className="bg-indigo-600 border-none text-white font-black h-10 px-4 rounded-xl uppercase italic tracking-widest text-[8px] transition-all flex items-center gap-2 active:scale-95"><Edit size={12}/> Edit</Button>
                        <Button onClick={handleCancelOrder} variant="outline" className="bg-rose-600 border-none text-white font-black h-10 px-4 rounded-xl uppercase italic tracking-widest text-[8px] transition-all flex items-center gap-2 active:scale-95"><Trash2 size={12}/> Cancel</Button>
                    </>
                )}
                <Button onClick={() => setOrder(null)} variant="outline" className="bg-zinc-800 border-zinc-700 text-zinc-400 font-black h-10 px-4 rounded-xl uppercase italic tracking-widest text-[8px] hover:text-white transition-all">Close</Button>
              </div>
            </div>
          ) : (
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger render={<button className="w-full bg-white hover:bg-zinc-200 h-14 md:h-16 text-black shadow-2xl transition-all active:scale-95 flex justify-between items-center px-6 md:px-8 uppercase tracking-widest rounded-xl md:rounded-2xl cursor-pointer group border-none" />}>
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 md:w-9 md:h-9 bg-black rounded-xl flex items-center justify-center text-white relative">
                       <ShoppingCart size={18} className="group-hover:translate-x-1 transition-transform" />
                       <Badge className="absolute -top-2 -right-2 bg-indigo-600 text-white rounded-full w-4 h-4 p-0 flex items-center justify-center font-black text-[8px] border-2 border-white">{cart.length}</Badge>
                    </div>
                    <span className="font-black text-sm md:text-lg italic tracking-tighter">Review Tray</span>
                  </div>
                  <div className="text-lg md:text-2xl font-black italic tracking-tighter">₹{total}</div>
              </SheetTrigger>
              <SheetContent side="bottom" className="rounded-t-[2rem] border-none shadow-[0_-40px_100px_rgba(0,0,0,0.9)] h-auto max-h-[95vh] bg-[#0a0a0a] ring-1 ring-white/10 p-4 md:p-8 flex flex-col no-scrollbar">
                <SheetHeader className="pb-4 border-b border-white/5 flex flex-row justify-between items-center space-y-0 flex-shrink-0">
                  <SheetTitle className="text-xl md:text-3xl font-black text-white tracking-tighter uppercase italic leading-none">Tray Summary</SheetTitle>
                  <Utensils size={24} className="text-indigo-600 opacity-20" />
                </SheetHeader>
                
                <div className="py-4 border-b border-white/5 flex-shrink-0">
                    <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-3 italic px-1">Special Event Mode</p>
                    <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                        {[
                            { id: 'None', icon: Zap },
                            { id: 'Birthday', icon: Cake },
                            { id: 'Anniversary', icon: Heart },
                            { id: 'Party', icon: Gift }
                        ].map((event) => (
                            <Button 
                                key={event.id}
                                onClick={() => setSpecialEvent(event.id)}
                                variant={specialEvent === event.id ? 'default' : 'outline'}
                                className={`rounded-xl h-10 px-4 font-black uppercase text-[8px] tracking-widest italic flex items-center gap-2 transition-all shrink-0 ${specialEvent === event.id ? 'bg-indigo-600 text-white border-transparent' : 'border-zinc-800 text-zinc-500'}`}
                            >
                                <event.icon size={14} /> {event.id}
                            </Button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1 custom-scrollbar min-h-0">
                  {cart.length === 0 ? (
                    <div className="py-20 text-center text-zinc-700 font-black uppercase italic tracking-widest text-[10px]">Registry Empty</div>
                  ) : cart.map((item: any) => (
                    <div key={item.menuItemId} className="p-3 rounded-xl transition-all border border-white/5 bg-zinc-900/40 hover:bg-zinc-800/60 shadow-xl space-y-3">
                      <div className="flex justify-between items-center group/item ">
                        <div className="flex gap-3 items-center min-w-0">
                            <div className="w-10 h-10 bg-white text-black flex items-center justify-center font-black text-base rounded-xl shadow-2xl transition-transform group-hover/item:rotate-6 shrink-0">
                            {item.quantity}
                            </div>
                            <div className="min-w-0">
                            <p className="font-black text-white uppercase italic tracking-tight text-xs group-hover/item:text-indigo-400 transition-colors truncate shadow-sm">{item.name}</p>
                            <p className="text-[9px] font-black text-indigo-400/60 uppercase tracking-widest mt-0.5 italic">₹{item.price * item.quantity}</p>
                            </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                            <Button variant="ghost" size="icon" onClick={() => updateQty(item.menuItemId, item.quantity - 1)} className="rounded-lg bg-zinc-800 hover:bg-rose-500/10 text-zinc-400 hover:text-rose-400 h-8 w-8 border border-white/5 transition-colors"><Minus size={14} /></Button>
                            <Button variant="ghost" size="icon" onClick={() => updateQty(item.menuItemId, item.quantity + 1)} className="rounded-lg bg-zinc-800 hover:bg-emerald-500/10 text-zinc-400 hover:text-emerald-400 h-8 w-8 border border-white/5 transition-colors"><Plus size={14} /></Button>
                        </div>
                      </div>
                      
                      <div className="relative group/inst bg-black/40 border border-white/5 rounded-xl overflow-hidden focus-within:ring-1 focus-within:ring-indigo-500/30 transition-all">
                          <input 
                            type="text"
                            placeholder="Add mission instructions (TAP TO ENTER)..."
                            value={item.instructions || ''}
                            onChange={(e) => updateInstructions(item.menuItemId, e.target.value)}
                            className="w-full h-10 px-4 text-[10px] font-bold text-white italic outline-none placeholder:text-zinc-800 transition-all uppercase tracking-tight shadow-inner"
                          />
                      </div>
                    </div>
                  ))}
                </div>
                
                <SheetFooter className="mt-2 pt-4 border-t border-white/5 flex-shrink-0 flex flex-col gap-4">
                  <div className="flex justify-between items-end px-2">
                    <div>
                      <p className="text-[8px] font-black uppercase text-zinc-500 tracking-[0.4em] italic mb-1">Valuation</p>
                      <span className="text-3xl md:text-5xl font-black text-white italic tracking-tighter drop-shadow-2xl">₹{total}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-2 p-1">
                    <Button 
                      disabled={cart.length === 0} 
                      onClick={placeOrder} 
                      className="w-full h-14 md:h-18 text-base md:text-xl font-black bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl md:rounded-2xl shadow-xl shadow-indigo-600/20 uppercase tracking-[0.1em] italic transition-all active:scale-95 group"
                    >
                      <Zap size={20} fill="currentColor" className="mr-2 group-hover:scale-125 transition-transform" /> COMMAND DEPLOY
                    </Button>
                    <Button variant="ghost" onClick={() => setIsSheetOpen(false)} className="text-[9px] font-black uppercase text-zinc-600 tracking-widest italic h-8">Abort Operation</Button>
                  </div>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>
    </div>
  );
}
