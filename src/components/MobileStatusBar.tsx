import React from 'react';
import { useCms } from '../context/CmsContext';
import { Phone, MapPin } from 'lucide-react';

export const MobileStatusBar: React.FC = () => {
  const { userLocation, settings } = useCms();

  return (
    <div className="bg-slate-950 text-slate-300 border-b border-slate-800/60 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5 flex items-center justify-between text-[11px] sm:text-xs">
        
        {/* Left: Minimal trust note */}
        <div className="flex items-center gap-2 truncate">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
          <span className="text-slate-300 font-medium truncate">
            All-Inclusive Chauffeur Tariffs · Tolls & State Taxes Included
          </span>
        </div>

        {/* Right: Clean location & 24/7 Hotline */}
        <div className="flex items-center gap-4 shrink-0">
          <span className="hidden md:inline-flex items-center gap-1 text-slate-400">
            <MapPin className="w-3 h-3 text-red-400" />
            <span className="text-slate-300">{userLocation}</span>
          </span>
          <a
            href={`tel:${settings.phone}`}
            className="text-red-400 hover:text-red-300 font-semibold transition-colors flex items-center gap-1"
          >
            <Phone className="w-3 h-3" />
            <span>24/7 Hotline: {settings.phone}</span>
          </a>
        </div>

      </div>
    </div>
  );
};
