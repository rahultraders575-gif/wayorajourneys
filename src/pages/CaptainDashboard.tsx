import React, { useState } from 'react';
import { useCms } from '../context/CmsContext';
import { Booking, BookingStatus } from '../types';
import { 
  UserCheck, ShieldCheck, Phone, MessageSquare, MapPin, 
  Car, Navigation, AlertTriangle, CheckCircle2, Gauge, 
  CreditCard, LogOut, ArrowRight, Star, Clock, Check, RefreshCw 
} from 'lucide-react';

export const CaptainDashboard: React.FC = () => {
  const { 
    currentCaptain, captains, loginCaptain, logoutCaptain, 
    updateCaptainDuty, bookings, updateTripOdometer, updateBookingStatus, 
    showToast 
  } = useCms();

  // Login form state
  const [selectedCaptainId, setSelectedCaptainId] = useState('cpt-01');
  const [inputPhone, setInputPhone] = useState('');
  const [inputPin, setInputPin] = useState('1234');

  // Active trip odometer state
  const [activeTripId, setActiveTripId] = useState<string | null>(null);
  const [startKmInput, setStartKmInput] = useState<number>(42350);
  const [endKmInput, setEndKmInput] = useState<number>(43470);
  const [tollInput, setTollInput] = useState<number>(420);
  const [parkingInput, setParkingInput] = useState<number>(150);

  // Fastag simulation
  const [fastagRechargeSuccess, setFastagRechargeSuccess] = useState(false);

  const handleQuickLogin = (id: string) => {
    loginCaptain(id, '1234');
  };

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginCaptain(inputPhone, inputPin);
  };

  // Find trips for this captain (or unassigned/new trips if none assigned)
  const captainTrips = currentCaptain
    ? bookings.filter(
        (b) =>
          b.assignedDriver?.toLowerCase().includes(currentCaptain.name.toLowerCase()) ||
          b.assignedCarNumber?.toLowerCase().includes(currentCaptain.vehicleNumber.toLowerCase()) ||
          b.status === 'Assigned' ||
          b.status === 'En Route'
      )
    : [];

  const handleRecordStartKm = (bookingId: string) => {
    updateTripOdometer(bookingId, Number(startKmInput));
    updateBookingStatus(bookingId, 'En Route');
    showToast(`Starting Odometer logged at ${startKmInput} km. Journey started!`, 'success');
  };

  const handleRecordEndKm = (booking: Booking) => {
    if (!endKmInput || endKmInput <= (booking.startKm || 0)) {
      alert('End kilometer reading must be greater than starting kilometer.');
      return;
    }
    const finalDistance = endKmInput - (booking.startKm || 0);
    updateTripOdometer(booking.id, booking.startKm || 0, endKmInput, finalDistance, tollInput, parkingInput);
    updateBookingStatus(booking.id, 'Completed');
    setActiveTripId(null);
    showToast(`Journey completed! ${finalDistance} km logged. Digital receipt sent to customer.`, 'success');
  };

  const handleRechargeFastag = () => {
    setFastagRechargeSuccess(true);
    showToast('₹1,000 topped up to commercial Fastag wallet via central dispatch account.', 'success');
    setTimeout(() => setFastagRechargeSuccess(false), 4000);
  };

  // ================= 1. LOGIN GATE IF NO CAPTAIN ACTIVE =================
  if (!currentCaptain) {
    return (
      <div className="py-12 sm:py-20 bg-slate-50 text-slate-900 transition-colors">
        <div className="max-w-md mx-auto px-4 space-y-6">
          
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-600 border border-red-200 flex items-center justify-center mx-auto shadow-md">
              <UserCheck className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black text-slate-900">
              Captain Partner Cockpit
            </h1>
            <p className="text-xs text-slate-600">
              Sign in to manage active passenger trips, record odometer readings, and check daily allowances.
            </p>
          </div>

          {/* Quick Pilot Selector */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-3">
            <span className="text-[11px] font-bold text-red-600 uppercase tracking-wider block">
              1-Tap Demo Captain Login
            </span>

            <div className="space-y-2">
              {captains.map((cpt) => (
                <div
                  key={cpt.id}
                  onClick={() => handleQuickLogin(cpt.id)}
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-red-50/50 hover:border-red-300 flex items-center justify-between cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={cpt.photoUrl}
                      alt={cpt.name}
                      className="w-10 h-10 rounded-full object-cover border border-red-300"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">
                        {cpt.name}
                      </h4>
                      <p className="text-[10px] text-slate-500">
                        {cpt.vehicleModel} · {cpt.vehicleNumber}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-red-600 flex items-center gap-0.5 justify-end">
                      <Star className="w-3 h-3 fill-current" /> {cpt.rating}
                    </span>
                    <span className="text-[9px] text-slate-500 font-mono">{cpt.totalTrips} trips</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Phone & PIN Form */}
          <form
            onSubmit={handleCustomLogin}
            className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-3"
          >
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
              Or Sign In via Mobile PIN
            </span>

            <div>
              <label className="block text-[10px] font-bold text-slate-700 mb-1">
                Registered Mobile Number
              </label>
              <input
                type="tel"
                placeholder="+91 98490 55112"
                value={inputPhone}
                onChange={(e) => setInputPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-700 mb-1">
                4-Digit Security PIN (Default: 1234)
              </label>
              <input
                type="password"
                maxLength={4}
                value={inputPin}
                onChange={(e) => setInputPin(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white font-mono tracking-widest text-center"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-red-500/25 cursor-pointer"
            >
              <span>Access Cockpit</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

        </div>
      </div>
    );
  }

  // ================= 2. ACTIVE CAPTAIN COCKPIT DASHBOARD =================
  return (
    <div className="py-6 sm:py-10 bg-slate-50 text-slate-900 transition-colors">
      <div className="max-w-md sm:max-w-xl mx-auto px-4 space-y-6">
        
        {/* Profile & Duty Header Card */}
        <div className="p-5 rounded-3xl border border-slate-200 bg-white shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={currentCaptain.photoUrl}
                  alt={currentCaptain.name}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-red-500"
                />
                <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
                  currentCaptain.dutyStatus === 'On Duty'
                    ? 'bg-emerald-500 animate-pulse'
                    : currentCaptain.dutyStatus === 'On Trip'
                    ? 'bg-amber-500'
                    : 'bg-slate-400'
                }`} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="font-black text-base text-slate-900">
                    {currentCaptain.name}
                  </h2>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-600 text-white font-bold">
                    CAPTAIN
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  {currentCaptain.vehicleModel}
                </p>
                <span className="text-[10px] font-mono font-bold text-red-600">
                  {currentCaptain.vehicleNumber}
                </span>
              </div>
            </div>

            <button
              onClick={logoutCaptain}
              className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:text-red-600 hover:bg-red-50 border border-slate-200 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Duty Switcher Segmented Control */}
          <div>
            <div className="flex rounded-xl p-1 border border-slate-200 bg-slate-100">
              {(['On Duty', 'On Trip', 'Off Duty'] as const).map((status) => {
                const isActive = currentCaptain.dutyStatus === status;
                return (
                  <button
                    key={status}
                    onClick={() => updateCaptainDuty(status)}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      isActive
                        ? status === 'On Duty'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : status === 'On Trip'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-slate-700 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {status}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Key Metrics Quick Grid */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50">
              <span className="text-[10px] text-slate-500 block">Rating</span>
              <span className="font-black text-sm text-red-600 flex items-center justify-center gap-0.5 mt-0.5">
                <Star className="w-3.5 h-3.5 fill-current" /> {currentCaptain.rating}
              </span>
            </div>
            <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50">
              <span className="text-[10px] text-slate-500 block">Today's Total</span>
              <span className="font-black text-sm mt-0.5 block text-slate-900">
                ₹{currentCaptain.todayEarnings.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50">
              <span className="text-[10px] text-slate-500 block">Fastag Balance</span>
              <span className="font-black text-sm text-emerald-600 mt-0.5 block">
                ₹{currentCaptain.fastagBalance}
              </span>
            </div>
          </div>
        </div>

        {/* Assigned Dispatches */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
              <h3 className="font-black text-sm uppercase tracking-wider text-slate-900">
                Assigned Trip Dispatches ({captainTrips.length})
              </h3>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Central Dispatch Live</span>
          </div>

          {captainTrips.length === 0 ? (
            <div className="p-8 text-center rounded-2xl border border-slate-200 bg-white shadow-xs">
              <Car className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
              <p className="text-xs text-slate-600">No active outstation trips assigned currently.</p>
              <p className="text-[10px] text-slate-400 mt-1">Keep status On Duty to receive upcoming dispatches.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {captainTrips.map((trip) => {
                const isSelectedForOdo = activeTripId === trip.id;
                return (
                  <div
                    key={trip.id}
                    className="rounded-2xl p-5 border border-slate-200 bg-white transition-all space-y-4 shadow-sm"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-red-600">{trip.id}</span>
                        <h4 className="font-black text-sm mt-0.5 text-slate-900">
                          {trip.destination}
                        </h4>
                        <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-red-500" />
                          <span>Pickup: {trip.pickupLocation}</span>
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        trip.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : trip.status === 'En Route'
                          ? 'bg-red-50 text-red-700 border border-red-200 animate-pulse'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {trip.status}
                      </span>
                    </div>

                    {/* Passenger & Fare Details */}
                    <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Guest:</span>
                        <span className="font-bold text-slate-900">
                          {trip.customerName} ({trip.passengers} Pax)
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Scheduled:</span>
                        <span className="font-semibold text-slate-700">
                          {trip.travelDate} @ {trip.travelTime}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Total / Advance:</span>
                        <span className="font-mono text-emerald-700 font-bold">
                          ₹{trip.estimatedTotal} (Adv: ₹{trip.advancePaid})
                        </span>
                      </div>
                    </div>

                    {/* Quick Passenger Action Buttons */}
                    <div className="grid grid-cols-3 gap-2">
                      <a
                        href={`tel:${trip.customerPhone}`}
                        className="py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200 flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5 text-red-600" />
                        <span>Call</span>
                      </a>
                      <a
                        href={`https://wa.me/${trip.customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi ${trip.customerName}, I am Captain ${currentCaptain.name} from Wayora Journeys for your trip to ${trip.destination}. I am preparing your vehicle.`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200 flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Chat</span>
                      </a>
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(trip.pickupLocation)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200 flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Navigation className="w-3.5 h-3.5 text-blue-600" />
                        <span>Maps</span>
                      </a>
                    </div>

                    {/* Odometer Terminal / Journey Progress */}
                    {trip.status !== 'Completed' && (
                      <div className="pt-2 border-t border-slate-200 space-y-3">
                        {!trip.startKm ? (
                          <div className="space-y-2">
                            <label className="block text-[11px] font-bold text-slate-700">
                              Step 1: Record Doorstep Starting Odometer (km)
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="number"
                                value={startKmInput}
                                onChange={(e) => setStartKmInput(Number(e.target.value))}
                                className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white font-mono"
                              />
                              <button
                                onClick={() => handleRecordStartKm(trip.id)}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-md shadow-red-500/20 cursor-pointer flex items-center gap-1.5"
                              >
                                <Gauge className="w-3.5 h-3.5" />
                                <span>Start Trip</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-red-50/60 border border-red-200">
                              <span className="text-slate-600">Trip In Progress (Started at {trip.startKm} km)</span>
                              <span className="text-emerald-700 font-bold flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                                LIVE TRIP
                              </span>
                            </div>

                            {isSelectedForOdo ? (
                              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-700 mb-1">
                                    Closing Odometer (km) *
                                  </label>
                                  <input
                                    type="number"
                                    value={endKmInput}
                                    onChange={(e) => setEndKmInput(Number(e.target.value))}
                                    className="w-full px-3 py-1.5 text-xs rounded-lg bg-white border border-slate-200 text-slate-900 font-mono focus:border-red-600"
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-700 mb-1">Toll (₹)</label>
                                    <input
                                      type="number"
                                      value={tollInput}
                                      onChange={(e) => setTollInput(Number(e.target.value))}
                                      className="w-full px-3 py-1.5 text-xs rounded-lg bg-white border border-slate-200 text-slate-900 font-mono focus:border-red-600"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-700 mb-1">Parking (₹)</label>
                                    <input
                                      type="number"
                                      value={parkingInput}
                                      onChange={(e) => setParkingInput(Number(e.target.value))}
                                      className="w-full px-3 py-1.5 text-xs rounded-lg bg-white border border-slate-200 text-slate-900 font-mono focus:border-red-600"
                                    />
                                  </div>
                                </div>
                                <div className="flex justify-end gap-2 pt-1">
                                  <button
                                    onClick={() => setActiveTripId(null)}
                                    className="px-3 py-1.5 rounded-lg bg-slate-200 text-slate-700 text-[11px] font-semibold"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => handleRecordEndKm(trip)}
                                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg shadow-xs"
                                  >
                                    Complete & Collect Fare
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  setActiveTripId(trip.id);
                                  setEndKmInput((trip.startKm || 42000) + 1120);
                                }}
                                className="w-full py-2.5 bg-red-50 hover:bg-red-600 hover:text-white text-red-600 border border-red-200 font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                              >
                                <Gauge className="w-3.5 h-3.5" />
                                <span>End Trip & Record Closing Odometer</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Fastag Wallet & Vehicle Documents Strip */}
        <div className="p-5 rounded-3xl border border-slate-200 bg-white shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <h4 className="font-bold text-xs text-slate-900">
                Fastag & Commercial Fleet Wallet
              </h4>
            </div>
            <button
              onClick={handleRechargeFastag}
              className="text-[10px] text-red-600 font-bold hover:underline cursor-pointer"
            >
              + Quick Recharge ₹1,000
            </button>
          </div>

          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] text-slate-500 block">Bank Fastag ID:</span>
              <span className="font-mono font-bold text-slate-900">FASTAG-TS09-8819</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 block">Available Balance:</span>
              <span className="text-sm font-black text-emerald-600">
                ₹{currentCaptain.fastagBalance + (fastagRechargeSuccess ? 1000 : 0)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-[10px] text-slate-500">
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-emerald-600 font-bold block">PUC: Valid</span>
              <span>Till Jan 2027</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-emerald-600 font-bold block">Insurance</span>
              <span>All India Permit</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-emerald-600 font-bold block">Yellow Board</span>
              <span>Commercial OK</span>
            </div>
          </div>
        </div>

        {/* SOS Highway Emergency Button */}
        <a
          href="tel:+919182471876"
          className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md shadow-red-500/25 transition-colors"
        >
          <AlertTriangle className="w-4 h-4 text-white" />
          <span>Captain SOS & Highway Breakdown Desk (+91 91824 71876)</span>
        </a>

      </div>
    </div>
  );
};
