import React, { useState } from 'react';
import { useCms } from '../context/CmsContext';
import { 
  Building2, Users, Plane, Briefcase, FileText, 
  CheckCircle2, ArrowRight, ShieldCheck, Mail, Phone 
} from 'lucide-react';

export const CorporatePage: React.FC = () => {
  const { showToast, settings } = useCms();

  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [serviceType, setServiceType] = useState('Employee Transportation');
  const [estimatedCabs, setEstimatedCabs] = useState('2-5 Cabs');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !contactPerson.trim() || !email.trim() || !phone.trim()) {
      alert('Please fill out all mandatory fields.');
      return;
    }
    setSubmitted(true);
    showToast(`Corporate RFP received from ${companyName}. Our enterprise manager will contact you within 4 business hours.`, 'success');
  };

  return (
    <div className="py-12 bg-slate-50 text-slate-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Header */}
        <div className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-xs font-bold text-red-600 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
            <span>ENTERPRISE MOBILITY SOLUTIONS</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900">
            Your Business. Our Priority.
          </h1>
          <p className="text-sm leading-relaxed text-slate-600">
            Premium outstation cabs, executive airport pickups, and employee shuttle services for corporations across Hyderabad, HITEC City, Gachibowli, and South Indian business corridors. Complete GST compliance and dedicated account management.
          </p>
        </div>

        {/* Enterprise Capabilities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-red-300 transition-all shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Employee Commute</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Punctual daily shift pick-and-drop services for IT companies and tech parks with live GPS and verified drivers.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-red-300 transition-all shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
              <Plane className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Airport Executive Rides</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Nameboard meet-and-greet transfers at RGIA Hyderabad with pristine sedans and suited chauffeurs.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-red-300 transition-all shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
              <Briefcase className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Client Hospitality</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Luxury sedans (Dzire, Etios) and premium SUVs (Innova Crysta) to host visiting delegates and leadership.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-red-300 transition-all shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Consolidated Invoicing</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Single monthly GST tax invoice with full trip sheets, cost center tags, and 30-day corporate credit terms.
            </p>
          </div>

        </div>

        {/* Main RFP Request Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left: Proposal Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6">
            <div>
              <span className="text-xs font-bold text-red-600 uppercase tracking-widest block mb-1">
                Contract Inquiry
              </span>
              <h2 className="text-2xl font-black text-slate-900">
                Request a Corporate Tariff Quote
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Tell us about your organization's mobility needs and get customized fleet pricing with volume discounts.
              </p>
            </div>

            {submitted ? (
              <div className="p-8 rounded-2xl bg-red-50/50 border border-red-200 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 border border-red-200 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">RFP Submitted Successfully</h3>
                <p className="text-xs text-slate-700 max-w-md mx-auto leading-relaxed">
                  Thank you, <strong>{contactPerson}</strong>. Our Corporate Accounts Director will review <strong>{companyName}</strong>'s requirements and send the rate proposal to <strong>{email}</strong> within 4 business hours.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all cursor-pointer shadow-md shadow-red-500/20"
                >
                  Submit another inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Company / Organization Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Infosys, TCS, Deloitte, Tech Start"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-red-600 focus:bg-white transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Contact Person Name & Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      placeholder="e.g. Anand Sharma (HR/Admin)"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-red-600 focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Official Work Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="anand@company.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-red-600 focus:bg-white transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Phone / Mobile Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-red-600 focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Primary Mobility Requirement
                    </label>
                    <select
                      value={serviceType}
                      onChange={(e) => setServiceType(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-red-600 focus:bg-white cursor-pointer transition-colors"
                    >
                      <option value="Employee Transportation">Daily Employee Transportation</option>
                      <option value="Airport Transfers">Frequent Airport Transfers</option>
                      <option value="Outstation Business Travel">Outstation Business Travel</option>
                      <option value="Executive Client Fleet">Executive Luxury Client Fleet</option>
                      <option value="Conference / Event Mobility">Conference / Annual Event Cabs</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Estimated Fleet Volume
                    </label>
                    <select
                      value={estimatedCabs}
                      onChange={(e) => setEstimatedCabs(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-red-600 focus:bg-white cursor-pointer transition-colors"
                    >
                      <option value="1-2 Cabs">1–2 Cabs / On-demand</option>
                      <option value="3-5 Cabs">3–5 Cabs (Monthly contract)</option>
                      <option value="6-15 Cabs">6–15 Cabs (Regular shifts)</option>
                      <option value="15+ Cabs">15+ Cabs (Enterprise fleet)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold rounded-xl shadow-md shadow-red-500/25 text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <span>Submit Corporate Proposal Request</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

          </div>

          {/* Right: Key Enterprise Standards */}
          <div className="lg:col-span-5 bg-gradient-to-br from-red-50/80 via-white to-red-50/40 border border-red-200 rounded-3xl p-8 space-y-6 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-md shadow-red-500/30">
              <Building2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-xl font-black text-slate-900">Why 40+ Enterprises Trust Wayora</h3>
              <p className="text-xs text-slate-600 mt-1">
                Structured corporate mobility that complies with enterprise safety and financial auditing standards.
              </p>
            </div>

            <ul className="space-y-3.5 text-xs text-slate-700">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span><strong className="text-slate-900">100% Police Verified Chauffeurs:</strong> Strict background verification and route competency training.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span><strong className="text-slate-900">Comprehensive Vehicle Insurance:</strong> All commercial yellow-board vehicles with active third-party passenger insurance.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span><strong className="text-slate-900">Real-time GPS Tracking:</strong> Fleet operations desk monitors vehicle speeds and route progress 24/7.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span><strong className="text-slate-900">Priority Dispatch:</strong> Pre-allocated standby vehicles during festive surges, monsoon, and early morning flights.</span>
              </li>
            </ul>

            <div className="pt-4 border-t border-red-200/60 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] text-slate-500 block">Direct Corporate Desk:</span>
                <span className="text-slate-900 font-bold">{settings.phone}</span>
              </div>
              <a
                href={`mailto:${settings.email}?subject=Corporate%20Mobility%20Inquiry`}
                className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition-colors"
              >
                Email Desk
              </a>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
