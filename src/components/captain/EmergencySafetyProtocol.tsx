import React, { useState } from 'react';
import { CaptainProfile, IncidentBreakdownReport } from '../../types';
import {
  AlertTriangle, ShieldAlert, Phone, Wrench, 
  MapPin, BatteryCharging, Radio, CheckCircle2, 
  Camera, X, Check, ArrowRight, RefreshCw, Car
} from 'lucide-react';

interface EmergencySafetyProtocolProps {
  captain: CaptainProfile;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const EmergencySafetyProtocol: React.FC<EmergencySafetyProtocolProps> = ({
  captain,
  showToast,
}) => {
  // SOS State
  const [sosActive, setSosActive] = useState(false);
  const [sosCountdown, setSosCountdown] = useState(10);
  const [sosDispatched, setSosDispatched] = useState(false);

  // Breakdown Modal State
  const [breakdownModalOpen, setBreakdownModalOpen] = useState(false);
  const [issueType, setIssueType] = useState<IncidentBreakdownReport['issueType']>('Flat Tire');
  const [locationMilestone, setLocationMilestone] = useState('NH44 Km 142 near Jadcherla Bypass, Telangana');
  const [breakdownNotes, setBreakdownNotes] = useState('Rear right radial puncture. Stepney fitted but requires roadside assistance / relief car.');
  const [reliefRequested, setReliefRequested] = useState(true);
  const [reportedIncidents, setReportedIncidents] = useState<IncidentBreakdownReport[]>([]);

  // Timer effect for SOS
  React.useEffect(() => {
    let timer: any = null;
    if (sosActive && sosCountdown > 0) {
      timer = setTimeout(() => {
        setSosCountdown((prev) => prev - 1);
      }, 1000);
    } else if (sosActive && sosCountdown === 0) {
      setSosActive(false);
      setSosDispatched(true);
      showToast('🚨 CAPTAIN DISTRESS BEACON ACTIVE: Central Dispatch, Relief Fleet & Police 112 alerted with live coordinates.', 'error');
    }
    return () => clearTimeout(timer);
  }, [sosActive, sosCountdown, showToast]);

  const handleTriggerSos = () => {
    setSosActive(true);
    setSosCountdown(10);
    setSosDispatched(false);
  };

  const handleCancelSos = () => {
    setSosActive(false);
    setSosCountdown(10);
    showToast('Captain SOS Distress beacon cancelled. False alarm averted.', 'info');
  };

  const handleBreakdownSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newReport: IncidentBreakdownReport = {
      id: `INC-${Date.now().toString(36).toUpperCase()}`,
      captainId: captain.id,
      captainName: captain.name,
      vehicleNumber: captain.vehicleNumber,
      issueType,
      locationDescription: locationMilestone,
      reliefVehicleRequested: reliefRequested,
      status: 'Relief Dispatched',
      reportedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ', Today',
    };

    setReportedIncidents((prev) => [newReport, ...prev]);
    setBreakdownModalOpen(false);
    showToast(`Breakdown #${newReport.id} registered. Nearest relief cab dispatched from Jadcherla hub!`, 'success');
  };

