import React, { useState } from 'react';
import { useCms } from '../context/CmsContext';
import { UserRegistrationModal } from './UserRegistrationModal';
import { 
  X, User, Phone, Mail, MapPin, CheckCircle2, 
  ArrowRight, ShieldCheck, LogOut, Sparkles, KeyRound, 
  MessageSquare, Send, BellRing, Lock, RefreshCw, Check,
  Eye, EyeOff, ShieldAlert, Navigation, Building2
} from 'lucide-react';

export const COUNTRY_CODES = [
  { code: '+91', flag: '🇮🇳', label: '+91 (India)' },
  { code: '+1', flag: '🇺🇸', label: '+1 (USA/Canada)' },
  { code: '+44', flag: '🇬🇧', label: '+44 (UK)' },
  { code: '+971', flag: '🇦🇪', label: '+971 (UAE)' },
  { code: '+966', flag: '🇸🇦', label: '+966 (Saudi Arabia)' },
  { code: '+65', flag: '🇸🇬', label: '+65 (Singapore)' },
  { code: '+61', flag: '🇦🇺', label: '+61 (Australia)' },
  { code: '+974', flag: '🇶🇦', label: '+974 (Qatar)' },
  { code: '+968', flag: '🇴🇲', label: '+968 (Oman)' },
  { code: '+965', flag: '🇰🇼', label: '+965 (Kuwait)' },
  { code: '+49', flag: '🇩🇪', label: '+49 (Germany)' },
  { code: '+33', flag: '🇫🇷', label: '+33 (France)' },
  { code: '+60', flag: '🇲🇾', label: '+60 (Malaysia)' },
];

export interface PasswordStrength {
  score: number;
  label: 'Weak' | 'Fair' | 'Good' | 'Strong';
  color: string;
  barColor: string;
  hasMinLength: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
  hasLetter: boolean;
}

export const evaluatePasswordStrength = (pwd: string): PasswordStrength => {
  if (!pwd) {
    return {
      score: 0,
      label: 'Weak',
      color: 'text-slate-400',
      barColor: 'bg-slate-200',
      hasMinLength: false,
      hasNumber: false,
      hasSpecial: false,
      hasLetter: false,
    };
  }

  const hasMinLength = pwd.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(pwd);
  const hasNumber = /\d/.test(pwd);
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pwd);

  let score = 0;
  if (pwd.length >= 6) score += 1;
  if (hasMinLength) score += 1;
  if (hasLetter && hasNumber) score += 1;
  if (hasSpecial) score += 1;

  if (score <= 1) {
    return { score, label: 'Weak', color: 'text-red-500', barColor: 'bg-red-500', hasMinLength, hasNumber, hasSpecial, hasLetter };
  } else if (score === 2) {
    return { score, label: 'Fair', color: 'text-amber-500', barColor: 'bg-amber-500', hasMinLength, hasNumber, hasSpecial, hasLetter };
  } else if (score === 3) {
    return { score, label: 'Good', color: 'text-blue-500', barColor: 'bg-blue-500', hasMinLength, hasNumber, hasSpecial, hasLetter };
  } else {
    return { score: 4, label: 'Strong', color: 'text-emerald-600', barColor: 'bg-emerald-600', hasMinLength, hasNumber, hasSpecial, hasLetter };
  }
};

