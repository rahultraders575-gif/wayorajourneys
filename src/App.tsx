/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CmsProvider, useCms } from './context/CmsContext';
import { LenisProvider, useLenis } from './context/LenisContext';
import { MobileStatusBar } from './components/MobileStatusBar';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { MobileBottomNav } from './components/MobileBottomNav';
import { BookingModal } from './components/BookingModal';
import { UserAuthModal } from './components/UserAuthModal';
import { NotificationToast } from './components/NotificationToast';
import { BackendConnectionIndicator } from './components/BackendConnectionIndicator';

import { HomePage } from './pages/HomePage';
import { PackagesPage } from './pages/PackagesPage';
import { FleetPage } from './pages/FleetPage';
import { PlannerPage } from './pages/PlannerPage';
import { CorporatePage } from './pages/CorporatePage';
import { BlogPage } from './pages/BlogPage';
import { AboutContactPage } from './pages/AboutContactPage';
import { CmsDashboard } from './pages/CmsDashboard';
import { CaptainDashboard } from './pages/CaptainDashboard';
import { BookingPage } from './pages/BookingPage';

import { Phone, MessageSquare, X, Headphones } from 'lucide-react';

const AppContent: React.FC = () => {
  const { activePage, settings, isBookingModalOpen, isAuthModalOpen } = useCms();
  const { stop, start } = useLenis();
  const [mobileFabOpen, setMobileFabOpen] = useState(false);

  // Stop Lenis inertia scrolling when a modal overlay is active
  useEffect(() => {
    if (isBookingModalOpen || isAuthModalOpen) {
      stop();
    } else {
      start();
    }
  }, [isBookingModalOpen, isAuthModalOpen, stop, start]);

  const renderCurrentPage = () => {
    switch (activePage) {
      case 'home':
        return <HomePage />;
      case 'booking':
        return <BookingPage />;
      case 'packages':
        return <PackagesPage />;
      case 'fleet':
        return <FleetPage />;
      case 'planner':
        return <PlannerPage />;
      case 'corporate':
        return <CorporatePage />;
      case 'blog':
        return <BlogPage />;
      case 'about':
        return <AboutContactPage />;
      case 'cms':
        return <CmsDashboard />;
      case 'captain':
        return <CaptainDashboard />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-red-600 selection:text-white transition-colors">

      {/* Main Responsive App Container: Automatic Normal Full Width on Desktop, Responsive Mobile on Mobile */}
      <div className="min-h-screen flex flex-col w-full">
        
        {/* Top Status Bar (Mobile-specific device bar on mobile, ambient live GPS & dispatch strip on desktop) */}
        <MobileStatusBar />

        {/* Global Universal Header (Rendered on all subpages; Home has integrated hero stage) */}
        {activePage !== 'home' && <Header />}

        {/* Main Content Area */}
        <main className="flex-1 pb-20 md:pb-0">
          {renderCurrentPage()}
        </main>

        {/* Global Footer */}
        <Footer />

        {/* Mobile Ergonomic Bottom Navigation Bar (Visible only on mobile devices) */}
        <MobileBottomNav />

        {/* Floating Action Buttons */}
        <div className="fixed z-40 flex flex-col items-end gap-2.5 pointer-events-auto bottom-20 md:bottom-8 right-4 md:right-7">
          <a
            href={`tel:${settings.phone}`}
            className="w-10 h-10 sm:w-11 sm:h-11 bg-white text-slate-800 hover:text-white hover:bg-red-600 rounded-full shadow-lg flex items-center justify-center border border-slate-200 hover:border-red-600 transition-all hover:scale-105 active:scale-95"
            title="Direct Phone Call"
          >
            <Phone className="w-4 h-4" />
          </a>

          <a
            href={`https://wa.me/919182471876?text=${encodeURIComponent('Hi Wayora Journeys! I would like to reserve a chauffeur ride.')}`}
            target="_blank"
            rel="noreferrer"
            className="w-11 h-11 sm:w-12 sm:h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-emerald-600/30"
            title="Chat on WhatsApp"
          >
            <MessageSquare className="w-5 h-5" />
          </a>
        </div>

      </div>

      {/* Interactive Global Booking Modal */}
      <BookingModal />

      {/* Rider Authentication & Profile Modal */}
      <UserAuthModal />

      {/* Global Notifications */}
      <NotificationToast />

      {/* Real-Time Live Backend API Connection Indicator */}
      <BackendConnectionIndicator />

    </div>
  );
};

export default function App() {
  return (
    <CmsProvider>
      <LenisProvider>
        <AppContent />
      </LenisProvider>
    </CmsProvider>
  );
}
