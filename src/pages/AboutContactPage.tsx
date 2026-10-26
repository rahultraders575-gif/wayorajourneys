import React, { useState } from 'react';
import { useCms } from '../context/CmsContext';
import { 
  ShieldCheck, MapPin, Phone, Mail, MessageSquare, 
  HelpCircle, ChevronDown, ChevronUp, Send, Award, HeartHandshake, CheckCircle2 
} from 'lucide-react';

export const AboutContactPage: React.FC = () => {
  const { settings, showToast } = useCms();

  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [formSent, setFormSent] = useState(false);

  const faqs = [
    {
      q: 'What is Wayora Journeys’ cancellation policy?',
      a: 'We offer 100% free cancellation. If you cancel your booking at least 2 hours prior to the scheduled pickup time, your entire advance payment (25% or full pay) is refunded immediately to your original payment mode with zero cancellation penalty.'
    },
    {
      q: 'How are extra kilometers and trip distance billed?',
      a: 'Trips are priced based on actual odometer readings starting from your doorstep in Hyderabad and ending upon final return drop. Extra kilometers beyond the agreed round-trip estimate are charged strictly at your car’s per-kilometer rate (₹15/km for Dzire/Wagon R, ₹19/km for Etios/Ertiga/Innova).'
    },
    {
      q: 'Are tolls, state border taxes, and parking included in the base rate?',
      a: 'Base fares include the sanitized AC vehicle, fuel, and professional driver allowance. Toll plaza payments (via Fastag), parking entry tickets at monuments/temples, and interstate road entry permits are paid at actuals with physical receipts.'
    },
    {
      q: 'Can the driver pick up family members from multiple locations in Hyderabad?',
      a: 'Yes, absolutely. You can specify intermediate pickup locations (e.g., picking up grandparents in Secunderabad after starting from Gachibowli). Chauffeurs gladly accommodate extra local pickup stops.'
    },
    {
      q: 'Is night driving permitted on outstation trips?',
      a: 'Yes, our vehicles and drivers are fully equipped and certified for highway night driving. Standard driver allowance covers both day and night driving support.'
    },
    {
      q: 'What hygiene and safety checks are performed before the trip?',
      a: 'Before each outstation tour, our maintenance depot conducts a 24-point vehicle inspection: tire tread depth, brake pad health, air-conditioning refrigerant, engine oil levels, and a full interior cabin deep cleaning.'
    }
  ];

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactPhone.trim() || !contactMessage.trim()) {
      alert('Please fill out all fields.');
      return;
    }
    setFormSent(true);
    showToast(`Thank you, ${contactName}. Your message has been routed to our Ameerpet dispatch team.`, 'success');
  };

  return (
    <div className="py-12 bg-slate-50 text-slate-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Header */}
        <div className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-xs font-bold text-red-600 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
            <span>OUR STORY & SUPPORT</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900">
            About Wayora Journeys
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Headquartered in Hyderabad, Wayora Journeys was founded on a simple principle: long-distance highway road trips should be transparent, safe, and stress-free for families and businesses alike.
          </p>
        </div>

        {/* Story & Guarantee Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-slate-900">
              Reliable Travel. Professional Service.
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Whether embarking on a spiritual darshan to Tirumala or Srisailam, driving through misty mountain ghats to Araku Valley, or hosting important corporate executives from abroad, our team ensures every kilometer is driven with care.
            </p>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Unlike on-demand app rides where drivers cancel at the last moment or demand unmetered cash tolls, Wayora operates a disciplined dispatch network with verified chauffeurs who treat you like family.
            </p>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200 text-center">
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
                <span className="text-2xl font-black text-red-600 block">10,000+</span>
                <span className="text-[11px] text-slate-500 font-semibold">Happy Trips</span>
              </div>
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
                <span className="text-2xl font-black text-red-600 block">100%</span>
                <span className="text-[11px] text-slate-500 font-semibold">Doorstep Arrival</span>
              </div>
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
                <span className="text-2xl font-black text-red-600 block">4.9 / 5</span>
                <span className="text-[11px] text-slate-500 font-semibold">Guest Rating</span>
              </div>
            </div>
          </div>

          {/* Visual Card */}
          <div className="bg-gradient-to-br from-red-50/80 via-white to-red-50/40 p-8 rounded-3xl border border-red-200 space-y-6 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-md shadow-red-500/30">
              <HeartHandshake className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-black text-slate-900">
              The Wayora Chauffeur Code of Honour
            </h3>

            <ul className="space-y-3 text-xs text-slate-700">
              <li className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span><strong className="text-slate-900">Punctual arrival:</strong> 15 minutes before scheduled departure time.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span><strong className="text-slate-900">Sanitized cabin:</strong> Clean, smoke-free, hygienic air-conditioned cabin at all times.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span><strong className="text-slate-900">Family care:</strong> Assistance with luggage handling for elderly guests and families.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span><strong className="text-slate-900">Safe cruising:</strong> Strict adherence to highway speed limits and passenger comfort.</span>
              </li>
            </ul>

            <div className="p-4 rounded-2xl bg-white border border-red-200/80 flex items-center gap-3 shadow-xs">
              <MapPin className="w-5 h-5 text-red-600 shrink-0" />
              <div className="text-xs">
                <span className="text-slate-500 block text-[10px] font-semibold">Operational Headquarters:</span>
                <span className="text-slate-900 font-bold">{settings.address}</span>
              </div>
            </div>
          </div>

        </div>

        {/* FAQs Accordion */}
        <div className="space-y-6">
          <div>
            <span className="text-xs font-bold text-red-600 uppercase tracking-widest block mb-1">
              Common Questions
            </span>
            <h2 className="text-2xl font-black text-slate-900">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="bg-white border border-slate-200 rounded-2xl overflow-hidden transition-all shadow-xs"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between text-xs sm:text-sm font-bold text-slate-900 hover:text-red-600 transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-red-600 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Direct Contact & Feedback Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Contact Details */}
          <div className="lg:col-span-5 bg-white p-8 rounded-3xl border border-slate-200 space-y-6 shadow-sm">
            <div>
              <span className="text-xs font-bold text-red-600 uppercase tracking-widest block mb-1">
                Connect With Us
              </span>
              <h3 className="text-2xl font-black text-slate-900">Direct Dispatch Hub</h3>
              <p className="text-xs text-slate-600 mt-1">
                Have an urgent pickup inquiry or need help with a custom itinerary? Call or WhatsApp our 24/7 team.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <a
                href={`tel:${settings.phone}`}
                className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-red-300 transition-colors text-slate-800"
              >
                <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-200">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block font-semibold">24/7 Phone Desk</span>
                  <span className="font-bold text-slate-900">{settings.phone}</span>
                </div>
              </a>

              <a
                href={`https://wa.me/919182471876?text=${encodeURIComponent('Hi Wayora Journeys! I would like to speak to customer service.')}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-red-300 transition-colors text-slate-800"
              >
                <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-200">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block font-semibold">WhatsApp Support Desk</span>
                  <span className="font-bold text-slate-900">+91 91824 71876 (Live Chat)</span>
                </div>
              </a>

              <a
                href={`mailto:${settings.email}`}
                className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-red-300 transition-colors text-slate-800"
              >
                <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-200">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block font-semibold">Official Email</span>
                  <span className="font-bold text-slate-900">{settings.email}</span>
                </div>
              </a>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800">
                <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-200 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block font-semibold">Physical Address</span>
                  <span className="text-slate-700">{settings.address}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Send Message Form */}
          <div className="lg:col-span-7 bg-white p-8 rounded-3xl border border-slate-200 space-y-6 shadow-sm">
            <div>
              <h3 className="text-2xl font-black text-slate-900">Send a Message</h3>
              <p className="text-xs text-slate-600 mt-1">
                We respond to all traveler queries and quotes within 15 minutes.
              </p>
            </div>

            {formSent ? (
              <div className="p-8 rounded-2xl bg-red-50/50 border border-red-200 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 border border-red-200 flex items-center justify-center mx-auto">
                  <Send className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-bold text-slate-900">Message Dispatched!</h4>
                <p className="text-xs text-slate-700">
                  Thank you, <strong>{contactName}</strong>. Our fleet duty officer will call you back at <strong>{contactPhone}</strong> shortly.
                </p>
                <button
                  onClick={() => setFormSent(false)}
                  className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-xs text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="Full name"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-red-600 focus:bg-white transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-red-600 focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    How can we help? (Trip inquiry, feedback, driver question) *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="Describe your travel date, pickup location, or questions..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-red-600 focus:bg-white resize-none transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md shadow-red-500/25 text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>Dispatch Message to Support</span>
                </button>
              </form>
            )}

          </div>

        </div>
      </div>
    </div>
  );
};
