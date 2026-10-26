import React, { useState } from 'react';
import { useCms } from '../context/CmsContext';
import { 
  Calculator, MapPin, Calendar, Clock, Car, ArrowRight, 
  MessageSquare, CheckCircle2, ShieldCheck, Sparkles 
} from 'lucide-react';

// Distance registry for instant calculation (round trip from Hyderabad in KM)
const DISTANCE_MATRIX: Record<string, number> = {
  tirupati: 1120,
  srisailam: 450,
  goa: 1360,
  araku: 1240,
  shirdi: 1300,
  ooty: 1800,
  hampi: 820,
  munnar: 2150,
  kashi: 2600,
  mysore: 1560,
  rameswaram: 2360,
  tuljapur: 690,
  mantralayam: 560,
  yadagirigutta: 160,
  nagarjunasagar: 340,
  warangal: 300,
  vijayawada: 580,
  bengaluru: 1140,
  chennai: 1280,
};

import { calculateTripRouteAndPrice } from '../utils/geoDistancePrice';

export const PlannerPage: React.FC = () => {
  const { vehicles, openBookingModal, userLocation, userCoords, isLocating, detectUserLocation } = useCms();

  const [pickupCity, setPickupCity] = useState(userLocation || 'Hyderabad');
  const [destination, setDestination] = useState('Tirupati');
  const [tripFormat, setTripFormat] = useState<'round' | 'oneway'>('round');
  const [selectedVehicleId, setSelectedVehicleId] = useState('car-sedan');
  const [tripDays, setTripDays] = useState(2);
  const [travelDate, setTravelDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0];

  // Dynamic live calculation engine
  const routeCalc = calculateTripRouteAndPrice({
    originName: pickupCity,
    originCoords: userCoords,
    destinationName: destination,
    tripType: tripFormat === 'oneway' ? 'One-Way Drop' : 'Round Trip',
    driverDays: tripDays,
  });

  const finalKm = routeCalc.distanceKm;
  const minimumKmForDays = tripDays * (selectedVehicle?.minimumKmPerDay || 300);
  const billableKm = Math.max(finalKm, minimumKmForDays);

  const baseFare = billableKm * (selectedVehicle?.ratePerKm || 15);
  const totalDriverAllowance = tripDays * (selectedVehicle?.driverAllowancePerDay || 400);
  const estimatedTotal = baseFare + totalDriverAllowance;
  const advanceRequired = Math.round(estimatedTotal * 0.25);

  const handleBookEstimate = () => {
    openBookingModal(`${destination} (${tripFormat === 'round' ? 'Round Trip' : 'One Way'} - ${tripDays} Days)`);
  };

  const handleWhatsAppEstimate = () => {
    const msg = `*Wayora Journeys Custom Route Estimate*%0A` +
      `📍 From: ${encodeURIComponent(pickupCity)}%0A` +
      `🎯 To: ${encodeURIComponent(destination)}%0A` +
      `🔄 Format: ${tripFormat === 'round' ? 'Round Trip' : 'One Way'} (${tripDays} Days)%0A` +
      `📅 Travel Date: ${travelDate}%0A` +
      `🚗 Car: ${encodeURIComponent(selectedVehicle.name)} (₹${selectedVehicle.ratePerKm}/km)%0A` +
      `🛣️ Est. Distance: ~${billableKm} km%0A` +
      `💰 Est. Total: ₹${estimatedTotal.toLocaleString('en-IN')}%0A` +
      `Please confirm car availability and send official quote.`;

    window.open(`https://wa.me/919182471876?text=${msg}`, '_blank');
  };

  return (
    <div className="py-12 bg-slate-50 text-slate-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Header */}
        <div className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-xs font-bold text-red-600 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
            <span>TRANSPARENT TARIFF ESTIMATOR</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900">
            Interactive Route & Cost Planner
          </h1>
          <p className="text-sm leading-relaxed text-slate-600">
            Calculate your exact outstation fare upfront based on distance and vehicle category. No surge pricing, no hidden driver night surprises.
          </p>
        </div>

        {/* Main Calculator Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Input Parameters Form */}
          <div className="lg:col-span-7 rounded-3xl p-6 sm:p-8 border border-slate-200 bg-white space-y-6 shadow-sm">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-100 text-sm font-bold text-slate-900">
              <Calculator className="w-4 h-4 text-red-600" />
              <span>Customize Trip Parameters</span>
            </div>

            {/* Trip Format Selector */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                Format
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTripFormat('round')}
                  className={`py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    tripFormat === 'round'
                      ? 'bg-red-600 text-white border-red-600 shadow-md shadow-red-600/25'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  Round Trip (Recommended)
                </button>
                <button
                  type="button"
                  onClick={() => setTripFormat('oneway')}
                  className={`py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    tripFormat === 'oneway'
                      ? 'bg-red-600 text-white border-red-600 shadow-md shadow-red-600/25'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  One Way Drop
                </button>
              </div>
            </div>

            {/* Pickup and Destination */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-slate-700">
                    Pickup City / Address
                  </label>
                  <button
                    type="button"
                    onClick={async () => {
                      const loc = await detectUserLocation(true);
                      if (loc) setPickupCity(loc);
                    }}
                    className="text-[10px] font-bold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer bg-red-50 hover:bg-red-100 px-2 py-0.5 rounded-full border border-red-100 shadow-2xs"
                  >
                    <span className="flex items-center gap-1">
                      <MapPin className="w-2.5 h-2.5" />
                      <span>{isLocating ? 'Detecting GPS...' : 'Use Live GPS'}</span>
                    </span>
                  </button>
                </div>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-red-600 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={pickupCity}
                    onChange={(e) => setPickupCity(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-red-500 focus:bg-white shadow-xs"
                  />
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {['Hyderabad', 'Secunderabad', 'Vijayawada', 'Vizag'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setPickupCity(c)}
                      className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 hover:text-red-600 hover:border-red-300 transition-colors cursor-pointer"
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Destination City / Shrine
                </label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. Tirupati, Goa, Srisailam"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-red-500 focus:bg-white shadow-xs"
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {['Tirupati', 'Srisailam', 'Goa', 'Araku', 'Shirdi', 'Ooty'].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDestination(d)}
                      className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 hover:text-red-600 hover:border-red-300 transition-colors cursor-pointer"
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Dates & Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={travelDate}
                  onChange={(e) => setTravelDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-red-500 focus:bg-white shadow-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Number of Trip Days
                </label>
                <select
                  value={tripDays}
                  onChange={(e) => setTripDays(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-red-500 focus:bg-white cursor-pointer shadow-xs"
                >
                  <option value={1}>1 Day (Same day return)</option>
                  <option value={2}>2 Days (1 Night Stay)</option>
                  <option value={3}>3 Days (2 Nights Stay)</option>
                  <option value={4}>4 Days (3 Nights Stay)</option>
                  <option value={5}>5 Days (4 Nights Stay)</option>
                  <option value={7}>7 Days (North/South Tour)</option>
                </select>
              </div>
            </div>

            {/* Vehicle Category Selector */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                Vehicle Segment
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {vehicles.map((v) => {
                  const isSelected = selectedVehicleId === v.id;
                  return (
                    <div
                      key={v.id}
                      onClick={() => setSelectedVehicleId(v.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-red-50 border-red-500 shadow-xs ring-1 ring-red-500'
                          : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div>
                        <h5 className="font-bold text-slate-900 text-xs">{v.name}</h5>
                        <span className="text-[10px] text-slate-500">{v.capacity}</span>
                      </div>
                      <span className="text-xs font-black text-red-600">₹{v.ratePerKm}/km</span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Live Estimation Output Card */}
          <div className="lg:col-span-5 rounded-3xl p-6 sm:p-7 border border-red-200 bg-white shadow-lg space-y-6 text-slate-900">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-red-600 block">
                  Calculated Breakdown
                </span>
                <h3 className="text-lg font-black text-slate-900">Estimated Trip Fare</h3>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full border bg-red-50 text-red-700 border-red-200">
                Guaranteed Cap
              </span>
            </div>

            {/* Price breakdown rows */}
            <div className="space-y-3 text-xs font-mono">
              <div className="flex justify-between text-slate-600">
                <span className="font-sans font-medium">Route Distance:</span>
                <span className="font-bold text-slate-900">~{billableKm} km</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span className="font-sans font-medium">Base Rate ({selectedVehicle.name}):</span>
                <span>{billableKm} km × ₹{selectedVehicle.ratePerKm}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span className="font-sans font-medium">Base Car Fare:</span>
                <span className="text-slate-900 font-bold">₹{baseFare.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span className="font-sans font-medium">Driver Allowance ({tripDays} days):</span>
                <span className="text-slate-900 font-bold">₹{totalDriverAllowance.toLocaleString('en-IN')}</span>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline font-sans">
                <div>
                  <span className="text-[11px] text-slate-500 block font-medium">Total Estimated Fare:</span>
                  <span className="text-2xl font-black text-slate-900">
                    ₹{estimatedTotal.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block font-medium">Advance to Book (25%):</span>
                  <span className="text-base font-black text-red-600">
                    ₹{advanceRequired.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* Trust points */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-700 space-y-1.5 shadow-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-red-600 shrink-0" />
                <span>Includes vehicle, air conditioning, fuel & verified chauffeur.</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-red-600 shrink-0" />
                <span>Full advance refund if cancelled up to 2 hours before pickup.</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-red-600 shrink-0" />
                <span>Toll plaza and state tax receipts billed at actual government rates.</span>
              </div>
            </div>

            {/* Action CTAs */}
            <div className="space-y-2.5">
              <button
                onClick={handleBookEstimate}
                className="w-full py-3.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold rounded-xl shadow-md shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <span>Lock In Quote & Book (₹{advanceRequired})</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={handleWhatsAppEstimate}
                className="w-full py-3 bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs"
              >
                <MessageSquare className="w-4 h-4 text-red-600" />
                <span>Send Itinerary to WhatsApp Desk</span>
              </button>
            </div>

          </div>

        </div>

        {/* Top Routes Quick Reference Table */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-lg font-black text-slate-900">Popular Highway Distance Reference from Hyderabad</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-xs font-mono">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-sans text-slate-900 block font-bold">Tirupati</span>
              <span className="text-red-600 font-bold">1120 km (Round)</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-sans text-slate-900 block font-bold">Srisailam</span>
              <span className="text-red-600 font-bold">450 km (Round)</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-sans text-slate-900 block font-bold">Goa</span>
              <span className="text-red-600 font-bold">1360 km (Round)</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-sans text-slate-900 block font-bold">Araku Valley</span>
              <span className="text-red-600 font-bold">1240 km (Round)</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-sans text-slate-900 block font-bold">Shirdi</span>
              <span className="text-red-600 font-bold">1300 km (Round)</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-sans text-slate-900 block font-bold">Ooty Hills</span>
              <span className="text-red-600 font-bold">1800 km (Round)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
