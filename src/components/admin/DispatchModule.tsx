import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Booking, BookingStatus, FleetTelemetryVehicle, EmergencyAlert, AdminRole } from '../../types';
import {
  Car, Navigation, AlertTriangle, Phone, CheckCircle2, Clock, 
  MapPin, ShieldAlert, ArrowRight, UserCheck, RefreshCw, Filter, 
  Search, Shield, Check, X, RotateCcw, BatteryCharging, Gauge, 
  ChevronRight, AlertCircle, Compass, Eye, Send
} from 'lucide-react';

interface DispatchModuleProps {
  bookings: Booking[];
  telemetryVehicles: FleetTelemetryVehicle[];
  emergencyAlerts: EmergencyAlert[];
  currentRole: AdminRole;
  onUpdateBookingStatus: (id: string, status: BookingStatus) => void;
  onAssignChauffeur: (id: string, driver: string, carNumber: string) => void;
  onResolveAlert: (id: string) => void;
  onOpenOverrideModal: (booking: Booking) => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const DispatchModule: React.FC<DispatchModuleProps> = ({
  bookings,
  telemetryVehicles,
  emergencyAlerts,
  currentRole,
  onUpdateBookingStatus,
  onAssignChauffeur,
  onResolveAlert,
  onOpenOverrideModal,
  showToast,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [telemetryFilter, setTelemetryFilter] = useState<'all' | 'active' | 'assigned' | 'idle' | 'sos'>('all');
  const [selectedVehicle, setSelectedVehicle] = useState<FleetTelemetryVehicle | null>(null);
  const [bookingSearch, setBookingSearch] = useState('');
  const [tableStatusFilter, setTableStatusFilter] = useState<string>('all');
  
  // Quick assign modal local state
  const [quickAssignBooking, setQuickAssignBooking] = useState<Booking | null>(null);
  const [driverNameInput, setDriverNameInput] = useState('');
  const [carNumberInput, setCarNumberInput] = useState('');

  // 1. Initialize and update Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Center map around South-Central India hub (Hyderabad / Deccan Corridor)
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [17.385, 78.4867],
        zoom: 6,
        scrollWheelZoom: true,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        maxZoom: 19,
      }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;
      mapInstanceRef.current = map;
    }

    const markersGroup = markersLayerRef.current;
    if (!markersGroup || !mapInstanceRef.current) return;

    markersGroup.clearLayers();

    const filteredVehicles = telemetryVehicles.filter((v) => {
      if (telemetryFilter === 'all') return true;
      return v.status === telemetryFilter;
    });

    filteredVehicles.forEach((v) => {
      let pinColor = '#3b82f6'; // blue idle
      let pulseRing = false;

      if (v.status === 'active') {
        pinColor = '#10b981'; // emerald active
        pulseRing = true;
      } else if (v.status === 'assigned') {
        pinColor = '#f59e0b'; // amber assigned
      } else if (v.status === 'sos') {
        pinColor = '#dc2626'; // red sos
        pulseRing = true;
      } else if (v.status === 'maintenance') {
        pinColor = '#64748b'; // slate maintenance
      }

      const iconHtml = `
        <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
          ${pulseRing ? `<div style="position: absolute; inset: -4px; border-radius: 9999px; background: ${pinColor}; opacity: 0.35; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>` : ''}
          <div style="width: 30px; height: 30px; border-radius: 9999px; background: ${pinColor}; border: 2.5px solid #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2); display: flex; align-items: center; justify-content: center; color: white;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C2.1 10.8 2 11 2 11.2V16c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-fleet-pin',
        html: iconHtml,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });

      const marker = L.marker([v.lat, v.lng], { icon: customIcon });

