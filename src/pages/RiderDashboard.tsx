import React, { useState, useMemo } from 'react';
import { useCms } from '../context/CmsContext';
import { 
  Booking, RiderProfile, RiderPreferences, 
  FamilyPassengerProfile, EmergencyContact, RiderPaymentMethod 
} from '../types';
import { INITIAL_DEMO_RIDER } from '../data/riderInitialData';

// 7 Modular Sub-Components
import { ActiveFlightDeck } from '../components/rider/ActiveFlightDeck';
import { FamilyConsole } from '../components/rider/FamilyConsole';
import { TripHistoryModule } from '../components/rider/TripHistoryModule';
import { SafetyCenterModule } from '../components/rider/SafetyCenterModule';
import { WalletBillingModule } from '../components/rider/WalletBillingModule';
import { SavedToursModule } from '../components/rider/SavedToursModule';
import { ProfilePreferencesModule } from '../components/rider/ProfilePreferencesModule';

import {
  Navigation, Car, Users, History, ShieldAlert, 
  Wallet, Compass, User, LogOut, ArrowRight, 
  Clock, CheckCircle2, Sparkles, Phone, MapPin, 
  CreditCard, AlertTriangle, FileText, X, Download, 
  Printer, ExternalLink, ShieldCheck, Heart, Sliders,
  Check, Info, ChevronRight, Shield
} from 'lucide-react';

export type RiderDashboardTab = 
  | 'flightDeck' 
  | 'family' 
  | 'history' 
  | 'safety' 
  | 'wallet' 
  | 'tours' 
  | 'profile';

