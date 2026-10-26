import React from 'react';
import { useCms } from '../context/CmsContext';
import { ImageWithFallback } from '../components/ImageWithFallback';
import { Users, Briefcase, ShieldCheck, Check, ArrowRight, Gauge, HelpCircle } from 'lucide-react';

export const FleetPage: React.FC = () => {
  const { vehicles, openBookingModal } = useCms();

  return (
    <div className="py-12 bg-slate-50 text-slate-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Page Header */}
        <div className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-xs font-bold text-red-600 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
            <span>PRECISION FLEET LINEUP</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900">
            Executive Vehicles & Transparent Rates
          </h1>
          <p className="text-sm leading-relaxed text-slate-600">
            From budget-friendly hatchbacks to premium executive sedans, 7-seater family SUVs, and group coaches. Fully insured, strictly air-conditioned, and serviced before every outstation journey.
          </p>
        </div>

        {/* Fleet Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {vehicles.map((car) => (
            <div
              key={car.id}
              className="rounded-2xl overflow-hidden border border-slate-200 bg-white hover:border-red-300 transition-all shadow-sm hover:shadow-xl group flex flex-col justify-between"
            >
              <div>
                {/* Photo */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                  <ImageWithFallback
                    src={car.imageUrl}
                    alt={car.name}
                    fallbackTitle={car.name}
                    fallbackType="car"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded text-[11px] font-semibold text-white border border-white/10">
                    {car.type}
                  </div>
                  {car.popular && (
                    <div className="absolute top-3 right-3 bg-red-600 backdrop-blur-md px-2.5 py-0.5 rounded text-[10px] font-bold text-white uppercase tracking-wider shadow-sm">
                      Most Booked
                    </div>
                  )}
                </div>

                {/* Specs & Info */}
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-red-600 transition-colors">
                      {car.name}
                    </h3>
                    <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-red-600" />
                        {car.capacity}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-red-600" />
                        {car.luggage}
                      </span>
                    </div>
                  </div>

                  {/* Features list */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    {car.features.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 text-[11px] text-slate-700">
                        <Check className="w-3 h-3 text-red-600 shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>

                  {/* Pricing spec breakdown */}
                  <div className="p-3.5 rounded-xl border border-red-100 bg-red-50/40 space-y-1.5 text-[11px]">
                    <div className="flex justify-between text-slate-600">
                      <span>Base rate per km:</span>
                      <span className="font-black text-sm text-slate-900">
                        ₹{car.ratePerKm} / km
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Driver night/day allowance:</span>
                      <span className="font-semibold text-slate-700">
                        ₹{car.driverAllowancePerDay} / day
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Minimum billing distance:</span>
                      <span className="font-semibold text-slate-700">
                        {car.minimumKmPerDay} km / day
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Select Button */}
              <div className="px-6 pb-6 pt-0">
                <button
                  onClick={() => openBookingModal(car.name)}
                  className="w-full py-2.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-red-600/25"
                >
                  <span>Select {car.name}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Comparison Matrix Table */}
        <div className="rounded-3xl p-6 sm:p-8 border border-slate-200 bg-white shadow-sm space-y-6">
          <div>
            <span className="text-xs font-bold text-red-600 uppercase tracking-widest block mb-1">
              Side-by-Side Comparison
            </span>
            <h2 className="text-2xl font-black text-slate-900">
              Fleet Specifications & Best Fit
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="uppercase text-[10px] font-bold border-b border-slate-200 bg-slate-50 text-slate-600">
                <tr>
                  <th className="p-3.5">Vehicle Model</th>
                  <th className="p-3.5">Segment</th>
                  <th className="p-3.5">Seats</th>
                  <th className="p-3.5">Rate / km</th>
                  <th className="p-3.5">Driver Allowance</th>
                  <th className="p-3.5">Ideal Use Case</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px] text-slate-700">
                {vehicles.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 font-sans font-bold text-slate-900">{v.name}</td>
                    <td className="p-3.5 font-sans text-slate-500">{v.type}</td>
                    <td className="p-3.5">{v.capacity}</td>
                    <td className="p-3.5 font-bold text-red-600">₹{v.ratePerKm} / km</td>
                    <td className="p-3.5">₹{v.driverAllowancePerDay} / day</td>
                    <td className="p-3.5 font-sans text-slate-500">
                      {v.type === 'Hatchback' && 'Solo & couples, budget temple runs'}
                      {v.type === 'Sedan' && 'Small families, airport drops, executive'}
                      {v.type === 'Executive Sedan' && 'Long highway cruises, smooth ride'}
                      {v.type === 'MUV / Family' && 'Family pilgrimages, 5-6 passenger tours'}
                      {v.type === 'Premium SUV' && 'Luxury, VIP trips, hill stations & ghat roads'}
                      {v.type === 'Luxury Coach' && 'Extended family groups, corporate offsites'}
                    </td>
                    <td className="p-3.5 text-right font-sans">
                      <button
                        onClick={() => openBookingModal(v.name)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 bg-slate-50 hover:bg-red-600 hover:text-white hover:border-red-600 text-slate-800 transition-colors cursor-pointer shadow-xs"
                      >
                        Book
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Transparent Pricing Rules */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
              <Gauge className="w-4 h-4 text-red-600" />
              <span>How Kilometers are Counted</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Km readings are recorded directly from the car odometer at your doorstep pickup point and verified upon final return drop.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Toll, Parking & State Taxes</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Toll plaza charges (via Fastag), parking entry tickets, and interstate border entry taxes are billed at actuals with physical/digital slips.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
              <HelpCircle className="w-4 h-4 text-red-600" />
              <span>Free Cancellation Terms</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Need to change plans? Simply notify our dispatch desk at least 2 hours before the scheduled time for a 100% full refund of your advance payment.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
