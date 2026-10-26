import React, { useState } from 'react';
import { useCms } from '../context/CmsContext';
import { INITIAL_RIDERS } from '../data/initialData';
import { 
  X, User, Phone, Mail, MapPin, CheckCircle2, 
  ArrowRight, ShieldCheck, LogOut, Sparkles 
} from 'lucide-react';

export const UserAuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, closeAuthModal, currentRider, 
    loginRider, logoutRider, userLocation, openBookingModal 
  } = useCms();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState(userLocation || 'Hyderabad');

  if (!isAuthModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      alert('Please enter your full name and mobile number.');
      return;
    }
    loginRider({
      name,
      phone,
      email,
      city: city || userLocation || 'Hyderabad',
    });
  };

  const handleQuickDemoLogin = (rider: typeof INITIAL_RIDERS[0]) => {
    loginRider({
      name: rider.name,
      phone: rider.phone,
      email: rider.email,
      city: rider.city,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden text-slate-800 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-red-100 border border-red-200 flex items-center justify-center text-red-600">
              <User className="w-4 h-4" />
            </span>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-red-600 block">
                Rider Account
              </span>
              <h3 className="text-base font-extrabold text-slate-900">
                {currentRider ? 'Your Rider Profile' : 'Quick Sign-In / Register'}
              </h3>
            </div>
          </div>
          <button
            onClick={closeAuthModal}
            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs">
          
          {/* ALREADY LOGGED IN VIEW */}
          {currentRider ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-600 text-white font-bold flex items-center justify-center text-sm shadow-md shadow-red-600/30">
                      {currentRider.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{currentRider.name}</h4>
                      <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Active Rider
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={logoutRider}
                    className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-red-50 text-slate-600 hover:text-red-600 border border-slate-200 text-[11px] flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                  >
                    <LogOut className="w-3 h-3" />
                    <span>Sign Out</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-0.5 shadow-xs">
                    <span className="text-slate-400 block text-[10px] font-bold">PHONE</span>
                    <span className="font-semibold text-slate-800 block truncate">{currentRider.phone}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-0.5 shadow-xs">
                    <span className="text-slate-400 block text-[10px] font-bold">CITY / PICKUP</span>
                    <span className="font-semibold text-slate-800 block truncate">{currentRider.city}</span>
                  </div>
                </div>

                {currentRider.email && (
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-[11px] shadow-xs">
                    <span className="text-slate-400 block text-[10px] font-bold">EMAIL (GST INVOICES)</span>
                    <span className="font-semibold text-slate-800 block truncate">{currentRider.email}</span>
                  </div>
                )}
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-emerald-800 text-[11px]">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Your details will auto-fill on all cab bookings for 1-tap express checkout.</span>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    closeAuthModal();
                    openBookingModal('Express Doorstep');
                  }}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-red-600/30 cursor-pointer"
                >
                  <span>Book Ride Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={closeAuthModal}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* NEW USER SIGN-IN / REGISTER FORM */
            <div className="space-y-4">
              
              {/* Notice */}
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-slate-700 text-[11px] flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>
                  Enter only necessary details for driver dispatch and trip invoices. Zero passwords or long questionnaires.
                </span>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Ramesh Reddy"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:bg-white text-xs shadow-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Mobile Number * (For Driver WhatsApp & SMS)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:bg-white text-xs shadow-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      City / Area
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="e.g. Hyderabad"
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:bg-white text-xs shadow-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Email <span className="text-[10px] text-slate-400">(Optional)</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@email.com"
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:bg-white text-xs shadow-xs"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs shadow-md shadow-red-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>Save & Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Quick 1-Tap Demo Rider Profiles */}
              <div className="pt-3 border-t border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-2">
                  Or Test Instantly with Demo Rider (1-Tap):
                </span>
                <div className="grid grid-cols-1 gap-1.5">
                  {INITIAL_RIDERS.map((rider) => (
                    <button
                      key={rider.id}
                      type="button"
                      onClick={() => handleQuickDemoLogin(rider)}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-red-400 hover:bg-red-50/40 text-left flex items-center justify-between transition-colors cursor-pointer group shadow-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 group-hover:bg-red-600 group-hover:text-white flex items-center justify-center text-xs font-bold transition-colors">
                          {rider.name.slice(0, 1)}
                        </span>
                        <div>
                          <span className="font-bold text-slate-900 block text-xs">{rider.name}</span>
                          <span className="text-[10px] text-slate-500 block">{rider.phone} · {rider.city}</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-red-600 font-bold flex items-center gap-0.5">
                        <span>Select</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
