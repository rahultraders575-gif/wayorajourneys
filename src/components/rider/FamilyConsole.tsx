import React, { useState } from 'react';
import { FamilyPassengerProfile, RiderPreferences } from '../../types';
import {
  Users, UserPlus, Phone, MapPin, Share2, 
  Copy, Check, ShieldCheck, Heart, Sparkles, 
  Baby, Luggage, Dog, ShieldAlert, Edit2, Trash2, X
} from 'lucide-react';

interface FamilyConsoleProps {
  familyProfiles: FamilyPassengerProfile[];
  preferences?: RiderPreferences;
  onAddFamilyProfile: (profile: Omit<FamilyPassengerProfile, 'id'>) => void;
  onDeleteFamilyProfile: (id: string) => void;
  onSelectFamilyForBooking: (profile: FamilyPassengerProfile) => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const FamilyConsole: React.FC<FamilyConsoleProps> = ({
  familyProfiles,
  preferences,
  onAddFamilyProfile,
  onDeleteFamilyProfile,
  onSelectFamilyForBooking,
  showToast,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('Parents');
  const [phone, setPhone] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [notes, setNotes] = useState('');

  // Special Ride Instruction Toggles
  const [luggagePorter, setLuggagePorter] = useState(true);
  const [infantSeat, setInfantSeat] = useState(false);
  const [petFriendly, setPetFriendly] = useState(false);
  const [gentleDriving, setGentleDriving] = useState(true);

  // Tracking Share Link state
  const [copiedLink, setCopiedLink] = useState(false);
  const sampleTrackingUrl = 'https://wayorajourneys.com/track/WY-8891';

  const handleCopyTrackingLink = () => {
    navigator.clipboard.writeText(sampleTrackingUrl);
    setCopiedLink(true);
    showToast('Remote live tracking link copied to clipboard', 'success');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddFamilyProfile({
      name,
      relationship,
      phone,
      pickupAddress,
      specialNotes: notes,
    });
    showToast(`Profile for ${name} saved successfully`, 'success');
    setIsAddModalOpen(false);
    setName('');
    setPhone('');
    setPickupAddress('');
    setNotes('');
  };

  return (
    <div className="space-y-6">

      {/* TOP HEADER & ACTIONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-200/90 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-red-600 fill-current" />
            <h3 className="text-base font-black text-slate-900">"Book for Family & Guests" Console</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage passenger delegates, send remote shareable GPS links, and set special elder/infant ride preferences.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-all whitespace-nowrap"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Add Family Member</span>
        </button>
      </div>

      {/* SECTION 1: REMOTE LIVE TRACKING LINK BANNER */}
      <div className="rounded-3xl border border-red-200 bg-gradient-to-r from-red-50 via-rose-50 to-orange-50 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-red-700 bg-red-100/80 px-2.5 py-0.5 rounded-full border border-red-200">
            Browser Remote Tracking
          </span>
          <h4 className="text-sm font-black text-slate-900">Share Live Vehicle Path with Family</h4>
          <p className="text-xs text-slate-600 max-w-xl">
            Recipients do not need the Wayora app installed. They can view live GPS coordinates, estimated arrival time, and chauffeur contact directly in their browser.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyTrackingLink}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-red-600" />}
            <span>{copiedLink ? 'Link Copied!' : 'Copy Link'}</span>
          </button>

          <a
            href={`https://wa.me/?text=${encodeURIComponent(`Hi! Here is the live tracking link for our Wayora chauffeur ride: ${sampleTrackingUrl}`)}`}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share via WhatsApp</span>
          </a>
        </div>
      </div>

      {/* SECTION 2: SAVED DELEGATE PASSENGER PROFILES */}
      <div className="space-y-3">
        <h4 className="text-sm font-black text-slate-900">Saved Passenger Profiles ({familyProfiles.length})</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {familyProfiles.map((member) => (
            <div
              key={member.id}
              className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h5 className="font-black text-slate-900 text-sm">{member.name}</h5>
                    <span className="text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
                      {member.relationship}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDeleteFamilyProfile(member.id)}
                    className="text-slate-400 hover:text-red-600 p-1 cursor-pointer transition-colors"
                    title="Remove Profile"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-1 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5 font-medium">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{member.phone}</span>
                  </div>
                  <div className="flex items-start gap-1.5 text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{member.pickupAddress}</span>
                  </div>
                </div>

                {member.specialNotes && (
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-700 italic">
                    "{member.specialNotes}"
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => onSelectFamilyForBooking(member)}
                  className="w-full py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5"
                >
                  <Users className="w-3.5 h-3.5 text-rose-400" />
                  <span>Book Ride for {member.name.split(' ')[0]}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3: SPECIAL RIDE INSTRUCTIONS TOGGLES */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
        <div>
          <h4 className="text-base font-black text-slate-900">Pre-Set Ride Comfort & Care Instructions</h4>
          <p className="text-xs text-slate-500">
            Automatically attached to dispatch instructions sent to your chauffeur partner.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Luggage Porter */}
          <div
            onClick={() => setLuggagePorter(!luggagePorter)}
            className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 ${
              luggagePorter ? 'border-red-600 bg-red-50/40 text-red-950 ring-1 ring-red-500/20' : 'border-slate-200 bg-slate-50 text-slate-700'
            }`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${luggagePorter ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
              <Luggage className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-xs block">Luggage Porter</span>
              <span className="text-[10px] text-slate-500">Heavy baggage assistance</span>
            </div>
          </div>

          {/* Child Safety Seat */}
          <div
            onClick={() => setInfantSeat(!infantSeat)}
            className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 ${
              infantSeat ? 'border-red-600 bg-red-50/40 text-red-950 ring-1 ring-red-500/20' : 'border-slate-200 bg-slate-50 text-slate-700'
            }`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${infantSeat ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
              <Baby className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-xs block">Infant Safety Seat</span>
              <span className="text-[10px] text-slate-500">Pre-installed baby seat</span>
            </div>
          </div>

          {/* Gentle Ghat Driving */}
          <div
            onClick={() => setGentleDriving(!gentleDriving)}
            className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 ${
              gentleDriving ? 'border-red-600 bg-red-50/40 text-red-950 ring-1 ring-red-500/20' : 'border-slate-200 bg-slate-50 text-slate-700'
            }`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${gentleDriving ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-xs block">Calm Ghat Driving</span>
              <span className="text-[10px] text-slate-500">Smooth speed for seniors</span>
            </div>
          </div>

          {/* Pet Friendly */}
          <div
            onClick={() => setPetFriendly(!petFriendly)}
            className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 ${
              petFriendly ? 'border-red-600 bg-red-50/40 text-red-950 ring-1 ring-red-500/20' : 'border-slate-200 bg-slate-50 text-slate-700'
            }`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${petFriendly ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
              <Dog className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-xs block">Pet-Friendly Cab</span>
              <span className="text-[10px] text-slate-500">Rear seat protector</span>
            </div>
          </div>
        </div>
      </div>

      {/* ADD FAMILY MEMBER MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h4 className="font-black text-slate-900 text-sm">Add Family / Guest Profile</h4>
                <p className="text-xs text-slate-500">Save for rapid one-click delegate reservations.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Passenger Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Smt. Lakshmi Reddy (Mother)"
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
                    <option value="Parents">Parents</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Children">Children</option>
                    <option value="Sister">Sister</option>
                    <option value="Brother">Brother</option>
                    <option value="Corporate Guest">Corporate Guest</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Mobile Phone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 94400 12890"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Default Pickup Address</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Road No. 12, Banjara Hills, Hyderabad"
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Special Chauffeur Instructions</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Senior citizens on board. Please assist with luggage and drive gently on ghat curves."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
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
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

