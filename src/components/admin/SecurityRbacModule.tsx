import React, { useState } from 'react';
import { AuditLogEntry, AdminRole } from '../../types';
import {
  ShieldCheck, Lock, UserCheck, ShieldAlert, Download, 
  Upload, RefreshCw, KeyRound, CheckCircle2, AlertTriangle, 
  Search, Filter, Clock, Eye, FileCode, Check
} from 'lucide-react';

interface SecurityRbacModuleProps {
  auditLogs: AuditLogEntry[];
  currentRole: AdminRole;
  onChangeRole: (role: AdminRole) => void;
  onDownloadBackup: () => void;
  onRestoreBackup: (file: File) => void;
  onResetDefaults: () => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const SecurityRbacModule: React.FC<SecurityRbacModuleProps> = ({
  auditLogs,
  currentRole,
  onChangeRole,
  onDownloadBackup,
  onRestoreBackup,
  onResetDefaults,
  showToast,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'rbac' | 'audit' | 'portability'>('rbac');
  const [logSearch, setLogSearch] = useState('');
  const [logSeverityFilter, setLogSeverityFilter] = useState<'all' | 'info' | 'warning' | 'critical'>('all');

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSeverity = logSeverityFilter === 'all' || log.severity === logSeverityFilter;
    const matchesSearch =
      log.actor.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.module.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.action.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.details.toLowerCase().includes(logSearch.toLowerCase());
    return matchesSeverity && matchesSearch;
  });

  const rolesList: { role: AdminRole; desc: string; permissions: string[] }[] = [
    {
      role: 'Super Admin',
      desc: 'Complete administrative authorization across dispatch, fleet, chauffeur lifecycle, tariffs, finances, and system backups.',
      permissions: [
        'Full read & write across all 7 dashboard modules',
        'Approve/Suspend chauffeurs & reset driver security PINs',
        'Update base tariff matrix and surcharge percentages',
        'Authorize manual dispatch overrides and route breakdown reassignments',
        'Disburse chauffeur payouts and download tax invoices',
        'Export & restore atomic database JSON snapshots',
      ],
    },
    {
      role: 'Fleet Dispatcher',
      desc: 'Operational management of active trips, real-time telemetry, emergency SOS responses, and chauffeur rosters.',
      permissions: [
        'Live fleet radar & interactive map tracking',
        'Assign & reassign chauffeurs to bookings',
        'Inspect and resolve SOS and breakdown alerts',
        'Schedule vehicle maintenance downtime',
        'Verify pre/post trip odometer readings and review discrepancies',
      ],
    },
    {
      role: 'Accounts & Finance',
      desc: 'Financial reconciliations, GST compliance invoices, FASTag expense tracking, and promo coupon controls.',
      permissions: [
        'Generate and print SAC 9966 GST tax invoices',
        'Reconcile 25% online advance gate payments against cash balances',
        'Calculate net chauffeur payouts and disburse settlements',
        'Manage discount coupons and customer referral codes',
        'Audit tariff rules and highway entry toll matrices',
      ],
    },
    {
      role: 'Support Staff',
      desc: 'Customer reservation assistance, trip status checks, and passenger communication helpline.',
      permissions: [
        'View customer bookings and travel dates',
        'Inspect curated tour itineraries and inclusion details',
        'Escalate emergency SOS tickets to active dispatchers',
        'Read-only access to vehicle directory and tariffs',
      ],
    },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onRestoreBackup(file);
  };

