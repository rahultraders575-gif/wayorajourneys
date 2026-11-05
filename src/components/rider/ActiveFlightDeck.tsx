import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Booking, RiderSavedAddress } from '../../types';
import {
  Navigation, Phone, MessageSquare, ShieldCheck, Clock, 
  MapPin, Car, KeyRound, ArrowRight, Star, RefreshCw, 
  Compass, AlertCircle, CheckCircle2, ChevronRight, Copy, Check
} from 'lucide-react';

interface ActiveFlightDeckProps {
  activeBooking: Booking | null;
  savedAddresses: RiderSavedAddress[];
  onNavigateToBooking: (details?: any) => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const ActiveFlightDeck: React.FC<ActiveFlightDeckProps> = ({
  activeBooking,
  savedAddresses,
  onNavigateToBooking,
  showToast,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const carMarkerRef = useRef<L.Marker | null>(null);

  // Quick Re-Book Tab State
  const [quickTripType, setQuickTripType] = useState<'Round-Trip' | 'One-Way Drop' | 'Airport Transfer' | 'Hourly Rental'>('Round-Trip');
  const [selectedFromAddress, setSelectedFromAddress] = useState(savedAddresses[0]?.address || 'Road No. 12, Banjara Hills, Hyderabad');
  const [destinationInput, setDestinationInput] = useState('Tirupati, Andhra Pradesh');
  const [selectedVehicleTier, setSelectedVehicleTier] = useState<'sedan' | 'innova' | 'fortuner'>('innova');
  const [copiedOtp, setCopiedOtp] = useState(false);

  // Simulated live moving car coordinates along Hyderabad -> Tirupati Highway (NH44)
  const [carCoords, setCarCoords] = useState<{ lat: number; lng: number }>({
    lat: 17.3850,
    lng: 78.4867,
  });
  const [liveSpeed, setLiveSpeed] = useState(62);
  const [etaMinutes, setEtaMinutes] = useState(14);

  // 4-Digit Security OTP for active trip verification
  const startTripOtp = '5892';

  // Chauffeur details for active flight
  const chauffeur = {
    name: activeBooking?.assignedDriver || 'Raju Goud',
    phone: '+91 98480 12345',
    rating: 4.94,
    tripsCount: 428,
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    carModel: activeBooking?.vehicleName || 'Toyota Innova Crysta Luxury',
    carNumber: activeBooking?.assignedCarNumber || 'TS 09 UB 4421',
  };

  // 1. Initialize and render Leaflet live radar map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [17.3850, 78.4867],
        zoom: 12,
        scrollWheelZoom: true,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        maxZoom: 19,
      }).addTo(map);

      // Moving Car Marker
      const carIconHtml = `
        <div style="position: relative; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; inset: -4px; border-radius: 9999px; background: #dc2626; opacity: 0.35; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="width: 34px; height: 34px; border-radius: 9999px; background: #dc2626; border: 2.5px solid #ffffff; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3); display: flex; align-items: center; justify-content: center; color: white;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C2.1 10.8 2 11 2 11.2V16c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>
          </div>
        </div>
      `;

      const carIcon = L.divIcon({
        className: 'rider-live-car',
        html: carIconHtml,
        iconSize: [38, 38],
        iconAnchor: [19, 19],
      });

