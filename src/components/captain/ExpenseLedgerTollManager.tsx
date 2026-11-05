import React, { useState } from 'react';
import { CaptainProfile, CaptainExpenseEntry } from '../../types';
import {
  CreditCard, DollarSign, Plus, CheckCircle2, 
  Camera, FileText, Upload, Clock, RefreshCw, 
  MapPin, ShieldCheck, AlertCircle, X, ChevronRight, Check
} from 'lucide-react';

interface ExpenseLedgerTollManagerProps {
  captain: CaptainProfile;
  onRechargeFastag: () => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const ExpenseLedgerTollManager: React.FC<ExpenseLedgerTollManagerProps> = ({
  captain,
  onRechargeFastag,
  showToast,
}) => {
  const [fastagBalance, setFastagBalance] = useState<number>(captain.fastagBalance || 3420);
  const [isRecharging, setIsRecharging] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);

  // New Expense Form State
  const [category, setCategory] = useState<CaptainExpenseEntry['category']>('State Border Tax');
  const [amount, setAmount] = useState<number>(450);
  const [notes, setNotes] = useState('Karnataka Border Commercial Entry Tax permit receipt');
  const [photoUrl, setPhotoUrl] = useState('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80');

  // Simulated Plazas on NH44
  const tollPlazaHistory = [
    { name: 'Raikal Toll Plaza (NH44)', km: 'Km 62', deduction: 85, time: '08:42 AM', tagId: 'FASTAG-TS09-8819' },
    { name: 'Jadcherla Toll Plaza (NH44)', km: 'Km 114', deduction: 95, time: '09:28 AM', tagId: 'FASTAG-TS09-8819' },
    { name: 'Pullur Toll Plaza (Kurnool)', km: 'Km 205', deduction: 125, time: '11:15 AM', tagId: 'FASTAG-TS09-8819' },
    { name: 'Alipiri Foothill Toll (Tirupati)', km: 'Km 420', deduction: 65, time: '02:40 PM', tagId: 'FASTAG-TS09-8819' },
  ];

  // Out of pocket logger items
  const [expenseLedger, setExpenseLedger] = useState<CaptainExpenseEntry[]>([
    {
      id: 'exp-101',
      category: 'State Border Tax',
      amount: 450,
      receiptPhotoUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
      notes: 'Andhra Pradesh Commercial Border Entry Tax Paid at Alipiri Checkpost',
      status: 'Approved & Credited',
      timestamp: 'Today, 10:30 AM',
    },
    {
      id: 'exp-102',
      category: 'Airport Parking',
      amount: 200,
      receiptPhotoUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
      notes: 'RGIA Airport Domestic Terminal Commercial Cab Parking (2 Hours)',
      status: 'Approved & Credited',
      timestamp: 'Yesterday, 04:15 PM',
    },
  ]);

  const handleQuickRecharge = () => {
    setIsRecharging(true);
    setTimeout(() => {
      setFastagBalance((prev) => prev + 1000);
      captain.fastagBalance = fastagBalance + 1000;
      setIsRecharging(false);
      onRechargeFastag();
      showToast('₹1,000 topped up to Commercial Fastag Wallet via Central Dispatch.', 'success');
    }, 500);
  };

