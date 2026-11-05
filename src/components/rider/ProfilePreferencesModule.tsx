import React, { useState } from 'react';
import { RiderProfile, RiderPreferences } from '../../types';
import {
  User, ShieldCheck, Lock, BellRing, Phone, 
  Mail, Building2, Sliders, VolumeX, Radio, 
  CheckCircle2, Sparkles, Save, Shield
} from 'lucide-react';

interface ProfilePreferencesModuleProps {
  rider: RiderProfile;
  onUpdatePreferences: (prefs: Partial<RiderPreferences>) => void;
  onUpdateProfile: (profile: Partial<RiderProfile>) => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const ProfilePreferencesModule: React.FC<ProfilePreferencesModuleProps> = ({
  rider,
  onUpdatePreferences,
  onUpdateProfile,
  showToast,
}) => {
  const currentPrefs = rider.preferences || {
    acTemperature: 'Chilled (19°C)',
    quietRideMode: true,
    preferredMusic: 'Instrumental & Soft',
    luggagePorter: true,
    infantSeat: false,
    petFriendly: false,
    gentleDriving: true,
    pushNotifications: true,
    whatsappUpdates: true,
    promoSms: false,
    twoFactorAuth: true,
    corporateDomain: 'kalyangroup.com',
  };

  const [acTemp, setAcTemp] = useState(currentPrefs.acTemperature);
  const [quietMode, setQuietMode] = useState(currentPrefs.quietRideMode);
  const [musicPref, setMusicPref] = useState(currentPrefs.preferredMusic);
  const [twoFa, setTwoFa] = useState(currentPrefs.twoFactorAuth);
  const [corpDomain, setCorpDomain] = useState(currentPrefs.corporateDomain || '');

  const [pushNotifs, setPushNotifs] = useState(currentPrefs.pushNotifications);
  const [whatsappUpdates, setWhatsappUpdates] = useState(currentPrefs.whatsappUpdates);
  const [promoSms, setPromoSms] = useState(currentPrefs.promoSms);

  const [name, setName] = useState(rider.name);
  const [email, setEmail] = useState(rider.email || '');
  const [city, setCity] = useState(rider.city);

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdatePreferences({
      acTemperature: acTemp,
      quietRideMode: quietMode,
      preferredMusic: musicPref,
      twoFactorAuth: twoFa,
      corporateDomain: corpDomain,
      pushNotifications: pushNotifs,
      whatsappUpdates: whatsappUpdates,
      promoSms: promoSms,
    });
    onUpdateProfile({
      name,
      email,
      city,
    });
    showToast('Profile and in-cabin ride comfort preferences saved!', 'success');
  };

  return (
    <div className="space-y-6">

      {/* TOP HEADER */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-black text-slate-900">Passenger Profile & In-Cabin Comfort Preferences</h3>
          <p className="text-xs text-slate-500">
            Account security, corporate tariff eligibility, AC cabin temperatures, and notification channels.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveAll}
          className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-all whitespace-nowrap"
        >
          <Save className="w-4 h-4" />
          <span>Save Preferences</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* LEFT COLUMN: ACCOUNT SECURITY & CORPORATE PROFILE */}
        <div className="space-y-6">

