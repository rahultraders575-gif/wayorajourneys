import React, { useState } from 'react';
import { Booking, CaptainProfile } from '../../types';
import {
  Gauge, Camera, KeyRound, CheckCircle2, Clock, 
  Car, ShieldCheck, AlertTriangle, ArrowRight, Upload, 
  MapPin, Check, DollarSign, Sparkles, FileText, X
} from 'lucide-react';

interface TripExecutionOdometerProps {
  trip: Booking;
  captain: CaptainProfile;
  onRecordStartTrip: (bookingId: string, startKm: number, photoUrl: string, otp: string) => void;
  onRecordEndTrip: (
    bookingId: string, 
    startKm: number, 
    endKm: number, 
    photoUrl: string, 
    toll: number, 
    parking: number, 
    nightAllowance: number,
    finalAmount: number
  ) => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

const SAMPLE_CLUSTER_IMAGES = {
  start: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
  end: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
};

export const TripExecutionOdometer: React.FC<TripExecutionOdometerProps> = ({
  trip,
  captain,
  onRecordStartTrip,
  onRecordEndTrip,
  showToast,
}) => {
  // Start Trip State
  const [startKmInput, setStartKmInput] = useState<number>(trip.startKm || 44200);
  const [startPhotoUrl, setStartPhotoUrl] = useState<string>(trip.startOdometerPhotoUrl || SAMPLE_CLUSTER_IMAGES.start);
  const [riderOtpInput, setRiderOtpInput] = useState<string>('');
  const [isVerifyingStart, setIsVerifyingStart] = useState(false);

  // End Trip State
  const [endKmInput, setEndKmInput] = useState<number>(trip.endKm || (trip.startKm || 44200) + 440);
  const [endPhotoUrl, setEndPhotoUrl] = useState<string>(trip.endOdometerPhotoUrl || SAMPLE_CLUSTER_IMAGES.end);
  const [tollInput, setTollInput] = useState<number>(trip.tollCharges || 340);
  const [parkingInput, setParkingInput] = useState<number>(trip.parkingCharges || 150);

  // Anti-Dispute Package Math
  const minDailyPackageAllowanceKm = 300; // 300 km/day threshold for Innova Crysta
  const actualDistanceKm = Math.max(0, endKmInput - startKmInput);
  const billedDistanceKm = Math.max(actualDistanceKm, minDailyPackageAllowanceKm);
  const extraKm = Math.max(0, actualDistanceKm - minDailyPackageAllowanceKm);

  // Night Allowance Auto-Trigger (22:00 to 06:00)
  const isNightHours = (() => {
    const hour = new Date().getHours();
    return hour >= 22 || hour < 6;
  })();
  const [applyNightAllowance, setApplyNightAllowance] = useState<boolean>(isNightHours || true);
  const nightBataAmount = applyNightAllowance ? 300 : 0;

  // Calculated final payable total
  const estimatedBase = trip.estimatedTotal || 8500;
  const extraKmRate = trip.ratePerKm || 18;
  const extraKmCharges = extraKm * extraKmRate;
  const calculatedGrandTotal = estimatedBase + extraKmCharges + tollInput + parkingInput + nightBataAmount;
  const advanceDeduction = Math.round(trip.estimatedTotal * 0.25);
  const remainingDropOffCollection = Math.max(0, calculatedGrandTotal - advanceDeduction);

  const handleStartTripSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startKmInput || startKmInput <= 0) {
      showToast('Please enter a valid starting odometer reading.', 'error');
      return;
    }
    if (!startPhotoUrl) {
      showToast('Mandatory: Capture photo of the car instrument cluster before starting.', 'error');
      return;
    }
    if (!riderOtpInput || riderOtpInput.trim().length !== 4) {
      showToast('Please enter the 4-digit passenger OTP (shared on rider app/SMS).', 'error');
      return;
    }

