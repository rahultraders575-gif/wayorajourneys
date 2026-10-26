import React, { useState } from 'react';
import { useCms, PageId } from '../context/CmsContext';
import { Menu, X, Shield, ArrowRight, UserCheck, User, Phone, Car } from 'lucide-react';

export const Header: React.FC = () => {
  const { 
    activePage, setActivePage, openBookingModal, 
    currentCaptain, currentRider, openAuthModal, settings 
  } = useCms();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: PageId; label: string; shortLabel: string }[] = [
    { id: 'home', label: 'Home', shortLabel: 'Home' },
    { id: 'booking', label: 'Car Booking', shortLabel: 'Booking' },
    { id: 'fleet', label: 'Fleet & Rates', shortLabel: 'Fleet' },
    { id: 'packages', label: 'Tour Packages', shortLabel: 'Packages' },
    { id: 'planner', label: 'Route Planner', shortLabel: 'Planner' },
    { id: 'corporate', label: 'Corporate', shortLabel: 'Corporate' },
    { id: 'blog', label: 'Travel Guides', shortLabel: 'Guides' },
    { id: 'about', label: 'About & Support', shortLabel: 'Support' },
  ];

  const handleNavClick = (id: PageId) => {
    setActivePage(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Top Universal Minimal & Premium Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-slate-200/80 shadow-xs transition-colors">
        <div className="max-w-7xl xl:max-w-[1360px] 2xl:max-w-[1440px] mx-auto px-3 sm:px-5 lg:px-6">
          <div className="flex items-center justify-between gap-2.5 sm:gap-4 h-18 sm:h-20">
            
            {/* Zone 1: Official Wayora Journeys Brand Logo */}
            <button
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-2 sm:gap-2.5 group text-left cursor-pointer shrink-0"
              title="Wayora Journeys - Home"
            >
              <img
                src="/images/wayora-logo-light.jpg"
                alt="Wayora Journeys Brand Logo"
                className="w-10 h-10 rounded-xl object-contain shadow-xs border border-slate-200/80 bg-white p-0.5 group-hover:scale-105 transition-transform"
              />
              <div className="flex flex-col">
                <span className="text-slate-900 font-black text-base sm:text-lg 2xl:text-xl leading-tight tracking-tight">
                  Wayora<span className="text-red-600">Journeys</span>
                </span>
                <span className="hidden 2xl:block text-[9px] uppercase font-bold tracking-widest text-slate-500 mt-0.5">
                  Reliable Travel · Professional Service
                </span>
              </div>
            </button>

            {/* Zone 2: Minimal Universal Navigation Links (Smart Adaptive Lengths) */}
            <nav className="hidden xl:flex items-center gap-1.5 2xl:gap-3.5 text-xs 2xl:text-sm font-semibold">
              {navItems.map((item) => {
                const isActive = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer relative py-2 px-1.5 tracking-wide ${
                      isActive ? 'text-red-600 font-bold' : 'text-slate-600 hover:text-red-600'
                    }`}
                  >
                    <span className="hidden 2xl:inline">{item.label}</span>
                    <span className="inline 2xl:hidden">{item.shortLabel}</span>
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600 rounded-full animate-in fade-in" />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Zone 3: Actions + Captain + Rider + Primary CTA */}
            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">

              {/* 24/7 Hotline Pill (Visible on ultra-wide screens to prevent header clutter) */}
              <a
                href={`tel:${settings.phone}`}
                className="hidden 2xl:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-slate-50 border border-slate-200 text-slate-700 hover:text-red-600 hover:border-red-200 hover:bg-red-50/40 transition-colors"
                title="Call 24/7 Concierge Hotline"
              >
                <Phone className="w-3.5 h-3.5 text-red-600" />
                <span className="tracking-tight">{settings.phone}</span>
              </a>

              {/* Captain Cockpit Trigger */}
              <button
                onClick={() => handleNavClick('captain')}
                className={`hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border transition-all cursor-pointer shrink-0 ${
                  activePage === 'captain'
                    ? 'bg-red-50 text-red-700 border-red-300 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-red-200 hover:bg-red-50/50 hover:text-red-600'
                }`}
                title="Captain Chauffeur Partner Cockpit"
              >
                <div className="relative">
                  <UserCheck className="w-3.5 h-3.5 text-red-600" />
                  {currentCaptain?.dutyStatus === 'On Duty' && (
                    <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  )}
                </div>
                <span>Captain</span>
              </button>

              {/* Rider Account Trigger */}
              <button
                type="button"
                onClick={openAuthModal}
                className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer shadow-xs shrink-0"
                title={currentRider ? `Signed in as ${currentRider.name}` : 'Rider Sign In'}
              >
                <div className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-[10px] font-black shrink-0">
                  {currentRider ? currentRider.name.slice(0, 1) : <User className="w-3 h-3" />}
                </div>
                <span className="hidden sm:inline truncate max-w-[85px]">
                  {currentRider ? currentRider.name.split(' ')[0] : 'Sign In'}
                </span>
              </button>

              {/* Primary Book Ride Button (Shrink-proof, no edge cutoff) */}
              <button
                onClick={() => {
                  if (activePage !== 'booking') {
                    handleNavClick('booking');
                  } else {
                    openBookingModal('Express Booking');
                  }
                }}
                className="px-3.5 sm:px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 active:scale-95 rounded-full transition-all shadow-md shadow-red-600/25 flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Car className="w-3.5 h-3.5 shrink-0" />
                <span className="whitespace-nowrap">
                  {activePage === 'booking' ? 'Book Cab' : 'Book Chauffeur'}
                </span>
                <ArrowRight className="w-3.5 h-3.5 shrink-0" />
              </button>

              {/* Mobile Menu Toggle Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="xl:hidden p-2 text-slate-700 hover:text-slate-900 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5 text-red-600" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden fixed inset-x-0 top-18 sm:top-20 z-40 bg-white/98 backdrop-blur-2xl border-b border-slate-200 p-5 space-y-3 shadow-2xl animate-in fade-in slide-in-from-top-2">
          <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-100">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`text-left py-2 px-3 text-xs rounded-xl font-semibold transition-colors ${
                  activePage === item.id
                    ? 'bg-red-50 text-red-700 border-l-3 border-red-600 font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="pt-2 flex flex-col gap-2.5">
            <a
              href={`tel:${settings.phone}`}
              className="w-full py-2.5 px-3 text-xs font-semibold rounded-xl bg-slate-50 text-slate-800 border border-slate-200 flex items-center justify-center gap-2 hover:bg-slate-100 text-center"
            >
              <Phone className="w-4 h-4 text-red-600" />
              <span>Call 24/7 Helpline: {settings.phone}</span>
            </a>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleNavClick('captain')}
                className="py-2.5 px-3 text-xs font-semibold rounded-xl bg-slate-50 text-slate-700 border border-slate-200 flex items-center justify-center gap-2 hover:bg-red-50"
              >
                <UserCheck className="w-4 h-4 text-red-600" />
                <span>Captain Cockpit</span>
              </button>
              <button
                onClick={() => handleNavClick('cms')}
                className="py-2.5 px-3 text-xs font-semibold rounded-xl bg-slate-50 text-slate-700 border border-slate-200 flex items-center justify-center gap-2 hover:bg-red-50"
              >
                <Shield className="w-4 h-4 text-red-600" />
                <span>CMS Admin</span>
              </button>
            </div>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleNavClick('booking');
              }}
              className="w-full py-3 text-xs font-bold rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30 flex items-center justify-center gap-2"
            >
              <Car className="w-4 h-4" />
              <span>Reserve Chauffeur Cab</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};