  return (
    <div className="space-y-6">

      {/* TOP SUB-TABS NAVIGATION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-200/90 shadow-xs">
        <div className="flex flex-wrap gap-2 text-xs font-bold">
          <button
            onClick={() => setActiveSubTab('rbac')}
            className={`px-4 py-2 rounded-xl cursor-pointer transition-all flex items-center gap-1.5 ${
              activeSubTab === 'rbac' ? 'bg-red-600 text-white shadow-xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Role-Based Access Control (RBAC)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('audit')}
            className={`px-4 py-2 rounded-xl cursor-pointer transition-all flex items-center gap-1.5 ${
              activeSubTab === 'audit' ? 'bg-red-600 text-white shadow-xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Immutable Audit Logs ({auditLogs.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('portability')}
            className={`px-4 py-2 rounded-xl cursor-pointer transition-all flex items-center gap-1.5 ${
              activeSubTab === 'portability' ? 'bg-red-600 text-white shadow-xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Encrypted JSON Backup & Disaster Recovery</span>
          </button>
        </div>

        {/* Current Active Persona Badge */}
        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-2xl border border-slate-200 text-xs">
          <span className="text-slate-500 font-medium">Testing As:</span>
          <span className="font-extrabold text-red-700 bg-red-100/80 px-2 py-0.5 rounded-lg border border-red-200">
            {currentRole}
          </span>
        </div>
      </div>

      {/* SUB-TAB 1: RBAC CONTROLS */}
      {activeSubTab === 'rbac' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-black text-slate-900">Operator Role Switcher & Security Persona</h3>
              <p className="text-xs text-slate-500">
                Switch admin persona to test granular permission gating and view restrictions.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {rolesList.map((r) => (
                <div
                  key={r.role}
                  onClick={() => {
                    onChangeRole(r.role);
                    showToast(`Admin dashboard persona switched to ${r.role}`, 'info');
                  }}
                  className={`rounded-2xl p-4 border transition-all cursor-pointer flex flex-col justify-between ${
                    currentRole === r.role
                      ? 'border-red-600 bg-red-50/40 ring-2 ring-red-500/20 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-900 text-sm">{r.role}</span>
                      {currentRole === r.role && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-600 text-white">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2">{r.desc}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 mt-3 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Permissions Matrix:</span>
                    <ul className="space-y-1 text-[11px] text-slate-700">
                      {r.permissions.slice(0, 3).map((perm, pi) => (
                        <li key={pi} className="flex items-start gap-1">
                          <Check className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{perm}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: IMMUTABLE AUDIT LOGS */}
      {activeSubTab === 'audit' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-black text-slate-900">Immutable System Audit Trail & Security Ledger</h3>
              <p className="text-xs text-slate-500">
                Chronological audit tracking for tariff alterations, KYC approvals, manual ride overrides, and refunds.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-[200px]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search actor, action, details..."
                  value={logSearch}
                  onChange={(e) => setLogSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              <select
                value={logSeverityFilter}
                onChange={(e) => setLogSeverityFilter(e.target.value as any)}
                className="py-1.5 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold"
              >
                <option value="all">All Severities</option>
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Log ID</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Actor & Role</th>
                  <th className="py-3 px-4">Module</th>
                  <th className="py-3 px-4">Action Taken</th>
                  <th className="py-3 px-4">Details</th>
                  <th className="py-3 px-4 text-right">Severity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-rose-50/30 transition-colors">
                    <td className="py-3 px-4 font-mono font-extrabold text-red-600">{log.id}</td>
                    <td className="py-3 px-4 font-medium text-slate-600 whitespace-nowrap">{log.timestamp}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{log.actor}</div>
                      <div className="text-[10px] text-slate-500">{log.role}</div>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-700">{log.module}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{log.action}</td>
                    <td className="py-3 px-4 text-slate-600 max-w-sm">{log.details}</td>
                    <td className="py-3 px-4 text-right">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        log.severity === 'critical' ? 'bg-red-100 text-red-700 font-extrabold animate-pulse' :
                        log.severity === 'warning' ? 'bg-amber-100 text-amber-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {log.severity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: DATA PORTABILITY & BACKUP */}
      {activeSubTab === 'portability' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-6 max-w-3xl">
          <div>
            <h3 className="text-base font-black text-slate-900">Encrypted Database JSON Backup & Atomic Recovery</h3>
            <p className="text-xs text-slate-500">
              1-click system state snapshots for disaster recovery, auditing compliance, and staging environments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center gap-2">
                <Download className="w-5 h-5 text-red-600" />
                <h4 className="font-black text-slate-900 text-sm">Download System Snapshot</h4>
              </div>
              <p className="text-xs text-slate-600">
                Exports all bookings, vehicles, tour itineraries, tariffs, captains, and company settings as an encrypted JSON bundle.
              </p>
              <button
                onClick={onDownloadBackup}
                className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs cursor-pointer shadow-sm flex items-center justify-center gap-1.5 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Export JSON Database</span>
              </button>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-red-600" />
                <h4 className="font-black text-slate-900 text-sm">Restore from Snapshot</h4>
              </div>
              <p className="text-xs text-slate-600">
                Upload a verified JSON snapshot to atomically restore all bookings, tariffs, and fleet registry.
              </p>
              <label className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs cursor-pointer shadow-sm flex items-center justify-center gap-1.5 transition-all">
                <Upload className="w-4 h-4" />
                <span>Upload & Restore JSON</span>
                <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-red-200 bg-red-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h5 className="font-black text-red-900 text-xs">Reset All Catalogs to Factory Defaults</h5>
              <p className="text-[11px] text-red-700">Clears custom edits and reverts to initial high-fidelity seeded dataset.</p>
            </div>
            <button
              onClick={() => {
                if (confirm('Are you sure you want to revert all tariffs, packages, and bookings to default?')) {
                  onResetDefaults();
                }
              }}
              className="px-3.5 py-1.5 bg-red-800 hover:bg-red-900 text-white text-xs font-bold rounded-xl cursor-pointer whitespace-nowrap shadow-xs"
            >
              Factory Reset
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

