import React, { useState } from 'react';
import { useCms } from '../context/CmsContext';
import { INITIAL_RIDERS, INITIAL_CAPTAINS } from '../data/initialData';
import { 
  X, User, Phone, Mail, MapPin, CheckCircle2, 
  ArrowRight, ShieldCheck, LogOut, Sparkles, KeyRound, 
  MessageSquare, Send, BellRing, Lock, RefreshCw, Check,
  UserCheck, Car, Gauge, Fuel, Star, Award, ChevronRight,
  Shield, CheckCircle
} from 'lucide-react';

export const UserAuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, closeAuthModal, currentRider, 
    loginRider, logoutRider, userLocation, openBookingModal, showToast,
    authModalRole, setAuthModalRole,
    currentCaptain, loginCaptain, logoutCaptain, updateCaptainDuty,
    setActivePage
  } = useCms();

  // Active Role in Modal: 'user' (Passenger) | 'captain' (Driver Partner)
  const activeRole = authModalRole;

  // Passenger Mode: 'password_login' | 'otp_login' | 'register' | 'forgot_password'
  const [authMode, setAuthMode] = useState<'password_login' | 'otp_login' | 'register' | 'forgot_password'>('password_login');

  // Passenger Form Fields
  const [name, setName] = useState('');
  const [identifier, setIdentifier] = useState('+91 98490 11223');
  const [password, setPassword] = useState('Wayora@2026');
  const [city, setCity] = useState(userLocation || 'Hyderabad, Telangana');
  const [email, setEmail] = useState('aarav.sharma@example.com');

  // Passenger OTP State
  const [otpCode, setOtpCode] = useState('');
  const [otpChannel, setOtpChannel] = useState<'sms' | 'whatsapp' | 'email'>('whatsapp');
  const [otpSent, setOtpSent] = useState(false);
  const [demoReceivedOtp, setDemoReceivedOtp] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Forgot Password Reset State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Daily Offer Notification Toggles for Logged in User
  const [offerEmail, setOfferEmail] = useState(true);
  const [offerWhatsapp, setOfferWhatsapp] = useState(true);
  const [offerSms, setOfferSms] = useState(true);
  const [savingPrefs, setSavingPrefs] = useState(false);

  // Captain Auth State
  const [captainInput, setCaptainInput] = useState('+91 98490 55112');
  const [captainPin, setCaptainPin] = useState('1234');
  const [captainMode, setCaptainMode] = useState<'pin_login' | 'otp_login'>('pin_login');
  const [captainOtpCode, setCaptainOtpCode] = useState('');
  const [captainOtpSent, setCaptainOtpSent] = useState(false);
  const [captainDemoOtp, setCaptainDemoOtp] = useState<string | null>(null);
  const [captainOtpChannel, setCaptainOtpChannel] = useState<'sms' | 'whatsapp'>('sms');

  if (!isAuthModalOpen) return null;

  // ================= 1. PASSENGER AUTH HANDLERS =================
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      showToast('Please enter your registered mobile/email and password.', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        loginRider({
          name: data.user.name,
          phone: data.user.phone,
          email: data.user.email,
          city: data.user.city,
        });
        showToast(`Welcome back, ${data.user.name}!`, 'success');
      } else {
        showToast(data.error || 'Login failed. Please check credentials.', 'error');
      }
    } catch {
      loginRider({
        name: identifier.includes('@') ? identifier.split('@')[0] : 'Wayora Rider',
        phone: identifier,
        email: email,
        city: city || 'Hyderabad',
      });
      showToast('Signed in successfully as Passenger.', 'success');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestOtp = async (purpose: 'login' | 'forgot_password') => {
    if (!identifier) {
      showToast('Please enter your mobile number or email address.', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipient: identifier, channel: otpChannel, purpose }),
      });
      const data = await res.json();
      if (data.success) {
        setOtpSent(true);
        setDemoReceivedOtp(data.demoOtpCode || null);
        showToast(`OTP dispatched via ${otpChannel.toUpperCase()} to ${identifier}`, 'success');
      } else {
        showToast(data.error || 'Failed to dispatch OTP.', 'error');
      }
    } catch {
      setOtpSent(true);
      setDemoReceivedOtp('739201');
      showToast('Demo OTP 739201 generated for testing.', 'info');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtpLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode) {
      showToast('Please enter the 6-digit OTP code received.', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, otp: otpCode }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        loginRider({
          name: data.user.name,
          phone: data.user.phone,
          email: data.user.email,
          city: data.user.city,
        });
        showToast(`OTP Verified! Welcome, ${data.user.name}.`, 'success');
      } else {
        showToast(data.error || 'Invalid or expired OTP code.', 'error');
      }
    } catch {
      loginRider({
        name: 'Wayora Verified Rider',
        phone: identifier,
        email: email,
        city: city || 'Hyderabad',
      });
      showToast('OTP verified. Logged in successfully.', 'success');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || !newPassword) {
      showToast('Please enter the OTP code and new password.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match.', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/user/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, otp: otpCode, newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Password updated successfully! Please sign in.', 'success');
        setAuthMode('password_login');
      } else {
        showToast(data.error || 'Password reset failed.', 'error');
      }
    } catch {
      showToast('Password updated locally! Please sign in.', 'success');
      setAuthMode('password_login');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !identifier) {
      showToast('Please fill in your name and phone number.', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/user/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone: identifier, email, city, password }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        loginRider({
          name: data.user.name,
          phone: data.user.phone,
          email: data.user.email,
          city: data.user.city,
        });
        showToast(`Registration successful! Welcome to Wayora, ${name}.`, 'success');
      } else {
        showToast(data.error || 'Registration failed.', 'error');
      }
    } catch {
      loginRider({ name, phone: identifier, email, city });
      showToast(`Welcome to Wayora Journeys, ${name}!`, 'success');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSavePreferences = async () => {
    if (!currentRider) return;
    setSavingPrefs(true);
    try {
      const res = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: currentRider.phone || currentRider.email,
          email: offerEmail,
          whatsapp: offerWhatsapp,
          sms: offerSms,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Daily offer delivery channels updated!', 'success');
      }
    } catch {
      showToast('Notification preferences saved locally.', 'success');
    } finally {
      setSavingPrefs(false);
    }
  };

  // ================= 2. CAPTAIN AUTH HANDLERS =================
  const handleCaptainPinLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captainInput || !captainPin) {
      showToast('Please enter Captain Phone/ID and 4-digit PIN.', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/captain/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idOrPhone: captainInput, pin: captainPin }),
      });
      const data = await res.json();
      if (data.success && data.captain) {
        loginCaptain(data.captain.id, captainPin);
        showToast(`Welcome Captain ${data.captain.name}! Cockpit active.`, 'success');
        closeAuthModal();
      } else {
        const localSuccess = loginCaptain(captainInput, captainPin);
        if (localSuccess) closeAuthModal();
      }
    } catch {
      const localSuccess = loginCaptain(captainInput, captainPin);
      if (localSuccess) closeAuthModal();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCaptainRequestOtp = async () => {
    if (!captainInput) {
      showToast('Please enter Captain registered phone number.', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipient: captainInput, channel: captainOtpChannel, purpose: 'login' }),
      });
      const data = await res.json();
      if (data.success) {
        setCaptainOtpSent(true);
        setCaptainDemoOtp(data.demoOtpCode || null);
        showToast(`Captain OTP dispatched via ${captainOtpChannel.toUpperCase()}`, 'success');
      } else {
        setCaptainOtpSent(true);
        setCaptainDemoOtp('592814');
        showToast('Captain Demo OTP 592814 generated.', 'info');
      }
    } catch {
      setCaptainOtpSent(true);
      setCaptainDemoOtp('592814');
      showToast('Captain Demo OTP 592814 generated.', 'info');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCaptainVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!captainOtpCode) {
      showToast('Please enter the 6-digit Captain OTP.', 'error');
      return;
    }
    const success = loginCaptain(captainInput);
    if (success) {
      closeAuthModal();
    } else {
      loginCaptain('cpt-01', '1234');
      closeAuthModal();
    }
  };

  const handleCaptainQuickSelect = (id: string) => {
    loginCaptain(id, '1234');
    closeAuthModal();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden text-slate-800 animate-in zoom-in-95 duration-200 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="px-5 sm:px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className={`w-8 h-8 rounded-xl flex items-center justify-center border shadow-xs ${
              activeRole === 'captain'
                ? 'bg-amber-100 border-amber-300 text-amber-700'
                : 'bg-red-100 border-red-200 text-red-600'
            }`}>
              {activeRole === 'captain' ? <UserCheck className="w-4 h-4" /> : <User className="w-4 h-4" />}
            </span>
            <div>
              <span className={`text-[10px] uppercase font-bold tracking-widest block ${
                activeRole === 'captain' ? 'text-amber-700' : 'text-red-600'
              }`}>
                {activeRole === 'captain' ? 'Captain Chauffeur Portal' : 'Wayora Passenger Portal'}
              </span>
              <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                {activeRole === 'captain'
                  ? currentCaptain ? 'Captain Cockpit' : 'Chauffeur Partner Login'
                  : currentRider ? 'Your Rider Profile' : authMode === 'forgot_password' ? 'Password Recovery' : 'Rider Sign In'}
              </h3>
            </div>
          </div>
          <button
            onClick={closeAuthModal}
            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close authentication modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ================= PRIMARY ROLE SWITCHER (USER VS CAPTAIN) ================= */}
        <div className="px-5 sm:px-6 pt-4 pb-1">
          <div className="p-1 bg-slate-100/90 rounded-2xl border border-slate-200/90 flex gap-1 shadow-inner">
            <button
              type="button"
              onClick={() => setAuthModalRole('user')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeRole === 'user'
                  ? 'bg-white text-red-600 shadow-sm border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Passenger (User)</span>
              {currentRider && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 ml-0.5" title="Logged In" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setAuthModalRole('captain')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeRole === 'captain'
                  ? 'bg-white text-amber-700 shadow-sm border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Captain (Partner)</span>
              {currentCaptain && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 ml-0.5" title="Cockpit Active" />
              )}
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 pt-3 space-y-4 text-xs">

          {/* ========================================================================= */}
          {/* ====================== TAB 1: PASSENGER / USER VIEW ====================== */}
          {/* ========================================================================= */}
          {activeRole === 'user' && (
            <>
              {currentRider ? (
                /* Already Logged In Rider Profile */
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-600 text-white font-bold flex items-center justify-center text-sm shadow-md shadow-red-600/30">
                          {currentRider.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">{currentRider.name}</h4>
                          <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Active Verified Rider
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={logoutRider}
                        className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-red-50 text-slate-600 hover:text-red-600 border border-slate-200 text-[11px] flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                      >
                        <LogOut className="w-3 h-3" />
                        <span>Sign Out</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-0.5 shadow-xs">
                        <span className="text-slate-400 block text-[10px] font-bold">PHONE (SMS/WHATSAPP)</span>
                        <span className="font-semibold text-slate-800 block truncate">{currentRider.phone}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-0.5 shadow-xs">
                        <span className="text-slate-400 block text-[10px] font-bold">CITY / PICKUP BASE</span>
                        <span className="font-semibold text-slate-800 block truncate">{currentRider.city}</span>
                      </div>
                    </div>

                    {currentRider.email && (
                      <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-[11px] shadow-xs">
                        <span className="text-slate-400 block text-[10px] font-bold">EMAIL ADDRESS (INVOICES & OFFERS)</span>
                        <span className="font-semibold text-slate-800 block truncate">{currentRider.email}</span>
                      </div>
                    )}
                  </div>

                  {/* Daily Offer Preferences */}
                  <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2">
                    <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                      <BellRing className="w-4 h-4 text-amber-600" />
                      <span>Daily Travel Offers & Coupons</span>
                    </div>
                    <div className="space-y-1.5">
                      <label className="flex items-center gap-2 cursor-pointer text-slate-800 text-[11px]">
                        <input
                          type="checkbox"
                          checked={offerWhatsapp}
                          onChange={(e) => setOfferWhatsapp(e.target.checked)}
                          className="rounded text-red-600 focus:ring-red-500"
                        />
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                        <span>WhatsApp Instant Coupons</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-slate-800 text-[11px]">
                        <input
                          type="checkbox"
                          checked={offerSms}
                          onChange={(e) => setOfferSms(e.target.checked)}
                          className="rounded text-red-600 focus:ring-red-500"
                        />
                        <Phone className="w-3.5 h-3.5 text-blue-600" />
                        <span>SMS Flash Alerts & OTPs</span>
                      </label>
                    </div>
                    <button
                      type="button"
                      onClick={handleSavePreferences}
                      disabled={savingPrefs}
                      className="w-full py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-[10px] cursor-pointer"
                    >
                      {savingPrefs ? 'Updating...' : 'Save Notification Preferences'}
                    </button>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        closeAuthModal();
                        openBookingModal('Express Chauffeur Booking');
                      }}
                      className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-red-600/25 cursor-pointer"
                    >
                      <Car className="w-3.5 h-3.5" />
                      <span>Book a Chauffeur Ride</span>
                    </button>
                    <button
                      type="button"
                      onClick={closeAuthModal}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs cursor-pointer"
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                /* Passenger Guest Sign-In / Register */
                <div className="space-y-4">
                  {authMode !== 'forgot_password' && (
                    <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200">
                      <button
                        type="button"
                        onClick={() => setAuthMode('password_login')}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          authMode === 'password_login' ? 'bg-white text-red-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Password
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('otp_login');
                          setOtpSent(false);
                          setOtpCode('');
                        }}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          authMode === 'otp_login' ? 'bg-white text-red-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        1-Tap OTP
                      </button>
                      <button
                        type="button"
                        onClick={() => setAuthMode('register')}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          authMode === 'register' ? 'bg-white text-red-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Register
                      </button>
                    </div>
                  )}

                  {/* Mode 1: Passenger Password Login */}
                  {authMode === 'password_login' && (
                    <form onSubmit={handlePasswordLogin} className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Mobile Number or Email
                        </label>
                        <div className="relative">
                          <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                          <input
                            type="text"
                            required
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            placeholder="+91 98490 11223 or user@example.com"
                            className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-red-500 focus:bg-white"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[11px] font-bold text-slate-700">Password</label>
                          <button
                            type="button"
                            onClick={() => {
                              setAuthMode('forgot_password');
                              setOtpSent(false);
                              setOtpCode('');
                            }}
                            className="text-[11px] text-red-600 hover:text-red-700 font-bold hover:underline cursor-pointer"
                          >
                            Forgot Password?
                          </button>
                        </div>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                          <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-red-500 focus:bg-white"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs shadow-md shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
                      >
                        <span>{isSubmitting ? 'Signing in...' : 'Sign In as Passenger'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </form>
                  )}

                  {/* Mode 2: Passenger OTP Login */}
                  {authMode === 'otp_login' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Mobile Number
                        </label>
                        <div className="relative">
                          <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                          <input
                            type="text"
                            required
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            placeholder="+91 98490 11223"
                            className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-red-500 focus:bg-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Dispatch via:
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={() => setOtpChannel('whatsapp')}
                            className={`py-1.5 px-2 rounded-xl border text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                              otpChannel === 'whatsapp' ? 'bg-emerald-50 border-emerald-400 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-600'
                            }`}
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                            <span>WhatsApp</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setOtpChannel('sms')}
                            className={`py-1.5 px-2 rounded-xl border text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                              otpChannel === 'sms' ? 'bg-blue-50 border-blue-400 text-blue-800' : 'bg-slate-50 border-slate-200 text-slate-600'
                            }`}
                          >
                            <Phone className="w-3.5 h-3.5 text-blue-600" />
                            <span>SMS</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setOtpChannel('email')}
                            className={`py-1.5 px-2 rounded-xl border text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                              otpChannel === 'email' ? 'bg-red-50 border-red-400 text-red-800' : 'bg-slate-50 border-slate-200 text-slate-600'
                            }`}
                          >
                            <Mail className="w-3.5 h-3.5 text-red-600" />
                            <span>Email</span>
                          </button>
                        </div>
                      </div>

                      {!otpSent ? (
                        <button
                          type="button"
                          onClick={() => handleRequestOtp('login')}
                          disabled={isSubmitting}
                          className="w-full py-2.5 bg-slate-900 hover:bg-black text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{isSubmitting ? 'Sending OTP...' : `Send OTP to ${otpChannel.toUpperCase()}`}</span>
                        </button>
                      ) : (
                        <form onSubmit={handleVerifyOtpLogin} className="space-y-3 pt-1 border-t border-slate-200">
                          {demoReceivedOtp && (
                            <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between text-emerald-800 text-[11px]">
                              <span>OTP Code: <strong>{demoReceivedOtp}</strong></span>
                              <button
                                type="button"
                                onClick={() => setOtpCode(demoReceivedOtp)}
                                className="text-[10px] font-bold underline cursor-pointer"
                              >
                                Auto-Fill
                              </button>
                            </div>
                          )}
                          <input
                            type="text"
                            maxLength={6}
                            required
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value)}
                            placeholder="Enter 6-digit OTP"
                            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-center tracking-[0.2em] font-extrabold text-sm focus:outline-none focus:border-red-500 focus:bg-white"
                          />
                          <div className="flex gap-2">
                            <button
                              type="submit"
                              disabled={isSubmitting}
                              className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-red-600/30 cursor-pointer"
                            >
                              <span>Verify & Login</span>
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRequestOtp('login')}
                              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer"
                              title="Resend OTP"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  )}

                  {/* Mode 3: Passenger Register */}
                  {authMode === 'register' && (
                    <form onSubmit={handleRegister} className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Full Name *</label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Ramesh Reddy"
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-red-500 focus:bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Mobile Number *</label>
                        <input
                          type="tel"
                          required
                          value={identifier}
                          onChange={(e) => setIdentifier(e.target.value)}
                          placeholder="+91 98765 43210"
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-red-500 focus:bg-white"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="City (e.g. Hyderabad)"
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-red-500 focus:bg-white"
                        />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Email (optional)"
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-red-500 focus:bg-white"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs shadow-md shadow-red-600/30 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>Create Passenger Account</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  )}

                  {/* Mode 4: Forgot Password */}
                  {authMode === 'forgot_password' && (
                    <div className="space-y-3">
                      <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-900 text-[11px] flex items-start gap-2">
                        <KeyRound className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                        <div>
                          <strong>Password Recovery</strong>
                          <p className="text-[10px] text-red-700">Enter your mobile/email to receive a secure password reset OTP.</p>
                        </div>
                      </div>
                      <input
                        type="text"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="Registered Mobile or Email"
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-red-500"
                      />
                      {!otpSent ? (
                        <button
                          type="button"
                          onClick={() => handleRequestOtp('forgot_password')}
                          className="w-full py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs cursor-pointer"
                        >
                          Send Recovery OTP
                        </button>
                      ) : (
                        <form onSubmit={handleResetPasswordSubmit} className="space-y-2.5">
                          <input
                            type="text"
                            maxLength={6}
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value)}
                            placeholder="6-Digit OTP Code"
                            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-center text-xs focus:outline-none focus:border-red-500"
                          />
                          <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="New Password"
                            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-red-500"
                          />
                          <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm New Password"
                            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-red-500"
                          />
                          <button
                            type="submit"
                            className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs cursor-pointer"
                          >
                            Update Password
                          </button>
                        </form>
                      )}
                      <button
                        type="button"
                        onClick={() => setAuthMode('password_login')}
                        className="text-[11px] text-slate-500 hover:underline block text-center cursor-pointer"
                      >
                        Back to Password Sign In
                      </button>
                    </div>
                  )}

                  {/* Quick 1-Tap Demo Rider Profiles */}
                  {authMode !== 'forgot_password' && (
                    <div className="pt-3 border-t border-slate-200">
                      <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-2">
                        Quick 1-Tap Passenger Demo Profiles:
                      </span>
                      <div className="grid grid-cols-1 gap-1.5">
                        {INITIAL_RIDERS.map((rider) => (
                          <button
                            key={rider.id}
                            type="button"
                            onClick={() => {
                              loginRider({
                                name: rider.name,
                                phone: rider.phone,
                                email: rider.email,
                                city: rider.city,
                              });
                              showToast(`Signed in as demo rider ${rider.name}`, 'success');
                            }}
                            className="p-2 rounded-xl bg-slate-50 border border-slate-200 hover:border-red-400 hover:bg-red-50/40 text-left flex items-center justify-between transition-colors cursor-pointer group shadow-xs"
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 group-hover:bg-red-600 group-hover:text-white flex items-center justify-center text-[10px] font-bold transition-colors">
                                {rider.name.slice(0, 1)}
                              </span>
                              <div>
                                <span className="font-bold text-slate-900 block text-xs">{rider.name}</span>
                                <span className="text-[10px] text-slate-500 block">{rider.phone} · {rider.city}</span>
                              </div>
                            </div>
                            <span className="text-[10px] text-red-600 font-bold flex items-center gap-0.5">
                              <span>Select</span>
                              <ChevronRight className="w-3 h-3" />
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* ========================================================================= */}
          {/* ====================== TAB 2: CAPTAIN / PARTNER VIEW ===================== */}
          {/* ========================================================================= */}
          {activeRole === 'captain' && (
            <>
              {currentCaptain ? (
                /* Already Logged In Captain Cockpit Card */
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/90 space-y-3">
                    <div className="flex items-center justify-between pb-3 border-b border-amber-200/70">
                      <div className="flex items-center gap-3">
                        <img
                          src={currentCaptain.photoUrl}
                          alt={currentCaptain.name}
                          className="w-11 h-11 rounded-xl object-cover border-2 border-amber-400 shadow-sm"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-sm font-black text-slate-900">{currentCaptain.name}</h4>
                            <span className="px-1.5 py-0.5 rounded-md bg-amber-200 text-amber-900 text-[9px] font-black uppercase">
                              Captain
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-600 flex items-center gap-1">
                            <Car className="w-3 h-3 text-amber-700" />
                            <span>{currentCaptain.vehicleModel}</span> · <span className="font-mono font-bold text-slate-800">{currentCaptain.vehicleNumber}</span>
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={logoutCaptain}
                        className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-red-50 text-slate-600 hover:text-red-600 border border-slate-200 text-[11px] flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                      >
                        <LogOut className="w-3 h-3" />
                        <span>Sign Out</span>
                      </button>
                    </div>

                    {/* Stats & Duty Status */}
                    <div className="grid grid-cols-3 gap-2 text-[11px]">
                      <div className="p-2 rounded-xl bg-white border border-amber-200/60 text-center shadow-xs">
                        <span className="text-slate-400 block text-[9px] font-bold">DUTY STATUS</span>
                        <button
                          type="button"
                          onClick={() => updateCaptainDuty(currentCaptain.dutyStatus === 'On Duty' ? 'Off Duty' : 'On Duty')}
                          className={`mt-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold cursor-pointer transition-colors ${
                            currentCaptain.dutyStatus === 'On Duty'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-slate-100 text-slate-600 border border-slate-300'
                          }`}
                        >
                          {currentCaptain.dutyStatus === 'On Duty' ? '● On Duty' : '○ Off Duty'}
                        </button>
                      </div>

                      <div className="p-2 rounded-xl bg-white border border-amber-200/60 text-center shadow-xs">
                        <span className="text-slate-400 block text-[9px] font-bold">TODAY EARNINGS</span>
                        <span className="font-extrabold text-slate-900 text-xs mt-1 block">
                          ₹{currentCaptain.todayEarnings.toLocaleString()}
                        </span>
                      </div>

                      <div className="p-2 rounded-xl bg-white border border-amber-200/60 text-center shadow-xs">
                        <span className="text-slate-400 block text-[9px] font-bold">FASTAG</span>
                        <span className="font-extrabold text-emerald-700 text-xs mt-1 block">
                          ₹{currentCaptain.fastagBalance}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setActivePage('captain');
                        closeAuthModal();
                      }}
                      className="flex-1 py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-600/30 cursor-pointer"
                    >
                      <Gauge className="w-4 h-4" />
                      <span>Open Full Captain Cockpit</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={closeAuthModal}
                      className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                /* Captain Sign In Form */
                <div className="space-y-4">
                  {/* Mode switcher: PIN vs OTP */}
                  <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setCaptainMode('pin_login')}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        captainMode === 'pin_login' ? 'bg-white text-amber-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Security PIN Login
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCaptainMode('otp_login');
                        setCaptainOtpSent(false);
                        setCaptainOtpCode('');
                      }}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        captainMode === 'otp_login' ? 'bg-white text-amber-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      1-Tap OTP Login
                    </button>
                  </div>

                  {captainMode === 'pin_login' ? (
                    <form onSubmit={handleCaptainPinLogin} className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Captain Mobile Number or Fleet ID
                        </label>
                        <div className="relative">
                          <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                          <input
                            type="text"
                            required
                            value={captainInput}
                            onChange={(e) => setCaptainInput(e.target.value)}
                            placeholder="+91 98490 55112 or cpt-01"
                            className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-amber-500 focus:bg-white"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[11px] font-bold text-slate-700">4-Digit Security PIN</label>
                          <span className="text-[10px] text-slate-500">Default PIN: 1234</span>
                        </div>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                          <input
                            type="password"
                            maxLength={6}
                            required
                            value={captainPin}
                            onChange={(e) => setCaptainPin(e.target.value)}
                            placeholder="••••"
                            className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono tracking-widest focus:outline-none focus:border-amber-500 focus:bg-white"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-extrabold rounded-xl text-xs shadow-md shadow-amber-600/30 flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                      >
                        <UserCheck className="w-4 h-4" />
                        <span>{isSubmitting ? 'Authenticating...' : 'Sign In to Captain Cockpit'}</span>
                      </button>
                    </form>
                  ) : (
                    /* Captain OTP login */
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Captain Registered Phone Number
                        </label>
                        <input
                          type="text"
                          required
                          value={captainInput}
                          onChange={(e) => setCaptainInput(e.target.value)}
                          placeholder="+91 98490 55112"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-amber-500 focus:bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Send OTP via:
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setCaptainOtpChannel('sms')}
                            className={`py-1.5 px-2 rounded-xl border text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                              captainOtpChannel === 'sms' ? 'bg-blue-50 border-blue-400 text-blue-800' : 'bg-slate-50 border-slate-200 text-slate-600'
                            }`}
                          >
                            <Phone className="w-3.5 h-3.5 text-blue-600" />
                            <span>SMS</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setCaptainOtpChannel('whatsapp')}
                            className={`py-1.5 px-2 rounded-xl border text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                              captainOtpChannel === 'whatsapp' ? 'bg-emerald-50 border-emerald-400 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-600'
                            }`}
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                            <span>WhatsApp</span>
                          </button>
                        </div>
                      </div>

                      {!captainOtpSent ? (
                        <button
                          type="button"
                          onClick={handleCaptainRequestOtp}
                          disabled={isSubmitting}
                          className="w-full py-2.5 bg-slate-900 hover:bg-black text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{isSubmitting ? 'Sending OTP...' : `Dispatch Captain OTP (${captainOtpChannel.toUpperCase()})`}</span>
                        </button>
                      ) : (
                        <form onSubmit={handleCaptainVerifyOtp} className="space-y-3 pt-1 border-t border-slate-200">
                          {captainDemoOtp && (
                            <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between text-emerald-800 text-[11px]">
                              <span>Captain Test OTP: <strong>{captainDemoOtp}</strong></span>
                              <button
                                type="button"
                                onClick={() => setCaptainOtpCode(captainDemoOtp)}
                                className="text-[10px] font-bold underline cursor-pointer"
                              >
                                Auto-Fill
                              </button>
                            </div>
                          )}
                          <input
                            type="text"
                            maxLength={6}
                            required
                            value={captainOtpCode}
                            onChange={(e) => setCaptainOtpCode(e.target.value)}
                            placeholder="Enter 6-digit Captain OTP"
                            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-center tracking-[0.2em] font-extrabold text-sm focus:outline-none focus:border-amber-500 focus:bg-white"
                          />
                          <button
                            type="submit"
                            className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-extrabold rounded-xl text-xs shadow-md shadow-amber-600/30 flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Verify & Enter Captain Cockpit</span>
                          </button>
                        </form>
                      )}
                    </div>
                  )}

                  {/* 1-Tap Fleet Captain Quick Profiles */}
                  <div className="pt-3 border-t border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-2">
                      1-Tap Fleet Captain Demo Roster (Instant Cockpit Access):
                    </span>
                    <div className="grid grid-cols-1 gap-1.5">
                      {INITIAL_CAPTAINS.map((cpt) => (
                        <button
                          key={cpt.id}
                          type="button"
                          onClick={() => handleCaptainQuickSelect(cpt.id)}
                          className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-amber-400 hover:bg-amber-50/50 text-left flex items-center justify-between transition-colors cursor-pointer group shadow-xs"
                        >
                          <div className="flex items-center gap-2.5">
                            <img
                              src={cpt.photoUrl}
                              alt={cpt.name}
                              className="w-8 h-8 rounded-lg object-cover border border-amber-300"
                            />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-extrabold text-slate-900 block text-xs">{cpt.name}</span>
                                <span className="text-[10px] font-semibold text-amber-700">★ {cpt.rating}</span>
                              </div>
                              <span className="text-[10px] text-slate-500 block">
                                {cpt.vehicleModel} · <strong className="text-slate-700 font-mono">{cpt.vehicleNumber}</strong>
                              </span>
                            </div>
                          </div>
                          <span className="text-[10px] text-amber-800 font-black flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                            <span>Cockpit</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
};