      const marker = L.marker([17.3850, 78.4867], { icon: carIcon }).addTo(map);
      marker.bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px; padding: 2px;">
          <b style="color: #b91c1c;">${chauffeur.carNumber}</b><br/>
          <span>Captain: ${chauffeur.name}</span><br/>
          <span>Speed: 62 km/h · ETA: 14 mins</span>
        </div>
      `);

      carMarkerRef.current = marker;
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Simulate vehicle telemetry movement tick
  useEffect(() => {
    const interval = setInterval(() => {
      setCarCoords((prev) => {
        const nextLat = prev.lat + (Math.random() - 0.48) * 0.003;
        const nextLng = prev.lng + (Math.random() - 0.48) * 0.003;
        if (carMarkerRef.current && mapInstanceRef.current) {
          carMarkerRef.current.setLatLng([nextLat, nextLng]);
        }
        return { lat: nextLat, lng: nextLng };
      });
      setLiveSpeed(Math.floor(58 + Math.random() * 8));
      setEtaMinutes((prev) => Math.max(1, prev > 1 ? prev - (Math.random() > 0.7 ? 1 : 0) : 1));
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleCopyOtp = () => {
    navigator.clipboard.writeText(startTripOtp);
    setCopiedOtp(true);
    showToast(`Trip Verification OTP ${startTripOtp} copied`, 'success');
    setTimeout(() => setCopiedOtp(false), 2000);
  };

  // Quick Fare Calculations
  const fareEstimates = {
    sedan: { rate: 13, base: 2200, toll: 450, total: 2650 },
    innova: { rate: 19, base: 3500, toll: 680, total: 4180 },
    fortuner: { rate: 28, base: 5500, toll: 680, total: 6180 },
  };

  return (
    <div className="space-y-6">

      {/* SECTION 1: ACTIVE RIDE FLIGHT-DECK */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] uppercase font-extrabold tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Live Flight-Deck Active
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight mt-1">
              {activeBooking ? `Trip #${activeBooking.id}: ${activeBooking.destination}` : 'Active Chauffeur Escort to Tirupati'}
            </h2>
            <p className="text-xs text-slate-500">
              Live GPS tracking · {activeBooking?.pickupLocation || 'Banjara Hills, Hyderabad'} ➔ {activeBooking?.destination || 'Tirupati Tirumala VIP Darshan'}
            </p>
          </div>

          {/* Dynamic ETA Pill */}
          <div className="bg-gradient-to-r from-red-600 to-rose-600 text-white px-4 py-2 rounded-2xl shadow-md shadow-red-600/20 text-right">
            <span className="text-[10px] uppercase font-bold text-rose-100 block tracking-wider">Dynamic ETA</span>
            <div className="text-lg font-black tracking-tight">{etaMinutes} Mins to Pickup</div>
          </div>
        </div>

        {/* 2-COLUMN LAYOUT: RADAR MAP + CHAUFFEUR BOARDING CARD */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT: LEAFLET LIVE MOVEMENT MAP */}
          <div className="lg:col-span-2 relative rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
            <div ref={mapContainerRef} className="w-full h-[360px] z-10" />

