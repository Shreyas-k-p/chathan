'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { LogIn, Waves, Utensils } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { setUser } = useAuthStore();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // 🧪 SaaS Matrix Authentication Protocol
    const mockCredentials: Record<string, { name: string; role: any; password: string; restaurantId?: string }> = {
      'shreyas5710kp@gmail.com': { name: 'Shreyas', role: 'SUPER_ADMIN', password: 'shreyas5710' },
      'manager@scan4serve.com': { name: 'Sanjay Malik', role: 'MANAGER', password: 'manager123', restaurantId: 'r1' },
      'waiter@scan4serve.com': { name: 'Waiter Node', role: 'WAITER', password: 'waiter123', restaurantId: 'r1' },
      'kitchen@scan4serve.com': { name: 'Kitchen Node', role: 'KITCHEN', password: 'kitchen123', restaurantId: 'r1' }
    };

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await axios.post(`${apiUrl}/auth/login`, { email, password });
      
      const { user, token } = res.data;
      setUser(user);
      useAuthStore.getState().setToken(token);
      localStorage.setItem('scan4serve-auth-token', token);
      
      toast.success(`Matrix Node Sync: Welcome ${user.name} 📡`);
      router.push('/dashboard');
    } catch (err: any) {
      // Fallback for isolated dev nodes
      const mock = mockCredentials[email];
      if (mock && mock.password === password) {
          const fakeUser = { _id: 'dev-node-01', ...mock, token: 'dev-token-999' };
          setUser(fakeUser as any);
          useAuthStore.getState().setToken('dev-token-999');
          toast.info("Dev Local Sync Active (Mock Node)");
          router.push('/dashboard');
          return;
      }
      toast.error(err.response?.data?.error || 'Registry Authentication Failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-[#0a0a0a] overflow-hidden group">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity duration-1000">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-700 rounded-full blur-[150px] animate-pulse delay-75" />
      </div>

      <Card className="z-10 w-[440px] border-none shadow-2xl bg-[#111111]/80 backdrop-blur-3xl ring-1 ring-white/10 group-hover:ring-white/20 transition-all duration-500 rounded-[2.5rem] p-4">
        <CardHeader className="p-10 pb-6 text-center">
          <div className="mx-auto w-16 h-16 bg-white text-black rounded-3xl flex items-center justify-center font-black text-3xl mb-8 transform hover:rotate-12 transition-transform shadow-2xl shadow-indigo-500/20">
            S
          </div>
          <CardTitle className="text-4xl font-black text-white tracking-tighter uppercase italic drop-shadow-md">Scan4Serve</CardTitle>
          <CardDescription className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em] mt-3 italic">Staff Management Console</CardDescription>
        </CardHeader>
        <CardContent className="p-10 pt-0">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2 group/input">
              <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest pl-1 group-hover/input:text-indigo-400 transition-colors italic">Registry Email</label>
              <Input 
                type="email" 
                placeholder="shreyas5710kp@gmail.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-[#181818] border-none text-white h-16 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 shadow-inner px-6 text-sm font-bold transition-all placeholder:text-slate-700"
              />
            </div>
            <div className="space-y-2 group/input">
              <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest pl-1 group-hover/input:text-indigo-400 transition-colors italic">Vault Password</label>
              <Input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-[#181818] border-none text-white h-16 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 shadow-inner px-6 text-sm font-bold transition-all placeholder:text-slate-700"
              />
            </div>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full h-16 bg-white hover:bg-slate-200 text-black font-black text-lg shadow-2xl shadow-white/5 active:scale-95 transition-all rounded-2xl uppercase tracking-[0.2em] italic group"
            >
              {isLoading ? 'Authenticating...' : (
                <div className="flex items-center gap-3">
                  <LogIn size={22} className="group-hover:translate-x-1 transition-transform" />
                  <span>Secure Sign In</span>
                </div>
              )}
            </Button>
          </form>
          
          <div className="mt-10 pt-8 border-t border-white/5 text-center">
            <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest italic drop-shadow-sm">Scan4Serve Platform Performance Optimized v4.2</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
