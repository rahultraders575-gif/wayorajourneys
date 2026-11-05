import React, { useState } from 'react';
import { Booking, BookingStatus, GSTTaxInvoice } from '../../types';
import {
  Calendar, Clock, MapPin, Car, FileText, 
  Star, DollarSign, Download, Printer, CheckCircle2, 
  ArrowRight, Search, Filter, ShieldCheck, Heart, Sparkles, X, Check
} from 'lucide-react';

interface TripHistoryModuleProps {
  bookings: Booking[];
  onOpenInvoiceModal: (booking: Booking) => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const TripHistoryModule: React.FC<TripHistoryModuleProps> = ({
  bookings,
  onOpenInvoiceModal,
  showToast,
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | 'Completed' | 'Upcoming' | 'Cancelled'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Rating & Tipping Modal State
  const [ratingBooking, setRatingBooking] = useState<Booking | null>(null);
  const [ratingStars, setRatingStars] = useState(5);
  const [selectedBadges, setSelectedBadges] = useState<string[]>(['Smooth Driving', 'Spotless Car']);
  const [tipAmount, setTipAmount] = useState<number>(200);

  // Expense breakdown modal
  const [inspectBooking, setInspectBooking] = useState<Booking | null>(null);

  const availableBadges = [
    'Punctual & On-Time',
    'Smooth Ghat Driving',
    'Spotless Clean Car',
    'Courteous Chauffeur',
    'Safe Night Driver',
    'Luggage Porter Star',
  ];

  const filteredBookings = bookings.filter((b) => {
    let matchesStatus = true;
    if (statusFilter === 'Completed') matchesStatus = b.status === 'Completed';
    else if (statusFilter === 'Upcoming') matchesStatus = b.status === 'Confirmed' || b.status === 'Assigned' || b.status === 'New';
    else if (statusFilter === 'Cancelled') matchesStatus = b.status === 'Cancelled';

    const matchesSearch =
      b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.pickupLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.assignedDriver && b.assignedDriver.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesStatus && matchesSearch;
  });

  const handleToggleBadge = (badge: string) => {
    setSelectedBadges((prev) =>
      prev.includes(badge) ? prev.filter((b) => b !== badge) : [...prev, badge]
    );
  };

  const handleRatingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ratingBooking) return;
    showToast(
      `Thank you! Rated ${ratingStars} Stars for Captain ${ratingBooking.assignedDriver || 'Chauffeur'}${tipAmount > 0 ? ` with ₹${tipAmount} tip.` : '.'}`,
      'success'
    );
    setRatingBooking(null);
  };

