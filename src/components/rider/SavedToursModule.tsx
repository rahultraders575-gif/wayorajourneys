import React, { useState } from 'react';
import { TourPackage } from '../../types';
import {
  Compass, Heart, Calendar, Clock, MapPin, 
  ArrowRight, ShieldCheck, Mountain, Star, Plus, 
  Send, X, CheckCircle2, MessageSquare
} from 'lucide-react';

interface SavedToursModuleProps {
  packages: TourPackage[];
  onOpenBookingModal: (tourTitle?: string) => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const SavedToursModule: React.FC<SavedToursModuleProps> = ({
  packages,
  onOpenBookingModal,
  showToast,
}) => {
  const [wishlist, setWishlist] = useState<string[]>(['tirupati', 'goa', 'araku']);
  const [selectedTour, setSelectedTour] = useState<TourPackage>(packages[0]);
  
  // Custom VIP Quote Request Modal
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [quoteRoute, setQuoteRoute] = useState('Hyderabad to Hampi & Badami Caves');
  const [quoteFleetTier, setQuoteFleetTier] = useState('Toyota Fortuner VIP (7-Seater)');
  const [quotePassengers, setQuotePassengers] = useState('6 Adults + 2 Kids');
  const [quoteDates, setQuoteDates] = useState('14 Nov – 17 Nov 2026');
  const [quoteNotes, setQuoteNotes] = useState('Need luggage carrier on roof and experienced Kannada/Telugu speaking chauffeur.');

  const handleToggleWishlist = (id: string, title: string) => {
    setWishlist((prev) => {
      const exists = prev.includes(id);
      const next = exists ? prev.filter((item) => item !== id) : [...prev, id];
      showToast(exists ? `Removed ${title} from wishlist` : `Saved ${title} to your road-trip wishlist!`, 'info');
      return next;
    });
  };

  const handleQuoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast(`VIP Fleet Quote request dispatched for ${quoteRoute}! Our concierge will WhatsApp you within 30 minutes.`, 'success');
    setIsQuoteModalOpen(false);
  };

