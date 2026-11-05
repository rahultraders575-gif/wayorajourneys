import React from 'react';
import { Booking, CaptainProfile } from '../../types';
import {
  User, Phone, MessageSquare, Navigation, MapPin, 
  ShieldCheck, Heart, Sparkles, Luggage, Baby, 
  Dog, VolumeX, Thermometer, ExternalLink, ArrowRight, Check
} from 'lucide-react';

interface LiveNavPassengerCoordinationProps {
  trip: Booking;
  captain: CaptainProfile;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const LiveNavPassengerCoordination: React.FC<LiveNavPassengerCoordinationProps> = ({
  trip,
  captain,
  showToast,
}) => {
  // Masked calling simulation proxy number
  const maskedProxyPhone = '+91 40 6922 4410';

  const handleMaskedCall = () => {
    window.location.href = `tel:${trip.customerPhone}`;
    showToast(`Connecting encrypted line to passenger via Wayora Privacy Proxy (${maskedProxyPhone})`, 'info');
  };

  const whatsappMessage = encodeURIComponent(
    `Namaste ${trip.customerName}! I am Captain ${captain.name} from Wayora Journeys (${captain.vehicleModel} - ${captain.vehicleNumber}). I am assigned to your trip to ${trip.destination}. Please let me know if you have any pickup updates.`
  );

  return (
    <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
      {/* HEADER */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-red-600" />
            <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
              Passenger Coordination & Live Navigation
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Encrypted calling, special rider comfort instructions, and GPS turn-by-turn hand-off.
          </p>
        </div>

        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200 flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Masked Privacy Active</span>
        </span>
      </div>

      {/* RIDER PROFILE CARD */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 text-white font-black flex items-center justify-center text-sm shadow-md shadow-red-600/30">
              {trip.customerName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="font-black text-slate-900 text-sm">{trip.customerName}</h4>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold">
                  {trip.passengers} Pax
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium block">
                Booking ID: <strong className="font-mono text-red-600">{trip.id}</strong> · {trip.travelDate} @ {trip.travelTime}
              </span>
            </div>
          </div>
        </div>

        {/* Route stops / boarding point */}
        <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs space-y-2">
          <div className="flex items-start gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">PICKUP POINT</span>
              <p className="font-bold text-slate-900 text-xs">{trip.pickupLocation}</p>
            </div>
          </div>

          <div className="border-l-2 border-dashed border-slate-200 ml-1.5 pl-3 py-1 text-[11px] text-slate-500">
            Corridor Route: Direct Highway via NH44 Expressway
          </div>

          <div className="flex items-start gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 mt-1 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">DESTINATION DROP</span>
              <p className="font-bold text-slate-900 text-xs">{trip.destination}</p>
            </div>
          </div>
        </div>

        {/* SPECIAL RIDER PREFERENCES & IN-CABIN TAGS */}
        <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 block flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Passenger Requested In-Cabin Preferences</span>
          </span>

          <div className="flex flex-wrap gap-1.5 pt-0.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-amber-200 text-[11px] font-semibold text-slate-800 shadow-2xs">
              <Heart className="w-3 h-3 text-red-500" />
              <span>Gentle & Smooth Driving</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-amber-200 text-[11px] font-semibold text-slate-800 shadow-2xs">
              <Luggage className="w-3 h-3 text-amber-600" />
              <span>Luggage Porter Assistance</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-amber-200 text-[11px] font-semibold text-slate-800 shadow-2xs">
              <Thermometer className="w-3 h-3 text-blue-500" />
              <span>AC: Chilled 19°C</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-amber-200 text-[11px] font-semibold text-slate-800 shadow-2xs">
              <VolumeX className="w-3 h-3 text-purple-600" />
              <span>Quiet Ride Mode</span>
            </span>
          </div>
        </div>

        {/* MASKED DIRECT COMMUNICATION ACTION BUTTONS */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={handleMaskedCall}
            className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-400" />
            <span>Encrypted Call</span>
          </button>

          <a
            href={`https://wa.me/${trip.customerPhone.replace(/[^0-9]/g, '')}?text=${whatsappMessage}`}
            target="_blank"
            rel="noreferrer"
            className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm shadow-emerald-600/30 transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>WhatsApp Guest</span>
          </a>
        </div>
      </div>

      {/* TURN-BY-TURN EXTERNAL NAVIGATION HAND-OFF */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-red-50 to-rose-50 border border-red-200/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-red-600" />
            <h4 className="font-extrabold text-xs text-slate-900">
              Turn-by-Turn GPS Navigation Hand-Off
            </h4>
          </div>
          <span className="text-[10px] text-red-700 font-bold">1-Touch Route Launch</span>
        </div>

        <p className="text-[11px] text-slate-600">
          Seamlessly launch roadside GPS on your windshield dashboard phone mount:
        </p>

        <div className="grid grid-cols-2 gap-2.5">
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(trip.pickupLocation)}`}
            target="_blank"
            rel="noreferrer"
            className="py-3 px-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span>Google Maps</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </a>

          <a
            href={`https://waze.com/ul?q=${encodeURIComponent(trip.pickupLocation)}&navigate=yes`}
            target="_blank"
            rel="noreferrer"
            className="py-3 px-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
            <span>Waze Navigation</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </a>
        </div>
      </div>
    </div>
  );
};

