import React, { useState } from 'react';
import { useCms } from '../context/CmsContext';
import { ImageWithFallback } from '../components/ImageWithFallback';
import { Search, Compass, Clock, ArrowRight, MessageSquare, Car } from 'lucide-react';

export const PackagesPage: React.FC = () => {
  const { packages, openBookingModal, setActivePage } = useCms();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories: { id: string; label: string }[] = [
    { id: 'all', label: 'All Packages' },
    { id: 'spiritual', label: 'Spiritual & Temples' },
    { id: 'hill', label: 'Hill Stations' },
    { id: 'beach', label: 'Beach & Coastal' },
    { id: 'heritage', label: 'Heritage & Historical' },
  ];

  const filteredPackages = packages.filter((pkg) => {
    const matchesCategory = activeCategory === 'all' || pkg.category === activeCategory;
    const matchesSearch =
      pkg.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.highlights.some((h) => h.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="py-12 bg-slate-50 text-slate-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Page Header */}
        <div className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-xs font-bold text-red-600 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
            <span>CURATED HIGHWAY EXPEDITIONS</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900">
            Handcrafted Tour Packages
          </h1>
          <p className="text-sm leading-relaxed text-slate-600">
            From divine temple pilgrimages like Tirupati and Srisailam to misty holiday hills in Araku and Ooty. Doorstep pickup, sanitized AC car, and transparent distance-based billing.
          </p>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl border border-slate-200 bg-white shadow-xs">
          {/* Interactive Segmented Tabs */}
          <div className="flex flex-wrap gap-1.5">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveCategory(c.id)}
                className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                  activeCategory === c.id
                    ? 'bg-red-600 text-white shadow-md shadow-red-600/30 font-bold'
                    : 'bg-slate-50 text-slate-700 hover:text-red-600 hover:bg-red-50 border border-slate-200'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search destination..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:bg-white shadow-xs"
            />
          </div>
        </div>

        {/* Packages Grid */}
        {filteredPackages.length === 0 ? (
          <div className="p-16 text-center rounded-2xl border border-slate-200 bg-white shadow-xs">
            <p className="text-slate-500 text-sm">No packages matched your filter or search query.</p>
            <button
              onClick={() => {
                setActiveCategory('all');
                setSearchQuery('');
              }}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 shadow-sm cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPackages.map((pkg) => (
              <div
                key={pkg.id}
                className="rounded-2xl overflow-hidden border border-slate-200 bg-white hover:border-red-300 transition-all shadow-sm hover:shadow-xl group flex flex-col justify-between"
              >
                <div>
                  {/* Photo container */}
                  <div className="relative h-52 w-full overflow-hidden bg-slate-100">
                    <ImageWithFallback
                      src={pkg.imageUrl}
                      alt={pkg.title}
                      fallbackTitle={pkg.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    <div className="absolute top-3 left-3 flex items-center gap-2 text-[11px] font-semibold text-white bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10">
                      <Compass className="w-3.5 h-3.5 text-red-400" />
                      <span>{pkg.categoryLabel}</span>
                    </div>

                    <div className="absolute top-3 right-3 flex items-center gap-1.5 text-[11px] font-medium text-white bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10">
                      <Clock className="w-3 h-3 text-red-400" />
                      <span>{pkg.duration}</span>
                    </div>

                    <div className="absolute bottom-3 left-4 right-4">
                      <h3 className="text-xl font-black text-white group-hover:text-red-300 transition-colors">
                        {pkg.title}
                      </h3>
                      <span className="text-[11px] text-slate-200 font-medium">
                        {pkg.tagline}
                      </span>
                    </div>
                  </div>

                  {/* Body Details */}
                  <div className="p-6 space-y-4">
                    <p className="text-xs leading-relaxed min-h-[44px] text-slate-600">
                      {pkg.description}
                    </p>

                    {/* Highlights list */}
                    <div className="space-y-1.5 pt-1 border-t border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                        Itinerary Key Highlights
                      </span>
                      {pkg.highlights.map((h, i) => (
                        <div key={i} className="flex items-center gap-2 text-[11px] text-slate-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0" />
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>

                    {/* Vehicle recommendation */}
                    <div className="flex items-center gap-2 text-[11px] text-slate-600">
                      <Car className="w-3.5 h-3.5 text-red-600 shrink-0" />
                      <span>Suggested Car: <strong className="text-slate-900">{pkg.recommendedCar}</strong></span>
                    </div>

                    {/* Price box */}
                    <div className="p-3.5 rounded-xl border border-red-100 bg-red-50/40 flex items-baseline justify-between">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Round-trip from</span>
                        <span className="text-xl font-black text-slate-900">
                          ₹{pkg.fromPrice.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="text-right text-[11px] text-slate-500">
                        ₹{pkg.ratePerKm} / km
                        <span className="block text-[10px] text-red-600 font-bold">Doorstep pickup</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="px-6 pb-6 pt-0 grid grid-cols-2 gap-3">
                  <button
                    onClick={() => openBookingModal(pkg.title)}
                    className="py-2.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5 shadow-md shadow-red-600/25"
                  >
                    <span>Book Now</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                  <a
                    href={`https://wa.me/919182471876?text=${encodeURIComponent(`Hi Wayora Journeys, I want to inquire about the ${pkg.title} tour package (${pkg.duration}).`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="py-2.5 rounded-xl text-xs font-semibold transition-colors text-center flex items-center justify-center gap-1.5 border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 shadow-xs"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-red-600" />
                    <span>Enquiry</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Custom Itinerary Banner */}
        <div className="p-8 sm:p-10 rounded-3xl border border-red-200 bg-gradient-to-r from-red-50 via-white to-red-50 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-xs font-bold text-red-600 uppercase tracking-widest bg-white border border-red-200 px-3 py-1 rounded-full inline-block">
              Need a custom route?
            </span>
            <h3 className="text-2xl font-black text-slate-900">
              Plan a Multi-City Trip with Custom Stoppages
            </h3>
            <p className="text-xs max-w-xl text-slate-600">
              Visiting family temples or multiple tourist cities? Use our Interactive Route Planner to pick any destinations and receive an immediate transparent quote.
            </p>
          </div>
          <button
            onClick={() => {
              setActivePage('planner');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="px-6 py-3 font-bold rounded-xl border border-red-600 bg-red-600 hover:bg-red-700 text-white text-xs shrink-0 cursor-pointer flex items-center gap-2 shadow-md shadow-red-600/30"
          >
            <span>Open Custom Route Planner</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </button>
        </div>

      </div>
    </div>
  );
};
