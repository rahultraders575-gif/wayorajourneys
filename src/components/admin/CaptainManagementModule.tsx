import React, { useState } from 'react';
import { CaptainProfile, OdometerAuditRecord, CaptainSettlementRecord, AdminRole } from '../../types';
import {
  UserCheck, ShieldCheck, KeyRound, Phone, AlertTriangle, 
  CheckCircle2, Clock, Eye, RefreshCw, FileText, Camera, 
  Send, X, DollarSign, Wallet, CreditCard, ChevronRight, 
  AlertCircle, Check, Search, Filter, Ban, Award, BadgeCheck,
  Car, Gauge, Building, MapPin, CheckSquare, Info, Lock, 
  Compass, Sparkles, ChevronDown, ChevronUp, Shield
} from 'lucide-react';

interface CaptainManagementModuleProps {
  captains: CaptainProfile[];
  odometerAudits: OdometerAuditRecord[];
  settlements: CaptainSettlementRecord[];
  currentRole: AdminRole;
  onUpdateCaptainStatus: (captainId: string, status: CaptainProfile['verificationStatus']) => void;
  onUpdateCaptainDuty: (captainId: string, duty: CaptainProfile['dutyStatus']) => void;
  onResetCaptainPin: (captainId: string, newPin: string) => void;
  onSettlePayout: (captainId: string) => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const CaptainManagementModule: React.FC<CaptainManagementModuleProps> = ({
  captains,
  odometerAudits,
  settlements,
  currentRole,
  onUpdateCaptainStatus,
  onUpdateCaptainDuty,
  onResetCaptainPin,
  onSettlePayout,
  showToast,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'onboarding' | 'roster' | 'odometer' | 'settlements'>('roster');
  const [captainSearch, setCaptainSearch] = useState('');
  
  // KYC & Onboarding 4-Pillar states
  const [onboardingFilter, setOnboardingFilter] = useState<'all' | 'pending' | 'verified'>('all');
  const [expandedCaptainId, setExpandedCaptainId] = useState<string | null>('cpt-104');
  const [discrepancyCaptain, setDiscrepancyCaptain] = useState<CaptainProfile | null>(null);
  const [discrepancyNote, setDiscrepancyNote] = useState('');

  // Document preview modal state
  const [previewDocModal, setPreviewDocModal] = useState<{
    title: string;
    imageUrl?: string;
    captainName: string;
    dlNumber?: string;
    description?: string;
  } | null>(null);

  // Reset PIN modal state
  const [pinModalCaptain, setPinModalCaptain] = useState<CaptainProfile | null>(null);
  const [newPinInput, setNewPinInput] = useState('');

  // Odometer photo preview modal
  const [odometerPreview, setOdometerPreview] = useState<OdometerAuditRecord | null>(null);

  const isDispatcherOrAdmin = currentRole === 'Super Admin' || currentRole === 'Fleet Dispatcher';
  const isFinanceOrAdmin = currentRole === 'Super Admin' || currentRole === 'Accounts & Finance';

  // Filtered captains
  const filteredCaptains = captains.filter((c) => {
    return (
      c.name.toLowerCase().includes(captainSearch.toLowerCase()) ||
      c.phone.includes(captainSearch) ||
      c.vehicleNumber.toLowerCase().includes(captainSearch.toLowerCase()) ||
      c.vehicleModel.toLowerCase().includes(captainSearch.toLowerCase())
    );
  });

  const handleResetPinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinModalCaptain || newPinInput.length !== 4) {
      showToast('Please enter a 4-digit numeric PIN', 'error');
      return;
    }
    onResetCaptainPin(pinModalCaptain.id, newPinInput);
    showToast(`Security PIN reset for Captain ${pinModalCaptain.name}. SMS dispatch simulated.`, 'success');
    setPinModalCaptain(null);
    setNewPinInput('');
  };

