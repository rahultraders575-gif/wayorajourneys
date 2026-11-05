import React, { useState, useEffect } from 'react';
import { useCms } from '../context/CmsContext';
import {
  Booking, BookingStatus, TourPackage, Vehicle, 
  AdminRole, EmergencyAlert, FleetTelemetryVehicle, 
  OdometerAuditRecord, CaptainSettlementRecord, 
  MaintenanceLog, BaseTariffRule, HourlyRentalSlot, 
  SurchargeRule, GSTTaxInvoice, PromoCoupon, AuditLogEntry, CaptainProfile
} from '../types';
import {
  INITIAL_TELEMETRY_VEHICLES,
  INITIAL_EMERGENCY_ALERTS,
  INITIAL_ODOMETER_AUDITS,
  INITIAL_CAPTAIN_SETTLEMENTS,
  INITIAL_MAINTENANCE_LOGS,
  INITIAL_BASE_TARIFFS,
  INITIAL_HOURLY_SLOTS,
  INITIAL_SURCHARGES,
  INITIAL_GST_INVOICES,
  INITIAL_PROMO_COUPONS,
  INITIAL_AUDIT_LOGS,
} from '../data/adminInitialData';

// 7 Dedicated Modules
import { DispatchModule } from '../components/admin/DispatchModule';
import { CaptainManagementModule } from '../components/admin/CaptainManagementModule';
import { FleetAssetModule } from '../components/admin/FleetAssetModule';
import { TariffsEngineModule } from '../components/admin/TariffsEngineModule';
import { PackagesItineraryModule } from '../components/admin/PackagesItineraryModule';
import { BillingFinanceModule } from '../components/admin/BillingFinanceModule';
import { SecurityRbacModule } from '../components/admin/SecurityRbacModule';

import {
  Navigation, UserCheck, Car, Tag, Compass, 
  DollarSign, Shield, ShieldAlert, Download, Upload, 
  RefreshCw, Clock, AlertTriangle, CheckCircle2, 
  X, Save, Edit2, Phone, Calendar, ArrowRight
} from 'lucide-react';

export type AdminModuleTab =
  | 'dispatch'
  | 'captains'
  | 'fleet'
  | 'tariffs'
  | 'packages'
  | 'billing'
  | 'security';

