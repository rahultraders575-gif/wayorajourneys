import React, { useState } from 'react';
import { useCms, PageId } from '../context/CmsContext';
import { 
  Car, Compass, Shield, UserCheck, Menu, 
  MapPin, Building2, BookOpen, Settings, X, PlusCircle, User 
} from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const { 
    activePage, setActivePage, 
    currentCaptain, currentRider, openAuthModal 
  } = useCms();
  const [hubSheetOpen, setHubSheetOpen] = useState(false);

  const handleTabClick = (page: PageId) => {
    setActivePage(page);
    setHubSheetOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Bottom Navigation Anchor: Visible ONLY on mobile viewports */}
      <nav 
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] md:hidden transition-colors"
        aria-label="Mobile Navigation"
      >
        <div className="max-w-md mx-auto grid grid-cols-5 items-center h-16 px-1">
          
          {/* Tab 1: Ride (Home) */}
          <button
            type="button"
            onClick={() => handleTabClick('home')}
            className={`min-h-[48px] flex flex-col items-center justify-center transition-colors cursor-pointer ${
              activePage === 'home' ? 'text-red-600 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Car className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">Ride</span>
          </button>

          {/* Tab 2: Outstation Tours */}
          <button
            type="button"
            onClick={() => handleTabClick('packages')}
            className={`min-h-[48px] flex flex-col items-center justify-center transition-colors cursor-pointer ${
              activePage === 'packages' ? 'text-red-600 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Compass className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">Tours</span>
          </button>

          {/* Tab 3: Fleet & Tariffs */}
          <button
            type="button"
            onClick={() => handleTabClick('fleet')}
            className={`min-h-[48px] flex flex-col items-center justify-center transition-colors cursor-pointer ${
              activePage === 'fleet' ? 'text-red-600 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Shield className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">Fleet</span>
          </button>

          {/* Tab 4: Captain Cockpit */}
          <button
            type="button"
            onClick={() => handleTabClick('captain')}
            className={`min-h-[48px] flex flex-col items-center justify-center transition-colors relative cursor-pointer ${
              activePage === 'captain' ? 'text-red-600 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <div className="relative">
              <UserCheck className="w-5 h-5 mb-0.5" />
              {currentCaptain?.dutyStatus === 'On Duty' && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </div>
            <span className="text-[10px] tracking-tight">Captain</span>
          </button>

          {/* Tab 5: More Hub Drawer */}
          <button
            type="button"
            onClick={() => setHubSheetOpen(true)}
            className={`min-h-[48px] flex flex-col items-center justify-center transition-colors cursor-pointer ${
              hubSheetOpen || ['corporate', 'planner', 'blog', 'about', 'cms'].includes(activePage)
                ? 'text-red-600 font-bold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Menu className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">More</span>
          </button>

        </div>
      </nav>

      {/* Slide-Up Bottom Sheet for More Options */}
      {hubSheetOpen && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-end justify-center animate-in fade-in md:hidden"
          onClick={() => setHubSheetOpen(false)}
        >
          <div 
            className="w-full max-w-lg bg-white border-t border-slate-200 rounded-t-3xl p-6 space-y-5 shadow-2xl animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Grab handle */}
            <div className="w-12 h-1 bg-slate-300 rounded-full mx-auto -mt-1 mb-2" />

            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-red-600 flex items-center justify-center text-white text-xs font-black shadow-sm">
                  W
                </div>
                <h3 className="font-extrabold text-slate-900 text-sm">Wayora Mobility Hub</h3>
              </div>
              <button 
                onClick={() => setHubSheetOpen(false)} 
                className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Rider Account Strip */}
            <div 
              onClick={() => {
                setHubSheetOpen(false);
                openAuthModal();
              }}
              className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-red-300 flex items-center justify-between cursor-pointer transition-colors shadow-xs"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-red-100 border border-red-200 flex items-center justify-center text-red-600 font-bold text-xs">
                  {currentRider ? currentRider.name.slice(0, 2).toUpperCase() : <User className="w-4 h-4" />}
                </div>
                <div>
                  <span className="font-bold text-slate-900 block text-xs">
                    {currentRider ? currentRider.name : 'Sign In / Register'}
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    {currentRider ? `${currentRider.phone} · Active Rider` : 'Quick 1-tap rider account'}
                  </span>
                </div>
              </div>
              <span className="text-[10px] text-red-700 font-bold px-2 py-1 rounded-lg bg-red-50 border border-red-200">
                {currentRider ? 'Manage' : 'Sign In'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <button
                onClick={() => handleTabClick('planner')}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-red-400 text-left space-y-1 transition-all cursor-pointer shadow-xs hover:bg-red-50/40"
              >
                <MapPin className="w-4 h-4 text-red-600" />
                <span className="font-bold text-slate-900 block">Route Planner</span>
                <span className="text-[10px] text-slate-500 block">Instant distance & tariff</span>
              </button>

              <button
                onClick={() => handleTabClick('corporate')}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-red-400 text-left space-y-1 transition-all cursor-pointer shadow-xs hover:bg-red-50/40"
              >
                <Building2 className="w-4 h-4 text-red-600" />
                <span className="font-bold text-slate-900 block">Corporate Rides</span>
                <span className="text-[10px] text-slate-500 block">Monthly GST fleet contracts</span>
              </button>

              <button
                onClick={() => handleTabClick('blog')}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-red-400 text-left space-y-1 transition-all cursor-pointer shadow-xs hover:bg-red-50/40"
              >
                <BookOpen className="w-4 h-4 text-red-600" />
                <span className="font-bold text-slate-900 block">Travel Guides</span>
                <span className="text-[10px] text-slate-500 block">Highway tips & darshan</span>
              </button>

              <button
                onClick={() => handleTabClick('cms')}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-red-400 text-left space-y-1 transition-all cursor-pointer shadow-xs hover:bg-red-50/40"
              >
                <Settings className="w-4 h-4 text-red-600" />
                <span className="font-bold text-slate-900 block">CMS Dispatch</span>
                <span className="text-[10px] text-slate-500 block">Admin fleet controls</span>
              </button>
            </div>

            <button
              onClick={() => {
                setHubSheetOpen(false);
                handleTabClick('booking');
              }}
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs shadow-md shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Book An Outstation Cab Now</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};
