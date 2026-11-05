import React, { useState } from 'react';
import { CaptainProfile } from '../../types';
import {
  UserCheck, ShieldCheck, Power, BatteryCharging, 
  Radio, Lock, KeyRound, LogOut, CheckCircle2, 
  Clock, Navigation, AlertCircle, RefreshCw, Check, Sparkles
} from 'lucide-react';

interface ShiftAuthStatusSwitcherProps {
  captain: CaptainProfile;
  onUpdateDutyStatus: (status: CaptainProfile['dutyStatus']) => void;
  onLogout: () => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const ShiftAuthStatusSwitcher: React.FC<ShiftAuthStatusSwitcherProps> = ({
  captain,
  onUpdateDutyStatus,
  onLogout,
  showToast,
}) => {
  const [pinChangeOpen, setPinChangeOpen] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [batteryLevel] = useState(88);

  const dutyStatuses: {
    id: CaptainProfile['dutyStatus'];
    label: string;
    description: string;
    color: string;
    activeBg: string;
    badgeBg: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'Available (Standby)',
      label: 'Available (Standby)',
      description: 'Online & beacon active · Eligible for automatic dispatches',
      color: 'text-emerald-700',
      activeBg: 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-2 ring-emerald-500/30',
      badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      icon: <Radio className="w-4 h-4 animate-pulse" />,
    },
    {
      id: 'En Route to Pickup',
      label: 'En Route to Pickup',
      description: 'Heading to guest pickup point · Passenger tracking live',
      color: 'text-blue-700',
      activeBg: 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-2 ring-blue-500/30',
      badgeBg: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: <Navigation className="w-4 h-4" />,
    },
    {
      id: 'On Trip',
      label: 'On Trip',
      description: 'Passenger on board · Highway meter active',
      color: 'text-amber-700',
      activeBg: 'bg-amber-600 text-white shadow-md shadow-amber-600/30 ring-2 ring-amber-500/30',
      badgeBg: 'bg-amber-100 text-amber-800 border-amber-200',
      icon: <Clock className="w-4 h-4" />,
    },
    {
      id: 'Off Duty',
      label: 'Off Duty',
      description: 'Chauffeur resting · Telemetry paused · No dispatches routed',
      color: 'text-slate-600',
      activeBg: 'bg-slate-800 text-white shadow-md ring-2 ring-slate-700/30',
      badgeBg: 'bg-slate-100 text-slate-700 border-slate-200',
      icon: <Power className="w-4 h-4" />,
    },
  ];

  const handleDutyChange = (status: CaptainProfile['dutyStatus']) => {
    onUpdateDutyStatus(status);
    showToast(`Duty status updated to ${status}`, 'success');
  };

  const handleUpdatePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{4}$/.test(newPin)) {
      showToast('Quick PIN must be exactly 4 digits.', 'error');
      return;
    }
    if (newPin !== confirmPin) {
      showToast('PIN confirmation does not match.', 'error');
      return;
    }
    captain.pin = newPin;
    setPinChangeOpen(false);
    setNewPin('');
    setConfirmPin('');
    showToast('Chauffeur terminal PIN updated successfully.', 'success');
  };

  // Determine active duty match (matching old 'On Duty' to 'Available (Standby)' if needed)
  const isStatusActive = (id: string) => {
    if (captain.dutyStatus === id) return true;
    if (captain.dutyStatus === 'On Duty' && id === 'Available (Standby)') return true;
    return false;
  };

  return (
    <div className="space-y-4">
      {/* 1. TOP ROADSIDE DURABILITY STATUS STRIP */}
      <div className="bg-slate-900 text-white p-3.5 sm:p-4 rounded-3xl border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <img
              src={captain.photoUrl}
              alt={captain.name}
              className="w-12 h-12 rounded-2xl object-cover ring-2 ring-red-500/80 shadow-md"
            />
            <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${
              captain.dutyStatus === 'Off Duty'
                ? 'bg-slate-500'
                : captain.dutyStatus === 'On Trip'
                ? 'bg-amber-500'
                : 'bg-emerald-500 animate-pulse'
            }`} />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-black text-white text-base tracking-tight">{captain.name}</h2>
              <span className="px-2 py-0.5 rounded-full bg-red-600/30 text-red-300 font-bold text-[10px] border border-red-500/40">
                CAPTAIN #{captain.id.toUpperCase().replace('CPT-', '')}
              </span>
            </div>
            <p className="text-slate-400 text-[11px] mt-0.5">
              {captain.vehicleModel} · <span className="font-mono font-bold text-amber-400">{captain.vehicleNumber}</span>
            </p>
          </div>
        </div>

        {/* Telemetry Hardware Badges */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <div className="px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 flex items-center gap-1.5 text-slate-300 text-[11px]">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>GPS: ±3m Lock</span>
          </div>

          <div className="px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 flex items-center gap-1.5 text-slate-300 text-[11px]">
            <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
            <span>{batteryLevel}% Battery</span>
          </div>

          <button
            type="button"
            onClick={() => setPinChangeOpen(true)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
            title="Change 4-Digit Quick PIN"
          >
            <KeyRound className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-slate-300 hover:text-red-400 border border-white/10 transition-colors cursor-pointer"
            title="Sign out of Cockpit"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. 4-WAY DUTY STATUS SWITCHER (ROADSIDE DURABLE) */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-red-600" />
            <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
              Shift Duty Status Switcher
            </h3>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">
            Active: <strong>{captain.dutyStatus}</strong>
          </span>
        </div>

        <p className="text-xs text-slate-500 leading-tight">
          Keep status set to <strong>Available</strong> to receive automatic passenger dispatches. When driving to guest, switch to <strong>En Route</strong>.
        </p>

        {/* 4 Large Clickable Duty Tiles for Roadside Finger Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          {dutyStatuses.map((item) => {
            const active = isStatusActive(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleDutyChange(item.id)}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[82px] ${
                  active
                    ? item.activeBg
                    : 'bg-slate-50/80 border-slate-200 hover:bg-white hover:border-slate-300 text-slate-800'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2 font-black text-xs">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {active && (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-white/20 uppercase tracking-widest">
                      ACTIVE
                    </span>
                  )}
                </div>
                <span className={`text-[11px] leading-tight mt-1.5 ${active ? 'text-white/90' : 'text-slate-500'}`}>
                  {item.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. PIN RESET / UPDATE MODAL */}
      {pinChangeOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Lock className="w-4 h-4 text-red-600" />
                <span>Update 4-Digit Quick PIN</span>
              </div>
              <button
                type="button"
                onClick={() => setPinChangeOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdatePinSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  New 4-Digit Quick PIN *
                </label>
                <input
                  type="password"
                  maxLength={4}
                  required
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="••••"
                  className="w-full text-center text-lg font-mono font-black tracking-widest py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-red-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Confirm 4-Digit Quick PIN *
                </label>
                <input
                  type="password"
                  maxLength={4}
                  required
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="••••"
                  className="w-full text-center text-lg font-mono font-black tracking-widest py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-red-600 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPinChangeOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/30"
                >
                  Save New PIN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