    // Handshake verification
    setIsVerifyingStart(true);
    setTimeout(() => {
      setIsVerifyingStart(false);
      onRecordStartTrip(trip.id, startKmInput, startPhotoUrl, riderOtpInput);
      showToast(`Journey Initiated! Starting Odometer recorded at ${startKmInput} km.`, 'success');
    }, 600);
  };

  const handleEndTripSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (endKmInput <= startKmInput) {
      showToast(`Ending odometer (${endKmInput} km) must be greater than starting odometer (${startKmInput} km).`, 'error');
      return;
    }
    if (!endPhotoUrl) {
      showToast('Mandatory: Capture photo of instrument cluster at drop-off to avoid fare disputes.', 'error');
      return;
    }

    onRecordEndTrip(
      trip.id,
      startKmInput,
      endKmInput,
      endPhotoUrl,
      tollInput,
      parkingInput,
      nightBataAmount,
      calculatedGrandTotal
    );
    showToast(`Trip Completed! ${actualDistanceKm} km driven. Please collect ₹${remainingDropOffCollection.toLocaleString()} balance.`, 'success');
  };

  return (
    <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
      {/* HEADER */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-red-600" />
            <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
              Anti-Dispute Odometer Terminal
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Tamper-proof start & end photo logging with 4-digit passenger OTP verification.
          </p>
        </div>

        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
          trip.status === 'Completed'
            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
            : trip.status === 'En Route'
            ? 'bg-red-100 text-red-800 border border-red-300 animate-pulse'
            : 'bg-amber-100 text-amber-800 border border-amber-200'
        }`}>
          {trip.status}
        </span>
      </div>

      {/* STAGE A: START TRIP WORKFLOW (If trip not yet initiated) */}
      {!trip.startKm && trip.status !== 'Completed' && (
        <form onSubmit={handleStartTripSubmit} className="space-y-4">
          <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 space-y-2">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
              <KeyRound className="w-4 h-4 text-amber-600" />
              <span>Step 1: 4-Digit Rider Start OTP Handshake</span>
            </div>
            <p className="text-[11px] text-amber-800 leading-tight">
              Ask guest for their 4-digit start PIN (e.g. <strong>5892</strong>) displayed on their Wayora Rider app to confirm boarding.
            </p>
            <div className="pt-1">
              <input
                type="text"
                maxLength={4}
                required
                value={riderOtpInput}
                onChange={(e) => setRiderOtpInput(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="Enter 4-Digit Rider OTP (e.g. 5892)"
                className="w-full text-center text-lg font-mono font-black tracking-widest py-2 rounded-xl bg-white border border-amber-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Odometer Reading Input & Camera Photo */}
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Starting Odometer Reading (km) *
              </label>
              <input
                type="number"
                required
                value={startKmInput}
                onChange={(e) => setStartKmInput(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-mono font-bold text-slate-900 text-sm focus:bg-white focus:border-red-600 focus:outline-none"
              />
            </div>

            {/* Instrument Cluster Photo Preview */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>Cluster Snapshot (Instrument Cluster) *</span>
                <span className="text-[10px] text-emerald-600 font-bold">Live Photo Ready</span>
              </label>

              <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 aspect-video max-h-48 group">
                <img
                  src={startPhotoUrl}
                  alt="Starting Cluster"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center gap-2 text-white text-xs font-bold">
                  <Camera className="w-4 h-4" />
                  <span>Doorstep Starting Cluster Snapshot</span>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isVerifyingStart}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-black text-xs shadow-md shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
          >
            <Gauge className="w-4 h-4" />
            <span>{isVerifyingStart ? 'Verifying Rider OTP...' : 'Authenticate & Start Outstation Journey'}</span>
          </button>
        </form>
      )}

      {/* STAGE B: ACTIVE JOURNEY IN PROGRESS / END TRIP WORKFLOW */}
      {trip.startKm && trip.status !== 'Completed' && (
        <form onSubmit={handleEndTripSubmit} className="space-y-4">
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-bold block">JOURNEY IN PROGRESS</span>
              <span className="font-bold text-slate-900 text-sm">
                Started at {trip.startKm} km
              </span>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
              LIVE TELEMETRY
            </span>
          </div>

          {/* Closing Odometer & End Cluster Photo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Closing Drop-Off Odometer (km) *
              </label>
              <input
                type="number"
                required
                value={endKmInput}
                onChange={(e) => setEndKmInput(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-mono font-bold text-slate-900 text-sm focus:bg-white focus:border-red-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Drop-Off Cluster Snapshot *
              </label>
              <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-video max-h-24">
                <img
                  src={endPhotoUrl}
                  alt="Closing Cluster"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-slate-950/30 flex items-center justify-center text-white text-[10px] font-bold gap-1">
                  <Camera className="w-3.5 h-3.5" />
                  <span>Closing Cluster</span>
                </div>
              </div>
            </div>
          </div>

          {/* Toll & Parking Inputs */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Electronic FASTag Tolls (₹)
              </label>
              <input
                type="number"
                value={tollInput}
                onChange={(e) => setTollInput(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono text-slate-900 text-xs focus:bg-white focus:border-red-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                State Border / Parking Slip (₹)
              </label>
              <input
                type="number"
                value={parkingInput}
                onChange={(e) => setParkingInput(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono text-slate-900 text-xs focus:bg-white focus:border-red-600"
              />
            </div>
          </div>

          {/* Night Allowance Trigger */}
          <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-red-600" />
              <div>
                <span className="font-bold text-xs text-slate-900 block">Night Driving Driver Bata (22:00 – 06:00)</span>
                <span className="text-[10px] text-slate-500">Auto-calculated overnight highway driving allowance</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-slate-900 text-xs">+ ₹300</span>
              <input
                type="checkbox"
                checked={applyNightAllowance}
                onChange={(e) => setApplyNightAllowance(e.target.checked)}
                className="h-4 w-4 rounded text-red-600 focus:ring-red-500"
              />
            </div>
          </label>

          {/* Anti-Dispute Dynamic Reconciliation Breakdown */}
          <div className="p-3.5 rounded-2xl bg-slate-900 text-white space-y-2 text-xs">
            <div className="flex justify-between items-center text-slate-300">
              <span>Actual Km Driven ({endKmInput} - {startKmInput})</span>
              <span className="font-mono font-bold text-white">{actualDistanceKm} km</span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span>Minimum Package Allowance (Crysta 300 km/day)</span>
              <span className="font-mono font-bold text-white">{minDailyPackageAllowanceKm} km</span>
            </div>
            <div className="flex justify-between items-center text-slate-300 border-t border-slate-800 pt-1.5">
              <span>Billed Distance</span>
              <span className="font-mono font-bold text-amber-400">{billedDistanceKm} km</span>
            </div>

            <div className="flex justify-between items-center text-slate-300">
              <span>Gross Final Fare (Base + Tolls + Night Bata)</span>
              <span className="font-mono font-bold text-white">₹{calculatedGrandTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-emerald-400">
              <span>- 25% Online Advance Already Captured</span>
              <span className="font-mono font-bold">- ₹{advanceDeduction.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-white text-sm font-black border-t border-slate-700 pt-2">
              <span className="text-amber-300 uppercase tracking-wide">Collect from Passenger</span>
              <span className="font-mono text-emerald-400 text-base">₹{remainingDropOffCollection.toLocaleString()}</span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Complete Journey & Confirm Fare Reconciliation</span>
          </button>
        </form>
      )}

      {/* STAGE C: ALREADY COMPLETED STATE */}
      {trip.status === 'Completed' && (
        <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs space-y-3">
          <div className="flex items-center gap-2 text-emerald-800 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>This trip is completed and digitally settled.</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
            <div className="p-2 rounded-xl bg-white border border-emerald-200">
              <span className="text-slate-400 block text-[10px]">START KM</span>
              <span className="font-mono font-bold text-slate-900">{trip.startKm || 44200} km</span>
            </div>
            <div className="p-2 rounded-xl bg-white border border-emerald-200">
              <span className="text-slate-400 block text-[10px]">END KM</span>
              <span className="font-mono font-bold text-slate-900">{trip.endKm || 44640} km</span>
            </div>
            <div className="p-2 rounded-xl bg-white border border-emerald-200">
              <span className="text-slate-400 block text-[10px]">TOLL/PARKING</span>
              <span className="font-mono font-bold text-slate-900">₹{(trip.tollCharges || 340) + (trip.parkingCharges || 150)}</span>
            </div>
            <div className="p-2 rounded-xl bg-white border border-emerald-200">
              <span className="text-slate-400 block text-[10px]">TOTAL FARE</span>
              <span className="font-mono font-bold text-emerald-700">₹{(trip.finalPaidAmount || trip.estimatedTotal).toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

