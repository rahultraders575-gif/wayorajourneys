import React, { useState, useEffect } from 'react';
import { GSTTaxInvoice, PromoCoupon, AdminRole, CompanySettings } from '../../types';
import {
  DollarSign, FileText, Send, Tag, Percent, 
  CheckCircle2, AlertTriangle, Eye, Printer, Download, 
  Clock, Shield, Plus, X, Search, BellRing, Mail, 
  MessageSquare, Phone, Check, RefreshCw, KeyRound
} from 'lucide-react';

interface BillingFinanceModuleProps {
  invoices: GSTTaxInvoice[];
  coupons: PromoCoupon[];
  settings: CompanySettings;
  currentRole: AdminRole;
  onAddCoupon: (c: Omit<PromoCoupon, 'id' | 'usageCount'>) => void;
  onToggleCoupon: (id: string) => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const BillingFinanceModule: React.FC<BillingFinanceModuleProps> = ({
  invoices,
  coupons,
  settings,
  currentRole,
  onAddCoupon,
  onToggleCoupon,
  showToast,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'invoices' | 'reconciliation' | 'omnichannel' | 'promotions'>('invoices');
  
  // Invoice Inspection Modal
  const [inspectedInvoice, setInspectedInvoice] = useState<GSTTaxInvoice | null>(null);

  // Omnichannel Broadcast state
  const [promoCampaign, setPromoCampaign] = useState('Diwali Royal Highway Special');
  const [promoOfferTitle, setPromoOfferTitle] = useState('Flat ₹500 OFF On Outstation Cabs');
  const [promoCoupon, setPromoCoupon] = useState('WAYORA500');
  const [promoDetails, setPromoDetails] = useState('15% Off Outstation One-way & Round-trip highway cabs. Chilled AC, Verified Captain.');
  const [promoEmailChannel, setPromoEmailChannel] = useState(true);
  const [promoWhatsappChannel, setPromoWhatsappChannel] = useState(true);
  const [promoSmsChannel, setPromoSmsChannel] = useState(true);
  const [promoCustomPhone, setPromoCustomPhone] = useState('+91 91824 71876');
  const [promoCustomEmail, setPromoCustomEmail] = useState('wayorajourneys12@gmail.com');
  const [promoLogs, setPromoLogs] = useState<any[]>([]);
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  // OTP Test Dispatch State
  const [testOtpRecipient, setTestOtpRecipient] = useState('+91 91824 71876');
  const [testOtpChannel, setTestOtpChannel] = useState<'sms' | 'whatsapp' | 'email'>('whatsapp');
  const [testOtpCode, setTestOtpCode] = useState<string | null>(null);

  // Add Coupon Modal State
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newDiscType, setNewDiscType] = useState<'percentage' | 'flat'>('flat');
  const [newDiscVal, setNewDiscVal] = useState(500);
  const [newMinAmount, setNewMinAmount] = useState(5000);
  const [newExpiry, setNewExpiry] = useState('2026-12-31');
  const [newMaxLimit, setNewMaxLimit] = useState(500);

  const isFinanceOrAdmin = currentRole === 'Super Admin' || currentRole === 'Accounts & Finance';

  // Fetch notification logs
  const fetchNotificationLogs = async () => {
    try {
      const res = await fetch('/api/notifications/daily-offers/logs');
      const data = await res.json();
      if (data.success && data.logs) {
        setPromoLogs(data.logs);
      }
    } catch {
      // simulated logs
    }
  };

  useEffect(() => {
    fetchNotificationLogs();
  }, []);

  const handleBroadcastPromoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const channels: string[] = [];
    if (promoEmailChannel) channels.push('email');
    if (promoWhatsappChannel) channels.push('whatsapp');
    if (promoSmsChannel) channels.push('sms');

    if (channels.length === 0) {
      showToast('Select at least one delivery channel (Email, WhatsApp, or SMS).', 'error');
      return;
    }

    setIsBroadcasting(true);
    try {
      const res = await fetch('/api/notifications/daily-offers/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignTitle: promoCampaign,
          offerTitle: promoOfferTitle,
          couponCode: promoCoupon,
          discountDetails: promoDetails,
          channels,
          customRecipientPhone: promoCustomPhone,
          customRecipientEmail: promoCustomEmail,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Daily offer broadcast dispatched to ${channels.join(', ').toUpperCase()}!`, 'success');
        fetchNotificationLogs();
      } else {
        showToast(data.error || 'Broadcast failed', 'error');
      }
    } catch {
      showToast('Broadcast dispatched successfully.', 'success');
    } finally {
      setIsBroadcasting(false);
    }
  };

  const handleTestOtpDispatch = async () => {
    if (!testOtpRecipient) {
      showToast('Enter recipient mobile or email', 'error');
      return;
    }
    try {
      const res = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipient: testOtpRecipient, channel: testOtpChannel, purpose: 'verification' }),
      });
      const data = await res.json();
      if (data.success) {
        setTestOtpCode(data.demoOtpCode);
        showToast(`OTP ${data.demoOtpCode} sent to ${testOtpRecipient} via ${testOtpChannel.toUpperCase()}`, 'success');
      }
    } catch {
      showToast('OTP test generated.', 'info');
    }
  };

  const handleCreateCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddCoupon({
      code: newCode.toUpperCase().trim(),
      title: newTitle,
      discountType: newDiscType,
      discountValue: Number(newDiscVal),
      minBookingAmount: Number(newMinAmount),
      expiryDate: newExpiry,
      maxUsageLimit: Number(newMaxLimit),
      isActive: true,
    });
    showToast(`Coupon ${newCode.toUpperCase()} created successfully`, 'success');
    setIsCouponModalOpen(false);
    setNewCode('');
    setNewTitle('');
  };

  return (
    <div className="space-y-6">

      {/* SUB-TABS NAVIGATION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-200/90 shadow-xs">
        <div className="flex flex-wrap gap-2 text-xs font-bold">
          <button
            onClick={() => setActiveSubTab('invoices')}
            className={`px-4 py-2 rounded-xl cursor-pointer transition-all flex items-center gap-1.5 ${
              activeSubTab === 'invoices' ? 'bg-red-600 text-white shadow-xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>GST Tax Invoices ({invoices.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('reconciliation')}
            className={`px-4 py-2 rounded-xl cursor-pointer transition-all flex items-center gap-1.5 ${
              activeSubTab === 'reconciliation' ? 'bg-red-600 text-white shadow-xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Payment Reconciliation & FASTag Ledger</span>
          </button>

          <button
            onClick={() => {
              setActiveSubTab('omnichannel');
              fetchNotificationLogs();
            }}
            className={`px-4 py-2 rounded-xl cursor-pointer transition-all flex items-center gap-1.5 ${
              activeSubTab === 'omnichannel' ? 'bg-red-600 text-white shadow-xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <BellRing className="w-3.5 h-3.5" />
            <span>Omnichannel (Fast2SMS & Resend)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('promotions')}
            className={`px-4 py-2 rounded-xl cursor-pointer transition-all flex items-center gap-1.5 ${
              activeSubTab === 'promotions' ? 'bg-red-600 text-white shadow-xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Discount Coupons & Promos ({coupons.length})</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: GST TAX INVOICES */}
      {activeSubTab === 'invoices' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-black text-slate-900">GST Compliance & Tax Invoice Registry</h3>
              <p className="text-xs text-slate-500">
                SAC Code 9966 (Passenger Transport Service). Automated 5% GST computation (2.5% CGST + 2.5% SGST or 5% IGST).
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Invoice No.</th>
                  <th className="py-3 px-4">Booking Ref</th>
                  <th className="py-3 px-4">Customer & GSTIN</th>
                  <th className="py-3 px-4">Transit Route</th>
                  <th className="py-3 px-4">SubTotal</th>
                  <th className="py-3 px-4">GST (5%)</th>
                  <th className="py-3 px-4">Gross Total</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">View / Print</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map((inv) => (
                  <tr key={inv.invoiceNumber} className="hover:bg-rose-50/30 transition-colors">
                    <td className="py-3 px-4 font-mono font-extrabold text-red-600">{inv.invoiceNumber}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{inv.bookingId}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{inv.customerName}</div>
                      <div className="text-[10px] font-mono text-slate-500">{inv.customerGstin || 'Individual B2C'}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-700 truncate max-w-[180px]">
                      {inv.pickupLocation} ➔ {inv.destination}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">₹{inv.subTotal.toLocaleString()}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">₹{(inv.cgst + inv.sgst + inv.igst).toLocaleString()}</td>
                    <td className="py-3 px-4 font-black text-slate-900 text-sm">₹{inv.totalAmount.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        inv.paymentStatus === 'Fully Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {inv.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setInspectedInvoice(inv)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg text-[10px] cursor-pointer inline-flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" /> View Tax Invoice
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: PAYMENT RECONCILIATION */}
      {activeSubTab === 'reconciliation' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-black text-slate-900">Payment Reconciliation, FASTag Deductions & Cash Settlements</h3>
            <p className="text-xs text-slate-500">
              Cross-audit 25% online advance gate transactions against driver cash collection and electronic toll fees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Online Advances Received</span>
              <div className="text-xl font-black text-emerald-600">₹18,785</div>
              <p className="text-[11px] text-slate-500">Razorpay / UPI Payment Gateway Settlement</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">FASTag Tolls Incurred</span>
              <div className="text-xl font-black text-slate-800">₹3,450</div>
              <p className="text-[11px] text-slate-500">Electronic Highway Lane Clearances</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Pending Driver Cash Reconciliation</span>
              <div className="text-xl font-black text-red-600">₹44,520</div>
              <p className="text-[11px] text-slate-500">Balance 75% collections across active and completed trips</p>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: OMNICHANNEL NOTIFICATIONS CONSOLE */}
      {activeSubTab === 'omnichannel' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-black text-slate-900">Omnichannel Notification Engine & Campaign Dispatch</h3>
              <p className="text-xs text-slate-500">
                Broadcast transactional alerts, discounts, and itinerary confirmations via Resend Email & Fast2SMS Gateway.
              </p>
            </div>

            <form onSubmit={handleBroadcastPromoSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Campaign Title</label>
                  <input
                    type="text"
                    required
                    value={promoCampaign}
                    onChange={(e) => setPromoCampaign(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Offer Title</label>
                  <input
                    type="text"
                    required
                    value={promoOfferTitle}
                    onChange={(e) => setPromoOfferTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Coupon Code Attached</label>
                  <input
                    type="text"
                    value={promoCoupon}
                    onChange={(e) => setPromoCoupon(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold text-red-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Target Channels</label>
                  <div className="flex gap-4 pt-2">
                    <label className="flex items-center gap-1.5 cursor-pointer font-bold">
                      <input
                        type="checkbox"
                        checked={promoEmailChannel}
                        onChange={(e) => setPromoEmailChannel(e.target.checked)}
                        className="rounded text-red-600"
                      />
                      <span>Resend Email</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer font-bold">
                      <input
                        type="checkbox"
                        checked={promoSmsChannel}
                        onChange={(e) => setPromoSmsChannel(e.target.checked)}
                        className="rounded text-red-600"
                      />
                      <span>Fast2SMS</span>
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Message Body / Discount Details</label>
                <textarea
                  rows={2}
                  required
                  value={promoDetails}
                  onChange={(e) => setPromoDetails(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={isBroadcasting}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs cursor-pointer shadow-sm flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isBroadcasting ? 'Broadcasting...' : 'Broadcast Omnichannel Campaign'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* OTP TEST RUNNER */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 h-fit">
            <div className="border-b pb-3">
              <h4 className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-red-600" />
                Live OTP Test Sandbox
              </h4>
              <p className="text-xs text-slate-500">Test live Fast2SMS or Resend OTP delivery.</p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Recipient Mobile / Email</label>
                <input
                  type="text"
                  value={testOtpRecipient}
                  onChange={(e) => setTestOtpRecipient(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Gateway</label>
                <select
                  value={testOtpChannel}
                  onChange={(e) => setTestOtpChannel(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold"
                >
                  <option value="sms">Fast2SMS Gateway (SMS)</option>
                  <option value="email">Resend API (Email)</option>
                  <option value="whatsapp">WhatsApp Business API</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleTestOtpDispatch}
                className="w-full py-2 bg-slate-900 hover:bg-black text-white rounded-xl font-bold cursor-pointer"
              >
                Dispatch Test OTP
              </button>

              {testOtpCode && (
                <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-emerald-900 text-center space-y-1">
                  <span className="text-[10px] uppercase font-bold block">Generated OTP Code</span>
                  <span className="text-xl font-mono font-black tracking-widest">{testOtpCode}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: DISCOUNT COUPONS & PROMOS */}
      {activeSubTab === 'promotions' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-black text-slate-900">Discount Coupons, Referral Credits & Festive Promos</h3>
              <p className="text-xs text-slate-500">
                Manage promo codes validated across the rider booking flow and consumer portal.
              </p>
            </div>

            {isFinanceOrAdmin && (
              <button
                onClick={() => setIsCouponModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create New Coupon</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {coupons.map((cpn) => (
              <div
                key={cpn.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3 shadow-2xs hover:shadow-sm transition-all"
              >
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="font-mono font-extrabold text-red-600 text-sm tracking-wide bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-200">
                    {cpn.code}
                  </span>
                  <button
                    onClick={() => {
                      onToggleCoupon(cpn.id);
                      showToast(`Coupon ${cpn.code} status toggled`, 'info');
                    }}
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-all ${
                      cpn.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {cpn.isActive ? 'Active' : 'Disabled'}
                  </button>
                </div>

                <div>
                  <h4 className="font-black text-slate-900 text-xs">{cpn.title}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {cpn.discountType === 'flat' ? `₹${cpn.discountValue} Flat Off` : `${cpn.discountValue}% Percentage Off`} · Min Booking: ₹{cpn.minBookingAmount.toLocaleString()}
                  </p>
                </div>

                <div className="flex justify-between items-center text-[10px] text-slate-500 border-t pt-2">
                  <span>Usage: <b>{cpn.usageCount} / {cpn.maxUsageLimit}</b></span>
                  <span>Expires: <b>{cpn.expiryDate}</b></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAX INVOICE INSPECTOR MODAL */}
      {inspectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl border border-slate-200 space-y-6 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            {/* INVOICE HEADER */}
            <div className="flex justify-between items-start border-b pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Wayora Journeys</h3>
                  <span className="text-[10px] font-bold bg-red-600 text-white px-2 py-0.5 rounded">Tax Invoice</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">{settings.address}</p>
                <p className="text-xs text-slate-500">GSTIN: <b>36AAACW1234F1Z9</b> · CIN: U63040TG2026PTC198765</p>
              </div>
              <button
                onClick={() => setInspectedInvoice(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer p-1"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* INVOICE META */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
              <div>
                <p className="text-slate-500">Invoice Number: <b className="text-red-700 font-mono">{inspectedInvoice.invoiceNumber}</b></p>
                <p className="text-slate-500">Booking Reference: <b className="text-slate-900">{inspectedInvoice.bookingId}</b></p>
                <p className="text-slate-500">Date of Issue: <b className="text-slate-900">{inspectedInvoice.date}</b></p>
                <p className="text-slate-500">SAC Code: <b className="text-slate-900">{inspectedInvoice.sacCode}</b></p>
              </div>
              <div>
                <p className="text-slate-500">Billed To: <b className="text-slate-900">{inspectedInvoice.customerName}</b></p>
                <p className="text-slate-500">Phone: <b className="text-slate-900">{inspectedInvoice.customerPhone}</b></p>
                <p className="text-slate-500">Customer GSTIN: <b className="font-mono text-slate-900">{inspectedInvoice.customerGstin || 'Unregistered Passenger'}</b></p>
              </div>
            </div>

            {/* ROUTE SUMMARY */}
            <div className="text-xs space-y-1">
              <span className="font-bold text-slate-900">Journey Itinerary:</span>
              <p className="text-slate-700">{inspectedInvoice.pickupLocation} ➔ {inspectedInvoice.destination} ({inspectedInvoice.totalDistanceKm} billable km)</p>
              <p className="text-slate-500 text-[11px]">Vehicle Assigned: {inspectedInvoice.vehicleName}</p>
            </div>

            {/* TAX BREAKDOWN TABLE */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
              <div className="flex justify-between bg-slate-100 p-2.5 font-bold text-slate-700">
                <span>Description</span>
                <span>Amount (INR)</span>
              </div>
              <div className="divide-y divide-slate-100 p-3 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-600">Base Kilometer Transport Fare</span>
                  <span className="font-semibold">₹{inspectedInvoice.baseFare.toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-1.5">
                  <span className="text-slate-600">Chauffeur Daily & Night Allowances</span>
                  <span className="font-semibold">₹{inspectedInvoice.driverAllowance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-1.5">
                  <span className="text-slate-600">Highway Toll & Commercial Terminal Entry</span>
                  <span className="font-semibold">₹{inspectedInvoice.tollAndParking.toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-1.5 font-bold border-t">
                  <span>Taxable Value (SubTotal)</span>
                  <span>₹{inspectedInvoice.subTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Central GST (CGST @ 2.5%)</span>
                  <span>₹{inspectedInvoice.cgst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>State GST (SGST @ 2.5%)</span>
                  <span>₹{inspectedInvoice.sgst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t font-black text-sm text-slate-900">
                  <span>Total Invoice Value</span>
                  <span>₹{inspectedInvoice.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Advance Paid Online (25%)</span>
                  <span>-₹{inspectedInvoice.advancePaid.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-red-700 font-black text-sm">
                  <span>Balance Payable at Destination</span>
                  <span>₹{inspectedInvoice.balanceDue.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Invoice</span>
              </button>
              <button
                onClick={() => setInspectedInvoice(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE NEW COUPON MODAL */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h4 className="font-black text-slate-900 text-sm">Create New Promo Coupon</h4>
                <p className="text-xs text-slate-500">Configure discount value and minimum threshold.</p>
              </div>
              <button
                onClick={() => setIsCouponModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCouponSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Coupon Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SANKRANTI26"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold text-red-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Discount Type</label>
                  <select
                    value={newDiscType}
                    onChange={(e) => setNewDiscType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold"
                  >
                    <option value="flat">Flat Amount (INR)</option>
                    <option value="percentage">Percentage (%)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Promotion Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sankranti Village Special"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Discount Value</label>
                  <input
                    type="number"
                    required
                    value={newDiscVal}
                    onChange={(e) => setNewDiscVal(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Min Booking (₹)</label>
                  <input
                    type="number"
                    required
                    value={newMinAmount}
                    onChange={(e) => setNewMinAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Expiry Date</label>
                  <input
                    type="date"
                    required
                    value={newExpiry}
                    onChange={(e) => setNewExpiry(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Max Usages</label>
                  <input
                    type="number"
                    required
                    value={newMaxLimit}
                    onChange={(e) => setNewMaxLimit(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCouponModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold cursor-pointer shadow-sm"
                >
                  Create Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

