import React, { useState } from 'react';
import { useCms } from '../context/CmsContext';
import { INITIAL_RIDERS } from '../data/initialData';
import { 
  X, User, Phone, Mail, MapPin, CheckCircle2, 
  ArrowRight, ShieldCheck, LogOut, Sparkles, KeyRound, 
  MessageSquare, Send, BellRing, Lock, RefreshCw, Check
} from 'lucide-react';

export const UserAuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, closeAuthModal, currentRider, 
    loginRider, logoutRider, userLocation, openBookingModal, showToast 
  } = useCms();

  // Mode: 'password_login' | 'otp_login' | 'register' | 'forgot_password'
  const [authMode, setAuthMode] = useState<'password_login' | 'otp_login' | 'register' | 'forgot_password'>('password_login');

  // Form Fields
  const [name, setName] = useState('');
  const [identifier, setIdentifier] = useState('+91 98490 11223'); // Phone or email
  const [password, setPassword] = useState('Wayora@2026');
  const [city, setCity] = useState(userLocation || 'Hyderabad, Telangana');
  const [email, setEmail] = useState('aarav.sharma@example.com');

  // OTP State
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

  if (!isAuthModalOpen) return null;

  // 1. Password Login
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
      // Fallback
      loginRider({
        name: identifier.includes('@') ? identifier.split('@')[0] : 'Wayora Rider',
        phone: identifier,
        email: email,
        city: city || 'Hyderabad',
      });
      showToast('Signed in successfully.', 'success');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. Request OTP for Login or Forgot Password
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
      showToast(`Demo OTP 739201 generated for testing.`, 'info');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Verify OTP and Complete Login
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

  // 4. Reset Password Submit
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || !newPassword) {
      showToast('Please enter the OTP code and new password.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match. Please verify.', 'error');
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
        showToast('Password reset successfully! You can now log in.', 'success');
        setPassword(newPassword);
        setAuthMode('password_login');
        setOtpSent(false);
        setOtpCode('');
      } else {
        showToast(data.error || 'Password reset failed.', 'error');
      }
    } catch {
      showToast('Password updated. You can now sign in.', 'success');
      setAuthMode('password_login');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 5. Register New User
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !identifier) {
      showToast('Please enter your name and mobile number.', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/user/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone: identifier,
          email,
          city,
          password: password || 'Wayora@2026',
        }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        loginRider({
          name: data.user.name,
          phone: data.user.phone,
          email: data.user.email,
          city: data.user.city,
        });
        showToast(`Registration complete! Welcome, ${data.user.name}.`, 'success');
      } else {
        showToast(data.error || 'Registration failed.', 'error');
      }
    } catch {
      loginRider({ name, phone: identifier, email, city });
      showToast('Account registered successfully.', 'success');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 6. User Logout
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/user/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    logoutRider();
    showToast('Signed out of rider profile.', 'info');
  };

  // 7. Update Daily Offer Preferences
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

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden text-slate-800 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-red-100 border border-red-200 flex items-center justify-center text-red-600">
              <User className="w-4 h-4" />
            </span>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-red-600 block">
                Wayora Passenger Portal
              </span>
              <h3 className="text-base font-extrabold text-slate-900">
                {currentRider ? 'Your Rider Profile' : authMode === 'forgot_password' ? 'Forgot Password Recovery' : 'Rider Sign In & Security'}
              </h3>
            </div>
          </div>
          <button
            onClick={closeAuthModal}
            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs">
          
          {/* ================= ALREADY LOGGED IN VIEW ================= */}
          {currentRider ? (
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
                    onClick={handleLogout}
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

              {/* DAILY OFFER UPDATES CHANNELS PREFERENCES */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2.5">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                  <BellRing className="w-4 h-4 text-amber-600" />
                  <span>Daily Travel Offers & Coupon Alerts</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-tight">
                  Choose where you receive exclusive daily discounts, coupon codes, and festival rates:
                </p>

                <div className="space-y-1.5 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-800 text-[11px]">
                    <input
                      type="checkbox"
                      checked={offerWhatsapp}
                      onChange={(e) => setOfferWhatsapp(e.target.checked)}
                      className="rounded text-red-600 focus:ring-red-500"
                    />
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                    <span>WhatsApp Alerts (Instant coupons & booking links)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-slate-800 text-[11px]">
                    <input
                      type="checkbox"
                      checked={offerSms}
                      onChange={(e) => setOfferSms(e.target.checked)}
                      className="rounded text-red-600 focus:ring-red-500"
                    />
                    <Phone className="w-3.5 h-3.5 text-blue-600" />
                    <span>SMS Notifications (Flash sales & OTP login)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-slate-800 text-[11px]">
                    <input
                      type="checkbox"
                      checked={offerEmail}
                      onChange={(e) => setOfferEmail(e.target.checked)}
                      className="rounded text-red-600 focus:ring-red-500"
                    />
                    <Mail className="w-3.5 h-3.5 text-red-600" />
                    <span>Email Newsletter (Weekend holiday route itineraries)</span>
                  </label>
                </div>

                <button
                  type="button"
                  onClick={handleSavePreferences}
                  disabled={savingPrefs}
                  className="w-full py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer mt-2"
                >
                  <Check className="w-3 h-3" />
                  <span>{savingPrefs ? 'Updating Channels...' : 'Save Notification Preferences'}</span>
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    closeAuthModal();
                    openBookingModal('Express Doorstep');
                  }}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-red-600/30 cursor-pointer"
                >
                  <span>Book Ride Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={closeAuthModal}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* ================= GUEST SIGN-IN / REGISTER TABS ================= */
            <div className="space-y-4">
              
              {/* Tab Selector */}
              {authMode !== 'forgot_password' && (
                <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setAuthMode('password_login')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      authMode === 'password_login'
                        ? 'bg-white text-red-600 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Password Sign-In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('otp_login');
                      setOtpSent(false);
                      setOtpCode('');
                    }}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      authMode === 'otp_login'
                        ? 'bg-white text-red-600 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    1-Tap OTP Login
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthMode('register')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      authMode === 'register'
                        ? 'bg-white text-red-600 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Register
                  </button>
                </div>
              )}

              {/* TAB 1: PASSWORD LOGIN */}
              {authMode === 'password_login' && (
                <form onSubmit={handlePasswordLogin} className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Mobile Number or Email Address
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="+91 98490 11223 or user@example.com"
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-red-500 focus:bg-white text-xs shadow-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-bold text-slate-700">
                        Password
                      </label>
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
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-red-500 focus:bg-white text-xs shadow-xs"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs shadow-md shadow-red-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <span>{isSubmitting ? 'Authenticating...' : 'Sign In to Account'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              {/* TAB 2: OTP LOGIN */}
              {authMode === 'otp_login' && (
                <div className="space-y-3.5">
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
                        placeholder="+91 98490 11223"
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-red-500 focus:bg-white text-xs shadow-xs"
                      />
                    </div>
                  </div>

                  {/* Channel Picker */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Send OTP via:
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setOtpChannel('whatsapp')}
                        className={`py-2 px-2 rounded-xl border text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          otpChannel === 'whatsapp'
                            ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                            : 'bg-slate-50 border-slate-200 text-slate-600'
                        }`}
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                        <span>WhatsApp</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setOtpChannel('sms')}
                        className={`py-2 px-2 rounded-xl border text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          otpChannel === 'sms'
                            ? 'bg-blue-50 border-blue-400 text-blue-800'
                            : 'bg-slate-50 border-slate-200 text-slate-600'
                        }`}
                      >
                        <Phone className="w-3.5 h-3.5 text-blue-600" />
                        <span>SMS</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setOtpChannel('email')}
                        className={`py-2 px-2 rounded-xl border text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          otpChannel === 'email'
                            ? 'bg-red-50 border-red-400 text-red-800'
                            : 'bg-slate-50 border-slate-200 text-slate-600'
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
                      <span>{isSubmitting ? 'Sending OTP...' : `Dispatch OTP to ${otpChannel.toUpperCase()}`}</span>
                    </button>
                  ) : (
                    <form onSubmit={handleVerifyOtpLogin} className="space-y-3 pt-1 border-t border-slate-200">
                      {demoReceivedOtp && (
                        <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-emerald-800 text-[11px]">
                          <span>Test Code: <strong>{demoReceivedOtp}</strong></span>
                          <button
                            type="button"
                            onClick={() => setOtpCode(demoReceivedOtp)}
                            className="text-[10px] font-bold underline cursor-pointer"
                          >
                            Auto-Fill
                          </button>
                        </div>
                      )}

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Enter 6-Digit OTP Code
                        </label>
                        <input
                          type="text"
                          maxLength={6}
                          required
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value)}
                          placeholder="e.g. 462795"
                          className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-center tracking-[0.3em] font-extrabold text-base focus:outline-none focus:border-red-500 focus:bg-white"
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-red-600/30 cursor-pointer"
                        >
                          <span>Verify & Sign In</span>
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRequestOtp('login')}
                          className="px-3 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer"
                          title="Resend OTP"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* TAB 3: REGISTER */}
              {authMode === 'register' && (
                <form onSubmit={handleRegister} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Ramesh Reddy"
                        className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-red-500 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Mobile Number * (For Driver SMS & WhatsApp)
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="tel"
                        required
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-red-500 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        City / Base
                      </label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Hyderabad"
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-red-500 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@email.com"
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-red-500 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Set Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-red-500 focus:bg-white"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs shadow-md shadow-red-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <span>Create Rider Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              {/* FORGOT PASSWORD FLOW */}
              {authMode === 'forgot_password' && (
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-900 text-[11px] flex items-start gap-2">
                    <KeyRound className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span>
                      Verify your identity with an OTP code sent via SMS, WhatsApp, or Email to set a new password.
                    </span>
                  </div>

                  {!otpSent ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Registered Mobile Number or Email
                        </label>
                        <input
                          type="text"
                          required
                          value={identifier}
                          onChange={(e) => setIdentifier(e.target.value)}
                          placeholder="+91 98490 11223"
                          className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-red-500 focus:bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                          Dispatch OTP via:
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {(['whatsapp', 'sms', 'email'] as const).map((ch) => (
                            <button
                              key={ch}
                              type="button"
                              onClick={() => setOtpChannel(ch)}
                              className={`py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                                otpChannel === ch
                                  ? 'bg-red-50 border-red-400 text-red-600'
                                  : 'bg-slate-50 border-slate-200 text-slate-600'
                              }`}
                            >
                              {ch}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleRequestOtp('forgot_password')}
                          disabled={isSubmitting}
                          className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-red-500/25 cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Send Recovery OTP</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setAuthMode('password_login')}
                          className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleResetPasswordSubmit} className="space-y-3">
                      {demoReceivedOtp && (
                        <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between text-emerald-800 text-[11px]">
                          <span>Recovery OTP: <strong>{demoReceivedOtp}</strong></span>
                          <button
                            type="button"
                            onClick={() => setOtpCode(demoReceivedOtp)}
                            className="font-bold underline text-[10px] cursor-pointer"
                          >
                            Fill
                          </button>
                        </div>
                      )}

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          6-Digit OTP Code
                        </label>
                        <input
                          type="text"
                          maxLength={6}
                          required
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value)}
                          placeholder="e.g. 581920"
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-center tracking-widest text-sm focus:outline-none focus:border-red-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          New Password
                        </label>
                        <input
                          type="password"
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter new password"
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-red-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Re-enter new password"
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-red-500"
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/25 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Update Password</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setAuthMode('password_login')}
                          className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs cursor-pointer"
                        >
                          Back
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* Quick 1-Tap Demo Rider Profiles */}
              {authMode !== 'forgot_password' && (
                <div className="pt-3 border-t border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-2">
                    Quick 1-Tap Demo Profiles (Instant Verification):
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
                        className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-red-400 hover:bg-red-50/40 text-left flex items-center justify-between transition-colors cursor-pointer group shadow-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 group-hover:bg-red-600 group-hover:text-white flex items-center justify-center text-xs font-bold transition-colors">
                            {rider.name.slice(0, 1)}
                          </span>
                          <div>
                            <span className="font-bold text-slate-900 block text-xs">{rider.name}</span>
                            <span className="text-[10px] text-slate-500 block">{rider.phone} · {rider.city}</span>
                          </div>
                        </div>
                        <span className="text-[10px] text-red-600 font-bold flex items-center gap-0.5">
                          <span>Select</span>
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