  return (
    <div className="space-y-6">

      {/* TOP HEADER & ACTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-200/90 shadow-xs">
        <div>
          <h3 className="text-base font-black text-slate-900">Curated Tour Itineraries & Road-Trip Wishlist</h3>
          <p className="text-xs text-slate-500">
            Day-by-day sightseeing timelines, hotel stay notes, and custom VIP fleet quote requests.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsQuoteModalOpen(true)}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-all whitespace-nowrap"
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Request Custom VIP Fleet Quote</span>
        </button>
      </div>

      {/* 2-COLUMN VIEW: SAVED WISHLIST TOURS + DETAILED DAY-WISE TIMELINE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT: WISHLIST CARDS */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {packages.map((pkg) => {
              const isSaved = wishlist.includes(pkg.id);
              return (
                <div
                  key={pkg.id}
                  onClick={() => setSelectedTour(pkg)}
                  className={`bg-white rounded-3xl border overflow-hidden shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between ${
                    selectedTour.id === pkg.id ? 'border-red-600 ring-2 ring-red-500/20' : 'border-slate-200'
                  }`}
                >
                  <div>
                    <div className="relative h-40 overflow-hidden bg-slate-100">
                      <img
                        src={pkg.imageUrl}
                        alt={pkg.title}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-3 left-3 text-[10px] font-black px-2.5 py-0.5 rounded-full bg-red-600 text-white shadow-2xs">
                        {pkg.categoryLabel}
                      </span>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleWishlist(pkg.id, pkg.title);
                        }}
                        className={`absolute top-3 right-3 p-1.5 rounded-full cursor-pointer transition-all ${
                          isSaved ? 'bg-red-600 text-white shadow-md' : 'bg-black/50 text-white hover:bg-black/80'
                        }`}
                        title={isSaved ? 'Saved in Wishlist' : 'Add to Wishlist'}
                      >
                        <Heart className="w-4 h-4 fill-current" />
                      </button>
                    </div>

                    <div className="p-4 space-y-2">
                      <div>
                        <h4 className="font-black text-slate-900 text-sm">{pkg.title}</h4>
                        <p className="text-[11px] text-red-600 font-bold">{pkg.tagline}</p>
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-2">{pkg.description}</p>

                      <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase font-bold">Estimated Total</span>
                          <span className="font-extrabold text-slate-900 text-sm">₹{pkg.fromPrice.toLocaleString()}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-slate-400 block text-[9px] uppercase font-bold">Duration</span>
                          <span className="font-bold text-slate-700">{pkg.duration}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 pt-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenBookingModal(pkg.title);
                      }}
                      className="w-full py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5"
                    >
                      <span>Reserve Tour Itinerary</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT: SELECTED TOUR TIMELINE INSPECTOR */}
        {selectedTour && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5 h-fit sticky top-6">
            <div className="border-b pb-3">
              <span className="text-[10px] font-extrabold text-red-600 uppercase tracking-wider block">
                Itinerary Schedule
              </span>
              <h4 className="text-base font-black text-slate-900">{selectedTour.title}</h4>
              <p className="text-xs text-slate-500 mt-0.5">{selectedTour.duration} · {selectedTour.estimatedDistanceKm} km round-trip</p>
            </div>

            {/* Inclusions */}
            {selectedTour.inclusionsList && (
              <div className="space-y-1 text-xs">
                <span className="font-bold text-slate-900 block">Package Inclusions:</span>
                <ul className="space-y-1 text-slate-600">
                  {selectedTour.inclusionsList.map((inc, i) => (
                    <li key={i} className="flex items-center gap-1.5 text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      <span>{inc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Day-by-Day Timeline */}
            <div className="space-y-3 pt-1">
              <span className="font-bold text-slate-900 text-xs block">Day-by-Day Schedule:</span>
              {(selectedTour.itinerary || [
                {
                  dayNumber: 1,
                  title: 'Doorstep Pickup & Highway Cruise',
                  description: 'Departure at 5:00 AM. Chauffeur clears toll lanes with electronic FASTag.',
                  highlights: ['Breakfast oasis', 'Hotel check-in'],
                },
                {
                  dayNumber: 2,
                  title: 'Sightseeing, Darshan & Scenic Lookout',
                  description: 'Full day disposal with reserved parking access.',
                  highlights: ['VIP darshan', 'Sunset view point'],
                },
                {
                  dayNumber: 3,
                  title: 'Leisurely Return to Doorstep',
                  description: 'Comfortable return cruise arriving home before dinner.',
                  highlights: ['Local souvenir shopping', 'Doorstep drop'],
                },
              ]).map((day) => (
                <div key={day.dayNumber} className="relative pl-5 border-l-2 border-red-500/40 space-y-1 text-xs">
                  <div className="absolute -left-[7px] top-0.5 w-3 h-3 rounded-full bg-red-600 ring-2 ring-white" />
                  <h5 className="font-extrabold text-slate-900">Day {day.dayNumber}: {day.title}</h5>
                  <p className="text-[11px] text-slate-600">{day.description}</p>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => onOpenBookingModal(selectedTour.title)}
              className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all"
            >
              Book {selectedTour.title}
            </button>
          </div>
        )}

      </div>

      {/* CUSTOM VIP FLEET QUOTE MODAL */}
      {isQuoteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h4 className="font-black text-slate-900 text-sm">Request Custom Road-Trip & VIP Fleet Quote</h4>
                <p className="text-xs text-slate-500">Specialized itineraries for large families, weddings, or corporate delegations.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsQuoteModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleQuoteSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Custom Circuit Route *</label>
                <input
                  type="text"
                  required
                  value={quoteRoute}
                  onChange={(e) => setQuoteRoute(e.target.value)}
                  placeholder="e.g. Hyderabad to Hampi, Badami & Gokarna"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Preferred Fleet Tier</label>
                  <select
                    value={quoteFleetTier}
                    onChange={(e) => setQuoteFleetTier(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold"
                  >
                    <option value="Toyota Fortuner VIP (7-Seater)">Toyota Fortuner VIP (7-Seater)</option>
                    <option value="Toyota Innova Crysta (6+1 Captain)">Toyota Innova Crysta (6+1 Captain)</option>
                    <option value="Force Urbania Luxury Coach (16-Seater)">Force Urbania Luxury Coach (16-Seater)</option>
                    <option value="Executive Sedan (Etios / Dzire)">Executive Sedan (Etios / Dzire)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Passenger Count</label>
                  <input
                    type="text"
                    value={quotePassengers}
                    onChange={(e) => setQuotePassengers(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Travel Dates / Window</label>
                <input
                  type="text"
                  value={quoteDates}
                  onChange={(e) => setQuoteDates(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Special Requirements & Hotel Notes</label>
                <textarea
                  rows={2}
                  value={quoteNotes}
                  onChange={(e) => setQuoteNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsQuoteModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Request Concierge Quote</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