export const CmsDashboard: React.FC = () => {
  const {
    bookings,
    updateBookingStatus,
    assignChauffeur,
    packages,
    addPackage,
    updatePackage,
    deletePackage,
    togglePackageFeatured,
    vehicles,
    updateVehicle,
    addVehicle,
    deleteVehicle,
    captains,
    settings,
    updateSettings,
    resetToDefault,
    exportDatabaseJson,
    importDatabaseJson,
    showToast,
  } = useCms();

  // Active Module Tab
  const [activeTab, setActiveTab] = useState<AdminModuleTab>('dispatch');

  // RBAC Role
  const [currentRole, setCurrentRole] = useState<AdminRole>('Super Admin');

  // Local state for extended enterprise modules (persisted with initial fallback)
  const [telemetryVehicles, setTelemetryVehicles] = useState<FleetTelemetryVehicle[]>(() => {
    try {
      const saved = localStorage.getItem('wayora_admin_telemetry_v1');
      return saved ? JSON.parse(saved) : INITIAL_TELEMETRY_VEHICLES;
    } catch {
      return INITIAL_TELEMETRY_VEHICLES;
    }
  });

  const [emergencyAlerts, setEmergencyAlerts] = useState<EmergencyAlert[]>(() => {
    try {
      const saved = localStorage.getItem('wayora_admin_emergency_v1');
      return saved ? JSON.parse(saved) : INITIAL_EMERGENCY_ALERTS;
    } catch {
      return INITIAL_EMERGENCY_ALERTS;
    }
  });

  const [odometerAudits, setOdometerAudits] = useState<OdometerAuditRecord[]>(INITIAL_ODOMETER_AUDITS);
  const [settlements, setSettlements] = useState<CaptainSettlementRecord[]>(INITIAL_CAPTAIN_SETTLEMENTS);
  const [maintenanceLogs, setMaintenanceLogs] = useState<MaintenanceLog[]>(INITIAL_MAINTENANCE_LOGS);
  const [tariffs, setTariffs] = useState<BaseTariffRule[]>(INITIAL_BASE_TARIFFS);
  const [hourlySlots, setHourlySlots] = useState<HourlyRentalSlot[]>(INITIAL_HOURLY_SLOTS);
  const [surcharges, setSurcharges] = useState<SurchargeRule[]>(INITIAL_SURCHARGES);
  const [invoices, setInvoices] = useState<GSTTaxInvoice[]>(INITIAL_GST_INVOICES);
  const [coupons, setCoupons] = useState<PromoCoupon[]>(INITIAL_PROMO_COUPONS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);

  // Manual Override Modal
  const [overrideBooking, setOverrideBooking] = useState<Booking | null>(null);
  const [overrideTime, setOverrideTime] = useState('');
  const [overrideDate, setOverrideDate] = useState('');
  const [overrideDriver, setOverrideDriver] = useState('');
  const [overrideCar, setOverrideCar] = useState('');
  const [overrideStatus, setOverrideStatus] = useState<BookingStatus>('Assigned');
  const [overrideNotes, setOverrideNotes] = useState('');

  // Sync state helpers
  const appendAuditLog = (module: string, action: string, details: string, severity: 'info' | 'warning' | 'critical' = 'info') => {
    const newLog: AuditLogEntry = {
      id: `AUD-${Date.now().toString().slice(-4)}`,
      timestamp: 'Just now',
      actor: `${currentRole} (Console)`,
      role: currentRole,
      module,
      action,
      details,
      severity,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Dispatch Handlers
  const handleUpdateBookingStatus = (id: string, status: BookingStatus) => {
    updateBookingStatus(id, status);
    appendAuditLog('Live Operations', `Booking ${status}`, `Booking ${id} transitioned to ${status}.`, 'info');
  };

  const handleAssignChauffeur = (id: string, driver: string, carNumber: string) => {
    assignChauffeur(id, driver, carNumber);
    appendAuditLog('Live Operations', 'Chauffeur Assigned', `Assigned ${driver} (${carNumber}) to booking ${id}.`, 'info');
  };

  const handleResolveAlert = (alertId: string) => {
    setEmergencyAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, status: 'Resolved' } : a))
    );
    appendAuditLog('Live Operations', 'Emergency Alert Resolved', `Alert ${alertId} marked as Resolved by ${currentRole}.`, 'warning');
    showToast(`Emergency Incident ${alertId} marked resolved.`, 'success');
  };

  // Manual Override Handlers
  const handleOpenOverrideModal = (b: Booking) => {
    setOverrideBooking(b);
    setOverrideTime(b.travelTime);
    setOverrideDate(b.travelDate);
    setOverrideDriver(b.assignedDriver || '');
    setOverrideCar(b.assignedCarNumber || '');
    setOverrideStatus(b.status);
    setOverrideNotes(b.notes || '');
  };

  const handleSaveOverrideSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideBooking) return;

    if (overrideDriver && overrideCar && (overrideDriver !== overrideBooking.assignedDriver || overrideCar !== overrideBooking.assignedCarNumber)) {
      assignChauffeur(overrideBooking.id, overrideDriver, overrideCar);
    }

    if (overrideStatus !== overrideBooking.status) {
      updateBookingStatus(overrideBooking.id, overrideStatus);
    }

    appendAuditLog(
      'Live Operations',
      'Manual Dispatch Override',
      `Manual adjustments applied to ${overrideBooking.id}: Time (${overrideTime}), Driver (${overrideDriver || 'None'}), Status (${overrideStatus}).`,
      'warning'
    );

    showToast(`Manual override saved for booking ${overrideBooking.id}`, 'success');
    setOverrideBooking(null);
  };

  // Captain Handlers
  const handleUpdateCaptainStatus = (captainId: string, status: CaptainProfile['verificationStatus']) => {
    appendAuditLog('Captain Management', 'KYC Status Update', `Captain ${captainId} verification set to ${status}.`, 'info');
  };

  const handleUpdateCaptainDuty = (captainId: string, duty: CaptainProfile['dutyStatus']) => {
    appendAuditLog('Captain Management', 'Duty Status Changed', `Captain ${captainId} duty toggled to ${duty}.`, 'info');
  };

  const handleResetCaptainPin = (captainId: string, newPin: string) => {
    appendAuditLog('Captain Management', 'Security PIN Reset', `4-digit security PIN reset for captain ${captainId}.`, 'warning');
  };

  const handleSettlePayout = (captainId: string) => {
    setSettlements((prev) =>
      prev.map((s) => (s.captainId === captainId ? { ...s, payoutStatus: 'Paid', lastPayoutDate: 'Just now' } : s))
    );
    appendAuditLog('Billing & Settlements', 'Chauffeur Payout Disbursed', `Direct settlement payout cleared for captain ${captainId}.`, 'info');
  };

  // Fleet Handlers
  const handleAddMaintenanceLog = (log: Omit<MaintenanceLog, 'id'>) => {
    const newId = `MNT-${Date.now().toString().slice(-3)}`;
    const fullLog: MaintenanceLog = { ...log, id: newId };
    setMaintenanceLogs((prev) => [fullLog, ...prev]);
    appendAuditLog('Fleet Asset', 'Maintenance Scheduled', `Service log ${newId} logged for vehicle ${log.vehicleNumber}.`, 'info');
  };

  const handleUpdateMaintenanceLogStatus = (id: string, status: MaintenanceLog['status']) => {
    setMaintenanceLogs((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status } : l))
    );
    appendAuditLog('Fleet Asset', 'Maintenance Status Updated', `Log ${id} updated to ${status}.`, 'info');
  };

  // Tariff Handlers
  const handleUpdateTariff = (tier: string, updated: Partial<BaseTariffRule>) => {
    setTariffs((prev) =>
      prev.map((t) => (t.vehicleTier === tier ? { ...t, ...updated } : t))
    );
    appendAuditLog('Tariffs & Geo Engine', 'Base Tariff Revised', `Updated tariff parameters for ${tier}.`, 'warning');
  };

  const handleUpdateHourlySlot = (id: string, updated: Partial<HourlyRentalSlot>) => {
    setHourlySlots((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updated } : s))
    );
    appendAuditLog('Tariffs & Geo Engine', 'Hourly Package Updated', `Updated slot ${id}.`, 'info');
  };

  const handleToggleSurcharge = (id: string) => {
    setSurcharges((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s))
    );
    appendAuditLog('Tariffs & Geo Engine', 'Surcharge Rule Toggled', `Toggled rule ${id}.`, 'info');
  };

  // Promo Handlers
  const handleAddCoupon = (c: Omit<PromoCoupon, 'id' | 'usageCount'>) => {
    const newCoupon: PromoCoupon = {
      ...c,
      id: `cpn-${Date.now().toString().slice(-4)}`,
      usageCount: 0,
    };
    setCoupons((prev) => [newCoupon, ...prev]);
    appendAuditLog('Billing & Promotions', 'Coupon Created', `Created promo code ${c.code}.`, 'info');
  };

  const handleToggleCoupon = (id: string) => {
    setCoupons((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c))
    );
    appendAuditLog('Billing & Promotions', 'Coupon State Toggled', `Toggled coupon ${id}.`, 'info');
  };

  // Backup & Restore Handlers
  const handleDownloadBackup = () => {
    const jsonStr = exportDatabaseJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wayora-enterprise-cms-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    appendAuditLog('Security & Portability', 'Database Backup Exported', 'Full encrypted JSON snapshot downloaded.', 'info');
    showToast('Database JSON backup downloaded', 'success');
  };

  const handleRestoreBackup = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importDatabaseJson(content);
      if (success) {
        appendAuditLog('Security & Portability', 'Database Snapshot Restored', `Restored from file ${file.name}.`, 'warning');
      }
    };
    reader.readAsText(file);
  };

  const handleResetDefaults = () => {
    resetToDefault();
    setTelemetryVehicles(INITIAL_TELEMETRY_VEHICLES);
    setEmergencyAlerts(INITIAL_EMERGENCY_ALERTS);
    setTariffs(INITIAL_BASE_TARIFFS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    appendAuditLog('Security & Portability', 'Factory Reset Executed', 'All catalogs and settings reverted to defaults.', 'critical');
    showToast('System reverted to factory defaults', 'info');
  };

  // Key KPI Numbers
  const activeTripsCount = bookings.filter((b) => b.status === 'En Route').length;
  const pendingDispatchCount = bookings.filter((b) => b.status === 'New' || b.status === 'Confirmed').length;
  const onDutyCaptainsCount = captains.filter((c) => c.dutyStatus === 'On Duty' || c.dutyStatus === 'On Trip').length;
  const activeSosCount = emergencyAlerts.filter((a) => a.status !== 'Resolved').length;
  const totalGmvEstimate = bookings.reduce((sum, b) => sum + (b.estimatedTotal || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7 bg-slate-50 text-slate-900 transition-colors">

      {/* TOP BANNER & OPERATOR PERSONA COCKPIT */}
      <div className="bg-gradient-to-r from-red-800 via-rose-800 to-red-700 text-white rounded-3xl p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-xl border border-red-500/30">
        <div className="flex items-center gap-4">
          <img
            src="/images/wayora-logo-dark.jpg"
            alt="Wayora Journeys Logo"
            className="w-13 h-13 rounded-2xl object-contain bg-black shadow-md ring-2 ring-white/40 p-1"
          />
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">Wayora Command & Admin Console</h1>
              <span className="text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white text-red-700 font-extrabold shadow-xs">
                Red Edition
              </span>
            </div>
            <p className="text-xs text-rose-100 mt-0.5 max-w-xl">
              Enterprise Central Dashboard: Fleet Telemetry, Chauffeur Lifecycle, Multi-Day Itineraries, Tariffs & GST Billing.
            </p>
          </div>
        </div>

        {/* Global Quick Action & RBAC Persona Switcher */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-black/30 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-white/20 flex items-center gap-2 text-xs">
            <span className="text-rose-200 text-[11px] font-semibold">Role:</span>
            <select
              value={currentRole}
              onChange={(e) => {
                const nextRole = e.target.value as AdminRole;
                setCurrentRole(nextRole);
                appendAuditLog('Security & RBAC', 'Persona Switched', `Active dashboard persona set to ${nextRole}.`, 'info');
                showToast(`Switched active view to ${nextRole}`, 'info');
              }}
              className="bg-transparent text-white font-extrabold cursor-pointer focus:outline-none"
            >
              <option value="Super Admin" className="text-slate-900">Super Admin</option>
              <option value="Fleet Dispatcher" className="text-slate-900">Fleet Dispatcher</option>
              <option value="Accounts & Finance" className="text-slate-900">Accounts & Finance</option>
              <option value="Support Staff" className="text-slate-900">Support Staff</option>
            </select>
          </div>

          <button
            onClick={handleDownloadBackup}
            className="px-3.5 py-2 rounded-2xl bg-white hover:bg-rose-50 text-red-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
            title="Export Full System State Snapshot"
          >
            <Download className="w-3.5 h-3.5 text-red-600" />
            <span className="hidden sm:inline">Export</span> Backup
          </button>
        </div>
      </div>

      {/* TOP KPI METRICS STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-bold tracking-wider">Active Trips</span>
            <Car className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="text-xl font-black text-slate-900">{activeTripsCount}</div>
          <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            En Route on Highway
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-bold tracking-wider">Pending Dispatch</span>
            <Clock className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-xl font-black text-slate-900">{pendingDispatchCount}</div>
          <span className="text-[10px] font-semibold text-amber-600">
            Awaiting Chauffeur Assign
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-bold tracking-wider">On-Duty Captains</span>
            <UserCheck className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <div className="text-xl font-black text-slate-900">{onDutyCaptainsCount}</div>
          <span className="text-[10px] font-semibold text-blue-600">
            Ready for Dispatches
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-bold tracking-wider">Estimated GMV</span>
            <DollarSign className="w-3.5 h-3.5 text-red-600" />
          </div>
          <div className="text-xl font-black text-slate-900">₹{totalGmvEstimate.toLocaleString()}</div>
          <span className="text-[10px] font-semibold text-slate-500">
            {bookings.length} Bookings Total
          </span>
        </div>

        <div className={`p-4 rounded-2xl border shadow-2xs space-y-1 col-span-2 sm:col-span-1 ${
          activeSosCount > 0 ? 'bg-red-50/80 border-red-300' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-bold tracking-wider text-red-800">SOS & Breakdown</span>
            <ShieldAlert className={`w-3.5 h-3.5 ${activeSosCount > 0 ? 'text-red-600 animate-bounce' : 'text-slate-400'}`} />
          </div>
          <div className={`text-xl font-black ${activeSosCount > 0 ? 'text-red-700' : 'text-slate-900'}`}>
            {activeSosCount}
          </div>
          <span className={`text-[10px] font-bold ${activeSosCount > 0 ? 'text-red-600' : 'text-slate-400'}`}>
            {activeSosCount > 0 ? 'Action Required' : 'All Clear on Route'}
          </span>
        </div>
      </div>

      {/* 7 MODULE TABS NAVIGATION */}
      <div className="flex border-b border-slate-200 overflow-x-auto text-xs font-bold gap-1 sm:gap-2 pb-0.5">
        <button
          onClick={() => setActiveTab('dispatch')}
          className={`pb-3 px-3.5 transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'dispatch'
              ? 'text-red-600 border-b-2 border-red-600'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Navigation className="w-4 h-4" />
          <span>1. Live Dispatch & Radar</span>
        </button>

        <button
          onClick={() => setActiveTab('captains')}
          className={`pb-3 px-3.5 transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'captains'
              ? 'text-red-600 border-b-2 border-red-600'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>2. Captain Lifecycle</span>
        </button>

        <button
          onClick={() => setActiveTab('fleet')}
          className={`pb-3 px-3.5 transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'fleet'
              ? 'text-red-600 border-b-2 border-red-600'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Car className="w-4 h-4" />
          <span>3. Fleet & Compliance</span>
        </button>

        <button
          onClick={() => setActiveTab('tariffs')}
          className={`pb-3 px-3.5 transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'tariffs'
              ? 'text-red-600 border-b-2 border-red-600'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>4. Tariffs & Geo Engine</span>
        </button>

        <button
          onClick={() => setActiveTab('packages')}
          className={`pb-3 px-3.5 transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'packages'
              ? 'text-red-600 border-b-2 border-red-600'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>5. Tour Packages CMS</span>
        </button>

        <button
          onClick={() => setActiveTab('billing')}
          className={`pb-3 px-3.5 transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'billing'
              ? 'text-red-600 border-b-2 border-red-600'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>6. Billing & Invoices</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`pb-3 px-3.5 transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'security'
              ? 'text-red-600 border-b-2 border-red-600'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>7. Security & Audit Trail</span>
        </button>
      </div>

      {/* MODULE RENDER STAGE */}
      <div className="transition-all">
        {activeTab === 'dispatch' && (
          <DispatchModule
            bookings={bookings}
            telemetryVehicles={telemetryVehicles}
            emergencyAlerts={emergencyAlerts}
            currentRole={currentRole}
            onUpdateBookingStatus={handleUpdateBookingStatus}
            onAssignChauffeur={handleAssignChauffeur}
            onResolveAlert={handleResolveAlert}
            onOpenOverrideModal={handleOpenOverrideModal}
            showToast={showToast}
          />
        )}

        {activeTab === 'captains' && (
          <CaptainManagementModule
            captains={captains}
            odometerAudits={odometerAudits}
            settlements={settlements}
            currentRole={currentRole}
            onUpdateCaptainStatus={handleUpdateCaptainStatus}
            onUpdateCaptainDuty={handleUpdateCaptainDuty}
            onResetCaptainPin={handleResetCaptainPin}
            onSettlePayout={handleSettlePayout}
            showToast={showToast}
          />
        )}

        {activeTab === 'fleet' && (
          <FleetAssetModule
            vehicles={vehicles}
            maintenanceLogs={maintenanceLogs}
            currentRole={currentRole}
            onAddVehicle={addVehicle}
            onUpdateVehicle={updateVehicle}
            onDeleteVehicle={deleteVehicle}
            onAddMaintenanceLog={handleAddMaintenanceLog}
            onUpdateMaintenanceLogStatus={handleUpdateMaintenanceLogStatus}
            showToast={showToast}
          />
        )}

        {activeTab === 'tariffs' && (
          <TariffsEngineModule
            tariffs={tariffs}
            hourlySlots={hourlySlots}
            surcharges={surcharges}
            settings={settings}
            currentRole={currentRole}
            onUpdateTariff={handleUpdateTariff}
            onUpdateHourlySlot={handleUpdateHourlySlot}
            onToggleSurcharge={handleToggleSurcharge}
            onUpdateSettings={updateSettings}
            showToast={showToast}
          />
        )}

        {activeTab === 'packages' && (
          <PackagesItineraryModule
            packages={packages}
            currentRole={currentRole}
            onAddPackage={addPackage}
            onUpdatePackage={updatePackage}
            onDeletePackage={deletePackage}
            onToggleFeatured={togglePackageFeatured}
            showToast={showToast}
          />
        )}

        {activeTab === 'billing' && (
          <BillingFinanceModule
            invoices={invoices}
            coupons={coupons}
            settings={settings}
            currentRole={currentRole}
            onAddCoupon={handleAddCoupon}
            onToggleCoupon={handleToggleCoupon}
            showToast={showToast}
          />
        )}

        {activeTab === 'security' && (
          <SecurityRbacModule
            auditLogs={auditLogs}
            currentRole={currentRole}
            onChangeRole={setCurrentRole}
            onDownloadBackup={handleDownloadBackup}
            onRestoreBackup={handleRestoreBackup}
            onResetDefaults={handleResetDefaults}
            showToast={showToast}
          />
        )}
      </div>

      {/* MANUAL OVERRIDE & DISPATCH MODAL */}
      {overrideBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">Manual Override: {overrideBooking.id}</h3>
                <p className="text-xs text-slate-500">{overrideBooking.customerName} ({overrideBooking.customerPhone})</p>
              </div>
              <button
                onClick={() => setOverrideBooking(null)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveOverrideSubmit} className="space-y-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <span className="text-slate-500 font-semibold">Itinerary:</span>
                <p className="font-bold text-slate-900">{overrideBooking.pickupLocation} ➔ {overrideBooking.destination}</p>
                <p className="text-[11px] text-slate-500">{overrideBooking.vehicleName} · Est: ₹{overrideBooking.estimatedTotal.toLocaleString()}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Travel Date</label>
                  <input
                    type="text"
                    required
                    value={overrideDate}
                    onChange={(e) => setOverrideDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Pickup Time</label>
                  <input
                    type="text"
                    required
                    value={overrideTime}
                    onChange={(e) => setOverrideTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Assigned Chauffeur</label>
                  <input
                    type="text"
                    placeholder="e.g. Raju Goud"
                    value={overrideDriver}
                    onChange={(e) => setOverrideDriver(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Assigned Car Number</label>
                  <input
                    type="text"
                    placeholder="e.g. TS 09 UB 4421"
                    value={overrideCar}
                    onChange={(e) => setOverrideCar(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Trip Stage / Status</label>
                <select
                  value={overrideStatus}
                  onChange={(e) => setOverrideStatus(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                >
                  <option value="New">New Request</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Assigned">Chauffeur Assigned</option>
                  <option value="En Route">En Route / In Transit</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Override Dispatch Notes</label>
                <textarea
                  rows={2}
                  placeholder="Reason for manual override or reassignment..."
                  value={overrideNotes}
                  onChange={(e) => setOverrideNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setOverrideBooking(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold cursor-pointer shadow-sm"
                >
                  Apply Override
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
