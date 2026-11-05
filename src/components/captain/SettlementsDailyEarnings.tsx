import React, { useState } from 'react';
import { CaptainProfile, Booking } from '../../types';
import {
  DollarSign, CreditCard, Building2, CheckCircle2, 
  ArrowRight, ShieldCheck, Sparkles, QrCode, Check, 
  Clock, Download, RefreshCw, X, TrendingUp
} from 'lucide-react';

interface SettlementsDailyEarningsProps {
  captain: CaptainProfile;
  activeTrip: Booking | null;
  onConfirmCollection: (bookingId: string, amount: number) => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const SettlementsDailyEarnings: React.FC<SettlementsDailyEarningsProps> = ({
  captain,
  activeTrip,
  onConfirmCollection,
  showToast,
}) => {
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [collectedSuccess, setCollectedSuccess] = useState(false);

  // Settlement calculations
  const tripTotal = activeTrip?.finalPaidAmount || activeTrip?.estimatedTotal || 8500;
  const advancePaid = Math.round(tripTotal * 0.25);
  const dropOffBalanceToCollect = Math.max(0, tripTotal - advancePaid);

  // Itemized Earnings Shift Metrics
  const baseTripEarnings = Math.round(captain.todayEarnings * 0.65) || 2730;
  const extraKmIncentives = Math.round(captain.todayEarnings * 0.15) || 630;
  const nightDriverBata = 300;
  const tollParkingReimbursements = 540;
  const netCaptainTakeHomeToday = baseTripEarnings + extraKmIncentives + nightDriverBata + tollParkingReimbursements;

  const handleMarkCashCollected = () => {
    if (!activeTrip) return;
    setCollectedSuccess(true);
    onConfirmCollection(activeTrip.id, dropOffBalanceToCollect);
    showToast(`Drop-off balance ₹${dropOffBalanceToCollect.toLocaleString()} marked as collected from passenger.`, 'success');
  };

  return (
    <div className="space-y-5">
      {/* 1. DROP-OFF CASH / UPI RECONCILIATION CARD */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-red-950 text-white p-5 rounded-3xl border border-red-900/60 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-red-400 block">
              Drop-Off Cash / UPI Collection
            </span>
            <h3 className="text-base font-black text-white">
              Trip #{activeTrip?.id || 'WY-8891'} Settlement
            </h3>
          </div>

          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            {collectedSuccess ? 'Settled' : 'Action Required at Drop-Off'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-slate-400 block text-[10px] font-bold">GROSS TRIP VALUE</span>
            <span className="text-base font-black text-white font-mono mt-0.5 block">
              ₹{tripTotal.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400">Total tariff + all tolls</span>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-slate-400 block text-[10px] font-bold">25% ADVANCE ONLINE</span>
            <span className="text-base font-black text-emerald-400 font-mono mt-0.5 block">
              - ₹{advancePaid.toLocaleString()}
            </span>
            <span className="text-[10px] text-emerald-400/90">Captured by Wayora</span>
          </div>

          <div className="p-3 rounded-2xl bg-red-600/30 border border-red-500/40">
            <span className="text-amber-300 block text-[10px] font-bold uppercase tracking-wider">
              75% TO COLLECT (CASH/UPI)
            </span>
            <span className="text-xl font-black text-amber-300 font-mono mt-0.5 block">
              ₹{dropOffBalanceToCollect.toLocaleString()}
            </span>
            <span className="text-[10px] text-white/80">Collect from guest</span>
          </div>
        </div>

        {/* Collection Actions */}
        <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
          <button
            type="button"
            onClick={handleMarkCashCollected}
            disabled={collectedSuccess}
            className={`flex-1 py-3 px-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 cursor-pointer transition-all ${
              collectedSuccess
                ? 'bg-emerald-600 text-white cursor-default'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{collectedSuccess ? 'Balance Confirmed Collected' : `Confirm ₹${dropOffBalanceToCollect.toLocaleString()} Collected in Cash`}</span>
          </button>

          <button
            type="button"
            onClick={() => setQrModalOpen(true)}
            className="py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <QrCode className="w-4 h-4" />
            <span>Show UPI QR Code</span>
          </button>
        </div>
      </div>

      {/* 2. ITEMIZED DAILY EARNINGS BREAKDOWN */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-red-600" />
              <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
                Today's Shift Earnings Breakdown
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Net earnings, driver allowances, and approved toll reimbursements.
            </p>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 font-bold block">NET TAKE-HOME TODAY</span>
            <span className="text-base font-black text-emerald-600 font-mono">
              ₹{netCaptainTakeHomeToday.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl bg-slate-50/50 text-xs">
          <div className="p-3.5 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-900 block">Base Trip Earnings</span>
              <span className="text-[10px] text-slate-500">Outstation round-trip base chauffeur quota</span>
            </div>
            <span className="font-mono font-bold text-slate-900">₹{baseTripEarnings.toLocaleString()}</span>
          </div>

          <div className="p-3.5 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-900 block">Extra KM & Overtime Incentive</span>
              <span className="text-[10px] text-slate-500">Bonus for mileage beyond package allowance</span>
            </div>
            <span className="font-mono font-bold text-slate-900">+ ₹{extraKmIncentives.toLocaleString()}</span>
          </div>

          <div className="p-3.5 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-900 block">Night Driving Driver Bata (22:00 – 06:00)</span>
              <span className="text-[10px] text-slate-500">Fixed overnight highway bata allowance</span>
            </div>
            <span className="font-mono font-bold text-slate-900">+ ₹{nightDriverBata}</span>
          </div>

          <div className="p-3.5 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-900 block">Approved Toll & Parking Reimbursements</span>
              <span className="text-[10px] text-slate-500">Recredited to captain settlement ledger</span>
            </div>
            <span className="font-mono font-bold text-emerald-600">+ ₹{tollParkingReimbursements}</span>
          </div>
        </div>
      </div>

      {/* 3. BANK PAYOUT LEDGER CARD */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-red-600" />
            <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">
              Direct Bank Payout Ledger
            </h4>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
            Direct NEFT Verified
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 font-mono block">BENEFICIARY BANK ACCOUNT</span>
            <span className="font-bold text-slate-900 block">HDFC Bank Limited</span>
            <span className="font-mono text-slate-600 text-[11px] block">A/C: ••••••••••4491 · IFSC: HDFC0001234</span>
          </div>

          <div className="sm:text-right">
            <span className="text-[10px] text-slate-400 font-mono block">PAYOUT FREQUENCY</span>
            <span className="font-bold text-slate-900 block">Every Tuesday Weekly Batch</span>
            <span className="text-[11px] text-emerald-600 font-semibold block">Next Batch: 03 Nov 2026</span>
          </div>
        </div>
      </div>

      {/* UPI QR CODE MODAL */}
      {qrModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 border border-slate-200 shadow-2xl space-y-4 text-center">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="font-bold text-sm text-slate-900">Scan to Pay Captain</h4>
              <button
                type="button"
                onClick={() => setQrModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-center gap-3">
              <div className="w-48 h-48 bg-white border border-slate-300 rounded-xl p-2 shadow-inner flex items-center justify-center">
                {/* Simulated QR Pattern */}
                <div className="w-full h-full bg-slate-900 rounded-lg flex items-center justify-center text-white font-mono text-xs p-4 text-center">
                  [UPI QR]
                  <br />
                  wayora.driver.cpt101@hdfcbank
                </div>
              </div>

              <div>
                <span className="text-slate-500 text-[11px] block">Exact Payable Amount</span>
                <span className="text-xl font-black text-slate-900 font-mono">
                  ₹{dropOffBalanceToCollect.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Accepts Google Pay, PhonePe, Paytm, BHIM UPI
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setQrModalOpen(false);
                handleMarkCashCollected();
              }}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/30 cursor-pointer"
            >
              Payment Received via UPI
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

