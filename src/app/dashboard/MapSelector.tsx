'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, CheckCircle2, X } from 'lucide-react';
import { toast } from 'sonner';

interface MapSelectorProps {
  onSelect: (location: string) => void;
  onClose: () => void;
  initialLocation?: string;
}

export default function MapSelector({ onSelect, onClose, initialLocation }: MapSelectorProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [selectedPos, setSelectedPos] = useState<[number, number] | null>(null);
  const [address, setAddress] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Dynamically load Leaflet
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => {
      if (!mapRef.current) return;
      
      const L = (window as any).L;
      const map = L.map(mapRef.current).setView([20.5937, 78.9629], 5); // Default to India

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      let marker: any = null;

      // Reverse geocoding function
      const reverseGeocode = async (lat: number, lng: number) => {
        setLoading(true);
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
          const data = await res.json();
          const addr = data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
          setAddress(addr);
        } catch (e) {
          setAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        } finally {
          setLoading(false);
        }
      };

      map.on('click', (e: any) => {
        const { lat, lng } = e.latlng;
        setSelectedPos([lat, lng]);
        
        if (marker) {
          marker.setLatLng(e.latlng);
        } else {
          marker = L.marker(e.latlng).addTo(map);
        }
        
        reverseGeocode(lat, lng);
      });

      // Try to get user's location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
          const { latitude, longitude } = pos.coords;
          map.setView([latitude, longitude], 13);
        });
      }
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(link);
      document.head.removeChild(script);
    };
  }, []);

  const handleConfirm = () => {
    if (address) {
      onSelect(address);
      onClose();
      toast.success('Location Geocoded Successfully');
    } else {
      toast.error('Please select a point on the matrix');
    }
  };

  return (
    <div className="flex flex-col h-[500px] w-full bg-black rounded-[2rem] overflow-hidden border border-white/10 animate-in zoom-in-95 duration-300">
      <div className="p-6 border-b border-white/10 flex justify-between items-center bg-zinc-900/50">
        <div>
          <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Geometric Selector</h3>
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mt-1 italic">Scan the matrix for operational coordinates</p>
        </div>
        <Button size="icon" variant="ghost" className="rounded-full text-zinc-500 hover:text-white" onClick={onClose}><X size={20}/></Button>
      </div>

      <div className="flex-1 relative">
         <div ref={mapRef} className="absolute inset-0 z-10" />
         {!selectedPos && (
             <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                 <div className="bg-black/60 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 flex items-center gap-3 animate-pulse">
                     <MapPin size={16} className="text-indigo-400" />
                     <span className="text-[10px] font-black text-white uppercase tracking-widest italic">Click to anchor Node location</span>
                 </div>
             </div>
         )}
      </div>

      <div className="p-6 bg-zinc-900/80 backdrop-blur-xl border-t border-white/10 space-y-4">
        <div className="flex items-start gap-4 p-4 bg-black/40 rounded-2xl border border-white/5 min-h-[60px]">
          <div className="mt-1"><Navigation size={18} className="text-indigo-500" /></div>
          <div className="flex-1 min-w-0">
             <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest italic mb-1">Resolved Sequence</p>
             <p className="text-xs font-bold text-white uppercase italic truncate">
                {loading ? 'Decrypting location...' : (address || 'Node coordinates not established')}
             </p>
          </div>
        </div>
        <Button 
          disabled={!address || loading} 
          onClick={handleConfirm}
          className="w-full h-14 bg-white text-black hover:bg-zinc-200 font-black uppercase italic tracking-widest rounded-xl transition-all active:scale-95 shadow-2xl shadow-white/5 flex items-center gap-3"
        >
          <CheckCircle2 size={18} /> Confirm Entry Matrix
        </Button>
      </div>
    </div>
  );
}
