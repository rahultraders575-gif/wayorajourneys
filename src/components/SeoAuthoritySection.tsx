import React, { useState } from 'react';
import { 
  ShieldCheck, Car, MapPin, Award, ChevronDown, 
  HelpCircle, CheckCircle2, Clock, Sparkles, Navigation 
} from 'lucide-react';
import { useCms } from '../context/CmsContext';

export const SeoAuthoritySection: React.FC = () => {
  const { navigateToBooking } = useCms();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: "What is Wayora Journeys (also searched as Way Ora Journey)?",
      a: "Wayora Journeys (often searched as Way Ora Journey or Wayora Cab) is India's premier outstation chauffeur car rental and taxi booking service. Operating across Hyderabad, Bangalore, Vijayawada, Chennai, and major hubs, Wayora delivers luxury round-trips, one-way drops, airport VIP transfers, and pilgrimage holiday packages with 100% verified chauffeurs, sanitized vehicles, and transparent per-km billing."
    },
    {
      q: "How does outstation cab fare calculation work with Wayora Journeys?",
      a: "Our fare structure is completely transparent with zero hidden surcharges. Fares are calculated based on actual highway distance (km), standard minimum daily km limits, estimated FASTag tolls, state border permits, and chauffeur night allowances. You can preview the exact itemized breakdown before confirming your booking."
    },
    {
      q: "Which vehicles are available for outstation travel and pilgrimage trips?",
      a: "Wayora Journeys maintains a premium fleet: Prime Executive Sedans (Maruti Dzire, Toyota Etios, Hyundai Aura for 1-4 passengers), Luxury SUVs (Toyota Innova Crysta & Innova Hycross for 6-7 passengers), VIP Executives (Toyota Fortuner VIP), and Maharaja Tempo Travellers (12-17 seats for large family pilgrimages)."
    },
    {
      q: "Can I book one-way drops from Hyderabad to Bangalore, Vijayawada, or Tirupati?",
      a: "Yes! Wayora Journeys provides dedicated one-way intercity drops. You pay only for the one-way journey without being forced to pay round-trip return fares, saving up to 40% on intercity travel."
    },
    {
      q: "How does the 4-digit start-trip PIN protect passenger safety?",
      a: "Every confirmed booking generates a unique 4-digit security PIN on your rider dashboard. The chauffeur's cockpit terminal cannot initiate the trip odometer or billing without you providing this PIN, ensuring that you board the exact assigned car with the verified driver."
    },
    {
      q: "Does Wayora Journeys provide corporate GST invoices?",
      a: "Yes. Both individual business travelers and corporate teams can enter their legal company name and GSTIN during booking. Detailed itemized tax invoices with complete GST input credit breakdown are automatically generated and emailed upon trip completion."
    }
  ];

  const popularRoutes = [
    { from: "Hyderabad", to: "Tirupati", distance: "560 km", tag: "Pilgrimage VIP" },
    { from: "Hyderabad", to: "Srisailam", distance: "215 km", tag: "Jyotirlinga Darshan" },
    { from: "Hyderabad", to: "Vijayawada", distance: "275 km", tag: "Express Corridor" },
    { from: "Hyderabad", to: "Bangalore", distance: "570 km", tag: "NH 44 Highway" },
    { from: "Hyderabad", to: "Shirdi", distance: "620 km", tag: "Sai Temple Tour" },
    { from: "Hyderabad", to: "Goa", distance: "650 km", tag: "Holiday Getaway" },
    { from: "Hyderabad", to: "Warangal", distance: "150 km", tag: "Heritage Tour" },
    { from: "Hyderabad", to: "Visakhapatnam", distance: "620 km", tag: "Coastal Route" },
  ];

  return (
    <section className="py-20 bg-white border-t border-b border-slate-200 text-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">

        {/* Heading & Brand Semantic Authority */}
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-600 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>India's Leading Chauffeur Network</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Wayora Journeys (Way Ora Journey) — Premium Outstation Cabs &amp; Car Rental
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Whether you are searching for <strong>Way Ora Journey</strong> or <strong>Wayora Journeys</strong>, 
            we are India's trusted outstation travel partner. Delivering punctual doorstep pickups, 
            sanitized premium vehicles, vetted professional chauffeurs, and upfront pricing with 
            zero cancellation anxiety across South India.
          </p>
        </div>

        {/* 4 Pillars of Excellence Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 hover:border-red-300 transition-all shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Verified Chauffeurs</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every captain undergoes police background clearance, transport commercial DL badge checks, and highway etiquette training.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 hover:border-red-300 transition-all shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-md">
              <Car className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Spotless Luxury Fleet</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Travel comfortably in pristine Innova Crysta, Fortuner VIP, or executive sedans equipped with chilled AC, GPS tracking, and safety kits.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 hover:border-red-300 transition-all shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-md">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">100% Transparent Fares</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              No hidden driver charges or surprise toll hikes. View itemized per-km pricing, estimated tolls, and taxes before you ride.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 hover:border-red-300 transition-all shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-md">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">24/7 Operations Desk</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Instant live dispatch telemetry, road breakdown backup, and multilingual emergency SOS concierge available 24 hours every day.
            </p>
          </div>
        </div>

        {/* Popular Intercity Routes Grid for SEO Crawlers & Instant Booking */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-red-600 uppercase tracking-widest block">
                Top Outstation Corridors
              </span>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                High-Frequency Outstation Cab Routes
              </h3>
            </div>
            <p className="text-xs text-slate-500 max-w-md">
              Direct door-to-door cab dispatches available daily. Instant route pricing with guaranteed car allocation.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {popularRoutes.map((route, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => navigateToBooking({ fromCity: route.from, toCity: route.to })}
                className="group p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-red-50/50 hover:border-red-300 text-left transition-all cursor-pointer shadow-2xs"
              >
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium mb-1.5">
                  <span className="text-red-600 font-bold">{route.tag}</span>
                  <span>{route.distance}</span>
                </div>
                <div className="font-bold text-sm text-slate-900 group-hover:text-red-700 transition-colors flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0" />
                  <span>{route.from} → {route.to}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Semantic FAQ Accordion for Search Engine Rich Snippets */}
        <div className="space-y-6 pt-6 border-t border-slate-200">
          <div className="max-w-2xl space-y-1">
            <span className="text-xs font-bold text-red-600 uppercase tracking-widest block">
              Frequently Asked Questions
            </span>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              Everything You Need to Know About Wayora Journeys
            </h3>
          </div>

          <div className="divide-y divide-slate-200 border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/50">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div key={index} className="transition-colors">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full py-4 px-6 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-slate-900 hover:text-red-700 transition-colors cursor-pointer"
                    aria-expanded={isOpen}
                  >
                    <span className="flex items-center gap-3">
                      <HelpCircle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>{faq.q}</span>
                    </span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-red-600' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed bg-white">
                      <p>{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};
