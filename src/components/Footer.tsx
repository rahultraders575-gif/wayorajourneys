import React from 'react';
import { useCms, PageId } from '../context/CmsContext';
import { Phone, Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  const { setActivePage, settings } = useCms();

  const handleNav = (page: PageId) => {
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navLinks: { id: PageId; label: string }[] = [
    { id: 'booking', label: 'Car Booking' },
    { id: 'fleet', label: 'Fleet & Rates' },
    { id: 'packages', label: 'Tour Packages' },
    { id: 'planner', label: 'Route Planner' },
    { id: 'corporate', label: 'Corporate Fleet' },
    { id: 'about', label: 'About & Support' },
  ];

  return (
    <footer className="bg-white border-t border-slate-200/80 text-slate-600 text-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Main Row: Brand, Essential Nav, Contact */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-100">
          
          {/* Brand Wordmark & Tagline */}
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <img
                src="/images/wayora-logo-light.jpg"
                alt="Wayora Journeys Brand Logo"
                className="w-9 h-9 rounded-xl object-contain shadow-xs border border-slate-200/80 bg-white p-0.5"
              />
              <span className="text-slate-900 font-black text-base tracking-tight">
                Wayora<span className="text-red-600">Journeys</span>
              </span>
            </div>
            <p className="text-slate-500 text-xs font-medium">
              Premier Chauffeur & Outstation Intercity Travel across India.
            </p>
          </div>

          {/* Essential Quick Links */}
          <nav className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNav(link.id)}
                className="text-slate-600 hover:text-red-600 font-medium transition-colors cursor-pointer text-xs"
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Necessary Contact Points */}
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <a
              href={`tel:${settings.phone}`}
              className="flex items-center gap-1.5 text-slate-700 hover:text-red-600 font-semibold transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-red-600" />
              <span>{settings.phone}</span>
            </a>
            <span className="text-slate-300">·</span>
            <a
              href={`mailto:${settings.email}`}
              className="flex items-center gap-1.5 text-slate-700 hover:text-red-600 font-medium transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-red-600" />
              <span>{settings.email}</span>
            </a>
          </div>

        </div>

        {/* Minimal Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-400 text-[11px]">
          <div>
            © {new Date().getFullYear()} Wayora Journeys. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleNav('cms')}
              className="hover:text-red-600 transition-colors cursor-pointer"
            >
              CMS Admin
            </button>
            <span>·</span>
            <span>All-Inclusive Tariffs</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
