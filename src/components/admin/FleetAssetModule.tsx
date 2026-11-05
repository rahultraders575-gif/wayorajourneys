import React, { useState } from 'react';
import { Vehicle, MaintenanceLog, AdminRole } from '../../types';
import {
  Car, ShieldCheck, AlertTriangle, Calendar, Plus, 
  Edit2, Trash2, CheckCircle2, Clock, Wrench, FileText, 
  Search, Filter, X, ShieldAlert, Award, AlertCircle
} from 'lucide-react';

interface FleetAssetModuleProps {
  vehicles: Vehicle[];
  maintenanceLogs: MaintenanceLog[];
  currentRole: AdminRole;
  onAddVehicle: (v: Omit<Vehicle, 'id'>) => void;
  onUpdateVehicle: (id: string, v: Partial<Vehicle>) => void;
  onDeleteVehicle: (id: string) => void;
  onAddMaintenanceLog: (log: Omit<MaintenanceLog, 'id'>) => void;
  onUpdateMaintenanceLogStatus: (id: string, status: MaintenanceLog['status']) => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const FleetAssetModule: React.FC<FleetAssetModuleProps> = ({
  vehicles,
  maintenanceLogs,
  currentRole,
  onAddVehicle,
  onUpdateVehicle,
  onDeleteVehicle,
  onAddMaintenanceLog,
  onUpdateMaintenanceLogStatus,
  showToast,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'directory' | 'compliance' | 'maintenance'>('directory');
  const [vehicleSearch, setVehicleSearch] = useState('');
  
  // Vehicle Add/Edit Modal
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);
  const [vName, setVName] = useState('');
  const [vType, setVType] = useState<Vehicle['type']>('Sedan');
  const [vCapacity, setVCapacity] = useState('4 Passengers');
  const [vLuggage, setVLuggage] = useState('3 Large Bags');
  const [vRate, setVRate] = useState(15);
  const [vAllowance, setVAllowance] = useState(400);
  const [vMinKm, setVMinKm] = useState(300);
  const [vImg, setVImg] = useState('');
  const [vPlate, setVPlate] = useState('');
  const [vYear, setVYear] = useState('2024');
  const [vOwnership, setVOwnership] = useState<Vehicle['ownershipType']>('Company Owned');

  // New Maintenance Log Modal
  const [isMntModalOpen, setIsMntModalOpen] = useState(false);
  const [mntVehicleNumber, setMntVehicleNumber] = useState('');
  const [mntServiceType, setMntServiceType] = useState<MaintenanceLog['serviceType']>('Oil & Filter Change');
  const [mntDate, setMntDate] = useState('2026-10-30');
  const [mntOdo, setMntOdo] = useState(45000);
  const [mntCost, setMntCost] = useState(6500);
  const [mntWorkshop, setMntWorkshop] = useState('Authorized Dealership Service Hub');
  const [mntNextKm, setMntNextKm] = useState(55000);

  const isDispatcherOrAdmin = currentRole === 'Super Admin' || currentRole === 'Fleet Dispatcher';

  const filteredVehicles = vehicles.filter((v) => {
    return (
      v.name.toLowerCase().includes(vehicleSearch.toLowerCase()) ||
      v.type.toLowerCase().includes(vehicleSearch.toLowerCase()) ||
      (v.plateNumber && v.plateNumber.toLowerCase().includes(vehicleSearch.toLowerCase()))
    );
  });

  const openNewVehicleModal = () => {
    setEditingVehicleId(null);
    setVName('');
    setVType('Sedan');
    setVCapacity('4 Passengers');
    setVLuggage('3 Large Bags');
    setVRate(15);
    setVAllowance(400);
    setVMinKm(300);
    setVImg('https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=900&q=80');
    setVPlate('TS 09 UB 5566');
    setVYear('2024');
    setVOwnership('Company Owned');
    setIsVehicleModalOpen(true);
  };

  const openEditVehicleModal = (v: Vehicle) => {
    setEditingVehicleId(v.id);
    setVName(v.name);
    setVType(v.type);
    setVCapacity(v.capacity);
    setVLuggage(v.luggage);
    setVRate(v.ratePerKm);
    setVAllowance(v.driverAllowancePerDay);
    setVMinKm(v.minimumKmPerDay);
    setVImg(v.imageUrl);
    setVPlate(v.plateNumber || 'TS 09 UB 0000');
    setVYear(String(v.vehicleYear || '2024'));
    setVOwnership(v.ownershipType || 'Company Owned');
    setIsVehicleModalOpen(true);
  };

  const handleSaveVehicleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingVehicleId) {
      onUpdateVehicle(editingVehicleId, {
        name: vName,
        type: vType,
        capacity: vCapacity,
        luggage: vLuggage,
        ratePerKm: Number(vRate),
        driverAllowancePerDay: Number(vAllowance),
        minimumKmPerDay: Number(vMinKm),
        imageUrl: vImg,
        plateNumber: vPlate,
        vehicleYear: vYear,
        ownershipType: vOwnership,
      });
      showToast(`Vehicle ${vName} updated successfully`, 'success');
    } else {
      onAddVehicle({
        name: vName,
        type: vType,
        capacity: vCapacity,
        luggage: vLuggage,
        ratePerKm: Number(vRate),
        driverAllowancePerDay: Number(vAllowance),
        minimumKmPerDay: Number(vMinKm),
        imageUrl: vImg,
        plateNumber: vPlate,
        vehicleYear: vYear,
        ownershipType: vOwnership,
        features: ['Dual AC Vents', 'Plush Pushback Recline', 'Verified Chauffeur'],
        popular: false,
        compliance: {
          rcExpiry: '2039-01-01',
          fitnessExpiry: '2028-01-01',
          insuranceExpiry: '2027-01-01',
          permitExpiry: '2029-01-01',
          pucExpiry: '2027-01-01',
        },
      });
      showToast(`New vehicle ${vName} added to fleet registry`, 'success');
    }
    setIsVehicleModalOpen(false);
  };

  const handleSaveMaintenanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddMaintenanceLog({
      vehicleId: 'car-custom',
      vehicleNumber: mntVehicleNumber,
      serviceType: mntServiceType,
      serviceDate: mntDate,
      odometerKm: Number(mntOdo),
      cost: Number(mntCost),
      workshopName: mntWorkshop,
      status: 'Scheduled',
      nextServiceKm: Number(mntNextKm),
    });
    showToast(`Maintenance log scheduled for ${mntVehicleNumber}`, 'success');
    setIsMntModalOpen(false);
  };

  // Helper to calculate days remaining
  const getDaysRemaining = (expiryDateStr?: string) => {
    if (!expiryDateStr) return { days: 999, status: 'valid' };
    const expiry = new Date(expiryDateStr).getTime();
    const now = new Date('2026-10-29').getTime();
    const diffDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return { days: diffDays, status: 'expired' };
    if (diffDays <= 30) return { days: diffDays, status: 'warning' };
    return { days: diffDays, status: 'valid' };
  };

  return (
    <div className="space-y-6">

      {/* TOP NAVIGATION SUB-TABS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-200/90 shadow-xs">
        <div className="flex flex-wrap gap-2 text-xs font-bold">
          <button
            onClick={() => setActiveSubTab('directory')}
            className={`px-4 py-2 rounded-xl cursor-pointer transition-all flex items-center gap-1.5 ${
              activeSubTab === 'directory' ? 'bg-red-600 text-white shadow-xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            <span>Vehicle Directory ({vehicles.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('compliance')}
            className={`px-4 py-2 rounded-xl cursor-pointer transition-all flex items-center gap-1.5 ${
              activeSubTab === 'compliance' ? 'bg-red-600 text-white shadow-xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Compliance & Legal Expiry Tracker</span>
          </button>

          <button
            onClick={() => setActiveSubTab('maintenance')}
            className={`px-4 py-2 rounded-xl cursor-pointer transition-all flex items-center gap-1.5 ${
              activeSubTab === 'maintenance' ? 'bg-red-600 text-white shadow-xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Service & Maintenance Logbook</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search plate, model, tier..."
              value={vehicleSearch}
              onChange={(e) => setVehicleSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600"
            />
          </div>

          {isDispatcherOrAdmin && (
            <button
              onClick={openNewVehicleModal}
              className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-all whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Vehicle</span>
            </button>
          )}
        </div>
      </div>

      {/* SUB-TAB 1: VEHICLE DIRECTORY */}
      {activeSubTab === 'directory' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredVehicles.map((v) => (
            <div
              key={v.id}
              className={`rounded-3xl border bg-white overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between ${
                v.inMaintenance ? 'border-amber-300 ring-2 ring-amber-300/20' : 'border-slate-200'
              }`}
            >
              <div>
                <div className="relative h-44 overflow-hidden bg-slate-100">
                  <img
                    src={v.imageUrl}
                    alt={v.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-black/80 text-white backdrop-blur-xs">
                      {v.type}
                    </span>
                    <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-white text-slate-900 shadow-2xs">
                      {v.ownershipType || 'Company Owned'}
                    </span>
                  </div>

                  {v.plateNumber && (
                    <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-xl shadow-md border border-slate-200/80 text-xs font-mono font-extrabold text-red-700">
                      {v.plateNumber}
                    </div>
                  )}

                  {v.inMaintenance && (
                    <div className="absolute top-3 right-3 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                      <Wrench className="w-3 h-3" /> In Maintenance
                    </div>
                  )}
                </div>

                <div className="p-4 space-y-3">
                  <div>
                    <h4 className="font-black text-slate-900 text-base">{v.name}</h4>
                    <p className="text-xs text-slate-500">{v.capacity} · {v.luggage}</p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-2xl border border-slate-100 text-center text-xs">
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Base Rate</span>
                      <span className="font-extrabold text-red-600">₹{v.ratePerKm}/km</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Allowance</span>
                      <span className="font-extrabold text-slate-800">₹{v.driverAllowancePerDay}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Min Dist</span>
                      <span className="font-extrabold text-slate-800">{v.minimumKmPerDay} km</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Maintenance Toggle & Edit Controls */}
              {isDispatcherOrAdmin && (
                <div className="p-4 pt-0 border-t border-slate-100 flex items-center justify-between gap-2 mt-2">
                  <button
                    onClick={() => {
                      const nextMnt = !v.inMaintenance;
                      onUpdateVehicle(v.id, { inMaintenance: nextMnt });
                      showToast(
                        nextMnt
                          ? `${v.name} placed in maintenance (dispatch blocked)`
                          : `${v.name} cleared for live dispatch`,
                        'info'
                      );
                    }}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold cursor-pointer transition-all ${
                      v.inMaintenance
                        ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {v.inMaintenance ? 'Clear from Maintenance' : 'Schedule Downtime'}
                  </button>

                  <div className="flex gap-1">
                    <button
                      onClick={() => openEditVehicleModal(v)}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl cursor-pointer"
                      title="Edit vehicle details"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Remove ${v.name} from fleet?`)) {
                          onDeleteVehicle(v.id);
                        }
                      }}
                      className="p-1.5 bg-rose-50 hover:bg-rose-100 text-red-600 rounded-xl cursor-pointer"
                      title="Delete vehicle"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* SUB-TAB 2: COMPLIANCE & LEGAL EXPIRES TRACKER */}
      {activeSubTab === 'compliance' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-black text-slate-900">Statutory Compliance, Permits & Fitness Repository</h3>
            <p className="text-xs text-slate-500">
              Live expiration monitoring for Registration Certificates (RC), Commercial Fitness (FC), Comprehensive Insurance, and All-India Tourist Permits.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Vehicle / Plate</th>
                  <th className="py-3 px-4">RC Expiry</th>
                  <th className="py-3 px-4">Commercial Fitness (FC)</th>
                  <th className="py-3 px-4">Insurance Expiry</th>
                  <th className="py-3 px-4">Interstate Permit</th>
                  <th className="py-3 px-4">Pollution (PUC)</th>
                  <th className="py-3 px-4 text-right">Dispatch Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredVehicles.map((v) => {
                  const ins = getDaysRemaining(v.compliance?.insuranceExpiry);
                  const fc = getDaysRemaining(v.compliance?.fitnessExpiry);
                  const isBlocked = ins.status === 'expired' || fc.status === 'expired';

                  return (
                    <tr key={v.id} className="hover:bg-rose-50/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-extrabold text-slate-900">{v.name}</div>
                        <div className="font-mono text-xs font-bold text-red-600">{v.plateNumber || 'TS 09 UB 0000'}</div>
                      </td>

                      <td className="py-3 px-4 font-mono font-medium text-slate-700">
                        {v.compliance?.rcExpiry || '2038-05-12'}
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-mono">{v.compliance?.fitnessExpiry || '2027-04-10'}</span>
                        <div className="text-[10px] text-emerald-600 font-bold">Valid ({fc.days}d)</div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-mono">{v.compliance?.insuranceExpiry || '2027-02-15'}</span>
                        {ins.status === 'warning' ? (
                          <div className="text-[10px] font-extrabold text-amber-600 flex items-center gap-0.5">
                            <AlertTriangle className="w-3 h-3" /> Expiring in {ins.days} days!
                          </div>
                        ) : (
                          <div className="text-[10px] text-emerald-600 font-bold">Valid ({ins.days}d)</div>
                        )}
                      </td>

                      <td className="py-3 px-4 font-mono font-medium text-slate-700">
                        {v.compliance?.permitExpiry || '2028-06-20'}
                      </td>

                      <td className="py-3 px-4 font-mono font-medium text-slate-700">
                        {v.compliance?.pucExpiry || '2027-01-05'}
                      </td>

                      <td className="py-3 px-4 text-right">
                        {isBlocked ? (
                          <span className="px-2.5 py-1 bg-red-100 text-red-700 font-bold rounded-lg text-[10px]">
                            Blocked
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-lg text-[10px] inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Approved
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: SERVICE & MAINTENANCE LOGBOOK */}
      {activeSubTab === 'maintenance' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-black text-slate-900">Service Logs, Preventive Maintenance & Vendor Workshops</h3>
              <p className="text-xs text-slate-500">
                Track oil changes, tire rotations, brake pad overhauls, and next service intervals.
              </p>
            </div>

            {isDispatcherOrAdmin && (
              <button
                onClick={() => {
                  setMntVehicleNumber(vehicles[0]?.plateNumber || 'TS 09 UB 4421');
                  setIsMntModalOpen(true);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log Service Entry</span>
              </button>
            )}
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Log ID</th>
                  <th className="py-3 px-4">Vehicle Plate</th>
                  <th className="py-3 px-4">Service Type</th>
                  <th className="py-3 px-4">Date & Odometer</th>
                  <th className="py-3 px-4">Cost (INR)</th>
                  <th className="py-3 px-4">Workshop Facility</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {maintenanceLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-rose-50/30 transition-colors">
                    <td className="py-3 px-4 font-mono font-extrabold text-slate-900">{log.id}</td>
                    <td className="py-3 px-4 font-mono font-bold text-red-600">{log.vehicleNumber}</td>
                    <td className="py-3 px-4 font-bold text-slate-800">{log.serviceType}</td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">{log.serviceDate}</div>
                      <div className="text-[10px] text-slate-500 font-mono">@{log.odometerKm.toLocaleString()} km</div>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">₹{log.cost.toLocaleString()}</td>
                    <td className="py-3 px-4 text-slate-600 truncate max-w-[200px]">{log.workshopName}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        log.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                        log.status === 'In Progress' ? 'bg-amber-100 text-amber-800 animate-pulse' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {isDispatcherOrAdmin && log.status !== 'Completed' && (
                        <button
                          onClick={() => {
                            onUpdateMaintenanceLogStatus(log.id, 'Completed');
                            showToast(`Service log ${log.id} marked Completed`, 'success');
                          }}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                        >
                          Mark Done
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VEHICLE ADD / EDIT MODAL */}
      {isVehicleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  {editingVehicleId ? 'Update Vehicle Details' : 'Register New Fleet Vehicle'}
                </h3>
                <p className="text-xs text-slate-500">Configure tier rates, plate number, and capacities.</p>
              </div>
              <button
                onClick={() => setIsVehicleModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVehicleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Vehicle Name / Make</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Toyota Innova Crysta"
                    value={vName}
                    onChange={(e) => setVName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-600 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Plate / Registration No.</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TS 09 UB 4421"
                    value={vPlate}
                    onChange={(e) => setVPlate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-600 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Vehicle Tier</label>
                  <select
                    value={vType}
                    onChange={(e) => setVType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold"
                  >
                    <option value="Sedan">Sedan</option>
                    <option value="Executive Sedan">Executive Sedan</option>
                    <option value="MUV / Family">MUV / Family</option>
                    <option value="Premium SUV">Premium SUV</option>
                    <option value="Luxury Coach">Luxury Coach</option>
                    <option value="Hatchback">Hatchback</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Ownership Type</label>
                  <select
                    value={vOwnership}
                    onChange={(e) => setVOwnership(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold"
                  >
                    <option value="Company Owned">Company Owned</option>
                    <option value="Chauffeur Attached">Chauffeur Attached</option>
                    <option value="Leased">Leased</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Model Year</label>
                  <input
                    type="text"
                    value={vYear}
                    onChange={(e) => setVYear(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Rate (₹/km)</label>
                  <input
                    type="number"
                    min="10"
                    required
                    value={vRate}
                    onChange={(e) => setVRate(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Driver Allowance (₹)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={vAllowance}
                    onChange={(e) => setVAllowance(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Min Daily Km</label>
                  <input
                    type="number"
                    min="100"
                    required
                    value={vMinKm}
                    onChange={(e) => setVMinKm(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Passenger Capacity</label>
                  <input
                    type="text"
                    value={vCapacity}
                    onChange={(e) => setVCapacity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Luggage Space</label>
                  <input
                    type="text"
                    value={vLuggage}
                    onChange={(e) => setVLuggage(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Image URL</label>
                <input
                  type="text"
                  required
                  value={vImg}
                  onChange={(e) => setVImg(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-[11px]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsVehicleModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold cursor-pointer shadow-sm"
                >
                  Save Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEW SERVICE LOG ENTRY MODAL */}
      {isMntModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <div>
                <h3 className="text-base font-black text-slate-900">Schedule Preventive Maintenance</h3>
                <p className="text-xs text-slate-500">Log workshop service for commercial fleet vehicle.</p>
              </div>
              <button
                onClick={() => setIsMntModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMaintenanceSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Target Vehicle Plate</label>
                <input
                  type="text"
                  required
                  value={mntVehicleNumber}
                  onChange={(e) => setMntVehicleNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Service Type</label>
                <select
                  value={mntServiceType}
                  onChange={(e) => setMntServiceType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold"
                >
                  <option value="Oil & Filter Change">Oil & Filter Change</option>
                  <option value="Tire Rotation & Alignment">Tire Rotation & Alignment</option>
                  <option value="Brake Pad Replacement">Brake Pad Replacement</option>
                  <option value="AC Overhaul">AC Overhaul</option>
                  <option value="General Inspection">General Inspection</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Service Date</label>
                  <input
                    type="date"
                    required
                    value={mntDate}
                    onChange={(e) => setMntDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Estimated Cost (₹)</label>
                  <input
                    type="number"
                    required
                    value={mntCost}
                    onChange={(e) => setMntCost(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Current Odometer (km)</label>
                  <input
                    type="number"
                    value={mntOdo}
                    onChange={(e) => setMntOdo(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Next Service Due (km)</label>
                  <input
                    type="number"
                    value={mntNextKm}
                    onChange={(e) => setMntNextKm(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Workshop Name / Vendor</label>
                <input
                  type="text"
                  required
                  value={mntWorkshop}
                  onChange={(e) => setMntWorkshop(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsMntModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white font-bold cursor-pointer shadow-sm"
                >
                  Schedule Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

