import React, { useState } from 'react';
import { BaseTariffRule, HourlyRentalSlot, SurchargeRule, CompanySettings, AdminRole } from '../../types';
import {
  Tag, Percent, Clock, Moon, Plane, ShieldCheck, 
  MapPin, RefreshCw, Save, Plus, Edit2, AlertCircle, 
  CheckCircle2, DollarSign, ArrowRight, Check
} from 'lucide-react';

interface TariffsEngineModuleProps {
  tariffs: BaseTariffRule[];
  hourlySlots: HourlyRentalSlot[];
  surcharges: SurchargeRule[];
  settings: CompanySettings;
  currentRole: AdminRole;
  onUpdateTariff: (tier: string, updated: Partial<BaseTariffRule>) => void;
  onUpdateHourlySlot: (id: string, updated: Partial<HourlyRentalSlot>) => void;
  onToggleSurcharge: (id: string) => void;
  onUpdateSettings: (settings: Partial<CompanySettings>) => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const TariffsEngineModule: React.FC<TariffsEngineModuleProps> = ({
  tariffs,
  hourlySlots,
  surcharges,
  settings,
  currentRole,
  onUpdateTariff,
  onUpdateHourlySlot,
  onToggleSurcharge,
  onUpdateSettings,
  showToast,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'matrix' | 'hourly' | 'surcharges' | 'advance'>('matrix');
  
  // Advance payment rules local state
  const [freeCancelHours, setFreeCancelHours] = useState(settings.freeCancellationHours || 2);
  const [defaultAdvanceType, setDefaultAdvanceType] = useState<'25%' | '100%'>('25%');

  // Editing tariff modal state
  const [editingTariff, setEditingTariff] = useState<BaseTariffRule | null>(null);
  const [editRatePerKm, setEditRatePerKm] = useState(15);
  const [editBaseFare, setEditBaseFare] = useState(2500);
  const [editMinKm, setEditMinKm] = useState(300);
  const [editDeadhead, setEditDeadhead] = useState(1.25);
  const [editDriverAllowance, setEditDriverAllowance] = useState(400);

  const isFinanceOrAdmin = currentRole === 'Super Admin' || currentRole === 'Accounts & Finance';

  const handleOpenEditTariff = (t: BaseTariffRule) => {
    setEditingTariff(t);
    setEditRatePerKm(t.ratePerKm);
    setEditBaseFare(t.baseFare);
    setEditMinKm(t.minDailyKm);
    setEditDeadhead(t.deadheadMultiplier);
    setEditDriverAllowance(t.driverAllowancePerDay);
  };

  const handleSaveTariffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTariff) return;
    onUpdateTariff(editingTariff.vehicleTier, {
      ratePerKm: Number(editRatePerKm),
      baseFare: Number(editBaseFare),
      minDailyKm: Number(editMinKm),
      deadheadMultiplier: Number(editDeadhead),
      driverAllowancePerDay: Number(editDriverAllowance),
    });
    showToast(`Tariff for ${editingTariff.vehicleTier} updated successfully`, 'success');
    setEditingTariff(null);
  };

  const handleSaveAdvanceRules = () => {
    onUpdateSettings({ freeCancellationHours: Number(freeCancelHours) });
    showToast('Advance booking split and cancellation policy saved', 'success');
  };