  return (
    <div className="space-y-6">

      {/* TOP HEADER & SEARCH / FILTER STRIP */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-200/90 shadow-xs">
        <div>
          <h3 className="text-base font-black text-slate-900">Trip Ledger & Digital Invoices</h3>
          <p className="text-xs text-slate-500">
            View past outstation journeys, odometer readings, FASTag toll slips, and instant GST invoices.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            {(['all', 'Completed', 'Upcoming', 'Cancelled'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                  statusFilter === tab ? 'bg-white text-red-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search destination, trip ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600"
            />
          </div>
        </div>
      </div>

      {/* TRIP HISTORY CARDS */}
      <div className="space-y-3.5">
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs space-y-2">
            <Car className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="font-black text-slate-700 text-sm">No Journeys Found</h4>
            <p className="text-xs text-slate-500">There are no rides matching the selected filter criteria.</p>
          </div>
        ) : (
          filteredBookings.map((trip) => (
            <div
              key={trip.id}
              className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs hover:shadow-md transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="font-black text-red-600 text-sm">{trip.id}</span>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                    trip.status === 'Completed' ? 'bg-slate-100 text-slate-700' :
                    trip.status === 'En Route' ? 'bg-emerald-100 text-emerald-800 animate-pulse' :
                    trip.status === 'Assigned' ? 'bg-blue-100 text-blue-800' :
                    trip.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {trip.status}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">· {trip.travelDate} ({trip.travelTime})</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-base font-black text-slate-900">₹{trip.estimatedTotal.toLocaleString()}</span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">
                    Adv: ₹{trip.advancePaid.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Transit Itinerary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="space-y-1.5">
                  <div className="flex items-start gap-2 text-slate-600">
                    <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                    <span><b>Pickup:</b> {trip.pickupLocation}</span>
                  </div>
                  <div className="flex items-start gap-2 text-slate-900">
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span><b>Drop:</b> {trip.destination}</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1 text-slate-600 text-[11px]">
                  <div className="flex justify-between">
                    <span>Vehicle Tier:</span>
                    <span className="font-bold text-slate-800">{trip.vehicleName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Chauffeur:</span>
                    <span className="font-bold text-slate-800">
                      {trip.assignedDriver ? `${trip.assignedDriver} (${trip.assignedCarNumber})` : 'Awaiting Assignment'}
                    </span>
                  </div>
                  {trip.startKm && trip.endKm && (
                    <div className="flex justify-between font-mono text-[10px] text-slate-500">
                      <span>Odometer Log:</span>
                      <span>{trip.startKm} km ➔ {trip.endKm} km ({trip.endKm - trip.startKm} km)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons: Invoice, Expense Breakdown, Rating */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setInspectBooking(trip)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-all"
                  >
                    View Itemized Expenses
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenInvoiceModal(trip)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-all"
                  >
                    <FileText className="w-3.5 h-3.5 text-red-600" />
                    <span>GST Tax Invoice</span>
                  </button>
                </div>

                {trip.status === 'Completed' && (
                  <button
                    type="button"
                    onClick={() => setRatingBooking(trip)}
                    className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-black font-extrabold rounded-xl text-xs flex items-center gap-1 cursor-pointer shadow-xs transition-all"
                  >
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>Rate & Tip Chauffeur</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* RATING & TIPPING MODAL */}
      {ratingBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h4 className="font-black text-slate-900 text-sm">Rate Captain {ratingBooking.assignedDriver || 'Chauffeur'}</h4>
                <p className="text-xs text-slate-500">Trip #{ratingBooking.id} · {ratingBooking.destination}</p>
              </div>
              <button
                type="button"
                onClick={() => setRatingBooking(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRatingSubmit} className="space-y-4 text-xs">
              {/* Star Rating Selector */}
              <div className="text-center space-y-1">
                <span className="text-slate-500 font-bold block">How was your highway journey?</span>
                <div className="flex justify-center gap-2 pt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRatingStars(star)}
                      className="cursor-pointer transition-transform hover:scale-110"
                    >
                      <Star className={`w-8 h-8 ${star <= ratingStars ? 'text-amber-400 fill-current' : 'text-slate-200'}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Service Badges */}
              <div className="space-y-1.5">
                <span className="font-bold text-slate-700 block">Highlight service accolades:</span>
                <div className="flex flex-wrap gap-1.5">
                  {availableBadges.map((badge) => {
                    const isSelected = selectedBadges.includes(badge);
                    return (
                      <button
                        key={badge}
                        type="button"
                        onClick={() => handleToggleBadge(badge)}
                        className={`px-3 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-all ${
                          isSelected ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {badge}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Digital Tipping */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 block">Add a direct tip to chauffeur wallet:</span>
                <div className="grid grid-cols-4 gap-2">
                  {[0, 100, 200, 500].map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => setTipAmount(amount)}
                      className={`py-1.5 rounded-xl font-extrabold text-xs cursor-pointer border transition-all ${
                        tipAmount === amount ? 'border-red-600 bg-red-600 text-white' : 'border-slate-200 bg-white text-slate-700'
                      }`}
                    >
                      {amount === 0 ? 'No Tip' : `₹${amount}`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRatingBooking(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  Skip
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold cursor-pointer shadow-sm"
                >
                  Submit Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ITEMIZED EXPENSE BREAKDOWN MODAL */}
      {inspectBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h4 className="font-black text-slate-900 text-sm">Itemized Fare Audit: {inspectBooking.id}</h4>
                <p className="text-xs text-slate-500">{inspectBooking.destination}</p>
              </div>
              <button
                type="button"
                onClick={() => setInspectBooking(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs divide-y divide-slate-100">
              <div className="flex justify-between py-1">
                <span className="text-slate-600">Base Transport Fare</span>
                <span className="font-bold text-slate-900">₹{(inspectBooking.estimatedTotal * 0.85).toFixed(0)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-600">FASTag Toll Passes & State Entry</span>
                <span className="font-bold text-slate-900">₹{inspectBooking.tollCharges || 680}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-600">Chauffeur Daily & Night Allowance</span>
                <span className="font-bold text-slate-900">₹{inspectBooking.parkingCharges ? inspectBooking.parkingCharges + 500 : 500}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-600">GST (5% Composite Scheme)</span>
                <span className="font-bold text-slate-900">₹{(inspectBooking.estimatedTotal * 0.05).toFixed(0)}</span>
              </div>
              <div className="flex justify-between py-2 border-t font-black text-sm text-slate-900">
                <span>Total Amount</span>
                <span>₹{inspectBooking.estimatedTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 text-emerald-700 font-bold">
                <span>Advance Paid Online (25%)</span>
                <span>-₹{inspectBooking.advancePaid.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 text-red-700 font-black">
                <span>Balance Settled</span>
                <span>₹{(inspectBooking.estimatedTotal - inspectBooking.advancePaid).toLocaleString()}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t">
              <button
                type="button"
                onClick={() => setInspectBooking(null)}
                className="px-5 py-2 bg-slate-900 text-white rounded-xl font-bold cursor-pointer"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

