'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { ShoppingBag, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function OrdersPage() {
  const [orders, setOrders] = useState([
    { _id: '1', tableId: 'T01', totalAmount: 450, status: 'placed', createdAt: new Date().toISOString() },
    { _id: '2', tableId: 'T04', totalAmount: 1200, status: 'preparing', createdAt: new Date().toISOString() },
    { _id: '3', tableId: 'T02', totalAmount: 850, status: 'ready', createdAt: new Date().toISOString() },
    { _id: '4', tableId: 'T05', totalAmount: 320, status: 'served', createdAt: new Date().toISOString() },
  ]);

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <header className="border-b border-border pb-8">
        <h1 className="text-4xl font-black text-foreground tracking-tighter uppercase italic">Live Orders</h1>
        <p className="text-muted-foreground font-bold uppercase text-[10px] tracking-[0.3em] mt-2 italic">Real-time Fulfillment Tracking</p>
      </header>

      <Card className="border-none shadow-2xl bg-card text-card-foreground ring-1 ring-border rounded-[2rem] overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="border-none">
              <TableHead className="font-black uppercase text-[10px] tracking-widest text-muted-foreground italic py-6 pl-8">Order ID</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-widest text-muted-foreground italic py-6">Table</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-widest text-muted-foreground italic py-6">Status</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-widest text-muted-foreground italic py-6 text-right pr-8">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order._id} className="border-none hover:bg-accent transition-colors">
                <TableCell className="font-bold py-6 pl-8">#ORD-{order._id.padStart(4, '0')}</TableCell>
                <TableCell className="font-black italic text-indigo-500">{order.tableId}</TableCell>
                <TableCell>
                  <Badge className={`uppercase font-black text-[10px] italic px-3 py-1 ${
                    order.status === 'placed' ? 'bg-blue-500/10 text-blue-500' :
                    order.status === 'preparing' ? 'bg-amber-500/10 text-amber-500' :
                    order.status === 'ready' ? 'bg-indigo-500/10 text-indigo-500' :
                    'bg-emerald-500/10 text-emerald-500'
                  }`}>
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-black text-lg pr-8 italic">₹{order.totalAmount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
