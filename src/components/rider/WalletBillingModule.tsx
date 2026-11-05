import React, { useState } from 'react';
import { RiderPaymentMethod, Booking } from '../../types';
import {
  Wallet, CreditCard, DollarSign, Plus, CheckCircle2, 
  ArrowRight, ShieldCheck, Sparkles, Building2, Trash2, 
  X, Check, Lock, RefreshCw, AlertCircle
} from 'lucide-react';

interface WalletBillingModuleProps {
  walletBalance: number;
  paymentMethods: RiderPaymentMethod[];
  bookings: Booking[];
  onAddPaymentMethod: (pm: Omit<RiderPaymentMethod, 'id'>) => void;
  onDeletePaymentMethod: (id: string) => void;
  onSetDefaultPaymentMethod: (id: string) => void;
  onTopUpWallet: (amount: number) => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const WalletBillingModule: React.FC<WalletBillingModuleProps> = ({
  walletBalance,
  paymentMethods,
  bookings,
  onAddPaymentMethod,
  onDeletePaymentMethod,
  onSetDefaultPaymentMethod,
  onTopUpWallet,
  showToast,
}) => {
  const [isAddPmModalOpen, setIsAddPmModalOpen] = useState(false);
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState<number>(1000);
  const [autoDebitEnabled, setAutoDebitEnabled] = useState(true);

  // New PM State
  const [pmType, setPmType] = useState<RiderPaymentMethod['type']>('upi');
  const [pmTitle, setPmTitle] = useState('');
  const [pmSubtitle, setPmSubtitle] = useState('');

  const handleTopUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onTopUpWallet(topUpAmount);
    showToast(`Added ₹${topUpAmount.toLocaleString()} to Wayora Wallet successfully!`, 'success');
    setIsTopUpModalOpen(false);
  };