            {/* Live Movement Telemetry HUD */}
            <div className="absolute top-3 left-3 z-20 bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-slate-200 shadow-md text-xs space-y-1">
              <div className="font-extrabold text-slate-900 flex items-center gap-1.5 border-b pb-1">
                <Compass className="w-3.5 h-3.5 text-red-600 animate-spin" />
                <span>Highway Radar Telemetry</span>
              </div>
              <div className="flex gap-4 pt-1 text-[11px]">
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Speed</span>
                  <span className="font-black text-slate-900">{liveSpeed} km/h</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Transit Status</span>
                  <span className="font-extrabold text-emerald-600">On Track</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Corridor</span>
                  <span className="font-bold text-slate-800">NH44 Highway</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: CHAUFFEUR BOARDING & START OTP CARD */}
          <div className="space-y-4 flex flex-col justify-between">
            {/* 4-Digit Boarding OTP Box */}
            <div className="bg-gradient-to-br from-red-50 via-rose-50 to-orange-50 p-4 rounded-2xl border border-red-200 shadow-2xs space-y-2 text-center">
              <div className="flex items-center justify-center gap-1.5 text-red-700 text-xs font-bold">
                <KeyRound className="w-4 h-4 text-red-600" />
                <span>Boarding Verification OTP</span>
              </div>
              <div className="text-3xl font-mono font-black tracking-widest text-slate-900 bg-white py-2 rounded-xl border border-red-200 shadow-inner">
                {startTripOtp}
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-600 px-1">
                <span>Share with chauffeur when entering car</span>
                <button
                  type="button"
                  onClick={handleCopyOtp}
                  className="font-bold text-red-600 hover:text-red-700 cursor-pointer flex items-center gap-1"
                >
                  {copiedOtp ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedOtp ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Chauffeur Card */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 text-xs">
              <div className="flex items-center gap-3">
                <img
                  src={chauffeur.photoUrl}
                  alt={chauffeur.name}
                  className="w-12 h-12 rounded-2xl object-cover ring-2 ring-white shadow-md"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-black text-slate-900 text-sm">{chauffeur.name}</h4>
                    <span title="Wayora Verified Chauffeur" className="inline-flex">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                    <span className="font-bold text-amber-600 flex items-center gap-0.5">
                      <Star className="w-3 h-3 fill-current" /> {chauffeur.rating}
                    </span>
                    <span>·</span>
                    <span>{chauffeur.tripsCount} Highway Trips</span>
                  </div>
                </div>
              </div>

              {/* Vehicle Badge */}
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 space-y-0.5">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Assigned Vehicle</span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    Chilled AC Cabin
                  </span>
                </div>
                <div className="font-extrabold text-slate-900 text-xs">{chauffeur.carModel}</div>
                <div className="font-mono font-bold text-red-600 text-xs">{chauffeur.carNumber}</div>
              </div>

              {/* Direct Masked Calling & Chat Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <a
                  href={`tel:${chauffeur.phone}`}
                  className="py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl font-bold flex items-center justify-center gap-1.5 text-xs transition-all shadow-xs"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Call Captain</span>
                </a>
                <a
                  href={`https://wa.me/919182471876?text=${encodeURIComponent(`Hi Captain ${chauffeur.name}, I am waiting at the pickup location.`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 text-xs transition-all shadow-xs"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: QUICK RE-BOOK & SCHEDULER */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-5">
        <div>
          <h3 className="text-base font-black text-slate-900">Quick Re-Book & Outstation Trip Scheduler</h3>
          <p className="text-xs text-slate-500">
            Rapid booking shortcuts with saved addresses, live fare preview, and instant chauffeur dispatch.
          </p>
        </div>

        {/* Tabbed Trip Types */}
        <div className="flex flex-wrap gap-2 text-xs font-bold border-b pb-3">
          {(['Round-Trip', 'One-Way Drop', 'Airport Transfer', 'Hourly Rental'] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setQuickTripType(type)}
              className={`px-4 py-2 rounded-xl cursor-pointer transition-all ${
                quickTripType === type
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Saved Address Shortcuts */}
        <div className="space-y-2">
          <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">
            Saved Address Shortcuts:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {savedAddresses.map((addr) => (
              <button
                key={addr.id}
                type="button"
                onClick={() => {
                  setSelectedFromAddress(addr.address);
                  showToast(`Pickup set to ${addr.label}`, 'info');
                }}
                className={`p-3 rounded-2xl border text-left cursor-pointer transition-all text-xs ${
                  selectedFromAddress === addr.address
                    ? 'border-red-600 bg-red-50/40 text-red-700 ring-1 ring-red-500/20'
                    : 'border-slate-200 bg-slate-50/70 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  <MapPin className="w-3.5 h-3.5 text-red-600" />
                  <span>{addr.label}</span>
                </div>
                <p className="text-[10px] text-slate-500 truncate">{addr.address}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Fare Preview & Quick Book Trigger */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
          <div className="space-y-1">
            <span className="font-extrabold text-slate-900 block">
              Estimated Total Fare: <b className="text-red-700 text-sm">₹{fareEstimates[selectedVehicleTier].total.toLocaleString()}</b>
            </span>
            <p className="text-[11px] text-slate-500">
              Includes ₹{fareEstimates[selectedVehicleTier].base} base fare, 5% GST, ₹{fareEstimates[selectedVehicleTier].toll} FASTag highway toll & night allowance.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigateToBooking({ fromCity: selectedFromAddress, toCity: destinationInput, tripType: quickTripType })}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-red-600/25 cursor-pointer whitespace-nowrap"
          >
            <span>Proceed with {quickTripType}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
};