  return (
    <div className="space-y-5">
      {/* 1. HIGH-PRIORITY CAPTAIN SOS BEACON */}
      <div className="bg-gradient-to-r from-red-950 via-slate-900 to-red-900 text-white p-5 rounded-3xl border border-red-700/60 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-md shadow-red-600/40">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-red-400 block">
                Emergency Distress Protocol
              </span>
              <h3 className="text-base font-black text-white">
                Captain High-Priority SOS Beacon
              </h3>
            </div>
          </div>

          <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-600/30 text-red-300 font-bold border border-red-500/40">
            24/7 Armed Response
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-tight">
          Trigger in case of highway robbery threat, medical emergency, or severe roadside dispute. Immediately broadcasts your live GPS coordinates, battery level (88%), and vehicle plate (<strong className="text-amber-400 font-mono">{captain.vehicleNumber}</strong>) to Central Dispatch.
        </p>

        {/* SOS Countdown State */}
        {sosActive && (
          <div className="p-4 rounded-2xl bg-red-600/30 border border-red-500 text-center space-y-3 animate-pulse">
            <div className="flex items-center justify-center gap-2 text-red-400 text-xs font-black uppercase tracking-wider">
              <Radio className="w-4 h-4 animate-ping" />
              <span>Broadcasting Distress Signal In...</span>
            </div>
            <div className="text-4xl font-black text-white font-mono">{sosCountdown}s</div>
            <button
              type="button"
              onClick={handleCancelSos}
              className="px-6 py-2 rounded-xl bg-white text-slate-900 font-black text-xs hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel Distress (False Alarm)
            </button>
          </div>
        )}

        {/* SOS Dispatched Banner */}
        {sosDispatched && (
          <div className="p-4 rounded-2xl bg-red-600 border border-red-400 text-white text-xs space-y-2">
            <div className="flex items-center gap-2 font-black text-sm">
              <AlertTriangle className="w-5 h-5 text-amber-300" />
              <span>🚨 SOS BEACON TRANSMITTED LIVE</span>
            </div>
            <p className="text-white/90 text-[11px]">
              Wayora Emergency Desk and highway patrol have been dispatched to your GPS location (NH44 Coordinates). Keep phone line free for urgent call back.
            </p>
          </div>
        )}

        {!sosActive && !sosDispatched && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={handleTriggerSos}
              className="py-3.5 px-4 rounded-2xl bg-red-600 hover:bg-red-500 active:scale-95 text-white font-black text-xs shadow-lg shadow-red-600/40 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>TRIGGER CAPTAIN SOS BEACON</span>
            </button>

            <a
              href="tel:+919182471876"
              className="py-3.5 px-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>Call Emergency Desk (+91 91824 71876)</span>
            </a>
          </div>
        )}
      </div>

      {/* 2. BREAKDOWN & INCIDENT REPORTING */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-red-600" />
              <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
                Breakdown & Incident Reporting
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Rapid relief car auto-assignment for mechanical punctures, engine breakdown, or accidents.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setBreakdownModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Wrench className="w-3.5 h-3.5 text-amber-400" />
            <span>Report Breakdown</span>
          </button>
        </div>

        {/* Existing / Active Incidents */}
        {reportedIncidents.length === 0 ? (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500 space-y-1">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto" />
            <p className="font-bold text-slate-800">Zero Active Highway Breakdowns</p>
            <p className="text-[11px] text-slate-500">Your vehicle is running smoothly with no reported incidents.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reportedIncidents.map((inc) => (
              <div
                key={inc.id}
                className="p-3.5 rounded-2xl border border-amber-200 bg-amber-50/70 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{inc.issueType}</span>
                    <span className="font-mono text-[10px] text-red-600 font-bold">#{inc.id}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                    {inc.status}
                  </span>
                </div>
                <p className="text-slate-600 text-[11px]">{inc.locationDescription}</p>
                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-amber-200/60">
                  <span>Reported at {inc.reportedAt}</span>
                  <span className="font-bold text-emerald-700">Relief Innova En Route</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. BREAKDOWN MODAL */}
      {breakdownModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 border border-slate-200 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Wrench className="w-4 h-4 text-red-600" />
                <span>Report Highway Breakdown / Relief Request</span>
              </div>
              <button
                type="button"
                onClick={() => setBreakdownModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleBreakdownSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Incident / Breakdown Type *
                </label>
                <select
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-semibold focus:outline-none focus:border-red-600 focus:bg-white"
                >
                  <option value="Flat Tire">Flat Tire / Tire Puncture</option>
                  <option value="Engine Overheating">Engine Radiator Overheating</option>
                  <option value="Battery Drain">Battery / Alternator Failure</option>
                  <option value="Minor Collision">Minor Collision / Fender Damage</option>
                  <option value="Severe Route Blockage">Highway Landslide / Severe Route Blockage</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Highway Milestone / Location *
                </label>
                <input
                  type="text"
                  required
                  value={locationMilestone}
                  onChange={(e) => setLocationMilestone(e.target.value)}
                  placeholder="e.g. NH44 Km 142 near Jadcherla Bypass"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Chauffeur Notes & Severity
                </label>
                <textarea
                  rows={2}
                  required
                  value={breakdownNotes}
                  onChange={(e) => setBreakdownNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white"
                />
              </div>

              <label className="flex items-center gap-2 p-3 rounded-2xl bg-red-50 border border-red-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={reliefRequested}
                  onChange={(e) => setReliefRequested(e.target.checked)}
                  className="h-4 w-4 rounded text-red-600 focus:ring-red-500"
                />
                <span className="font-bold text-red-900 text-xs">
                  Request Immediate Relief Vehicle for Passenger Transfer
                </span>
              </label>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setBreakdownModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-md shadow-red-600/30"
                >
                  Dispatch Breakdown Alarm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