          {/* BASIC PROFILE */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h4 className="text-sm font-black text-slate-900">Personal Details</h4>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Full Legal Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Mobile Phone (Verified)</label>
                  <div className="relative">
                    <input
                      type="text"
                      disabled
                      value={rider.phone}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-600"
                    />
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 absolute right-3 top-2.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">City / Home Base</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium"
                />
              </div>
            </div>
          </div>

          {/* CORPORATE BILLING DOMAIN */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              <h4 className="text-sm font-black text-slate-900">Corporate Domain & Negotiated Tariffs</h4>
            </div>

            <p className="text-xs text-slate-500">
              Link your corporate email domain to unlock negotiated corporate highway tariffs and centralized GST input invoicing.
            </p>

            <div className="text-xs space-y-2">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Corporate Domain</label>
                <div className="flex rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
                  <span className="px-3 py-2 text-slate-400 font-medium border-r border-slate-200">@</span>
                  <input
                    type="text"
                    value={corpDomain}
                    onChange={(e) => setCorpDomain(e.target.value)}
                    placeholder="e.g. kalyangroup.com"
                    className="w-full px-3 py-2 bg-transparent text-slate-900 font-medium focus:outline-none"
                  />
                </div>
              </div>

              {corpDomain && (
                <div className="p-2.5 bg-blue-50 rounded-xl border border-blue-200 text-blue-900 text-[11px] font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Corporate Tariff Discount (5% Off Standard Highway Km) Active for @{corpDomain}</span>
                </div>
              )}
            </div>
          </div>

          {/* TWO FACTOR AUTH */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-red-600" />
                <h4 className="text-sm font-black text-slate-900">Two-Factor Authentication (2FA)</h4>
              </div>

              <button
                type="button"
                onClick={() => setTwoFa(!twoFa)}
                className={`w-11 h-6 rounded-full transition-colors p-0.5 cursor-pointer ${twoFa ? 'bg-red-600' : 'bg-slate-300'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${twoFa ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Requires a verified OTP sent to your registered mobile number for all login attempts and wallet withdrawals.
            </p>
          </div>

        </div>

        {/* RIGHT COLUMN: RIDE COMFORT PREFERENCES & NOTIFICATIONS */}
        <div className="space-y-6">

          {/* CABIN COMFORT */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-red-600" />
              <h4 className="text-sm font-black text-slate-900">In-Cabin Climate & Comfort Preferences</h4>
            </div>

            <div className="space-y-4 text-xs">
              {/* AC Temp */}
              <div>
                <label className="block text-slate-700 font-bold mb-2">Preferred Air-Conditioning Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Chilled (19°C)', 'Comfort (22°C)', 'Normal (25°C)'] as const).map((temp) => (
                    <button
                      key={temp}
                      type="button"
                      onClick={() => setAcTemp(temp)}
                      className={`py-2 rounded-xl border text-[11px] font-bold cursor-pointer transition-all ${
                        acTemp === temp ? 'border-red-600 bg-red-600 text-white shadow-xs' : 'border-slate-200 bg-slate-50 text-slate-700'
                      }`}
                    >
                      {temp}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quiet Mode */}
              <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-900 block flex items-center gap-1.5">
                    <VolumeX className="w-4 h-4 text-red-600" /> Quiet Ride Mode
                  </span>
                  <span className="text-[11px] text-slate-500">Minimal conversation & no audio for focus/work</span>
                </div>

                <button
                  type="button"
                  onClick={() => setQuietMode(!quietMode)}
                  className={`w-11 h-6 rounded-full transition-colors p-0.5 cursor-pointer ${quietMode ? 'bg-red-600' : 'bg-slate-300'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${quietMode ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

              {/* Music Preference */}
              <div>
                <label className="block text-slate-700 font-bold mb-2">Default Highway Audio</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['No Music', 'Instrumental & Soft', 'FM Radio'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMusicPref(m)}
                      className={`py-2 rounded-xl border text-[11px] font-bold cursor-pointer transition-all ${
                        musicPref === m ? 'border-red-600 bg-red-600 text-white shadow-xs' : 'border-slate-200 bg-slate-50 text-slate-700'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* NOTIFICATION CHANNELS */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <BellRing className="w-4 h-4 text-red-600" />
              <h4 className="text-sm font-black text-slate-900">Communication & Notification Preferences</h4>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="font-bold text-slate-900 block">WhatsApp Trip Updates</span>
                  <span className="text-[11px] text-slate-500">Itinerary PDFs, chauffeur contact, live tracking links</span>
                </div>
                <input
                  type="checkbox"
                  checked={whatsappUpdates}
                  onChange={(e) => setWhatsappUpdates(e.target.checked)}
                  className="rounded text-red-600 w-4 h-4 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="font-bold text-slate-900 block">Push Notifications</span>
                  <span className="text-[11px] text-slate-500">Chauffeur arrival alerts and boarding OTP reminders</span>
                </div>
                <input
                  type="checkbox"
                  checked={pushNotifs}
                  onChange={(e) => setPushNotifs(e.target.checked)}
                  className="rounded text-red-600 w-4 h-4 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="font-bold text-slate-900 block">Promotional Highway Discounts</span>
                  <span className="text-[11px] text-slate-500">Occasional festive flash sales (Diwali / Sankranti)</span>
                </div>
                <input
                  type="checkbox"
                  checked={promoSms}
                  onChange={(e) => setPromoSms(e.target.checked)}
                  className="rounded text-red-600 w-4 h-4 cursor-pointer"
                />
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