  const handleAddExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0) {
      showToast('Please enter a valid expense amount.', 'error');
      return;
    }

    const newEntry: CaptainExpenseEntry = {
      id: `exp-${Date.now().toString(36)}`,
      category,
      amount,
      notes,
      receiptPhotoUrl: photoUrl,
      status: 'Pending Dispatch Review',
      timestamp: 'Just now',
    };

    setExpenseLedger((prev) => [newEntry, ...prev]);
    setIsAddExpenseOpen(false);
    showToast(`Out-of-pocket claim for ₹${amount} submitted for instant dispatch reimbursement.`, 'success');
  };

  return (
    <div className="space-y-5">
      {/* 1. FASTAG HIGHWAY TOLL METER & DEDUCTION SIMULATION */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
                Commercial FASTag Toll Meter
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Automated highway electronic deductions linked to Bank Vehicle Wallet.
            </p>
          </div>

          <button
            type="button"
            onClick={handleQuickRecharge}
            disabled={isRecharging}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto cursor-pointer transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRecharging ? 'animate-spin' : ''}`} />
            <span>{isRecharging ? 'Recharging...' : '+ Quick Top-Up ₹1,000'}</span>
          </button>
        </div>

        {/* Balance Status Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-mono block">COMMERCIAL TAG ID</span>
            <span className="font-mono font-bold text-white text-sm">FASTAG-TS09-8819</span>
            <span className="text-[11px] text-emerald-400 block mt-0.5">National Electronic Toll Pass OK</span>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 block font-bold">AVAILABLE BALANCE</span>
            <span className="text-xl font-black text-emerald-400 font-mono">
              ₹{fastagBalance.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Recent Highway Deductions List */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
            Recent Corridor Plaza Deductions
          </span>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/50">
            {tollPlazaHistory.map((item, idx) => (
              <div key={idx} className="p-3 flex items-center justify-between text-xs hover:bg-white transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px]">
                    NH
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 text-xs">{item.name}</h5>
                    <span className="text-[10px] text-slate-500">{item.km} · {item.time}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-mono font-bold text-red-600 block">- ₹{item.deduction}</span>
                  <span className="text-[10px] text-slate-400">Automated</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. ON-ROAD OUT-OF-POCKET EXPENSE LOGGER */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-red-600" />
              <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
                Out-of-Pocket Expense Logger
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Instant reimbursement claim for border taxes, parking slips, and physical tolls.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAddExpenseOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-red-600/25 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Log Expense</span>
          </button>
        </div>

        {/* Expense Items List */}
        <div className="space-y-3">
          {expenseLedger.map((exp) => (
            <div
              key={exp.id}
              className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-start gap-3">
                <img
                  src={exp.receiptPhotoUrl}
                  alt={exp.category}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{exp.category}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      exp.status === 'Approved & Credited'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {exp.status}
                    </span>
                  </div>
                  <p className="text-slate-500 text-[11px] mt-0.5">{exp.notes}</p>
                  <span className="text-slate-400 text-[10px] block mt-1">{exp.timestamp}</span>
                </div>
              </div>

              <div className="sm:text-right shrink-0">
                <span className="text-[10px] text-slate-400 block font-bold">CLAIM AMOUNT</span>
                <span className="font-mono font-bold text-slate-900 text-sm">₹{exp.amount.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. ADD EXPENSE MODAL */}
      {isAddExpenseOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <FileText className="w-4 h-4 text-red-600" />
                <span>Log On-Road Expense Receipt</span>
              </div>
              <button
                type="button"
                onClick={() => setIsAddExpenseOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddExpenseSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Expense Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-semibold focus:outline-none focus:border-red-600 focus:bg-white"
                >
                  <option value="State Border Tax">State Border Entry Tax (AP/KA/TN/MH/DL)</option>
                  <option value="Physical Toll">Physical Toll Plaza Receipt</option>
                  <option value="Airport Parking">Airport Commercial Parking Ticket</option>
                  <option value="Fuel Slip">Emergency Fuel / AdBlue Slip</option>
                  <option value="Emergency Repair">Emergency Puncture / Tire Repair</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Amount Paid (₹) *
                </label>
                <input
                  type="number"
                  required
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  placeholder="e.g. 450"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono font-bold focus:outline-none focus:border-red-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Location / Notes
                </label>
                <input
                  type="text"
                  required
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Alipiri checkpost border permit tax"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white"
                />
              </div>

              {/* Receipt Image Attachment Preview */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Receipt Photo Snap *</span>
                  <span className="text-emerald-600 font-bold text-[10px]">Photo Attached</span>
                </label>
                <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-video max-h-32">
                  <img
                    src={photoUrl}
                    alt="Receipt"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-slate-950/30 flex items-center justify-center text-white text-[11px] font-bold gap-1">
                    <Camera className="w-3.5 h-3.5" />
                    <span>Receipt Snap</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddExpenseOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-md shadow-red-600/30"
                >
                  Submit For Reimbursement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

