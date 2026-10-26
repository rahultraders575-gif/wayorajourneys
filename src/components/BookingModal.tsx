import React, { useState, useEffect } from 'react';
import { useCms } from '../context/CmsContext';
import { TripType } from '../types';
import { INITIAL_RIDERS } from '../data/initialData';
import { RouteMiniMap } from './RouteMiniMap';
import { 
  X, Check, ArrowRight, MessageSquare, Copy, ShieldCheck, 
  MapPin, Calendar, Clock, Car, User, Phone, Sparkles, RefreshCw, CheckCircle2 
} from 'lucide-react';

export const BookingModal: React.FC = () => {
  const { 
    isBookingModalOpen, closeBookingModal, modalDefaultTour, 
    vehicles, addBooking, currentRider, loginRider, openAuthModal,
    userLocation, isLocating, detectUserLocation 
  } = useCms();

  const [isConfirmed, setIsConfirmed] = useState(false);
  const [confirmedBookingId, setConfirmedBookingId] = useState('');
  const [copyStatus, setCopyStatus] = useState(false);

  // Essential booking fields ONLY
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [pickup, setPickup] = useState(userLocation || 'Hyderabad');
  const [destination, setDestination] = useState('');
  const [travelDate, setTravelDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [travelTime, setTravelTime] = useState('06:00');
  const [tripType, setTripType] = useState<TripType>('ROUND_TRIP');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('car-sedan');

  // Synchronize when modal opens or rider changes
  useEffect(() => {
    if (isBookingModalOpen) {
      setIsConfirmed(false);
      setCopyStatus(false);
      
      // Auto prefill from current logged-in rider if present
      if (currentRider) {
        setName(currentRider.name);
        setPhone(currentRider.phone);
        if (currentRider.city && !pickup) {
          setPickup(currentRider.city);
        }
      } else {
        setName('');
        setPhone('');
      }

      if (modalDefaultTour) {
        setDestination(modalDefaultTour);
      } else if (!destination) {
        setDestination('Tirupati Tirumala Darshan');
      }

      if (userLocation) {
        setPickup(userLocation);
      }
    }
  }, [isBookingModalOpen, modalDefaultTour, currentRider, userLocation]);

  if (!isBookingModalOpen) return null;

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0];

  // Estimation calculation
  const estimatedKm = destination.toLowerCase().includes('srisailam')
    ? 450
    : destination.toLowerCase().includes('tirupati')
    ? 1120
    : destination.toLowerCase().includes('goa')
    ? 1350
    : destination.toLowerCase().includes('araku')
    ? 1240
    : destination.toLowerCase().includes('airport')
    ? 90
    : 600;

  const baseFare = Math.round(estimatedKm * (selectedVehicle?.ratePerKm || 15));
  const driverAllowance = selectedVehicle?.driverAllowancePerDay || 400;
  const totalWithDriver = baseFare + driverAllowance;
  const advanceAmount = Math.max(1000, Math.round(totalWithDriver * 0.25));

  // Quick 1-tap booking submission
  const handleQuickBook = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !phone.trim()) {
      alert('Please provide your name and mobile number for driver dispatch.');
      return;
    }

    if (!pickup.trim() || !destination.trim()) {
      alert('Please specify your pickup address and destination.');
      return;
    }

    const newBooking = addBooking({
      customerName: name.trim(),
      customerPhone: phone.trim(),
      pickupLocation: pickup.trim(),
      destination: destination.trim(),
      travelDate,
      travelTime,
      tripType,
      passengers: selectedVehicle.id.includes('sedan') ? 4 : selectedVehicle.id.includes('ertiga') ? 6 : 7,
      vehicleName: selectedVehicle.name,
      ratePerKm: selectedVehicle.ratePerKm,
      advancePaymentType: '25%',
      estimatedTotal: totalWithDriver,
      advancePaid: advanceAmount,
      notes: `Quick express booking. Distance ~${estimatedKm} km. Doorstep chauffeur dispatch.`,
    });

    setConfirmedBookingId(newBooking.id);
    setIsConfirmed(true);
  };

  const openWhatsAppConfirmation = () => {
    const text = `*Wayora Journeys Booking Dispatch Request*%0A` +
      `🆔 Ref ID: ${confirmedBookingId}%0A` +
      `👤 Guest Name: ${encodeURIComponent(name)}%0A` +
      `📞 Phone: ${encodeURIComponent(phone)}%0A` +
      `📍 Pickup: ${encodeURIComponent(pickup)}%0A` +
      `🎯 Destination: ${encodeURIComponent(destination)}%0A` +
      `📅 Date & Time: ${travelDate} at ${travelTime}%0A` +
      `🚗 Vehicle: ${encodeURIComponent(selectedVehicle.name)} (₹${selectedVehicle.ratePerKm}/km)%0A` +
      `💰 Est. Total: ₹${totalWithDriver.toLocaleString('en-IN')}%0A` +
      `Please assign nearest available chauffeur and send vehicle number.`;

    window.open(`https://wa.me/919182471876?text=${text}`, '_blank');
  };

  const copyBookingSummary = () => {
    const text = `WAYORA JOURNEYS RESERVATION\nBooking Ref: ${confirmedBookingId}\nGuest: ${name} (${phone})\nPickup: ${pickup}\nDestination: ${destination}\nTravel Date: ${travelDate} @ ${travelTime}\nVehicle: ${selectedVehicle.name}\nEstimated Total: ₹${totalWithDriver.toLocaleString('en-IN')}\nStatus: Confirmed`;

    navigator.clipboard.writeText(text);
    setCopyStatus(true);
    setTimeout(() => setCopyStatus(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden text-slate-800 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src="/images/wayora-logo-light.jpg"
              alt="Wayora Journeys Logo"
              className="w-8 h-8 rounded-xl object-contain shadow-xs border border-slate-200/80 bg-white p-0.5"
            />
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-red-600 block leading-tight">
                Express Chauffeur Booking
              </span>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                {isConfirmed ? 'Booking Confirmed!' : 'Book Your Outstation Ride'}
              </h3>
            </div>
          </div>
          <button
            onClick={closeBookingModal}
            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 text-xs">
          
          {/* SCREEN 1: EXPRESS SIMPLE BOOKING FORM */}
          {!isConfirmed ? (
            <form onSubmit={handleQuickBook} className="space-y-4">
              
              {/* RIDER AUTHENTICATION / USER STATUS STRIP */}
              {currentRider ? (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-red-100 border border-red-200 text-red-700 font-bold flex items-center justify-center text-xs">
                      {currentRider.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 text-xs">{currentRider.name}</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      </div>
                      <span className="text-[10px] text-slate-500">{currentRider.phone}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={openAuthModal}
                    className="text-[11px] font-semibold text-red-600 hover:text-red-700 px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-red-300 cursor-pointer shadow-xs"
                  >
                    Switch Rider
                  </button>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-900 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-red-600" />
                      Your Contact Details (Only Name & Phone)
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const demo = INITIAL_RIDERS[0];
                        setName(demo.name);
                        setPhone(demo.phone);
                        loginRider(demo);
                      }}
                      className="text-[10px] text-red-600 hover:text-red-700 font-semibold cursor-pointer underline"
                    >
                      Fill Demo Guest
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your Full Name *"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 shadow-xs"
                      />
                    </div>
                    <div>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Mobile Phone Number *"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 shadow-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ROUTE SECTION */}
              <div className="space-y-2.5">
                {/* Trip Type Selector */}
                <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-[11px]">
                  {(['ROUND_TRIP', 'ONE_WAY', 'AIRPORT'] as TripType[]).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setTripType(type)}
                      className={`py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                        tripType === type
                          ? 'bg-red-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {type === 'ROUND_TRIP' ? 'Round Trip' : type === 'ONE_WAY' ? 'One Way' : 'Airport Drop'}
                    </button>
                  ))}
                </div>

                {/* Pickup with GPS radar */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Pickup Address
                    </label>
                    <button
                      type="button"
                      onClick={async () => {
                        const loc = await detectUserLocation(true);
                        if (loc) setPickup(loc);
                      }}
                      className="text-[10px] text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className={`w-2.5 h-2.5 ${isLocating ? 'animate-spin' : ''}`} />
                      <span>{isLocating ? 'Detecting GPS...' : 'Use Live Location'}</span>
                    </button>
                  </div>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-red-600 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={pickup}
                      onChange={(e) => setPickup(e.target.value)}
                      placeholder="Enter pickup city or locality"
                      className="w-full pl-8 pr-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 shadow-xs"
                    />
                  </div>
                </div>

                {/* Destination */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Destination City / Tour Package
                  </label>
                  <input
                    type="text"
                    required
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="e.g. Tirupati, Srisailam, Goa, Araku"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 shadow-xs"
                  />
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Travel Date
                    </label>
                    <div className="relative">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="date"
                        required
                        value={travelDate}
                        onChange={(e) => setTravelDate(e.target.value)}
                        className="w-full pl-8 pr-2 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-[11px] focus:outline-none focus:border-red-500 shadow-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Pickup Time
                    </label>
                    <div className="relative">
                      <Clock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="time"
                        required
                        value={travelTime}
                        onChange={(e) => setTravelTime(e.target.value)}
                        className="w-full pl-8 pr-2 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-[11px] focus:outline-none focus:border-red-500 shadow-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* VEHICLE SELECTION (Compact 1-Tap Pills) */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Select Vehicle Category
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {vehicles.slice(0, 3).map((v) => {
                    const isSelected = selectedVehicleId === v.id;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedVehicleId(v.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-red-50/60 border-red-500 shadow-xs ring-1 ring-red-500'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-slate-900 text-xs block truncate">{v.name.split(' ')[0]}</span>
                          {isSelected && <Check className="w-3 h-3 text-red-600 shrink-0" />}
                        </div>
                        <span className="text-[11px] font-extrabold text-red-600 block">
                          ₹{v.ratePerKm}<span className="text-[9px] font-normal text-slate-500">/km</span>
                        </span>
                        <span className="text-[9px] text-slate-500 block truncate">{v.capacity}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* LIVE FARE PREVIEW CARD */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 block">Estimated Distance & Tariff</span>
                  <span className="text-xs font-bold text-slate-900">
                    ~{estimatedKm} km · {selectedVehicle.name}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-emerald-700 font-bold block">Pay 25% to confirm</span>
                  <span className="text-base font-black text-slate-900">
                    ₹{totalWithDriver.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* ACTION SUBMIT BUTTON */}
              <button
                type="submit"
                className="w-full py-3.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold rounded-xl text-xs shadow-md shadow-red-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Confirm & Dispatch Chauffeur</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-4 text-[10px] text-slate-500">
                <span>Free cancellation up to 2h</span>
                <span>·</span>
                <span>Doorstep pickup guaranteed</span>
                <span>·</span>
                <span>100% refund policy</span>
              </div>

            </form>
          ) : (
            /* SCREEN 2: INSTANT CONFIRMATION & WHATSAPP DISPATCH */
            <div className="space-y-4 py-2">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-base font-extrabold text-slate-900">Journey Reserved Successfully!</h4>
                <p className="text-slate-600 text-xs">
                  Chauffeur dispatch request has been logged in central fleet pool.
                </p>
              </div>

              {/* Mini-Map Route Summary Visualization */}
              <RouteMiniMap
                origin={pickup || 'Pickup City'}
                destination={destination || 'Destination'}
                distanceKm={estimatedKm}
                duration="~8h 30m"
                bookingRef={confirmedBookingId}
                vehicleName={selectedVehicle.name}
                tollIncluded={true}
                isDark={false}
              />

              {/* Summary Card */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500 text-[11px]">Booking Reference ID</span>
                  <span className="font-mono font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                    {confirmedBookingId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Guest Name</span>
                  <span className="font-semibold text-slate-900">{name} ({phone})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Pickup Location</span>
                  <span className="font-semibold text-slate-900 truncate max-w-[200px]">{pickup}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Destination</span>
                  <span className="font-semibold text-slate-900">{destination}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Schedule</span>
                  <span className="font-semibold text-slate-900">{travelDate} at {travelTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Vehicle</span>
                  <span className="font-semibold text-slate-900">{selectedVehicle.name}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200">
                  <span className="font-bold text-slate-700">Estimated Total</span>
                  <span className="font-bold text-slate-900 text-sm">₹{totalWithDriver.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* WhatsApp Trigger */}
              <button
                type="button"
                onClick={openWhatsAppConfirmation}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Send Dispatch Details to WhatsApp Chauffeur</span>
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={copyBookingSummary}
                  className="flex-1 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-xs border border-slate-200 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>{copyStatus ? 'Copied to Clipboard!' : 'Copy Summary'}</span>
                </button>
                <button
                  type="button"
                  onClick={closeBookingModal}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl text-xs cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