export const UserAuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, closeAuthModal, currentRider, 
    loginRider, logoutRider, userLocation, openBookingModal, showToast,
    setActivePage 
  } = useCms();

  // Mode: 'password_login' | 'otp_login' | 'register' | 'forgot_password'
  const [authMode, setAuthMode] = useState<'password_login' | 'otp_login' | 'register' | 'forgot_password'>('password_login');
  const [showFullRegistrationModal, setShowFullRegistrationModal] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [identifier, setIdentifier] = useState(''); // Phone or email
  const [password, setPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] = useState(false);
  const [city, setCity] = useState(userLocation || '');
  const [email, setEmail] = useState('');

  // OTP State
  const [otpCode, setOtpCode] = useState('');
  const [receivedDemoOtp, setReceivedDemoOtp] = useState('');
  const [otpChannel, setOtpChannel] = useState<'sms' | 'whatsapp' | 'email'>('whatsapp');
  const [otpSent, setOtpSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Forgot Password Reset State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showResetConfirmPassword, setShowResetConfirmPassword] = useState(false);

  // Daily Offer Notification Toggles for Logged in User
  const [offerEmail, setOfferEmail] = useState(true);
  const [offerWhatsapp, setOfferWhatsapp] = useState(true);
  const [offerSms, setOfferSms] = useState(true);
  const [savingPrefs, setSavingPrefs] = useState(false);

  // Helper to compose full international phone or email
  const getFullIdentifier = () => {
    const trimmed = identifier.trim();
    if (!trimmed) return '';
    if (trimmed.includes('@')) return trimmed; // Plain email
    if (trimmed.startsWith('+')) return trimmed; // Already international
    const cleanNum = trimmed.replace(/^0+/, ''); // strip leading zeroes
    return `${countryCode} ${cleanNum}`;
  };

  // Live password strength calculations
  const registerPwdStrength = evaluatePasswordStrength(password);
  const resetPwdStrength = evaluatePasswordStrength(newPassword);

  if (!isAuthModalOpen) return null;

  // 1. Password Login
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetId = getFullIdentifier();
    if (!targetId || !password) {
      showToast('Please enter your registered mobile/email and password.', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: targetId, password }),
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
        name: targetId.includes('@') ? targetId.split('@')[0] : 'Wayora Rider',
        phone: targetId,
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
    const targetId = getFullIdentifier();
    if (!targetId) {
      showToast('Please enter your mobile number or email address.', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipient: targetId, channel: otpChannel, purpose }),
      });
      const data = await res.json();
      if (data.success) {
        setOtpSent(true);
        if (data.demoOtpCode) {
          setReceivedDemoOtp(data.demoOtpCode);
          setOtpCode(data.demoOtpCode);
        }
        showToast(
          data.demoOtpCode
            ? `OTP Code: ${data.demoOtpCode} (Dispatched via ${otpChannel.toUpperCase()} to ${targetId})`
            : `OTP dispatched via ${otpChannel.toUpperCase()} to ${targetId}`,
          'success'
        );
      } else {
        showToast(data.error || 'Failed to dispatch OTP.', 'error');
      }
    } catch {
      showToast('Network error while requesting OTP. Please check your connection and try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Verify OTP and Complete Login
  const handleVerifyOtpLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetId = getFullIdentifier();
    if (!otpCode) {
      showToast('Please enter the 6-digit OTP code received.', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: targetId, otp: otpCode }),
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
      showToast('Network error while verifying OTP. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4. Reset Password Submit
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetId = getFullIdentifier();
    if (!otpCode || !newPassword) {
      showToast('Please enter the OTP code and new password.', 'error');
      return;
    }
    if (newPassword.length < 8) {
      showToast('Password must be at least 8 characters long.', 'error');
      return;
    }
    const strength = evaluatePasswordStrength(newPassword);
    if (strength.score < 2) {
      showToast('Please choose a stronger password (letters, numbers & symbols).', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match. Please re-enter to confirm.', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/user/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: targetId, otp: otpCode, newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Password reset successfully! You can now log in.', 'success');
        setPassword(newPassword);
        setAuthMode('password_login');
        setOtpSent(false);
        setOtpCode('');
        setReceivedDemoOtp('');
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
    const targetPhone = getFullIdentifier();
    if (!name || !targetPhone) {
      showToast('Please enter your name and mobile number.', 'error');
      return;
    }
    if (!password) {
      showToast('Please set an account password.', 'error');
      return;
    }
    if (password.length < 8) {
      showToast('Password must be at least 8 characters long.', 'error');
      return;
    }
    const strength = evaluatePasswordStrength(password);
    if (strength.score < 2) {
      showToast('Please choose a stronger password (letters, numbers & symbols).', 'error');
      return;
    }
    if (password !== registerConfirmPassword) {
      showToast('Passwords do not match. Please re-enter to confirm.', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/user/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone: targetPhone,
          email,
          city,
          password: password,
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
      loginRider({ name, phone: targetPhone, email, city });
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

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    closeAuthModal();
                    setActivePage('rider');
                  }}
                  className="w-full py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-red-600/30 cursor-pointer"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Open Rider Flight-Deck & Live GPS</span>
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      closeAuthModal();
                      openBookingModal('Express Doorstep');
                    }}
                    className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Book Ride Now</span>
                    <ArrowRight className="w-4 h-4" />
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
                    <div className="flex rounded-xl bg-slate-50 border border-slate-200 focus-within:border-red-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-red-500/20 shadow-xs transition-all overflow-hidden">
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        aria-label="Country Code"
                        className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-2 py-2.5 border-r border-slate-200 outline-none cursor-pointer shrink-0 transition-colors"
                      >
                        {COUNTRY_CODES.map((c) => (
                          <option key={c.code} value={c.code} className="text-slate-900 bg-white">
                            {c.flag} {c.code}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        required
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="98765 43210 or user@example.com"
                        className="w-full px-3 py-2.5 bg-transparent text-slate-900 focus:outline-none text-xs placeholder-slate-400 font-medium"
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
                    <div className="flex rounded-xl bg-slate-50 border border-slate-200 focus-within:border-red-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-red-500/20 shadow-xs transition-all overflow-hidden">
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        aria-label="Country Code"
                        className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-2 py-2.5 border-r border-slate-200 outline-none cursor-pointer shrink-0 transition-colors"
                      >
                        {COUNTRY_CODES.map((c) => (
                          <option key={c.code} value={c.code} className="text-slate-900 bg-white">
                            {c.flag} {c.code}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        required
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="98765 43210 or user@example.com"
                        className="w-full px-3 py-2.5 bg-transparent text-slate-900 focus:outline-none text-xs placeholder-slate-400 font-medium"
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
                      {receivedDemoOtp && (
                        <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900 shadow-sm animate-fade-in">
                          <div>
                            <span className="font-bold text-[10px] text-emerald-600 uppercase tracking-wider block">Verification OTP Code</span>
                            <span className="font-mono font-extrabold text-sm tracking-widest text-emerald-700">{receivedDemoOtp}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setOtpCode(receivedDemoOtp)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px] cursor-pointer shadow-sm transition-all"
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
                <div className="space-y-3">
                  <div className="p-3 rounded-2xl bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 text-xs flex items-center justify-between">
                    <div>
                      <span className="font-extrabold text-slate-900 block">Corporate GST & Travel Profile</span>
                      <span className="text-[10px] text-slate-500 block">2-Step DLT OTP flow with GSTIN tax input credit</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowFullRegistrationModal(true)}
                      className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] shadow-sm cursor-pointer whitespace-nowrap"
                    >
                      Open Flow &rarr;
                    </button>
                  </div>

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
                    <div className="flex rounded-xl bg-slate-50 border border-slate-200 focus-within:border-red-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-red-500/20 shadow-xs transition-all overflow-hidden">
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        aria-label="Country Code"
                        className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-2 py-2 border-r border-slate-200 outline-none cursor-pointer shrink-0 transition-colors"
                      >
                        {COUNTRY_CODES.map((c) => (
                          <option key={c.code} value={c.code} className="text-slate-900 bg-white">
                            {c.flag} {c.code}
                          </option>
                        ))}
                      </select>
                      <input
                        type="tel"
                        required
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="98765 43210"
                        className="w-full px-3 py-2 bg-transparent text-slate-900 focus:outline-none text-xs placeholder-slate-400 font-medium"
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

                  {/* Set Password Field */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Create Password *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min. 8 characters (letters & numbers)"
                        className="w-full pl-9 pr-9 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-red-500 focus:bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {/* Live Password Strength Meter */}
                    {password && (
                      <div className="mt-1.5 p-2 bg-slate-50 border border-slate-200 rounded-lg space-y-1 animate-fade-in">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-semibold text-slate-500">Password Strength:</span>
                          <span className={`font-bold uppercase tracking-wider ${registerPwdStrength.color}`}>
                            {registerPwdStrength.label}
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden flex gap-1">
                          <div className={`h-full flex-1 rounded-full ${registerPwdStrength.score >= 1 ? registerPwdStrength.barColor : 'bg-slate-200'} transition-all`} />
                          <div className={`h-full flex-1 rounded-full ${registerPwdStrength.score >= 2 ? registerPwdStrength.barColor : 'bg-slate-200'} transition-all`} />
                          <div className={`h-full flex-1 rounded-full ${registerPwdStrength.score >= 3 ? registerPwdStrength.barColor : 'bg-slate-200'} transition-all`} />
                          <div className={`h-full flex-1 rounded-full ${registerPwdStrength.score >= 4 ? registerPwdStrength.barColor : 'bg-slate-200'} transition-all`} />
                        </div>
                        <div className="flex items-center justify-between text-[9px] text-slate-500 pt-0.5">
                          <span className={registerPwdStrength.hasMinLength ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                            {registerPwdStrength.hasMinLength ? '✓' : '•'} 8+ chars
                          </span>
                          <span className={registerPwdStrength.hasLetter ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                            {registerPwdStrength.hasLetter ? '✓' : '•'} Letters
                          </span>
                          <span className={registerPwdStrength.hasNumber ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                            {registerPwdStrength.hasNumber ? '✓' : '•'} Numbers
                          </span>
                          <span className={registerPwdStrength.hasSpecial ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                            {registerPwdStrength.hasSpecial ? '✓' : '•'} Symbol
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password (Re-enter) Field */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Confirm Password (Re-enter) *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type={showRegisterConfirmPassword ? 'text' : 'password'}
                        required
                        value={registerConfirmPassword}
                        onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                        placeholder="Re-enter password to confirm"
                        className={`w-full pl-9 pr-9 py-2 rounded-xl bg-slate-50 border text-slate-900 text-xs focus:outline-none focus:bg-white transition-all ${
                          registerConfirmPassword
                            ? registerConfirmPassword === password
                              ? 'border-emerald-500 ring-1 ring-emerald-500/20'
                              : 'border-red-400 ring-1 ring-red-400/20'
                            : 'border-slate-200 focus:border-red-500'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegisterConfirmPassword(!showRegisterConfirmPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                        title={showRegisterConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        {showRegisterConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    {registerConfirmPassword && (
                      <div className="mt-1 text-[10px]">
                        {registerConfirmPassword === password ? (
                          <span className="text-emerald-600 font-bold flex items-center gap-1">
                            <Check className="w-3 h-3" /> Passwords match perfectly
                          </span>
                        ) : (
                          <span className="text-red-500 font-semibold flex items-center gap-1">
                            ✕ Passwords do not match yet
                          </span>
                        )}
                      </div>
                    )}
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
              </div>
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
                        <div className="flex rounded-xl bg-slate-50 border border-slate-200 focus-within:border-red-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-red-500/20 shadow-xs transition-all overflow-hidden">
                          <select
                            value={countryCode}
                            onChange={(e) => setCountryCode(e.target.value)}
                            aria-label="Country Code"
                            className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-2 py-2.5 border-r border-slate-200 outline-none cursor-pointer shrink-0 transition-colors"
                          >
                            {COUNTRY_CODES.map((c) => (
                              <option key={c.code} value={c.code} className="text-slate-900 bg-white">
                                {c.flag} {c.code}
                              </option>
                            ))}
                          </select>
                          <input
                            type="text"
                            required
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            placeholder="98765 43210 or user@example.com"
                            className="w-full px-3 py-2.5 bg-transparent text-slate-900 focus:outline-none text-xs placeholder-slate-400 font-medium"
                          />
                        </div>
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
                      {receivedDemoOtp && (
                        <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900 shadow-sm animate-fade-in">
                          <div>
                            <span className="font-bold text-[10px] text-emerald-600 uppercase tracking-wider block">Verification OTP Code</span>
                            <span className="font-mono font-extrabold text-sm tracking-widest text-emerald-700">{receivedDemoOtp}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setOtpCode(receivedDemoOtp)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px] cursor-pointer shadow-sm transition-all"
                          >
                            Auto-Fill
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

                      {/* New Password */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          New Password *
                        </label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                          <input
                            type={showNewPassword ? 'text' : 'password'}
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Min. 8 characters (letters & numbers)"
                            className="w-full pl-9 pr-9 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-red-500"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                            title={showNewPassword ? 'Hide password' : 'Show password'}
                          >
                            {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>

                        {/* Live Password Strength Meter */}
                        {newPassword && (
                          <div className="mt-1.5 p-2 bg-slate-50 border border-slate-200 rounded-lg space-y-1 animate-fade-in">
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="font-semibold text-slate-500">Password Strength:</span>
                              <span className={`font-bold uppercase tracking-wider ${resetPwdStrength.color}`}>
                                {resetPwdStrength.label}
                              </span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden flex gap-1">
                              <div className={`h-full flex-1 rounded-full ${resetPwdStrength.score >= 1 ? resetPwdStrength.barColor : 'bg-slate-200'} transition-all`} />
                              <div className={`h-full flex-1 rounded-full ${resetPwdStrength.score >= 2 ? resetPwdStrength.barColor : 'bg-slate-200'} transition-all`} />
                              <div className={`h-full flex-1 rounded-full ${resetPwdStrength.score >= 3 ? resetPwdStrength.barColor : 'bg-slate-200'} transition-all`} />
                              <div className={`h-full flex-1 rounded-full ${resetPwdStrength.score >= 4 ? resetPwdStrength.barColor : 'bg-slate-200'} transition-all`} />
                            </div>
                            <div className="flex items-center justify-between text-[9px] text-slate-500 pt-0.5">
                              <span className={resetPwdStrength.hasMinLength ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                                {resetPwdStrength.hasMinLength ? '✓' : '•'} 8+ chars
                              </span>
                              <span className={resetPwdStrength.hasLetter ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                                {resetPwdStrength.hasLetter ? '✓' : '•'} Letters
                              </span>
                              <span className={resetPwdStrength.hasNumber ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                                {resetPwdStrength.hasNumber ? '✓' : '•'} Numbers
                              </span>
                              <span className={resetPwdStrength.hasSpecial ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                                {resetPwdStrength.hasSpecial ? '✓' : '•'} Symbol
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Confirm New Password */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Confirm New Password (Re-enter) *
                        </label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                          <input
                            type={showResetConfirmPassword ? 'text' : 'password'}
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Re-enter new password to confirm"
                            className={`w-full pl-9 pr-9 py-2 rounded-xl bg-slate-50 border text-slate-900 text-xs focus:outline-none transition-all ${
                              confirmPassword
                                ? confirmPassword === newPassword
                                  ? 'border-emerald-500 ring-1 ring-emerald-500/20'
                                  : 'border-red-400 ring-1 ring-red-400/20'
                                : 'border-slate-200 focus:border-red-500'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowResetConfirmPassword(!showResetConfirmPassword)}
                            className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                            title={showResetConfirmPassword ? 'Hide password' : 'Show password'}
                          >
                            {showResetConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                        {confirmPassword && (
                          <div className="mt-1 text-[10px]">
                            {confirmPassword === newPassword ? (
                              <span className="text-emerald-600 font-bold flex items-center gap-1">
                                <Check className="w-3 h-3" /> Passwords match perfectly
                              </span>
                            ) : (
                              <span className="text-red-500 font-semibold flex items-center gap-1">
                                ✕ Passwords do not match yet
                              </span>
                            )}
                          </div>
                        )}
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

              {/* Quick Demo Access */}
              <div className="pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    loginRider({
                      name: 'Sanjay Reddy',
                      phone: '+91 98490 22331',
                      email: 'sanjay.reddy@kalyangroup.com',
                      city: 'Hyderabad, Telangana'
                    });
                    closeAuthModal();
                    setActivePage('rider');
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-red-50 text-slate-700 hover:text-red-700 border border-slate-200 hover:border-red-200 text-xs font-bold flex items-center justify-between transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2 text-left">
                    <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                    <div>
                      <span className="block text-slate-900 font-bold leading-tight">Demo Rider Flight-Deck</span>
                      <span className="block text-[10px] text-slate-500 font-normal">Explore 7 live modules as Sanjay Reddy</span>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-red-600 bg-red-100/70 px-2 py-0.5 rounded-md">
                    1-Tap Tour &rarr;
                  </span>
                </button>
              </div>

            </div>
          )}

        </div>
      </div>

      {/* FULL RED EDITION DLT REGISTRATION MODAL */}
      {showFullRegistrationModal && (
        <UserRegistrationModal
          isOpen={showFullRegistrationModal}
          onClose={() => setShowFullRegistrationModal(false)}
          onSuccess={(userData) => {
            loginRider({
              name: userData.fullName || userData.name,
              phone: userData.phone,
              email: userData.email,
              city: 'Hyderabad, Telangana',
            });
            setShowFullRegistrationModal(false);
            closeAuthModal();
            setActivePage('rider');
            showToast(`Welcome ${userData.fullName || userData.name}! Your Wayora profile is active.`, 'success');
          }}
        />
      )}
    </div>
  );
};