  return (
    <div className="space-y-6">

      {/* SUB-MODULE NAVIGATION BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-200/90 shadow-xs">
        <div className="flex flex-wrap gap-2 text-xs font-bold">
          <button
            onClick={() => setActiveSubTab('roster')}
            className={`px-4 py-2 rounded-xl cursor-pointer transition-all flex items-center gap-1.5 ${
              activeSubTab === 'roster' ? 'bg-red-600 text-white shadow-xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Chauffeur Roster & Duty ({captains.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('onboarding')}
            className={`px-4 py-2 rounded-xl cursor-pointer transition-all flex items-center gap-1.5 ${
              activeSubTab === 'onboarding' ? 'bg-red-600 text-white shadow-xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>KYC & Verification Pipeline ({captains.filter(c => c.verificationStatus === 'Pending Verification').length} Pending)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('odometer')}
            className={`px-4 py-2 rounded-xl cursor-pointer transition-all flex items-center gap-1.5 ${
              activeSubTab === 'odometer' ? 'bg-red-600 text-white shadow-xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Odometer Audits & Discrepancies</span>
          </button>

          <button
            onClick={() => setActiveSubTab('settlements')}
            className={`px-4 py-2 rounded-xl cursor-pointer transition-all flex items-center gap-1.5 ${
              activeSubTab === 'settlements' ? 'bg-red-600 text-white shadow-xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Chauffeur Settlements & Payouts</span>
          </button>
        </div>

        {/* Quick Search */}
        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search captain, car, phone..."
            value={captainSearch}
            onChange={(e) => setCaptainSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600"
          />
        </div>
      </div>

      {/* SUB-TAB 1: ROSTER & DUTY MANAGEMENT */}
      {activeSubTab === 'roster' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-black text-slate-900">Active Chauffeur Roster & Duty Controls</h3>
            <p className="text-xs text-slate-500">
              Live status, trip count, rating, FASTag balance, and 4-digit PIN authentication controls.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Captain</th>
                  <th className="py-3 px-4">Vehicle Attached</th>
                  <th className="py-3 px-4">Rating & Trips</th>
                  <th className="py-3 px-4">Duty Status</th>
                  <th className="py-3 px-4">Today's Earnings</th>
                  <th className="py-3 px-4">FASTag Balance</th>
                  <th className="py-3 px-4">PIN Controls</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCaptains.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-6 text-center text-slate-400">
                      No captains matching query.
                    </td>
                  </tr>
                ) : (
                  filteredCaptains.map((c) => (
                    <tr key={c.id} className="hover:bg-rose-50/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={c.photoUrl}
                            alt={c.name}
                            className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-100 shadow-2xs"
                          />
                          <div>
                            <div className="font-extrabold text-slate-900">{c.name}</div>
                            <div className="text-[11px] text-slate-500">{c.phone}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-800">{c.vehicleModel}</div>
                        <div className="text-[10px] font-mono text-red-600 font-bold">{c.vehicleNumber}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 font-bold text-amber-600">
                          <span>★ {c.rating.toFixed(2)}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium">{c.totalTrips} completed trips</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          c.dutyStatus === 'On Trip' ? 'bg-emerald-100 text-emerald-800' :
                          c.dutyStatus === 'On Duty' ? 'bg-blue-100 text-blue-800' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            c.dutyStatus === 'On Trip' ? 'bg-emerald-600 animate-pulse' :
                            c.dutyStatus === 'On Duty' ? 'bg-blue-600' : 'bg-slate-400'
                          }`} />
                          {c.dutyStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        ₹{c.todayEarnings.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-bold text-emerald-700">
                        ₹{c.fastagBalance.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-600 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200 w-fit">
                          <KeyRound className="w-3 h-3 text-red-500" />
                          <span>••••</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isDispatcherOrAdmin && (
                            <>
                              <button
                                onClick={() => {
                                  const nextDuty = c.dutyStatus === 'Off Duty' ? 'On Duty' : 'Off Duty';
                                  onUpdateCaptainDuty(c.id, nextDuty);
                                  showToast(`Captain ${c.name} status updated to ${nextDuty}`, 'info');
                                }}
                                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold cursor-pointer"
                              >
                                Toggle Duty
                              </button>
                              <button
                                onClick={() => {
                                  setPinModalCaptain(c);
                                  setNewPinInput('');
                                }}
                                className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                              >
                                Reset PIN
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: KYC & ONBOARDING VERIFICATION PIPELINE */}
      {activeSubTab === 'onboarding' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-red-600" />
                <h3 className="text-base font-black text-slate-900">Captain KYC Approvals & 4-Pillar Compliance Desk</h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Statutory audit desk verifying Personal Identity, Vehicle Regulatory documents, 4-Side Quality & Safety inspections, and Direct Bank Settlements.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setOnboardingFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  onboardingFilter === 'all'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                All Chauffeurs ({filteredCaptains.length})
              </button>
              <button
                type="button"
                onClick={() => setOnboardingFilter('pending')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  onboardingFilter === 'pending'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Pending Review ({filteredCaptains.filter(c => c.verificationStatus !== 'Verified').length})</span>
              </button>
              <button
                type="button"
                onClick={() => setOnboardingFilter('verified')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  onboardingFilter === 'verified'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}
              >
                <BadgeCheck className="w-3.5 h-3.5" />
                <span>Verified ({filteredCaptains.filter(c => c.verificationStatus === 'Verified').length})</span>
              </button>
            </div>
          </div>

          {/* Captain Dossier Cards */}
          <div className="space-y-4">
            {filteredCaptains
              .filter((c) => {
                if (onboardingFilter === 'pending') return c.verificationStatus !== 'Verified';
                if (onboardingFilter === 'verified') return c.verificationStatus === 'Verified';
                return true;
              })
              .map((c) => {
                const isExpanded = expandedCaptainId === c.id;
                const isVerified = c.verificationStatus === 'Verified';

                return (
                  <div
                    key={c.id}
                    className={`rounded-3xl border transition-all ${
                      isVerified
                        ? 'border-slate-200 bg-white hover:border-slate-300'
                        : 'border-amber-300/80 bg-amber-50/20 shadow-xs'
                    }`}
                  >
                    {/* Card Header */}
                    <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-start sm:items-center gap-4">
                        <div className="relative shrink-0">
                          <img
                            src={c.photoUrl}
                            alt={c.name}
                            className="w-14 h-14 rounded-2xl object-cover ring-2 ring-slate-100 shadow-sm"
                          />
                          <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                            isVerified ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
                          }`} />
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-black text-slate-900 text-base flex items-center gap-1.5">
                              {c.name}
                              {isVerified && <ShieldCheck className="w-4 h-4 text-emerald-600" />}
                            </h4>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold border border-slate-200">
                              ID: {c.id.toUpperCase()}
                            </span>
                            <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                              isVerified
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-amber-100 text-amber-800 border border-amber-300'
                            }`}>
                              {c.verificationStatus || 'Pending Verification'}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
                            <span className="flex items-center gap-1">
                              <Phone className="w-3.5 h-3.5 text-slate-400" />
                              <span className="font-mono">{c.phone}</span>
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className="flex items-center gap-1">
                              <Car className="w-3.5 h-3.5 text-red-600" />
                              <span className="font-bold text-slate-700">{c.vehicleModel}</span>
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className="font-mono font-bold text-slate-800 px-1.5 py-0.5 rounded bg-slate-100 text-[11px]">
                              {c.vehicleNumber}
                            </span>
                            <span className="text-slate-300">•</span>
                            <span>{c.primaryCity || 'Hyderabad'}</span>
                          </div>
                        </div>
                      </div>

                      {/* 4 Pillars Status Indicators & Primary Actions */}
                      <div className="flex items-center gap-3 flex-wrap justify-between lg:justify-end">
                        {/* 4 Mini Pillar Badges */}
                        <div className="flex items-center gap-1.5 text-[10px] font-bold">
                          <span className={`px-2 py-1 rounded-lg flex items-center gap-1 ${
                            c.policeClearanceStatus === 'Verified' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            <span>P1: Identity</span>
                            <Check className="w-3 h-3" />
                          </span>

                          <span className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                            <span>P2: Vehicle</span>
                            <Check className="w-3 h-3" />
                          </span>

                          <span className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                            <span>P3: Safety</span>
                            <Check className="w-3 h-3" />
                          </span>

                          <span className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                            <span>P4: Bank</span>
                            <Check className="w-3 h-3" />
                          </span>
                        </div>

                        {/* Expand / Collapse Button */}
                        <button
                          type="button"
                          onClick={() => setExpandedCaptainId(isExpanded ? null : c.id)}
                          className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5 text-red-600" />
                          <span>{isExpanded ? 'Hide 4-Pillar Dossier' : 'Inspect 4-Pillar Dossier'}</span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* EXPANDABLE 4-PILLAR COMPLIANCE DOSSIER */}
                    {isExpanded && (
                      <div className="p-4 sm:p-5 pt-0 border-t border-slate-100 space-y-4 animate-in fade-in duration-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-3">
                          
                          {/* PILLAR 1: PERSONAL IDENTITY & BACKGROUND */}
                          <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/80 space-y-2.5">
                            <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                              <span className="font-extrabold text-[11px] text-slate-900 uppercase flex items-center gap-1.5">
                                <span className="w-4 h-4 rounded bg-red-600 text-white text-[9px] flex items-center justify-center font-black">1</span>
                                <span>Personal Identity</span>
                              </span>
                              <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                                5 Docs
                              </span>
                            </div>

                            <div className="text-[11px] space-y-1.5">
                              <div>
                                <span className="text-slate-400 block text-[9px]">DRIVING LICENSE & BADGE:</span>
                                <span className="font-mono font-bold text-slate-800 block truncate">{c.drivingLicenseNumber}</span>
                                <span className="text-slate-500 text-[10px]">{c.badgeNumber || 'Commercial Badge LMV-TR'}</span>
                              </div>

                              <div className="pt-1 border-t border-slate-100">
                                <span className="text-slate-400 block text-[9px]">AADHAAR e-KYC:</span>
                                <span className="font-mono font-bold text-slate-800">{c.aadhaarNumber || 'XXXX-XXXX-8921'}</span>
                                <span className="text-[9px] text-emerald-600 font-bold block">✓ DigiLocker Biometric Validated</span>
                              </div>

                              <div className="pt-1 border-t border-slate-100">
                                <span className="text-slate-400 block text-[9px]">PAN CARD (TDS):</span>
                                <span className="font-mono font-bold text-slate-800">{c.panCardNumber || 'ABCDE1234F'}</span>
                              </div>

                              <div className="pt-1 border-t border-slate-100">
                                <span className="text-slate-400 block text-[9px]">POLICE CLEARANCE (PCC):</span>
                                <span className={`font-bold block ${c.policeClearanceStatus === 'Verified' ? 'text-emerald-700' : 'text-amber-700'}`}>
                                  {c.policeClearanceStatus === 'Verified' ? '✓ Verified (0 Antecedents)' : '⏳ Police Verification In Review'}
                                </span>
                              </div>
                            </div>

                            {/* Thumbnail buttons */}
                            <div className="grid grid-cols-2 gap-1.5 pt-1">
                              <button
                                type="button"
                                onClick={() => setPreviewDocModal({
                                  title: 'Commercial Driving License',
                                  imageUrl: c.licensePhoto || 'https://images.unsplash.com/photo-1633158829585-23ba8f7c8caf?auto=format&fit=crop&w=800&q=80',
                                  captainName: c.name,
                                  dlNumber: c.drivingLicenseNumber,
                                  description: 'Commercial badge with LMV-TR endorsement valid for luxury passenger transport.'
                                })}
                                className="p-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <Eye className="w-3 h-3 text-red-600" />
                                <span>Inspect DL</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => setPreviewDocModal({
                                  title: 'Police Clearance Certificate (PCC)',
                                  imageUrl: c.policeClearanceDocPhoto || 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80',
                                  captainName: c.name,
                                  description: c.policeClearanceDate || 'Issued by Special Branch / Commissionerate within last 6 months.'
                                })}
                                className="p-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <Shield className="w-3 h-3 text-blue-600" />
                                <span>Inspect PCC</span>
                              </button>
                            </div>
                          </div>

                          {/* PILLAR 2: VEHICLE & REGULATORY */}
                          <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/80 space-y-2.5">
                            <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                              <span className="font-extrabold text-[11px] text-slate-900 uppercase flex items-center gap-1.5">
                                <span className="w-4 h-4 rounded bg-red-600 text-white text-[9px] flex items-center justify-center font-black">2</span>
                                <span>Vehicle Regulatory</span>
                              </span>
                              <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                                Yellow Board
                              </span>
                            </div>

                            <div className="text-[11px] space-y-1.5">
                              <div>
                                <span className="text-slate-400 block text-[9px]">RC YELLOW BOARD:</span>
                                <span className="font-mono font-bold text-slate-800">{c.vehicleNumber}</span>
                                <span className="text-slate-500 text-[10px] block">{c.rcExpiry || 'Valid till Mar 2031'}</span>
                              </div>

                              <div className="pt-1 border-t border-slate-100">
                                <span className="text-slate-400 block text-[9px]">COMMERCIAL INSURANCE:</span>
                                <span className="font-mono font-bold text-slate-800 truncate block">{c.insurancePolicyNumber || 'POL-ICICI-COMM-44129'}</span>
                                <span className="text-slate-500 text-[10px] block">{c.insuranceExpiry || 'Valid till Oct 2027'}</span>
                              </div>

                              <div className="pt-1 border-t border-slate-100">
                                <span className="text-slate-400 block text-[9px]">RTA FITNESS (FC):</span>
                                <span className="font-mono font-bold text-slate-800 truncate block">{c.fcNumber || 'FC-TS09-88219-RTA'}</span>
                              </div>

                              <div className="pt-1 border-t border-slate-100">
                                <span className="text-slate-400 block text-[9px]">TOURIST PERMIT & FASTAG:</span>
                                <span className="font-semibold text-slate-800 block truncate">{c.permitType || 'All-India Tourist Permit (AITP)'}</span>
                                <span className="font-mono text-[10px] text-emerald-600 font-bold block">{c.fastagBarcodeId || 'NETC-3416-8921-1002'}</span>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-1.5 pt-1">
                              <button
                                type="button"
                                onClick={() => setPreviewDocModal({
                                  title: 'Vehicle Registration Certificate (RC Book)',
                                  imageUrl: c.rcDocumentPhoto || 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80',
                                  captainName: c.name,
                                  description: 'Commercial yellow-board registration endorsed for passenger taxi carriage.'
                                })}
                                className="p-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <FileText className="w-3 h-3 text-red-600" />
                                <span>Inspect RC</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => setPreviewDocModal({
                                  title: 'RTA Fitness & All-India Permit',
                                  imageUrl: c.permitDocPhoto || c.fcCertificatePhoto || 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80',
                                  captainName: c.name,
                                  description: 'Commercial Fitness Certificate (FC) and All-India Tourist Permit (AITP).'
                                })}
                                className="p-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <Award className="w-3 h-3 text-amber-600" />
                                <span>Inspect Permit</span>
                              </button>
                            </div>
                          </div>

                          {/* PILLAR 3: VEHICLE QUALITY & SAFETY AUDIT */}
                          <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/80 space-y-2.5">
                            <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                              <span className="font-extrabold text-[11px] text-slate-900 uppercase flex items-center gap-1.5">
                                <span className="w-4 h-4 rounded bg-red-600 text-white text-[9px] flex items-center justify-center font-black">3</span>
                                <span>Quality & Safety Audit</span>
                              </span>
                              <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                                Live Inspected
                              </span>
                            </div>

                            <div className="text-[11px] space-y-1.5">
                              <div>
                                <span className="text-slate-400 block text-[9px]">4-SIDE WALKAROUND:</span>
                                <span className="font-bold text-slate-800 block">Clear Plates (F, R, L, R)</span>
                              </div>

                              <div className="pt-1 border-t border-slate-100">
                                <span className="text-slate-400 block text-[9px]">CLUSTER & ODOMETER:</span>
                                <span className="font-mono font-bold text-slate-800 block">
                                  {c.currentOdometerReading || 44210} km
                                </span>
                                <span className="text-[9px] text-emerald-600 font-bold block">✓ No Check-Engine / ABS Lights</span>
                              </div>

                              <div className="pt-1 border-t border-slate-100">
                                <span className="text-slate-400 block text-[9px]">ONBOARD SAFETY KIT:</span>
                                <span className="text-[10px] text-slate-700 block font-medium">
                                  ✓ Stepney • Jack • Fire Extinguisher • First Aid
                                </span>
                              </div>

                              <div className="pt-1 border-t border-slate-100">
                                <span className="text-slate-400 block text-[9px]">PRE-DUTY AUDIT:</span>
                                <span className="text-[10px] text-emerald-700 font-bold block">
                                  Certified ({c.inspectionAudit?.lastAuditedAt || 'Today, 06:30 AM'})
                                </span>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-1.5 pt-1">
                              <button
                                type="button"
                                onClick={() => setPreviewDocModal({
                                  title: 'Vehicle 4-Side Walkaround Photos',
                                  imageUrl: c.vehicleFrontPhoto || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
                                  captainName: c.name,
                                  description: 'Daytime exterior inspection verifying yellow commercial plates and zero dents.'
                                })}
                                className="p-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <Camera className="w-3 h-3 text-red-600" />
                                <span>4-Side Snap</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => setPreviewDocModal({
                                  title: 'Instrument Cluster & Warning Lights Check',
                                  imageUrl: c.clusterPhoto || 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80',
                                  captainName: c.name,
                                  description: 'Instrument cluster odometer reading and verification of clear warning lights.'
                                })}
                                className="p-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <Gauge className="w-3 h-3 text-emerald-600" />
                                <span>Cluster Snap</span>
                              </button>
                            </div>
                          </div>

                          {/* PILLAR 4: PAYOUT & OPERATIONS */}
                          <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/80 space-y-2.5">
                            <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                              <span className="font-extrabold text-[11px] text-slate-900 uppercase flex items-center gap-1.5">
                                <span className="w-4 h-4 rounded bg-red-600 text-white text-[9px] flex items-center justify-center font-black">4</span>
                                <span>Payout & Operations</span>
                              </span>
                              <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                                NEFT Ready
                              </span>
                            </div>

                            <div className="text-[11px] space-y-1.5">
                              <div>
                                <span className="text-slate-400 block text-[9px]">BANK & IFSC:</span>
                                <span className="font-bold text-slate-800 block truncate">{c.bankAccountDetails?.bankName || 'HDFC Bank Ltd'}</span>
                                <span className="font-mono text-slate-600 text-[10px] block">{c.bankAccountDetails?.ifsc || 'HDFC0000128'}</span>
                              </div>

                              <div className="pt-1 border-t border-slate-100">
                                <span className="text-slate-400 block text-[9px]">ACCOUNT NUMBER:</span>
                                <span className="font-mono font-bold text-slate-800 truncate block">
                                  {c.bankAccountDetails?.accountNumber || '50100492817290'}
                                </span>
                              </div>

                              <div className="pt-1 border-t border-slate-100">
                                <span className="text-slate-400 block text-[9px]">PAYOUT CYCLE:</span>
                                <span className="text-emerald-700 font-bold block">
                                  {c.bankAccountDetails?.payoutCycle || 'Daily Auto-Sweep (T+1)'}
                                </span>
                              </div>

                              <div className="pt-1 border-t border-slate-100">
                                <span className="text-slate-400 block text-[9px]">OPERATING CORRIDORS:</span>
                                <span className="text-slate-700 text-[10px] block truncate">
                                  {c.operatingZones ? c.operatingZones.join(', ') : 'Airport, Outstation, Hourly'}
                                </span>
                              </div>
                            </div>

                            <div className="pt-1">
                              <button
                                type="button"
                                onClick={() => setPreviewDocModal({
                                  title: 'Cancelled Cheque Copy (Direct NEFT Settlement)',
                                  imageUrl: c.bankAccountDetails?.cancelledChequePhoto || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
                                  captainName: c.name,
                                  description: 'Bank account verification matching PAN card name for direct settlement credits.'
                                })}
                                className="w-full p-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <Building className="w-3 h-3 text-red-600" />
                                <span>Inspect Cancelled Cheque</span>
                              </button>
                            </div>
                          </div>

                        </div>

                        {/* Dispatcher Actions Bar */}
                        {isDispatcherOrAdmin && (
                          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 bg-slate-50/70 p-3 rounded-2xl">
                            <div className="text-xs text-slate-500">
                              Audit compliance authority: <strong>{currentRole}</strong>
                            </div>

                            <div className="flex items-center gap-2 w-full sm:w-auto">
                              {!isVerified ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setDiscrepancyCaptain(c);
                                      setDiscrepancyNote('Commercial Fitness Certificate (FC) is due for renewal within 30 days. Please upload updated certificate.');
                                    }}
                                    className="flex-1 sm:flex-none px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                                  >
                                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                                    <span>Flag Discrepancy</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      onUpdateCaptainStatus(c.id, 'Verified');
                                      c.verificationStatus = 'Verified';
                                      c.onboardingStatus = 'Approved';
                                      showToast(`Captain ${c.name} approved across all 4 pillars! Chauffeur activated for dispatch.`, 'success');
                                    }}
                                    className="flex-1 sm:flex-none px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-black shadow-md shadow-emerald-600/25 flex items-center justify-center gap-1.5 cursor-pointer transition-transform active:scale-95"
                                  >
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>Approve All 4 Pillars & Activate</span>
                                  </button>
                                </>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    onUpdateCaptainStatus(c.id, 'Pending Verification');
                                    c.verificationStatus = 'Pending Verification';
                                    c.onboardingStatus = 'Under Review';
                                    showToast(`Captain ${c.name} moved back to review state.`, 'info');
                                  }}
                                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                  <RefreshCw className="w-3.5 h-3.5" />
                                  <span>Reopen Compliance Audit</span>
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: ODOMETER AUDITS & DISCREPANCIES */}
      {activeSubTab === 'odometer' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-black text-slate-900">Pre-Trip & Post-Trip Odometer Audit Desk</h3>
            <p className="text-xs text-slate-500">
              Trip distance verification against live highway GPS logs. Automatic flagging of readings with &gt; 15% discrepancy.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Audit ID / Trip</th>
                  <th className="py-3 px-4">Chauffeur</th>
                  <th className="py-3 px-4">Route</th>
                  <th className="py-3 px-4">Odometer (Start ➔ End)</th>
                  <th className="py-3 px-4">Billed vs GPS Km</th>
                  <th className="py-3 px-4">Variance</th>
                  <th className="py-3 px-4">Audit Status</th>
                  <th className="py-3 px-4 text-right">Photo Proof</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {odometerAudits.map((a) => (
                  <tr key={a.id} className="hover:bg-rose-50/30 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-mono font-extrabold text-red-600">{a.id}</span>
                      <div className="text-[10px] text-slate-500">{a.bookingId}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{a.captainName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{a.carNumber}</div>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700">{a.route}</td>
                    <td className="py-3 px-4 font-mono">
                      {a.startKm.toLocaleString()} km ➔ {a.endKm.toLocaleString()} km
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">
                      {a.totalKmBilled} km <span className="text-slate-400 font-normal">({a.gpsDistanceKm} GPS)</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-md font-bold text-[10px] ${
                        a.flagDiscrepancy ? 'bg-red-100 text-red-700 font-extrabold' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {a.variancePercent > 0 ? `+${a.variancePercent}%` : `${a.variancePercent}%`}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        a.status === 'Verified' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-700 animate-pulse'
                      }`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setOdometerPreview(a)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[10px] cursor-pointer"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: CHAUFFEUR SETTLEMENTS & PAYOUTS */}
      {activeSubTab === 'settlements' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-black text-slate-900">Chauffeur Settlements, Commissions & Direct Payouts</h3>
              <p className="text-xs text-slate-500">
                15% Platform Commission deduction, night allowances, FASTag toll reimbursement, and instant payout execution.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Captain</th>
                  <th className="py-3 px-4">Trips Done</th>
                  <th className="py-3 px-4">Gross Fares</th>
                  <th className="py-3 px-4">15% Commission</th>
                  <th className="py-3 px-4">Night & Toll Reimburse</th>
                  <th className="py-3 px-4">Net Payable Due</th>
                  <th className="py-3 px-4">Payout Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {settlements.map((s) => (
                  <tr key={s.captainId} className="hover:bg-rose-50/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-extrabold text-slate-900">{s.captainName}</div>
                      <div className="text-[10px] text-slate-500">{s.phone} · {s.vehicleNumber}</div>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-700">{s.completedTrips} trips</td>
                    <td className="py-3 px-4 font-bold text-slate-900">₹{s.grossFareCollected.toLocaleString()}</td>
                    <td className="py-3 px-4 text-rose-600 font-bold">-₹{s.platformCommission.toLocaleString()}</td>
                    <td className="py-3 px-4 font-semibold text-emerald-700">
                      +₹{(s.nightAllowances + s.tollParkingReimbursement).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-black text-slate-900 text-sm">₹{s.netPayoutDue.toLocaleString()}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        s.payoutStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {s.payoutStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {isFinanceOrAdmin && s.payoutStatus !== 'Paid' ? (
                        <button
                          onClick={() => {
                            onSettlePayout(s.captainId);
                            showToast(`Payout of ₹${s.netPayoutDue.toLocaleString()} settled for ${s.captainName}!`, 'success');
                          }}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold cursor-pointer shadow-xs"
                        >
                          Disburse Payout
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-medium">Settled {s.lastPayoutDate}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DOCUMENT PREVIEW MODAL */}
      {previewDocModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h4 className="font-black text-slate-900 text-sm">{previewDocModal.title}</h4>
                <p className="text-xs text-slate-500">Captain: {previewDocModal.captainName} {previewDocModal.dlNumber ? `(${previewDocModal.dlNumber})` : ''}</p>
              </div>
              <button
                onClick={() => setPreviewDocModal(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 flex items-center justify-center max-h-[380px]">
              <img
                src={previewDocModal.imageUrl}
                alt={previewDocModal.title}
                className="w-full h-auto max-h-[380px] object-contain"
              />
            </div>

            {previewDocModal.description && (
              <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                {previewDocModal.description}
              </p>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setPreviewDocModal(null)}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DISCREPANCY REJECTION / RE-UPLOAD MODAL */}
      {discrepancyCaptain && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <h4 className="font-black text-slate-900 text-sm">Flag Compliance Discrepancy</h4>
              </div>
              <button
                onClick={() => setDiscrepancyCaptain(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Record a compliance note for <strong>Captain {discrepancyCaptain.name}</strong> ({discrepancyCaptain.vehicleNumber}). An automated alert will prompt document re-upload.
            </p>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 block">Common Audit Issues:</label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Commercial FC expiring within 30 days',
                  'Police clearance copy blurred/stamp obscured',
                  'Vehicle rear photo missing plate view',
                  'Cancelled cheque name mismatch with PAN',
                ].map((reason, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setDiscrepancyNote(reason)}
                    className="text-[10px] px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium cursor-pointer"
                  >
                    {reason}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 block">Discrepancy Reason Note:</label>
              <textarea
                value={discrepancyNote}
                onChange={(e) => setDiscrepancyNote(e.target.value)}
                rows={3}
                placeholder="Enter specific document deficiency details..."
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDiscrepancyCaptain(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => {
                  discrepancyCaptain.verificationStatus = 'Pending Verification';
                  discrepancyCaptain.onboardingStatus = 'Under Review';
                  discrepancyCaptain.rejectionReason = discrepancyNote;
                  onUpdateCaptainStatus(discrepancyCaptain.id, 'Pending Verification');
                  showToast(`Discrepancy flagged for Captain ${discrepancyCaptain.name}. Notification queued for re-upload.`, 'info');
                  setDiscrepancyCaptain(null);
                  setDiscrepancyNote('');
                }}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Dispatch Discrepancy Notice</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESET PIN MODAL */}
      {pinModalCaptain && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h4 className="font-black text-slate-900 text-sm">Reset Security PIN</h4>
                <p className="text-xs text-slate-500">Chauffeur: {pinModalCaptain.name}</p>
              </div>
              <button
                onClick={() => setPinModalCaptain(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleResetPinSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Enter New 4-Digit PIN</label>
                <input
                  type="password"
                  maxLength={4}
                  required
                  placeholder="e.g. 5566"
                  value={newPinInput}
                  onChange={(e) => setNewPinInput(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center tracking-widest text-lg font-mono px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-600 font-bold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPinModalCaptain(null)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold cursor-pointer shadow-sm"
                >
                  Update & Send PIN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ODOMETER INSPECTION MODAL */}
      {odometerPreview && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h4 className="font-black text-slate-900 text-sm">Odometer Audit Proof: {odometerPreview.id}</h4>
                <p className="text-xs text-slate-500">{odometerPreview.captainName} · {odometerPreview.carNumber}</p>
              </div>
              <button
                onClick={() => setOdometerPreview(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-slate-500">Route:</span>
                <span className="font-bold text-slate-800">{odometerPreview.route}</span>
              </div>
              <div className="flex justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-slate-500">Readings:</span>
                <span className="font-mono font-bold text-slate-800">
                  {odometerPreview.startKm} km ➔ {odometerPreview.endKm} km ({odometerPreview.totalKmBilled} km)
                </span>
              </div>
              <div className="flex justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-slate-500">GPS Highway Variance:</span>
                <span className={`font-bold ${odometerPreview.flagDiscrepancy ? 'text-red-600' : 'text-emerald-600'}`}>
                  {odometerPreview.variancePercent}%
                </span>
              </div>
              {odometerPreview.notes && (
                <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px]">
                  <b>Note:</b> {odometerPreview.notes}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] font-bold text-slate-500 block mb-1">Start Odometer Snap</span>
                <img
                  src={odometerPreview.startPhotoUrl}
                  alt="Start Odometer"
                  className="rounded-xl border border-slate-200 h-28 w-full object-cover"
                />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 block mb-1">End Odometer Snap</span>
                <img
                  src={odometerPreview.endPhotoUrl}
                  alt="End Odometer"
                  className="rounded-xl border border-slate-200 h-28 w-full object-cover"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setOdometerPreview(null)}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

