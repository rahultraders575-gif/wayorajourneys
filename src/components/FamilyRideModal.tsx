import React, { useState } from 'react';
import { 
  Users, User, Phone, MapPin, Heart, ShieldCheck, 
  Sparkles, Check, X, AlertCircle, MessageSquare
} from 'lucide-react';

export interface FamilyRideDetails {
  enabled: boolean;
  passengerName: string;
  passengerPhone: string;
  relationship?: string;
  doorstepAddress?: string;
  notes?: string;
  assistanceTags?: string[];
}

interface FamilyRideModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDetails?: Partial<FamilyRideDetails>;
  onApply: (details: FamilyRideDetails) => void;
  onReset: () => void;
  currentLiveLocation?: string;
}

const PRESET_RELATIONS = [
  { label: '👴 Parents / Elders', tag: 'Parents', note: 'Senior citizen passenger. Gentle highway cruising and courteous chauffeur care.' },
  { label: '👨‍👩‍👧 Family Member', tag: 'Family', note: 'Family travel. Assistance with boarding and luggage.' },
  { label: '👶 Spouse & Kids', tag: 'Spouse & Kids', note: 'Family trip. Child safety conscious driving.' },
  { label: '💼 Guest / Colleague', tag: 'Guest', note: 'Corporate guest / VIP transfer. Professional greeting required.' },
  { label: '🏥 Medical / Hospital Visit', tag: 'Medical', note: 'Hospital visit. Slow over speed-breakers and curb-side doorstep stop.' },
];

const PRESET_ASSISTANCE_TAGS = [
  '🧰 Doorstep Luggage Help',
  '👴 Senior Citizen Care',
  '♿ Wheelchair Assistance',
  '📞 Call 15 Min Before',
  '❄️ Moderate AC',
  '🚗 Smooth Highway Drive',
];

export const FamilyRideModal: React.FC<FamilyRideModalProps> = ({
  isOpen,
  onClose,
  initialDetails,
  onApply,
  onReset,
  currentLiveLocation,
}) => {
  const [enabled, setEnabled] = useState(initialDetails?.enabled ?? true);
  const [passengerName, setPassengerName] = useState(initialDetails?.passengerName || '');
  const [passengerPhone, setPassengerPhone] = useState(initialDetails?.passengerPhone || '');
  const [relationship, setRelationship] = useState(initialDetails?.relationship || 'Parents');
  const [doorstepAddress, setDoorstepAddress] = useState(initialDetails?.doorstepAddress || '');
  const [notes, setNotes] = useState(initialDetails?.notes || '');
  const [selectedTags, setSelectedTags] = useState<string[]>(initialDetails?.assistanceTags || ['🧰 Doorstep Luggage Help']);

  if (!isOpen) return null;

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => 
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSelectPresetRelation = (preset: typeof PRESET_RELATIONS[0]) => {
    setRelationship(preset.tag);
    if (!notes || notes === PRESET_RELATIONS.find(p => p.tag === relationship)?.note) {
      setNotes(preset.note);
    }
  };

  const handleSave = () => {
    onApply({
      enabled,
      passengerName: passengerName.trim(),
      passengerPhone: passengerPhone.trim(),
      relationship,
      doorstepAddress: doorstepAddress.trim(),
      notes: notes.trim(),
      assistanceTags: selectedTags,
    });
    onClose();
  };

  const handleRemove = () => {
    onReset();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-rose-50 via-red-50 to-amber-50/50 p-5 border-b border-rose-100 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-200 shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  Book Ride for Family / Someone Else
                </h3>
                <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700">
                  Care+
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5 leading-snug">
                Chauffeur coordinates directly with the passenger; live safety updates sent to both of you.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-white/80 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 custom-scroll text-xs">
          
          {/* Quick Preset Selector */}
          <div>
            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
              Who is Traveling?
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_RELATIONS.map((preset) => {
                const isSelected = relationship === preset.tag;
                return (
                  <button
                    key={preset.tag}
                    type="button"
                    onClick={() => handleSelectPresetRelation(preset)}
                    className={`px-2.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer text-xs flex items-center gap-1 border ${
                      isSelected
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs scale-102'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    <span>{preset.label}</span>
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Passenger Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Passenger Name */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Passenger / Family Member's Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={passengerName}
                  onChange={(e) => setPassengerName(e.target.value)}
                  placeholder="e.g. Ramesh Sharma"
                  className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-semibold focus:outline-none focus:border-rose-500 focus:bg-white transition-colors"
                />
              </div>
            </div>

            {/* Passenger Phone */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Passenger's Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="tel"
                  value={passengerPhone}
                  onChange={(e) => setPassengerPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-semibold focus:outline-none focus:border-rose-500 focus:bg-white transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Doorstep Family Pickup Address */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-bold text-slate-700 block">
                Family Member's Pickup Address / City
              </label>
              {currentLiveLocation && (
                <button
                  type="button"
                  onClick={() => setDoorstepAddress(currentLiveLocation)}
                  className="text-[10px] font-bold text-red-600 hover:text-red-700 cursor-pointer flex items-center gap-1"
                >
                  <MapPin className="w-3 h-3" />
                  <span>Use My Current City</span>
                </button>
              )}
            </div>
            <div className="relative">
              <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={doorstepAddress}
                onChange={(e) => setDoorstepAddress(e.target.value)}
                placeholder="e.g. Flat 302, Green Valley Apartments, Mumbai"
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-semibold focus:outline-none focus:border-rose-500 focus:bg-white transition-colors"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              The chauffeur will navigate directly to this doorstep location to receive your family member.
            </p>
          </div>

          {/* Chauffeur Special Assistance Tags */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1.5">
              Special Chauffeur Assistance
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_ASSISTANCE_TAGS.map((tag) => {
                const active = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-2 py-1 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer flex items-center gap-1 ${
                      active
                        ? 'bg-rose-50 text-rose-700 border-rose-300 font-bold'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    <span>{tag}</span>
                    {active && <Check className="w-2.5 h-2.5 text-rose-600" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes for Driver */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">
              Instructions for Chauffeur Captain
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Elderly parents traveling with luggage. Please call upon reaching the main gate."
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-rose-500 focus:bg-white transition-colors resize-none text-xs"
            />
          </div>

          {/* Safety & Real-time Tracking Notice */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-[11px] text-slate-600 leading-relaxed">
              <strong className="text-slate-900 font-bold">Dual WhatsApp & SMS Tracking:</strong> Both you (booker) and your family passenger will receive chauffeur captain details, car number plate, and live GPS map tracking link.
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          {initialDetails?.enabled ? (
            <button
              type="button"
              onClick={handleRemove}
              className="text-xs font-bold text-slate-500 hover:text-red-600 transition-colors cursor-pointer"
            >
              Cancel Family Mode
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              Discard
            </button>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 active:scale-98 text-white text-xs font-bold rounded-xl shadow-md shadow-rose-200 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Heart className="w-3.5 h-3.5 fill-white" />
              <span>Confirm & Book for Family</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