export const RiderDashboard: React.FC = () => {
  const { 
    currentRider, loginRider, logoutRider, openAuthModal, 
    bookings, packages, navigateToBooking, openBookingModal, showToast 
  } = useCms();

  // Active Tab
  const [activeTab, setActiveTab] = useState<RiderDashboardTab>('flightDeck');

  // Fallback demo state if user hasn't logged in with personal account
  const activeRiderData: RiderProfile = useMemo(() => {
    return currentRider || INITIAL_DEMO_RIDER;
  }, [currentRider]);

  // Local state for dynamic changes inside the dashboard session
  const [rider, setRider] = useState<RiderProfile>(activeRiderData);
  const [walletBalance, setWalletBalance] = useState<number>(activeRiderData.walletBalance || 2450);
  const [familyProfiles, setFamilyProfiles] = useState<FamilyPassengerProfile[]>(activeRiderData.familyProfiles || []);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>(activeRiderData.emergencyContacts || []);
  const [paymentMethods, setPaymentMethods] = useState<RiderPaymentMethod[]>(activeRiderData.savedPaymentMethods || []);
  const [preferences, setPreferences] = useState<RiderPreferences>(activeRiderData.preferences || INITIAL_DEMO_RIDER.preferences!);

  // Modal for GST Tax Invoice preview
  const [invoiceModalBooking, setInvoiceModalBooking] = useState<Booking | null>(null);

  // Active Ride identification
  const activeRideBooking = useMemo(() => {
    return (
      bookings.find((b) => b.status === 'En Route' || b.status === 'Assigned') ||
      bookings[0] ||
      null
    );
  }, [bookings]);

  // Keep local state in sync when activeRiderData changes
  React.useEffect(() => {
    setRider(activeRiderData);
    setWalletBalance(activeRiderData.walletBalance || 2450);
    setFamilyProfiles(activeRiderData.familyProfiles || []);
    setEmergencyContacts(activeRiderData.emergencyContacts || []);
    setPaymentMethods(activeRiderData.savedPaymentMethods || []);
    setPreferences(activeRiderData.preferences || INITIAL_DEMO_RIDER.preferences!);
  }, [activeRiderData]);

  // Handlers for Sub-Modules
  const handleUpdatePreferences = (updatedPrefs: Partial<RiderPreferences>) => {
    const nextPrefs = { ...preferences, ...updatedPrefs };
    setPreferences(nextPrefs);
    setRider((prev) => ({ ...prev, preferences: nextPrefs }));
  };

  const handleUpdateProfile = (updatedProfile: Partial<RiderProfile>) => {
    setRider((prev) => ({ ...prev, ...updatedProfile }));
  };

  const handleAddFamilyProfile = (profile: Omit<FamilyPassengerProfile, 'id'>) => {
    const newProfile: FamilyPassengerProfile = {
      ...profile,
      id: `fam-${Date.now().toString(36)}`,
    };
    setFamilyProfiles((prev) => [newProfile, ...prev]);
  };

  const handleDeleteFamilyProfile = (id: string) => {
    setFamilyProfiles((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSelectFamilyForBooking = (profile: FamilyPassengerProfile) => {
    openBookingModal(`Booking for ${profile.name} (${profile.relationship})`);
    showToast(`Initiating booking for ${profile.name}`, 'info');
  };

  const handleAddEmergencyContact = (contact: Omit<EmergencyContact, 'id'>) => {
    const newContact: EmergencyContact = {
      ...contact,
      id: `emg-${Date.now().toString(36)}`,
    };
    setEmergencyContacts((prev) => [...prev, newContact]);
  };

  const handleDeleteEmergencyContact = (id: string) => {
    setEmergencyContacts((prev) => prev.filter((c) => c.id !== id));
  };

  const handleToggleContactAlert = (id: string, type: 'start' | 'end') => {
    setEmergencyContacts((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        return type === 'start'
          ? { ...c, notifyOnTripStart: !c.notifyOnTripStart }
          : { ...c, notifyOnTripEnd: !c.notifyOnTripEnd };
      })
    );
    showToast('Emergency contact automated alert updated', 'info');
  };

  const handleAddPaymentMethod = (pm: Omit<RiderPaymentMethod, 'id'>) => {
    const newPm: RiderPaymentMethod = {
      ...pm,
      id: `pm-${Date.now().toString(36)}`,
    };
    setPaymentMethods((prev) => [newPm, ...prev]);
  };

  const handleDeletePaymentMethod = (id: string) => {
    setPaymentMethods((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSetDefaultPaymentMethod = (id: string) => {
    setPaymentMethods((prev) =>
      prev.map((p) => ({
        ...p,
        isDefault: p.id === id,
      }))
    );
    showToast('Default payment method updated', 'success');
  };

  const handleTopUpWallet = (amount: number) => {
    setWalletBalance((prev) => prev + amount);
  };

  const handleSwitchToDemoProfile = () => {
    loginRider({
      name: INITIAL_DEMO_RIDER.name,
      phone: INITIAL_DEMO_RIDER.phone,
      email: INITIAL_DEMO_RIDER.email,
      city: INITIAL_DEMO_RIDER.city,
    });
  };

  // Tab definitions
  const tabs = [
    {
      id: 'flightDeck' as RiderDashboardTab,
      label: 'Live Flight-Deck',
      shortLabel: 'Radar & Trip',
      icon: Navigation,
      badge: activeRideBooking?.status === 'En Route' ? 'Live GPS' : undefined,
    },
    {
      id: 'family' as RiderDashboardTab,
      label: 'Family & Guests',
      shortLabel: 'Family',
      icon: Users,
      badge: familyProfiles.length > 0 ? `${familyProfiles.length}` : undefined,
    },
    {
      id: 'history' as RiderDashboardTab,
      label: 'Trip History & Receipts',
      shortLabel: 'Trips',
      icon: History,
      badge: bookings.length > 0 ? `${bookings.length}` : undefined,
    },
    {
      id: 'safety' as RiderDashboardTab,
      label: 'Safety Center & SOS',
      shortLabel: 'Safety SOS',
      icon: ShieldAlert,
      badge: '24/7',
    },
    {
      id: 'wallet' as RiderDashboardTab,
      label: 'Payments & Wallet',
      shortLabel: 'Wallet',
      icon: Wallet,
      badge: `₹${walletBalance.toLocaleString()}`,
    },
    {
      id: 'tours' as RiderDashboardTab,
      label: 'Curated Tours & Wishlist',
      shortLabel: 'Tours',
      icon: Compass,
      badge: `${packages.length}`,
    },
    {
      id: 'profile' as RiderDashboardTab,
      label: 'Profile & Ride Comfort',
      shortLabel: 'Preferences',
      icon: Sliders,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors pb-16">
      
      {/* 1. DEMO MODE NOTICE STRIP (Shown when viewing in guest / demo mode) */}
      {!currentRider && (
        <div className="bg-gradient-to-r from-red-900 via-rose-900 to-slate-900 text-white px-4 py-2.5 text-xs border-b border-red-800 shadow-inner">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping shrink-0" />
              <span className="text-white/90">
                You are viewing the <strong>Interactive Rider Flight-Deck Demo</strong> as{' '}
                <span className="text-amber-300 font-bold">{INITIAL_DEMO_RIDER.name}</span> (Executive Travel Member).
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSwitchToDemoProfile}
                className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white text-[11px] font-bold transition-all shadow-xs cursor-pointer"
              >
                Sync Demo Session
              </button>
              <button
                type="button"
                onClick={openAuthModal}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold transition-all border border-white/20 cursor-pointer"
              >
                Sign In With Your Mobile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. TOP HERO BRAND STAGE */}
      <section className="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800 text-white pt-8 pb-10 border-b border-slate-800 relative overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 space-y-6">
          
          {/* Top Row: User Identity & Quick Action Badges */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 p-0.5 shadow-xl shadow-red-600/20 shrink-0">
                <div className="w-full h-full rounded-[14px] bg-slate-900 flex items-center justify-center text-white text-xl sm:text-2xl font-black">
                  {rider.name.slice(0, 2).toUpperCase()}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                    {rider.name}
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                    <CheckCircle2 className="w-3 h-3" /> Verified Member
                  </span>
                  {preferences.corporateDomain && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 text-[10px] font-bold">
                      <Sparkles className="w-3 h-3 text-blue-400" />
                      {preferences.corporateDomain} · 5% Tariff Discount
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 mt-1">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-red-400" />
                    <span>{rider.phone}</span>
                  </span>
                  <span className="hidden sm:inline text-slate-600">•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-red-400" />
                    <span>{rider.city}</span>
                  </span>
                  <span className="hidden sm:inline text-slate-600">•</span>
                  <span className="text-slate-400">
                    Member since {new Date(rider.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Balance & Safety Status Cards */}
            <div className="flex flex-wrap items-center gap-3">
              
              {/* Wayora Wallet Quick Card */}
              <div 
                onClick={() => setActiveTab('wallet')}
                className="px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 hover:border-red-500/50 hover:bg-white/10 transition-all cursor-pointer flex items-center gap-3 shadow-lg"
              >
                <div className="w-8 h-8 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center">
                  <Wallet className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    Wayora Wallet
                  </span>
                  <span className="text-sm font-black text-white">
                    ₹{walletBalance.toLocaleString()}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>

              {/* SOS Safety Indicator */}
              <div 
                onClick={() => setActiveTab('safety')}
                className="px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 hover:border-red-500/50 hover:bg-white/10 transition-all cursor-pointer flex items-center gap-3 shadow-lg"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    Security Center
                  </span>
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    24/7 Guarded
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>

              {/* Book Ride CTA */}
              <button
                type="button"
                onClick={() => openBookingModal('Express Doorstep')}
                className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 flex items-center gap-2 cursor-pointer transition-transform hover:scale-105 active:scale-95"
              >
                <Car className="w-4 h-4" />
                <span>Book Outstation</span>
              </button>

              {currentRider && (
                <button
                  type="button"
                  onClick={logoutRider}
                  className="p-2.5 rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:text-red-400 hover:bg-white/10 transition-colors cursor-pointer"
                  title="Sign out of rider account"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>

          </div>

          {/* Active Trip Telemetry Alert Bar */}
          {activeRideBooking && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-red-950/80 via-slate-900 to-rose-950/80 border border-red-700/60 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-md shadow-red-600/40 shrink-0">
                  <Navigation className="w-4 h-4 animate-spin text-white" style={{ animationDuration: '6s' }} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-white text-sm">
                      Active Trip #{activeRideBooking.id}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] border border-emerald-500/40 animate-pulse">
                      {activeRideBooking.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px] mt-0.5">
                    {activeRideBooking.pickupLocation} <span className="text-red-400 font-bold">&rarr;</span> {activeRideBooking.destination} · Chauffeur {activeRideBooking.assignedDriver || 'Raju Goud'} ({activeRideBooking.assignedCarNumber || 'TS 09 UB 4421'})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveTab('flightDeck')}
                  className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Open Radar Flight-Deck</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

        </div>
      </section>

      {/* 3. RESPONSIVE HORIZONTAL NAVIGATION TABS BAR */}
      <div className="sticky top-18 sm:top-20 z-30 bg-white/95 backdrop-blur-xl border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <nav className="flex items-center gap-1 overflow-x-auto py-2.5 no-scrollbar text-xs font-bold" aria-label="Rider Navigation">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    window.scrollTo({ top: 180, behavior: 'smooth' });
                  }}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-red-600 text-white shadow-md shadow-red-600/25 font-black'
                      : 'bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-red-600'}`} />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="inline sm:hidden">{tab.shortLabel}</span>

                  {tab.badge && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* 4. MAIN CONTENT WORKSPACE AREA */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        
        {/* MODULE 1: ACTIVE FLIGHT DECK & LIVE TRIP RADAR */}
        {activeTab === 'flightDeck' && (
          <div className="animate-in fade-in duration-200">
            <ActiveFlightDeck
              activeBooking={activeRideBooking}
              savedAddresses={rider.savedAddresses || INITIAL_DEMO_RIDER.savedAddresses!}
              onNavigateToBooking={navigateToBooking}
              showToast={showToast}
            />
          </div>
        )}

        {/* MODULE 2: BOOK FOR FAMILY & GUESTS CONSOLE */}
        {activeTab === 'family' && (
          <div className="animate-in fade-in duration-200">
            <FamilyConsole
              familyProfiles={familyProfiles}
              preferences={preferences}
              onAddFamilyProfile={handleAddFamilyProfile}
              onDeleteFamilyProfile={handleDeleteFamilyProfile}
              onSelectFamilyForBooking={handleSelectFamilyForBooking}
              showToast={showToast}
            />
          </div>
        )}

        {/* MODULE 3: TRIP HISTORY & DIGITAL RECEIPTS */}
        {activeTab === 'history' && (
          <div className="animate-in fade-in duration-200">
            <TripHistoryModule
              bookings={bookings}
              onOpenInvoiceModal={(b) => setInvoiceModalBooking(b)}
              showToast={showToast}
            />
          </div>
        )}

        {/* MODULE 4: SAFETY CENTER & SOS PROTOCOL */}
        {activeTab === 'safety' && (
          <div className="animate-in fade-in duration-200">
            <SafetyCenterModule
              emergencyContacts={emergencyContacts}
              onAddEmergencyContact={handleAddEmergencyContact}
              onDeleteEmergencyContact={handleDeleteEmergencyContact}
              onToggleContactAlert={handleToggleContactAlert}
              showToast={showToast}
            />
          </div>
        )}

        {/* MODULE 5: PAYMENTS, WALLET & BILLING VAULT */}
        {activeTab === 'wallet' && (
          <div className="animate-in fade-in duration-200">
            <WalletBillingModule
              walletBalance={walletBalance}
              paymentMethods={paymentMethods}
              bookings={bookings}
              onAddPaymentMethod={handleAddPaymentMethod}
              onDeletePaymentMethod={handleDeletePaymentMethod}
              onSetDefaultPaymentMethod={handleSetDefaultPaymentMethod}
              onTopUpWallet={handleTopUpWallet}
              showToast={showToast}
            />
          </div>
        )}

        {/* MODULE 6: CURATED TOURS & SAVED PACKAGES */}
        {activeTab === 'tours' && (
          <div className="animate-in fade-in duration-200">
            <SavedToursModule
              packages={packages}
              onOpenBookingModal={openBookingModal}
              showToast={showToast}
            />
          </div>
        )}

        {/* MODULE 7: PROFILE & RIDE COMFORT PREFERENCES */}
        {activeTab === 'profile' && (
          <div className="animate-in fade-in duration-200">
            <ProfilePreferencesModule
              rider={rider}
              onUpdatePreferences={handleUpdatePreferences}
              onUpdateProfile={handleUpdateProfile}
              showToast={showToast}
            />
          </div>
        )}

      </main>

      {/* ================= 5. GST TAX INVOICE PREVIEW & DOWNLOAD MODAL ================= */}
      {invoiceModalBooking && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in"
          onClick={() => setInvoiceModalBooking(null)}
        >
          <div 
            className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-8 text-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-red-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-md">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-red-400 block">
                    Official GST Tax Invoice
                  </span>
                  <h3 className="text-base font-extrabold text-white">
                    Invoice #{invoiceModalBooking.id}-INV
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setInvoiceModalBooking(null)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Printable Invoice Body */}
            <div className="p-6 space-y-6 text-xs text-slate-800">
              
              {/* Wayora Brand & GST Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-4 border-b border-slate-200">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-lg text-slate-900 tracking-tight">WAYORA JOURNEYS</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-bold">Red Edition</span>
                  </div>
                  <p className="text-slate-500 text-[11px]">
                    Wayora Mobility Private Limited · Luxury Outstation & Chauffeur Services
                  </p>
                  <p className="text-slate-600 font-mono text-[10px]">
                    GSTIN: <span className="font-bold">36AAACW1234F1Z8</span> · SAC Code: <strong>996412</strong> (Passenger Transport)
                  </p>
                  <p className="text-slate-500 text-[10px]">
                    Plot 18, Road No. 36, Jubilee Hills, Hyderabad, Telangana 500033
                  </p>
                </div>

                <div className="sm:text-right space-y-1 bg-slate-50 p-3 rounded-2xl border border-slate-200 shrink-0">
                  <span className="text-slate-400 block text-[10px] font-bold">INVOICE NUMBER</span>
                  <span className="font-mono font-bold text-slate-900 block text-sm">
                    WY-INV-2026-{invoiceModalBooking.id.replace('WY-', '')}
                  </span>
                  <span className="text-slate-400 block text-[10px] font-bold mt-1">DATE OF ISSUE</span>
                  <span className="font-semibold text-slate-800 block">
                    {invoiceModalBooking.travelDate || invoiceModalBooking.createdAt || '28 Oct 2026'}
                  </span>
                </div>
              </div>

              {/* Billed To & Journey Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-slate-200">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">BILLED TO (PASSENGER)</span>
                  <p className="font-bold text-slate-900 text-sm">{invoiceModalBooking.customerName}</p>
                  <p className="text-slate-600">{invoiceModalBooking.customerPhone}</p>
                  {preferences.corporateDomain && (
                    <p className="text-blue-600 font-mono text-[10px] font-semibold">
                      Corporate GSTIN: 36ABCDE1234F2Z5 ({preferences.corporateDomain})
                    </p>
                  )}
                  <p className="text-slate-500">{invoiceModalBooking.pickupLocation}</p>
                </div>

                <div className="space-y-1 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ROUTE & TELEMETRY</span>
                  <p className="font-semibold text-slate-900">
                    {invoiceModalBooking.pickupLocation} &rarr; {invoiceModalBooking.destination}
                  </p>
                  <p className="text-slate-600">
                    Vehicle: <strong>{invoiceModalBooking.vehicleName || 'Toyota Innova Crysta'}</strong> ({invoiceModalBooking.assignedCarNumber || 'TS 09 UB 4421'})
                  </p>
                  <p className="text-slate-600">
                    Chauffeur: <strong>{invoiceModalBooking.assignedDriver || 'Raju Goud'}</strong>
                  </p>
                  <p className="text-slate-500 font-mono text-[10px]">
                    Odometer: Start {invoiceModalBooking.startKm || 44200} km · End {invoiceModalBooking.endKm || 44640} km (440 km billed)
                  </p>
                </div>
              </div>

              {/* Itemized Line Items Table */}
              <div className="space-y-2">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-[10px] uppercase font-bold text-slate-500">
                      <th className="py-2">Item Description</th>
                      <th className="py-2 text-center">Qty / KM</th>
                      <th className="py-2 text-right">Unit Rate</th>
                      <th className="py-2 text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[11px]">
                    <tr>
                      <td className="py-2.5 font-medium text-slate-800">
                        Outstation Round-Trip Package Base Charge
                      </td>
                      <td className="py-2.5 text-center text-slate-600">1 Trip</td>
                      <td className="py-2.5 text-right font-mono">₹{Math.round(invoiceModalBooking.estimatedTotal * 0.72).toLocaleString()}</td>
                      <td className="py-2.5 text-right font-bold text-slate-900 font-mono">
                        ₹{Math.round(invoiceModalBooking.estimatedTotal * 0.72).toLocaleString()}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-medium text-slate-800">
                        State Highway FASTag Electronic Tolls (Itemized)
                      </td>
                      <td className="py-2.5 text-center text-slate-600">3 Plazas</td>
                      <td className="py-2.5 text-right font-mono">₹{invoiceModalBooking.tollCharges || 340}</td>
                      <td className="py-2.5 text-right font-bold text-slate-900 font-mono">
                        ₹{invoiceModalBooking.tollCharges || 340}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-medium text-slate-800">
                        Chauffeur Night Allowance (22:00 - 06:00)
                      </td>
                      <td className="py-2.5 text-center text-slate-600">1 Night</td>
                      <td className="py-2.5 text-right font-mono">₹300</td>
                      <td className="py-2.5 text-right font-bold text-slate-900 font-mono">
                        ₹300
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-medium text-slate-800">
                        CGST @ 2.5% + SGST @ 2.5% (Total GST 5%)
                      </td>
                      <td className="py-2.5 text-center text-slate-600">SAC 996412</td>
                      <td className="py-2.5 text-right font-mono">5%</td>
                      <td className="py-2.5 text-right font-bold text-slate-900 font-mono">
                        ₹{Math.round(invoiceModalBooking.estimatedTotal * 0.05).toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Total & Split Advance vs Balance Table */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex justify-between items-center text-slate-600 text-xs">
                  <span>Gross Invoice Total (Inclusive of all Taxes)</span>
                  <span className="font-bold text-slate-900 text-base font-mono">
                    ₹{invoiceModalBooking.estimatedTotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px] text-emerald-700 font-semibold border-t border-slate-200/80 pt-1.5">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 25% Online Advance Confirmed
                  </span>
                  <span className="font-mono">
                    - ₹{Math.round(invoiceModalBooking.estimatedTotal * 0.25).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs font-bold text-slate-900 border-t border-slate-200/80 pt-1.5">
                  <span>Balance 75% Settled at Trip Completion (Card/UPI/Wallet)</span>
                  <span className="font-mono text-emerald-600">
                    ₹{Math.round(invoiceModalBooking.estimatedTotal * 0.75).toLocaleString()} (PAID)
                  </span>
                </div>
              </div>

              {/* Legal Note & Signatory */}
              <div className="pt-2 text-[10px] text-slate-500 space-y-1">
                <p>
                  * This is a computer generated tax invoice issued under Rule 46 of the CGST Rules, 2017. Valid for Input Tax Credit (ITC) where applicable.
                </p>
                <p>
                  Questions or reimbursement queries? Contact corporate accounts at accounts@wayorajourneys.com or 24/7 concierge at +91 91212 91212.
                </p>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
              <span className="text-[10px] text-slate-500 font-mono">
                Digitally Signed by Wayora Journeys Accounts Deck
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    window.print();
                    showToast('Opening print dialog for GST Tax Invoice', 'info');
                  }}
                  className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    showToast(`Tax invoice WY-INV-2026-${invoiceModalBooking.id.replace('WY-', '')}.pdf downloaded!`, 'success');
                  }}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-red-600/30"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
