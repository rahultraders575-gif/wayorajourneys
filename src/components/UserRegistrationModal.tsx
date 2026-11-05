import React, { useState, useTransition } from "react";
import { 
  Phone, Mail, User, ShieldCheck, Building2, 
  ArrowRight, Sparkles, Check, Thermometer, VolumeX, 
  FileText, X, AlertCircle, RefreshCw 
} from "lucide-react";

interface UserRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (userData: any) => void;
}

export const UserRegistrationModal: React.FC<UserRegistrationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [step, setStep] = useState<"DETAILS" | "OTP">("DETAILS");
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    accountType: "INDIVIDUAL" as "INDIVIDUAL" | "CORPORATE",
    companyName: "",
    gstin: "",
    preferredTemp: "22C",
    silentRide: false,
    otp: "",
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [demoOtpHint, setDemoOtpHint] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);

    // Validation
    if (!formData.fullName.trim()) {
      setErrorMsg("Please enter your full name.");
      return;
    }
    const cleanDigits = formData.phone.replace(/\D/g, "");
    if (!/^[6-9]\d{9}$/.test(cleanDigits)) {
      setErrorMsg("Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.");
      return;
    }
    if (!formData.email.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    if (formData.accountType === "CORPORATE" && formData.gstin && formData.gstin.length < 15) {
      setErrorMsg("GSTIN must be 15 alphanumeric characters.");
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch("/api/auth/register/initiate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName: formData.fullName,
            phone: cleanDigits,
            email: formData.email,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to send OTP");
        
        if (data.demoOtpCode) {
          setDemoOtpHint(data.demoOtpCode);
          setFormData((prev) => ({ ...prev, otp: data.demoOtpCode }));
        }
        setStep("OTP");
      } catch (err: any) {
        setErrorMsg(err.message || "Failed to dispatch verification code.");
      }
    });
  };

  const handleVerifyRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (formData.otp.length !== 6) {
      setErrorMsg("Please enter the complete 6-digit verification code.");
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch("/api/auth/register/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            phone: formData.phone.replace(/\D/g, ""),
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Registration failed");

        if (data.token) {
          localStorage.setItem("wayora_token", data.token);
        }
        onSuccess(data.user);
        onClose();
      } catch (err: any) {
        setErrorMsg(err.message || "Invalid or expired OTP code.");
      }
    });
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-lg rounded-3xl border border-rose-950/70 bg-[#0F0F11] p-6 sm:p-8 shadow-2xl text-slate-100 animate-in zoom-in-95 duration-200 my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="mb-6 space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-[11px] uppercase tracking-widest font-bold text-rose-500 font-mono">
              Wayora Journeys • Red Edition
            </span>
          </div>
          <h2 className="text-2xl font-serif font-black text-white tracking-tight">
            {step === "DETAILS" ? "Create Your Travel Account" : "Verify Your Mobile"}
          </h2>
          <p className="text-xs text-zinc-400">
            {step === "DETAILS"
              ? "Join for private outstation chauffeurs, verified VIP fleet, and curated journeys."
              : `Enter the 6-digit verification code sent to +91 ${formData.phone}`}
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 rounded-xl bg-rose-950/60 border border-rose-800/80 p-3 text-xs text-rose-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* ================= STEP 1: TRAVEL PROFILE DETAILS ================= */}
        {step === "DETAILS" ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Full Name *</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 h-4 w-4 text-zinc-500" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Arjun Sharma"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900/70 pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-rose-600 focus:bg-zinc-900 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Mobile (+91) */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Mobile Number (SMS/WhatsApp) *</label>
              <div className="relative flex rounded-xl border border-zinc-800 bg-zinc-900/70 overflow-hidden focus-within:border-rose-600 transition-colors">
                <div className="flex items-center gap-1 bg-zinc-800/60 px-3 py-2.5 text-xs text-zinc-300 font-bold border-r border-zinc-800 shrink-0">
                  <span>🇮🇳</span>
                  <span>+91</span>
                </div>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, "") })}
                  className="w-full px-3 py-2 text-sm text-white placeholder-zinc-500 bg-transparent focus:outline-none font-mono"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Email Address (Invoices & Confirmations) *</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-zinc-500" />
                <input
                  type="email"
                  required
                  placeholder="arjun@kalyangroup.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900/70 pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-rose-600 focus:bg-zinc-900 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Account Type Selector (Individual vs Corporate) */}
            <div className="pt-1">
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Booking Purpose / Profile Type</label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, accountType: "INDIVIDUAL" })}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    formData.accountType === "INDIVIDUAL"
                      ? "bg-rose-950/80 border-rose-600 text-white shadow-md shadow-rose-950/40"
                      : "bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-white"
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Personal & Family</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, accountType: "CORPORATE" })}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    formData.accountType === "CORPORATE"
                      ? "bg-rose-950/80 border-rose-600 text-white shadow-md shadow-rose-950/40"
                      : "bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-white"
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Business / Corporate GST</span>
                </button>
              </div>
            </div>

            {/* Corporate Fields */}
            {formData.accountType === "CORPORATE" && (
              <div className="space-y-3 p-3.5 rounded-2xl bg-zinc-900/60 border border-rose-900/40 text-xs animate-in fade-in duration-200">
                <div className="flex items-center gap-1.5 text-rose-400 font-bold">
                  <Building2 className="w-4 h-4" />
                  <span>Corporate Billing & GST Input Tax Credit</span>
                </div>

                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Company Legal Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Kalyan Technologies Pvt Ltd"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:border-rose-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Corporate GSTIN (15 Characters)</label>
                  <input
                    type="text"
                    placeholder="36AAACW1234F1Z8"
                    maxLength={15}
                    value={formData.gstin}
                    onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-xs text-white placeholder-zinc-500 font-mono uppercase focus:border-rose-600 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Ride Comfort Preferences Preview */}
            <div className="p-3 rounded-2xl bg-zinc-900/40 border border-zinc-800 text-xs space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 block">
                Default Chauffeur Cabin Preferences
              </span>

              <div className="flex items-center justify-between">
                <span className="text-zinc-300 flex items-center gap-1.5">
                  <Thermometer className="w-3.5 h-3.5 text-blue-400" />
                  <span>Cabin Temperature</span>
                </span>
                <div className="flex gap-1.5">
                  {(["19C", "22C", "25C"] as const).map((temp) => (
                    <button
                      key={temp}
                      type="button"
                      onClick={() => setFormData({ ...formData, preferredTemp: temp })}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-colors ${
                        formData.preferredTemp === temp
                          ? "bg-rose-900 text-white border-rose-600"
                          : "bg-zinc-800 text-zinc-400 border-zinc-700"
                      }`}
                    >
                      {temp}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-zinc-800/80 pt-1.5">
                <span className="text-zinc-300 flex items-center gap-1.5">
                  <VolumeX className="w-3.5 h-3.5 text-purple-400" />
                  <span>Silent Ride (Quiet Mode)</span>
                </span>
                <input
                  type="checkbox"
                  checked={formData.silentRide}
                  onChange={(e) => setFormData({ ...formData, silentRide: e.target.checked })}
                  className="rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-700 via-rose-800 to-rose-900 hover:from-rose-600 hover:to-rose-800 py-3 text-sm font-bold text-white shadow-lg shadow-rose-950/50 transition-all cursor-pointer disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Generating Secure OTP...</span>
                </>
              ) : (
                <>
                  <span>Continue to Mobile Verification</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* ================= STEP 2: OTP VERIFICATION ================= */
          <form onSubmit={handleVerifyRegister} className="space-y-5">
            {demoOtpHint && (
              <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-600/40 text-xs text-amber-300 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Demo Verification Code:</span>
                </div>
                <span className="font-mono font-bold text-sm tracking-widest text-amber-300 bg-amber-900/50 px-2 py-0.5 rounded">
                  {demoOtpHint}
                </span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-2">
                Enter 6-Digit Verification Code
              </label>
              <input
                type="text"
                required
                maxLength={6}
                autoFocus
                placeholder="••••••"
                value={formData.otp}
                onChange={(e) => setFormData({ ...formData, otp: e.target.value.replace(/\D/g, "") })}
                className="w-full text-center tracking-[0.4em] text-2xl font-mono rounded-xl border border-zinc-800 bg-zinc-900/80 py-3.5 text-white focus:border-rose-600 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isPending || formData.otp.length !== 6}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-700 via-rose-800 to-rose-900 hover:from-rose-600 hover:to-rose-800 py-3 text-sm font-bold text-white shadow-lg shadow-rose-950/50 transition cursor-pointer disabled:opacity-50"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>{isPending ? "Verifying Account..." : "Confirm & Complete Registration"}</span>
            </button>

            <div className="flex justify-between items-center text-xs text-zinc-400 pt-1">
              <button
                type="button"
                onClick={() => setStep("DETAILS")}
                className="hover:text-white underline cursor-pointer"
              >
                Change Phone Number
              </button>
              <button
                type="button"
                onClick={() => handleSendOtp()}
                disabled={isPending}
                className="text-rose-400 hover:text-rose-300 font-semibold cursor-pointer"
              >
                Resend Code
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