      marker.bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px; line-height: 1.4; padding: 2px;">
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
            <b style="font-size: 13px; color: #1e293b;">${v.plateNumber}</b>
            <span style="font-size: 9px; font-weight: bold; padding: 1px 6px; border-radius: 9999px; background: ${pinColor}; color: white; text-transform: uppercase;">${v.status}</span>
          </div>
          <p style="margin: 2px 0; color: #475569;"><b>Captain:</b> ${v.driverName} (${v.driverPhone})</p>
          <p style="margin: 2px 0; color: #475569;"><b>Vehicle:</b> ${v.vehicleModel}</p>
          <p style="margin: 2px 0; color: #475569;"><b>Speed:</b> ${v.speedKmH} km/h · <b>Fuel/Batt:</b> ${v.batteryOrFuelPercent}%</p>
          ${v.destination ? `<p style="margin: 2px 0; color: #b91c1c;"><b>Route:</b> ${v.destination}</p>` : ''}
        </div>
      `);

      marker.on('click', () => {
        setSelectedVehicle(v);
      });

      markersGroup.addLayer(marker);
    });

  }, [telemetryVehicles, telemetryFilter]);

  // Clean up Leaflet on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Filtered bookings for Table & Kanban
  const filteredBookings = bookings.filter((b) => {
    const matchesStatus = tableStatusFilter === 'all' || b.status === tableStatusFilter;
    const matchesSearch =
      b.id.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.customerName.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.customerPhone.includes(bookingSearch) ||
      b.destination.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      (b.assignedDriver && b.assignedDriver.toLowerCase().includes(bookingSearch.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const kanbanColumns: { status: BookingStatus; label: string; color: string; bg: string; border: string }[] = [
    { status: 'New', label: '1. New Requests', color: 'text-rose-700', bg: 'bg-rose-50/70', border: 'border-rose-200' },
    { status: 'Confirmed', label: '2. Confirmed', color: 'text-blue-700', bg: 'bg-blue-50/70', border: 'border-blue-200' },
    { status: 'Assigned', label: '3. Chauffeur Assigned', color: 'text-amber-700', bg: 'bg-amber-50/70', border: 'border-amber-200' },
    { status: 'En Route', label: '4. En Route / Active', color: 'text-emerald-700', bg: 'bg-emerald-50/70', border: 'border-emerald-200' },
    { status: 'Completed', label: '5. Completed', color: 'text-slate-700', bg: 'bg-slate-100/70', border: 'border-slate-200' },
    { status: 'Cancelled', label: '6. Cancelled', color: 'text-red-800', bg: 'bg-red-50/50', border: 'border-red-100' },
  ];

  const handleQuickAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickAssignBooking || !driverNameInput || !carNumberInput) return;
    onAssignChauffeur(quickAssignBooking.id, driverNameInput, carNumberInput);
    showToast(`Chauffeur ${driverNameInput} assigned to ${quickAssignBooking.id}`, 'success');
    setQuickAssignBooking(null);
    setDriverNameInput('');
    setCarNumberInput('');
  };

  const isDispatcherOrAdmin = currentRole === 'Super Admin' || currentRole === 'Fleet Dispatcher';

  return (
    <div className="space-y-8">

      {/* TOP EMERGENCY SOS ALERTS FEED */}
      {emergencyAlerts.length > 0 && (
        <div className="rounded-2xl border-2 border-red-500/40 bg-gradient-to-r from-red-50 via-rose-50 to-orange-50 p-4 sm:p-5 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-600"></span>
              </span>
              <h3 className="text-sm font-black text-red-900 tracking-wide uppercase flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-red-600" />
                Live Emergency & SOS Incident Feed ({emergencyAlerts.filter(a => a.status !== 'Resolved').length} Active)
              </h3>
            </div>
            <span className="text-[11px] font-bold text-red-700 bg-red-100/80 px-2.5 py-1 rounded-full border border-red-200">
              Immediate Dispatcher Attention Required
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {emergencyAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-3.5 rounded-xl border bg-white shadow-xs transition-all ${
                  alert.status === 'Resolved'
                    ? 'border-slate-200 opacity-60'
                    : alert.severity === 'critical'
                    ? 'border-red-400 ring-2 ring-red-400/20'
                    : 'border-amber-300'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-extrabold text-slate-900 flex items-center gap-1">
                    <AlertTriangle className={`w-3.5 h-3.5 ${alert.severity === 'critical' ? 'text-red-600' : 'text-amber-600'}`} />
                    {alert.type}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    alert.status === 'Active' ? 'bg-red-600 text-white' : alert.status === 'Investigating' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {alert.status}
                  </span>
                </div>

                <p className="text-[11px] text-slate-700 line-clamp-2 mb-2">{alert.location}</p>

                <div className="bg-slate-50 rounded-lg p-2 text-[10px] space-y-0.5 border border-slate-100 mb-2.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Trip / Vehicle:</span>
                    <span className="font-bold text-slate-800">{alert.bookingId} ({alert.carNumber})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Captain / Phone:</span>
                    <span className="font-bold text-slate-800">{alert.driverName} ({alert.driverPhone})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Rider / Phone:</span>
                    <span className="font-bold text-slate-800">{alert.customerName} ({alert.customerPhone})</span>
                  </div>
                </div>

                {alert.status !== 'Resolved' && isDispatcherOrAdmin && (
                  <div className="flex items-center gap-2 pt-1">
                    <a
                      href={`tel:${alert.driverPhone}`}
                      className="flex-1 py-1 px-2 bg-slate-900 hover:bg-black text-white text-[11px] font-bold rounded-lg flex items-center justify-center gap-1 transition-all"
                    >
                      <Phone className="w-3 h-3 text-emerald-400" />
                      <span>Call Driver</span>
                    </a>
                    <button
                      onClick={() => onResolveAlert(alert.id)}
                      className="py-1 px-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-all"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Resolve</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 1: REAL-TIME FLEET TELEMETRY RADAR */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                <Navigation className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">Real-Time Fleet Telemetry & Transit Radar</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Live GPS tracking of active chauffeur cars, airport escorts, and idle hub reserves across operating corridors.
            </p>
          </div>

          {/* Telemetry Filters */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
            <span className="text-slate-400 mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Filter:
            </span>
            {(['all', 'active', 'assigned', 'idle', 'sos'] as const).map((filterKey) => (
              <button
                key={filterKey}
                onClick={() => setTelemetryFilter(filterKey)}
                className={`px-3 py-1.5 rounded-xl cursor-pointer transition-all uppercase text-[10px] tracking-wider font-extrabold ${
                  telemetryFilter === filterKey
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {filterKey} ({telemetryVehicles.filter(v => filterKey === 'all' ? true : v.status === filterKey).length})
              </button>
            ))}
          </div>
        </div>

        {/* Leaflet Map Stage */}
        <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
          <div ref={mapContainerRef} className="w-full h-[400px] sm:h-[440px] z-10" />

          {/* Quick Floating Telemetry Stat HUD */}
          <div className="absolute top-3 left-3 z-20 bg-white/95 backdrop-blur-md p-3 rounded-xl border border-slate-200/80 shadow-md text-xs space-y-1.5 max-w-[220px]">
            <div className="font-bold text-slate-900 flex items-center gap-1.5 border-b pb-1">
              <Compass className="w-3.5 h-3.5 text-red-600" />
              <span>Wayora Fleet Telemetry</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] pt-0.5">
              <div>
                <span className="text-slate-400 block text-[9px] uppercase font-bold">Active Cars</span>
                <span className="font-black text-emerald-600 text-sm">
                  {telemetryVehicles.filter(v => v.status === 'active').length}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[9px] uppercase font-bold">Idle at Hubs</span>
                <span className="font-black text-blue-600 text-sm">
                  {telemetryVehicles.filter(v => v.status === 'idle').length}
                </span>
              </div>
            </div>
          </div>

          {/* Selected Vehicle Card Drawer */}
          {selectedVehicle && (
            <div className="absolute bottom-3 right-3 z-20 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200 shadow-xl max-w-xs text-xs space-y-2 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-center justify-between border-b pb-1.5">
                <span className="font-black text-slate-900 text-sm">{selectedVehicle.plateNumber}</span>
                <button
                  onClick={() => setSelectedVehicle(null)}
                  className="text-slate-400 hover:text-slate-700 cursor-pointer p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-1 text-slate-600">
                <p><b>Model:</b> {selectedVehicle.vehicleModel}</p>
                <p><b>Chauffeur:</b> {selectedVehicle.driverName}</p>
                <p><b>Speed:</b> {selectedVehicle.speedKmH} km/h · <b>Fuel/Batt:</b> {selectedVehicle.batteryOrFuelPercent}%</p>
                {selectedVehicle.destination && (
                  <p className="text-red-700 font-semibold"><b>Route:</b> {selectedVehicle.destination}</p>
                )}
              </div>

              <div className="flex gap-2 pt-1">
                <a
                  href={`tel:${selectedVehicle.driverPhone}`}
                  className="flex-1 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl flex items-center justify-center gap-1 text-[11px]"
                >
                  <Phone className="w-3 h-3" /> Call Captain
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 2: BOOKING LIFECYCLE MANAGER & DISPATCH DESK */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                <Car className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">Booking Lifecycle & Manual Override Deck</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Centralized dispatch pipeline: New requests ➔ Confirmed ➔ Chauffeur Assigned ➔ Active Trips ➔ Completed settlements.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* View Switcher: Kanban vs Tabular */}
            <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold border border-slate-200">
              <button
                onClick={() => setViewMode('kanban')}
                className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                  viewMode === 'kanban' ? 'bg-white text-red-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Visual Kanban
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                  viewMode === 'table' ? 'bg-white text-red-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tabular Registry
              </button>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Booking ID, Rider name, Phone, Route, Chauffeur..."
              value={bookingSearch}
              onChange={(e) => setBookingSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600 font-medium"
            />
          </div>

          {viewMode === 'table' && (
            <select
              value={tableStatusFilter}
              onChange={(e) => setTableStatusFilter(e.target.value)}
              className="py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-600"
            >
              <option value="all">All Stages</option>
              <option value="New">New</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Assigned">Assigned</option>
              <option value="En Route">En Route</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          )}
        </div>

        {/* VIEW 1: VISUAL KANBAN */}
        {viewMode === 'kanban' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5 overflow-x-auto pb-2">
            {kanbanColumns.map((col) => {
              const columnBookings = filteredBookings.filter((b) => b.status === col.status);
              return (
                <div
                  key={col.status}
                  className={`flex flex-col rounded-2xl p-3 border ${col.bg} ${col.border} min-w-[230px]`}
                >
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/60">
                    <span className={`text-xs font-extrabold ${col.color}`}>{col.label}</span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-white text-slate-700 shadow-2xs">
                      {columnBookings.length}
                    </span>
                  </div>

                  <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[560px] pr-1">
                    {columnBookings.length === 0 ? (
                      <div className="h-28 flex flex-col items-center justify-center text-slate-400 text-[11px] text-center italic">
                        No trips in this stage
                      </div>
                    ) : (
                      columnBookings.map((b) => (
                        <div
                          key={b.id}
                          className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs hover:shadow-md transition-all space-y-2 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-red-600 text-[11px]">{b.id}</span>
                            <span className="text-[10px] text-slate-500 font-medium">{b.travelTime}</span>
                          </div>

                          <div>
                            <p className="font-bold text-slate-900 truncate">{b.customerName}</p>
                            <p className="text-[11px] text-slate-500">{b.customerPhone}</p>
                          </div>

                          <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 text-[10px] space-y-1">
                            <div className="flex items-center gap-1 text-slate-600 truncate">
                              <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                              <span className="truncate">{b.pickupLocation}</span>
                            </div>
                            <div className="flex items-center gap-1 text-slate-800 font-semibold truncate">
                              <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">{b.destination}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-[11px] pt-1">
                            <span className="font-bold text-slate-900">₹{b.estimatedTotal.toLocaleString()}</span>
                            <span className="text-[10px] px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded font-bold">
                              ₹{b.advancePaid.toLocaleString()} (25% Adv)
                            </span>
                          </div>

                          {/* Chauffeur Assignment Status */}
                          <div className="border-t border-slate-100 pt-1.5 text-[10px]">
                            {b.assignedDriver ? (
                              <div className="flex items-center justify-between text-slate-700">
                                <span className="font-semibold truncate">👨‍✈️ {b.assignedDriver}</span>
                                <span className="text-slate-500 text-[9px]">{b.assignedCarNumber}</span>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between text-rose-600 font-semibold">
                                <span>⚠️ Unassigned</span>
                                {isDispatcherOrAdmin && (
                                  <button
                                    onClick={() => setQuickAssignBooking(b)}
                                    className="px-2 py-0.5 bg-red-600 hover:bg-red-700 text-white rounded text-[9px] cursor-pointer"
                                  >
                                    Assign
                                  </button>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Quick Lifecycle Advance Buttons */}
                          {isDispatcherOrAdmin && (
                            <div className="flex items-center gap-1 pt-1">
                              {b.status === 'New' && (
                                <button
                                  onClick={() => onUpdateBookingStatus(b.id, 'Confirmed')}
                                  className="w-full py-1 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold rounded-lg cursor-pointer"
                                >
                                  Confirm Ride
                                </button>
                              )}
                              {b.status === 'Confirmed' && !b.assignedDriver && (
                                <button
                                  onClick={() => setQuickAssignBooking(b)}
                                  className="w-full py-1 bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold rounded-lg cursor-pointer"
                                >
                                  Assign Chauffeur
                                </button>
                              )}
                              {b.status === 'Assigned' && (
                                <button
                                  onClick={() => onUpdateBookingStatus(b.id, 'En Route')}
                                  className="w-full py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-lg cursor-pointer flex items-center justify-center gap-1"
                                >
                                  <Car className="w-3 h-3" /> Start Trip
                                </button>
                              )}
                              {b.status === 'En Route' && (
                                <button
                                  onClick={() => onUpdateBookingStatus(b.id, 'Completed')}
                                  className="w-full py-1 bg-slate-900 hover:bg-black text-white text-[10px] font-bold rounded-lg cursor-pointer flex items-center justify-center gap-1"
                                >
                                  <Check className="w-3 h-3 text-emerald-400" /> Complete Ride
                                </button>
                              )}
                              <button
                                onClick={() => onOpenOverrideModal(b)}
                                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded-lg cursor-pointer"
                                title="Manual Override / Adjust"
                              >
                                Edit
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* VIEW 2: TABULAR REGISTRY */}
        {viewMode === 'table' && (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Booking Ref</th>
                  <th className="py-3 px-4">Rider Info</th>
                  <th className="py-3 px-4">Route & Date</th>
                  <th className="py-3 px-4">Vehicle Tier</th>
                  <th className="py-3 px-4">Fare & Advance</th>
                  <th className="py-3 px-4">Chauffeur</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      No matching bookings found.
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-rose-50/30 transition-colors">
                      <td className="py-3 px-4 font-black text-red-600">{b.id}</td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{b.customerName}</div>
                        <div className="text-[11px] text-slate-500">{b.customerPhone}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800 truncate max-w-[180px]">
                          {b.pickupLocation} ➔ {b.destination}
                        </div>
                        <div className="text-[10px] text-slate-500">{b.travelDate} · {b.travelTime}</div>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-700">{b.vehicleName}</td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">₹{b.estimatedTotal.toLocaleString()}</div>
                        <div className="text-[10px] text-emerald-600 font-bold">Adv: ₹{b.advancePaid.toLocaleString()}</div>
                      </td>
                      <td className="py-3 px-4">
                        {b.assignedDriver ? (
                          <div>
                            <span className="font-bold text-slate-800">{b.assignedDriver}</span>
                            <div className="text-[10px] text-slate-500">{b.assignedCarNumber}</div>
                          </div>
                        ) : (
                          <span className="text-[11px] font-bold text-rose-600">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          b.status === 'Completed' ? 'bg-slate-100 text-slate-700' :
                          b.status === 'En Route' ? 'bg-emerald-100 text-emerald-800' :
                          b.status === 'Assigned' ? 'bg-amber-100 text-amber-800' :
                          b.status === 'Confirmed' ? 'bg-blue-100 text-blue-800' :
                          b.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-rose-100 text-rose-800'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isDispatcherOrAdmin && !b.assignedDriver && (
                            <button
                              onClick={() => setQuickAssignBooking(b)}
                              className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                            >
                              Assign
                            </button>
                          )}
                          <button
                            onClick={() => onOpenOverrideModal(b)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold cursor-pointer"
                          >
                            Manage
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* QUICK ASSIGN CHAUFFEUR MODAL */}
      {quickAssignBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <div>
                <h3 className="text-base font-black text-slate-900">Dispatch Chauffeur</h3>
                <p className="text-xs text-slate-500">Booking {quickAssignBooking.id} · {quickAssignBooking.destination}</p>
              </div>
              <button
                onClick={() => setQuickAssignBooking(null)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleQuickAssignSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Chauffeur Partner Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Raju Goud"
                  value={driverNameInput}
                  onChange={(e) => setDriverNameInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-600 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Vehicle License Plate Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TS 09 UB 4421"
                  value={carNumberInput}
                  onChange={(e) => setCarNumberInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-600 font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setQuickAssignBooking(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold cursor-pointer shadow-sm"
                >
                  Confirm & Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