  return (
    <div className="space-y-6">

      {/* SUB-TABS NAVIGATION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-200/90 shadow-xs">
        <div className="flex flex-wrap gap-2 text-xs font-bold">
          <button
            onClick={() => setActiveSubTab('matrix')}
            className={`px-4 py-2 rounded-xl cursor-pointer transition-all flex items-center gap-1.5 ${
              activeSubTab === 'matrix' ? 'bg-red-600 text-white shadow-xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Base Outstation Tariffs ({tariffs.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('hourly')}
            className={`px-4 py-2 rounded-xl cursor-pointer transition-all flex items-center gap-1.5 ${
              activeSubTab === 'hourly' ? 'bg-red-600 text-white shadow-xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Hourly Rental Packages ({hourlySlots.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('surcharges')}
            className={`px-4 py-2 rounded-xl cursor-pointer transition-all flex items-center gap-1.5 ${
              activeSubTab === 'surcharges' ? 'bg-red-600 text-white shadow-xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Percent className="w-3.5 h-3.5" />
            <span>Surcharges & State Entry Taxes</span>
          </button>

          <button
            onClick={() => setActiveSubTab('advance')}
            className={`px-4 py-2 rounded-xl cursor-pointer transition-all flex items-center gap-1.5 ${
              activeSubTab === 'advance' ? 'bg-red-600 text-white shadow-xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Advance Split & Cancellation Rules</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: BASE OUTSTATION TARIFF MATRIX */}
      {activeSubTab === 'matrix' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-black text-slate-900">Base Kilometer Rate & Minimum Threshold Matrix</h3>
            <p className="text-xs text-slate-500">
              Set per-km rates, daily distance commitments, empty deadhead return multipliers, and driver allowances.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Vehicle Tier</th>
                  <th className="py-3 px-4">Sample Models</th>
                  <th className="py-3 px-4">Rate Per Km</th>
                  <th className="py-3 px-4">Base Fare Floor</th>
                  <th className="py-3 px-4">Daily Min Threshold</th>
                  <th className="py-3 px-4">Deadhead Return Multiplier</th>
                  <th className="py-3 px-4">Driver Allowance</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tariffs.map((t) => (
                  <tr key={t.vehicleTier} className="hover:bg-rose-50/30 transition-colors">
                    <td className="py-3 px-4 font-black text-slate-900">{t.vehicleTier}</td>
                    <td className="py-3 px-4 text-slate-600">{t.modelExamples}</td>
                    <td className="py-3 px-4 font-extrabold text-red-600 text-sm">
                      ₹{t.ratePerKm}/km
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">
                      ₹{t.baseFare.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-700">
                      {t.minDailyKm} km/day
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-700">
                      {t.deadheadMultiplier}x
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      ₹{t.driverAllowancePerDay}/day
                    </td>
                    <td className="py-3 px-4 text-right">
                      {isFinanceOrAdmin && (
                        <button
                          onClick={() => handleOpenEditTariff(t)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg text-[10px] cursor-pointer inline-flex items-center gap-1"
                        >
                          <Edit2 className="w-3 h-3" /> Edit Rate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: HOURLY & RENTAL PACKAGES */}
      {activeSubTab === 'hourly' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-black text-slate-900">Predefined Hourly City Rental Packages</h3>
            <p className="text-xs text-slate-500">
              Short-term local city rentals: 4h/40km, 8h/80km, and 12h/120km with per-extra-km and per-extra-hour charges.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {hourlySlots.map((slot) => (
              <div
                key={slot.id}
                className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 space-y-3.5 shadow-2xs hover:shadow-sm transition-all"
              >
                <div className="flex items-center justify-between border-b pb-2">
                  <h4 className="font-black text-slate-900 text-sm">{slot.title}</h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                    {slot.hours}h / {slot.km}km
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center bg-white p-2 rounded-xl border border-slate-200/70">
                    <span className="font-semibold text-slate-600">Executive Sedan:</span>
                    <span className="font-extrabold text-slate-900">₹{slot.sedanRate.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center bg-white p-2 rounded-xl border border-slate-200/70">
                    <span className="font-semibold text-slate-600">Innova Crysta:</span>
                    <span className="font-extrabold text-red-600">₹{slot.innovaRate.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center bg-white p-2 rounded-xl border border-slate-200/70">
                    <span className="font-semibold text-slate-600">Fortuner VIP:</span>
                    <span className="font-extrabold text-slate-900">₹{slot.fortunerRate.toLocaleString()}</span>
                  </div>
                </div>

                <div className="pt-1 text-[11px] text-slate-500 flex justify-between border-t border-slate-200/60">
                  <span>Extra Km: <b>₹{slot.extraKmRate}/km</b></span>
                  <span>Extra Hour: <b>₹{slot.extraHourRate}/hr</b></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: SURCHARGES & STATE ENTRY TAXES */}
      {activeSubTab === 'surcharges' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-black text-slate-900">Mandatory Highway Surcharges & State Entry Permits</h3>
            <p className="text-xs text-slate-500">
              Rules governing overnight driving, commercial airport entry, interstate passenger transport permits, and peak surge.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {surcharges.map((sur) => (
              <div
                key={sur.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2.5 shadow-2xs hover:shadow-sm transition-all"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-slate-900 text-sm">{sur.name}</h4>
                  <button
                    onClick={() => {
                      onToggleSurcharge(sur.id);
                      showToast(`${sur.name} active state toggled`, 'info');
                    }}
                    className={`px-3 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-all ${
                      sur.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {sur.isActive ? 'Active Rule' : 'Disabled'}
                  </button>
                </div>

                <p className="text-xs text-slate-600">{sur.description}</p>

                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs flex justify-between items-center font-bold">
                  <span className="text-slate-500">Applied Rate:</span>
                  <span className="text-red-700 font-extrabold text-sm">
                    {sur.unit === 'percent' ? `+${sur.fee}% Surge` : `₹${sur.fee} Fixed`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: ADVANCE SPLIT & CANCELLATION RULES */}
      {activeSubTab === 'advance' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-6 max-w-2xl">
          <div>
            <h3 className="text-base font-black text-slate-900">Advance Booking Split & Cancellation Parameters</h3>
            <p className="text-xs text-slate-500">
              Configure online advance deposit ratio and doorstep cancellation policy.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <label className="block text-slate-800 font-bold">Default Advance Payment Ratio</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDefaultAdvanceType('25%')}
                  className={`p-3 rounded-xl border font-bold cursor-pointer text-left transition-all ${
                    defaultAdvanceType === '25%'
                      ? 'border-red-600 bg-red-50/50 text-red-700 shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700'
                  }`}
                >
                  <div className="text-sm font-black">25% Advance Online</div>
                  <div className="text-[11px] text-slate-500 font-normal mt-0.5">
                    Remaining 75% settled directly with chauffeur at destination.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setDefaultAdvanceType('100%')}
                  className={`p-3 rounded-xl border font-bold cursor-pointer text-left transition-all ${
                    defaultAdvanceType === '100%'
                      ? 'border-red-600 bg-red-50/50 text-red-700 shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700'
                  }`}
                >
                  <div className="text-sm font-black">100% Prepaid Online</div>
                  <div className="text-[11px] text-slate-500 font-normal mt-0.5">
                    Full payment upfront with all tolls and driver fees locked.
                  </div>
                </button>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <label className="block text-slate-800 font-bold">Free Cancellation Window (Hours Before Pickup)</label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="1"
                  max="48"
                  value={freeCancelHours}
                  onChange={(e) => setFreeCancelHours(Number(e.target.value))}
                  className="w-24 px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-center text-sm"
                />
                <span className="text-slate-600 font-medium">
                  Hours prior to departure for 100% refund of advance deposit.
                </span>
              </div>
            </div>

            {isFinanceOrAdmin && (
              <div className="pt-2">
                <button
                  onClick={handleSaveAdvanceRules}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Policy Settings</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* EDIT TARIFF MODAL */}
      {editingTariff && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <div>
                <h4 className="font-black text-slate-900 text-sm">Update Tariff: {editingTariff.vehicleTier}</h4>
                <p className="text-xs text-slate-500">Configure base per-km rate and commitments.</p>
              </div>
              <button
                onClick={() => setEditingTariff(null)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTariffSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Rate (₹/km)</label>
                  <input
                    type="number"
                    min="10"
                    required
                    value={editRatePerKm}
                    onChange={(e) => setEditRatePerKm(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Base Fare Floor (₹)</label>
                  <input
                    type="number"
                    required
                    value={editBaseFare}
                    onChange={(e) => setEditBaseFare(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Min Km Commit / Day</label>
                  <input
                    type="number"
                    min="150"
                    required
                    value={editMinKm}
                    onChange={(e) => setEditMinKm(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Deadhead Return Multiplier</label>
                  <input
                    type="number"
                    step="0.05"
                    min="1.0"
                    max="2.0"
                    required
                    value={editDeadhead}
                    onChange={(e) => setEditDeadhead(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Driver Allowance / Day (₹)</label>
                <input
                  type="number"
                  required
                  value={editDriverAllowance}
                  onChange={(e) => setEditDriverAllowance(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingTariff(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold cursor-pointer shadow-sm"
                >
                  Save Tariff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

