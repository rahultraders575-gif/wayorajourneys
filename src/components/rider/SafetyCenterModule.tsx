import React, { useState } from 'react';
import { EmergencyContact } from '../../types';
import {
  ShieldAlert, Phone, Users, UserPlus, Trash2, 
  CheckCircle2, AlertTriangle, ShieldCheck, Heart, 
  MapPin, Clock, Send, X, RefreshCw, Check
} from 'lucide-react';

interface SafetyCenterModuleProps {
  emergencyContacts: EmergencyContact[];
  onAddEmergencyContact: (contact: Omit<EmergencyContact, 'id'>) => void;
  onDeleteEmergencyContact: (id: string) => void;
  onToggleContactAlert: (id: string, type: 'start' | 'end') => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const SafetyCenterModule: React.FC<SafetyCenterModuleProps> = ({
  emergencyContacts,
  onAddEmergencyContact,
  onDeleteEmergencyContact,
  onToggleContactAlert,
  showToast,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('Spouse');
  const [phone, setPhone] = useState('');

  // SOS Trigger State
  const [sosActive, setSosActive] = useState(false);
  const [sosCountdown, setSosCountdown] = useState(10);
  const [sosDispatched, setSosDispatched] = useState(false);

  // Ride Check Banner State
  const [rideCheckActive, setRideCheckActive] = useState(true);
  const [rideCheckResolved, setRideCheckResolved] = useState(false);

  const handleTriggerSos = () => {
    setSosActive(true);
    setSosCountdown(10);
    setSosDispatched(false);
  };

  const handleCancelSos = () => {
    setSosActive(false);
    setSosCountdown(10);
    showToast('Emergency SOS alert cancelled. False alarm averted.', 'info');
  };

  const handleConfirmSosNow = () => {
    setSosActive(false);
    setSosDispatched(true);
    showToast('🚨 EMERGENCY PROTOCOL DISPATCHED: Wayora Security Center & Police 112 alerted with live coordinates.', 'error');
  };

  const handleAddContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (emergencyContacts.length >= 5) {
      showToast('Maximum 5 emergency contacts permitted', 'error');
      return;
    }
    onAddEmergencyContact({
      name,
      relationship,
      phone,
      notifyOnTripStart: true,
      notifyOnTripEnd: true,
    });
    showToast(`Emergency contact ${name} added successfully`, 'success');
    setIsAddModalOpen(false);
    setName('');
    setPhone('');
  };

  return (
    <div className="space-y-6">

      {/* EMERGENCY SOS PANIC BANNER */}
      <div className="rounded-3xl border-2 border-red-500/40 bg-gradient-to-r from-red-600 via-rose-700 to-red-800 text-white p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
            <span className="text-[10px] font-black uppercase tracking-widest text-rose-200">
              24/7 Wayora Security Protocol
            </span>
          </div>
          <h3 className="text-xl font-black tracking-tight">One-Tap Emergency Highway SOS</h3>
          <p className="text-xs text-rose-100 max-w-xl">
            In an emergency, tap SOS to instantly broadcast your real-time GPS coordinates to our 24/7 Security Operations Center, dial Police Helpline (112), and notify all trusted emergency contacts via SMS.
          </p>
        </div>

        <button
          type="button"
          onClick={handleTriggerSos}
          className="px-6 py-4 bg-white hover:bg-rose-50 text-red-700 font-black rounded-2xl text-sm flex items-center justify-center gap-2 shadow-2xl cursor-pointer active:scale-95 transition-all whitespace-nowrap"
        >
          <ShieldAlert className="w-5 h-5 text-red-600 animate-bounce" />
          <span>TRIGGER PANIC SOS</span>
        </button>
      </div>

      {/* SOS CONFIRMATION MODAL WITH COUNTDOWN */}
      {sosActive && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border-2 border-red-600 text-center space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto ring-4 ring-red-600/30">
              <ShieldAlert className="w-8 h-8 animate-pulse" />
            </div>

            <div className="space-y-1">
              <h4 className="text-xl font-black text-slate-900">Confirm Emergency SOS</h4>
              <p className="text-xs text-slate-600">
                Dispatching live telemetry coordinates to Police (112) and Wayora Crisis Response Desk.
              </p>
            </div>

            <div className="p-4 bg-red-50 rounded-2xl border border-red-200 text-xs text-red-900 font-bold">
              Automatically broadcasting in <span className="font-mono text-xl font-black text-red-600">{sosCountdown}</span> seconds...
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleCancelSos}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs cursor-pointer"
              >
                Cancel (False Alarm)
              </button>
              <button
                type="button"
                onClick={handleConfirmSosNow}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black text-xs cursor-pointer shadow-md"
              >
                Dispatch SOS Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SOS DISPATCHED BANNER */}
      {sosDispatched && (
        <div className="bg-red-900 text-white p-5 rounded-3xl border border-red-700 shadow-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-black text-sm uppercase tracking-wide flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              Live Emergency Response Active
            </span>
            <button
              onClick={() => setSosDispatched(false)}
              className="text-xs text-rose-300 hover:text-white font-bold cursor-pointer"
            >
              Close Alert
            </button>
          </div>
          <p className="text-xs text-rose-100">
            Emergency telemetry link has been transmitted to Highway Police and your emergency contacts. A security specialist will call the chauffeur and rider within 90 seconds.
          </p>
        </div>
      )}

      {/* RIDE CHECK & DEVIATION MONITORING BANNER */}
      {rideCheckActive && !rideCheckResolved && (
        <div className="rounded-3xl border border-amber-300 bg-amber-50/80 p-5 shadow-xs space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <h4 className="font-black text-slate-900 text-sm">Automated Highway Ride Check</h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Our system noticed your vehicle has stopped near Kurnool Toll Plaza for over 15 minutes.
                </p>
              </div>
            </div>
            <span className="text-[10px] font-extrabold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
              Automated Check-In
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                setRideCheckResolved(true);
                showToast('Status logged: Scheduled tea/fuel break. Everything on track.', 'success');
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs cursor-pointer shadow-xs"
            >
              I am Fine (Tea / Rest Break)
            </button>
            <button
              type="button"
              onClick={() => {
                showToast('Security team callback dispatched. Expect a call in 60 seconds.', 'info');
                setRideCheckResolved(true);
              }}
              className="px-4 py-2 bg-slate-900 hover:bg-black text-white font-bold rounded-xl text-xs cursor-pointer"
            >
              Request Dispatcher Callback
            </button>
          </div>
        </div>
      )}

      {/* TRUSTED EMERGENCY CONTACTS MANAGEMENT */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-base font-black text-slate-900">Trusted Emergency Contacts (Max 5)</h4>
            <p className="text-xs text-slate-500">
              Contacts automatically receive SMS trip updates when your ride starts and safely concludes.
            </p>
          </div>

          {emergencyContacts.length < 5 && (
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs whitespace-nowrap"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Emergency Contact</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {emergencyContacts.map((contact) => (
            <div
              key={contact.id}
              className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h5 className="font-extrabold text-slate-900 text-sm">{contact.name}</h5>
                  <span className="text-[10px] font-bold text-red-700 bg-red-100/60 px-2 py-0.5 rounded-full">
                    {contact.relationship}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onDeleteEmergencyContact(contact.id)}
                  className="text-slate-400 hover:text-red-600 p-1 cursor-pointer transition-colors"
                  title="Remove Contact"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{contact.phone}</span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[11px]">
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 font-semibold">
                  <input
                    type="checkbox"
                    checked={contact.notifyOnTripStart}
                    onChange={() => onToggleContactAlert(contact.id, 'start')}
                    className="rounded text-red-600"
                  />
                  <span>SMS on Departure</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 font-semibold">
                  <input
                    type="checkbox"
                    checked={contact.notifyOnTripEnd}
                    onChange={() => onToggleContactAlert(contact.id, 'end')}
                    className="rounded text-red-600"
                  />
                  <span>SMS on Arrival</span>
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ADD CONTACT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h4 className="font-black text-slate-900 text-sm">Add Emergency Contact</h4>
                <p className="text-xs text-slate-500">Add trusted contacts for real-time safety dispatches.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddContactSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Contact Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sunita Reddy"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Relationship</label>
                  <select
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold"
                  >
                    <option value="Spouse">Spouse</option>
                    <option value="Parents">Parents</option>
                    <option value="Brother">Brother</option>
                    <option value="Sister">Sister</option>
                    <option value="Friend">Friend</option>
                    <option value="Colleague">Colleague</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98490 33442"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold cursor-pointer shadow-sm"
                >
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