  const handleAddPmSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddPaymentMethod({
      type: pmType,
      title: pmTitle,
      subtitle: pmSubtitle || (pmType === 'upi' ? 'UPI Virtual Payment Address' : 'Debit/Credit Card'),
      isDefault: paymentMethods.length === 0,
    });
    showToast('Payment method saved to vault', 'success');
    setIsAddPmModalOpen(false);
    setPmTitle('');
    setPmSubtitle('');
  };

  return (
    <div className="space-y-6">

      {/* SECTION 1: WAYORA WALLET & REWARDS BANNER */}
      <div className="rounded-3xl border border-red-200 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-rose-200 bg-black/25 px-2.5 py-0.5 rounded-full">
            Stored Value & Cashbacks
          </span>
          <h3 className="text-2xl font-black tracking-tight">Wayora Credits Wallet</h3>
          <p className="text-xs text-rose-100 max-w-md">
            Instant automatic settlement for tolls, driver night allowances, and remaining trip balances without midnight cash hassles.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="bg-black/30 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20 text-right">
            <span className="text-[10px] font-bold text-rose-200 block uppercase">Available Balance</span>
            <span className="text-2xl font-black text-white">₹{walletBalance.toLocaleString()}</span>
          </div>

          <button
            type="button"
            onClick={() => setIsTopUpModalOpen(true)}
            className="px-5 py-3 bg-white hover:bg-rose-50 text-red-700 rounded-2xl font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md active:scale-95 transition-all whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Top-Up Wallet</span>
          </button>
        </div>
      </div>

      {/* SECTION 2: ADVANCE DEPOSIT MANAGEMENT LEDGER */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
        <div>
          <h4 className="text-base font-black text-slate-900">25% Online Advance & Balance Split Ledger</h4>
          <p className="text-xs text-slate-500">
            Real-time status of online reservation advance deposits and pending drop-off settlements.
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Trip Reference</th>
                <th className="py-3 px-4">Route Destination</th>
                <th className="py-3 px-4">Estimated Total</th>
                <th className="py-3 px-4">25% Advance Paid</th>
                <th className="py-3 px-4">75% Balance at Drop-off</th>
                <th className="py-3 px-4">Settlement Mode</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bookings.slice(0, 4).map((b) => {
                const balanceDue = b.estimatedTotal - b.advancePaid;
                return (
                  <tr key={b.id} className="hover:bg-rose-50/30 transition-colors">
                    <td className="py-3 px-4 font-mono font-extrabold text-red-600">{b.id}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{b.destination}</td>
                    <td className="py-3 px-4 font-extrabold text-slate-900">₹{b.estimatedTotal.toLocaleString()}</td>
                    <td className="py-3 px-4 font-bold text-emerald-700">₹{b.advancePaid.toLocaleString()}</td>
                    <td className="py-3 px-4 font-bold text-slate-800">₹{balanceDue.toLocaleString()}</td>
                    <td className="py-3 px-4 text-slate-600">
                      {autoDebitEnabled ? 'Wallet Auto-Debit' : 'Cash / UPI to Chauffeur'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        b.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {b.status === 'Completed' ? 'Fully Settled' : 'Advance Confirmed'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 3: PAYMENT METHODS VAULT */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-base font-black text-slate-900">Payment Vault & Auto-Debit Rules</h4>
            <p className="text-xs text-slate-500">
              Manage verified UPI handles, tokenized cards, and corporate central billing credentials.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAddPmModalOpen(true)}
            className="px-4 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Payment Method</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {paymentMethods.map((pm) => (
            <div
              key={pm.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                pm.isDefault ? 'border-red-600 bg-red-50/40 ring-1 ring-red-500/20' : 'border-slate-200 bg-white'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                    {pm.type === 'upi' ? <DollarSign className="w-4 h-4 text-emerald-600" /> :
                     pm.type === 'corporate' ? <Building2 className="w-4 h-4 text-blue-600" /> :
                     <CreditCard className="w-4 h-4 text-red-600" />}
                    {pm.title}
                  </span>
                  {pm.isDefault && (
                    <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-red-600 text-white">
                      Default
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500">{pm.subtitle}</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                {!pm.isDefault ? (
                  <button
                    type="button"
                    onClick={() => onSetDefaultPaymentMethod(pm.id)}
                    className="text-red-600 font-bold hover:underline cursor-pointer"
                  >
                    Set as Default
                  </button>
                ) : (
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Active for Auto-Debit
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => onDeletePaymentMethod(pm.id)}
                  className="text-slate-400 hover:text-red-600 cursor-pointer p-0.5"
                  title="Remove Method"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TOP-UP WALLET MODAL */}
      {isTopUpModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h4 className="font-black text-slate-900 text-sm">Add Money to Wayora Wallet</h4>
                <p className="text-xs text-slate-500">Current Balance: ₹{walletBalance.toLocaleString()}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsTopUpModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTopUpSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-2">
                {[500, 1000, 2500].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setTopUpAmount(amt)}
                    className={`py-2 rounded-xl font-bold cursor-pointer border ${
                      topUpAmount === amt ? 'border-red-600 bg-red-600 text-white' : 'border-slate-200 bg-slate-50 text-slate-700'
                    }`}
                  >
                    +₹{amt}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Custom Amount (INR)</label>
                <input
                  type="number"
                  min="100"
                  required
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(Number(e.target.value))}
                  className="w-full text-center text-lg font-black px-3 py-2 rounded-xl border border-slate-200 text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTopUpModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold cursor-pointer shadow-sm"
                >
                  Recharge Wallet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD PAYMENT METHOD MODAL */}
      {isAddPmModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h4 className="font-black text-slate-900 text-sm">Add Payment Method</h4>
                <p className="text-xs text-slate-500">Save UPI handle, credit/debit card, or corporate account.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddPmModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddPmSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Method Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['upi', 'card', 'corporate'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setPmType(type)}
                      className={`py-2 rounded-xl font-bold uppercase text-[11px] cursor-pointer border ${
                        pmType === type ? 'border-red-600 bg-red-600 text-white' : 'border-slate-200 bg-slate-50 text-slate-700'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  {pmType === 'upi' ? 'UPI Virtual Payment ID' : pmType === 'card' ? 'Cardholder Name & Number' : 'Corporate Entity Name'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={pmType === 'upi' ? 'name@okhdfcbank' : pmType === 'card' ? 'HDFC Regalia Visa' : 'Kalyan Group Direct'}
                  value={pmTitle}
                  onChange={(e) => setPmTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Subtitle / Details</label>
                <input
                  type="text"
                  placeholder="e.g. Card ending in 4412 or GSTIN for invoice"
                  value={pmSubtitle}
                  onChange={(e) => setPmSubtitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddPmModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold cursor-pointer shadow-sm"
                >
                  Save Method
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

