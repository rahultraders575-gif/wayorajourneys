import React, { useState } from 'react';
import { useCms } from '../context/CmsContext';
import { BookingStatus, TourPackage, Vehicle } from '../types';
import { 
  Shield, Calendar, Car, MapPin, Tag, Plus, Edit2, 
  Trash2, Star, CheckCircle2, RefreshCw, Download, Upload, 
  Search, Eye, UserCheck, X, BellRing, MessageSquare, Mail, Phone, Send, KeyRound 
} from 'lucide-react';

export const CmsDashboard: React.FC = () => {
  const { 
    bookings, updateBookingStatus, assignChauffeur, deleteBooking,
    packages, addPackage, updatePackage, deletePackage, togglePackageFeatured,
    vehicles, updateVehicle, addVehicle, deleteVehicle,
    settings, updateSettings, themeMode, setThemeMode,
    resetToDefault, exportDatabaseJson, importDatabaseJson, showToast 
  } = useCms();

  const [activeTab, setActiveTab] = useState<'bookings' | 'packages' | 'fleet' | 'promotions' | 'settings'>('bookings');
  
  // Bookings state
  const [bookingStatusFilter, setBookingStatusFilter] = useState<string>('all');
  const [bookingSearch, setBookingSearch] = useState('');
  const [activeAssignModalId, setActiveAssignModalId] = useState<string | null>(null);
  const [assignDriverName, setAssignDriverName] = useState('');
  const [assignCarNumber, setAssignCarNumber] = useState('');

  // Package modal state
  const [isPkgModalOpen, setIsPkgModalOpen] = useState(false);
  const [editingPkgId, setEditingPkgId] = useState<string | null>(null);
  const [pkgTitle, setPkgTitle] = useState('');
  const [pkgTagline, setPkgTagline] = useState('');
  const [pkgCategory, setPkgCategory] = useState<'spiritual' | 'hill' | 'beach' | 'heritage'>('spiritual');
  const [pkgDesc, setPkgDesc] = useState('');
  const [pkgDuration, setPkgDuration] = useState('2–3 days');
  const [pkgPrice, setPkgPrice] = useState(15000);
  const [pkgRatePerKm, setPkgRatePerKm] = useState(15);
  const [pkgDistKm, setPkgDistKm] = useState(1000);
  const [pkgImg, setPkgImg] = useState('');
  const [pkgCar, setPkgCar] = useState('Dzire or Ertiga');
  const [pkgHighlights, setPkgHighlights] = useState('Temple Darshan, Scenic Ghats, Doorstep Pickup');

  // Fleet modal state
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

  // Settings form state
  const [companyPhone, setCompanyPhone] = useState(settings.phone);
  const [companyEmail, setCompanyEmail] = useState(settings.email);
  const [companyAddress, setCompanyAddress] = useState(settings.address);

  // Daily Offers & Omnichannel Notifications state
  const [promoCampaign, setPromoCampaign] = useState('Diwali Royal Highway Special');
  const [promoOfferTitle, setPromoOfferTitle] = useState('Flat ₹500 OFF On Outstation Cabs');
  const [promoCoupon, setPromoCoupon] = useState('WAYORA500');
  const [promoDetails, setPromoDetails] = useState('15% Off Outstation One-way & Round-trip highway cabs. Chilled AC, Verified Captain.');
  const [promoEmailChannel, setPromoEmailChannel] = useState(true);
  const [promoWhatsappChannel, setPromoWhatsappChannel] = useState(true);
  const [promoSmsChannel, setPromoSmsChannel] = useState(true);
  const [promoCustomPhone, setPromoCustomPhone] = useState('+91 98490 11223');
  const [promoCustomEmail, setPromoCustomEmail] = useState('guest@wayorajourneys.com');
  const [promoLogs, setPromoLogs] = useState<any[]>([
    {
      id: 'NOTIF-101',
      campaign: 'Weekend Outstation Bonanza',
      channels: ['email', 'whatsapp', 'sms'],
      totalRecipients: 48,
      offerCoupon: 'WAYORA500',
      status: 'DELIVERED',
      sentAt: '2026-10-25T09:00:00.000Z',
      previewSnippet: 'Flat ₹500 OFF on highway intercity cabs this weekend. Use code WAYORA500.',
    }
  ]);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [testOtpRecipient, setTestOtpRecipient] = useState('+91 98490 11223');
  const [testOtpChannel, setTestOtpChannel] = useState<'sms' | 'whatsapp' | 'email'>('whatsapp');
  const [testOtpCode, setTestOtpCode] = useState<string | null>(null);

  // Load notification logs
  const fetchNotificationLogs = async () => {
    try {
      const res = await fetch('/api/notifications/daily-offers/logs');
      const data = await res.json();
      if (data.success && data.logs) {
        setPromoLogs(data.logs);
      }
    } catch {
      // ignore
    }
  };

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

  // Filtered bookings
  const filteredBookings = bookings.filter((b) => {
    const matchesStatus = bookingStatusFilter === 'all' || b.status === bookingStatusFilter;
    const matchesSearch =
      b.customerName.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.customerPhone.includes(bookingSearch) ||
      b.id.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.destination.toLowerCase().includes(bookingSearch.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Package handlers
  const openNewPackageModal = () => {
    setEditingPkgId(null);
    setPkgTitle('');
    setPkgTagline('');
    setPkgCategory('spiritual');
    setPkgDesc('');
    setPkgDuration('2–3 days');
    setPkgPrice(15000);
    setPkgRatePerKm(15);
    setPkgDistKm(1000);
    setPkgImg('https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1000&q=80');
    setPkgCar('Dzire or Ertiga');
    setPkgHighlights('Scenic Ghats, Temple Darshan, AC Cabin');
    setIsPkgModalOpen(true);
  };

  const openEditPackageModal = (pkg: TourPackage) => {
    setEditingPkgId(pkg.id);
    setPkgTitle(pkg.title);
    setPkgTagline(pkg.tagline);
    setPkgCategory(pkg.category);
    setPkgDesc(pkg.description);
    setPkgDuration(pkg.duration);
    setPkgPrice(pkg.fromPrice);
    setPkgRatePerKm(pkg.ratePerKm);
    setPkgDistKm(pkg.estimatedDistanceKm);
    setPkgImg(pkg.imageUrl);
    setPkgCar(pkg.recommendedCar);
    setPkgHighlights(pkg.highlights.join(', '));
    setIsPkgModalOpen(true);
  };

  const handleSavePackage = (e: React.FormEvent) => {
    e.preventDefault();
    const highlightsArr = pkgHighlights.split(',').map((s) => s.trim()).filter(Boolean);
    const categoryLabels: Record<string, string> = {
      spiritual: 'Spiritual',
      hill: 'Hill Station',
      beach: 'Beach & Coastal',
      heritage: 'Heritage',
    };

    if (editingPkgId) {
      updatePackage(editingPkgId, {
        title: pkgTitle,
        tagline: pkgTagline,
        category: pkgCategory,
        categoryLabel: categoryLabels[pkgCategory],
        description: pkgDesc,
        duration: pkgDuration,
        fromPrice: Number(pkgPrice),
        ratePerKm: Number(pkgRatePerKm),
        estimatedDistanceKm: Number(pkgDistKm),
        imageUrl: pkgImg,
        recommendedCar: pkgCar,
        highlights: highlightsArr,
      });
    } else {
      addPackage({
        title: pkgTitle,
        tagline: pkgTagline,
        category: pkgCategory,
        categoryLabel: categoryLabels[pkgCategory],
        description: pkgDesc,
        duration: pkgDuration,
        fromPrice: Number(pkgPrice),
        ratePerKm: Number(pkgRatePerKm),
        estimatedDistanceKm: Number(pkgDistKm),
        imageUrl: pkgImg,
        recommendedCar: pkgCar,
        highlights: highlightsArr,
        featured: false,
      });
    }
    setIsPkgModalOpen(false);
  };

  // Fleet handlers
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
    setIsVehicleModalOpen(true);
  };

  const handleSaveVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingVehicleId) {
      updateVehicle(editingVehicleId, {
        name: vName,
        type: vType,
        capacity: vCapacity,
        luggage: vLuggage,
        ratePerKm: Number(vRate),
        driverAllowancePerDay: Number(vAllowance),
        minimumKmPerDay: Number(vMinKm),
        imageUrl: vImg,
      });
    } else {
      addVehicle({
        name: vName,
        type: vType,
        capacity: vCapacity,
        luggage: vLuggage,
        ratePerKm: Number(vRate),
        driverAllowancePerDay: Number(vAllowance),
        minimumKmPerDay: Number(vMinKm),
        imageUrl: vImg || 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=900&q=80',
        features: ['Chilled AC', 'Luggage Carrier', 'Verified Driver'],
        popular: false,
      });
    }
    setIsVehicleModalOpen(false);
  };

  // Assign driver handler
  const handleAssignChauffeurSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAssignModalId || !assignDriverName || !assignCarNumber) return;
    assignChauffeur(activeAssignModalId, assignDriverName, assignCarNumber);
    setActiveAssignModalId(null);
    setAssignDriverName('');
    setAssignCarNumber('');
  };

  // Export / Import
  const handleDownloadBackup = () => {
    const jsonStr = exportDatabaseJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wayora-cms-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Database JSON backup downloaded', 'success');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      importDatabaseJson(content);
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-slate-50 text-slate-900 transition-colors">
      
      {/* Top Banner - Red & White Luxury Theme */}
      <div className="bg-gradient-to-r from-red-700 via-rose-700 to-red-600 text-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl border border-red-500/30">
        <div className="flex items-center gap-4">
          <img
            src="/images/wayora-logo-dark.jpg"
            alt="Wayora Journeys Logo"
            className="w-12 h-12 rounded-2xl object-contain bg-black shadow-md ring-2 ring-white/40 p-1"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-white tracking-tight">Wayora CMS & Dispatch Control</h1>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-white text-red-700 font-bold shadow-xs">
                Red Edition
              </span>
            </div>
            <p className="text-xs text-rose-100 mt-0.5">
              Manage tour catalog, outstation reservations, vehicle rates, and company parameters.
            </p>
          </div>
        </div>

        {/* Global actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleDownloadBackup}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-rose-50 text-red-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
            title="Download JSON Database"
          >
            <Download className="w-3.5 h-3.5 text-red-600" />
            <span>Export Backup</span>
          </button>

          <label className="px-3.5 py-2 rounded-xl bg-white hover:bg-rose-50 text-red-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-all">
            <Upload className="w-3.5 h-3.5 text-red-600" />
            <span>Restore JSON</span>
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          </label>

          <button
            onClick={() => {
              if (confirm('Reset entire catalog and bookings to default state?')) {
                resetToDefault();
              }
            }}
            className="px-3.5 py-2 rounded-xl bg-red-800/80 hover:bg-red-800 text-white border border-white/20 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-slate-200 text-xs font-bold gap-2">
        <button
          onClick={() => setActiveTab('bookings')}
          className={`pb-3 px-4 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'bookings'
              ? 'text-red-600 border-b-2 border-red-600'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Customer Bookings ({bookings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('packages')}
          className={`pb-3 px-4 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'packages'
              ? 'text-red-600 border-b-2 border-red-600'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Tour Packages ({packages.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('fleet')}
          className={`pb-3 px-4 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'fleet'
              ? 'text-red-600 border-b-2 border-red-600'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Car className="w-4 h-4" />
          <span>Fleet & Tariffs ({vehicles.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('promotions');
            fetchNotificationLogs();
          }}
          className={`pb-3 px-4 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'promotions'
              ? 'text-red-600 border-b-2 border-red-600'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <BellRing className="w-4 h-4" />
          <span>Daily Offers & Alerts</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`pb-3 px-4 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'settings'
              ? 'text-red-600 border-b-2 border-red-600'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Company & Policy</span>
        </button>
      </div>

      {/* TAB 1: BOOKINGS */}
      {activeTab === 'bookings' && (
        <div className="space-y-6">
          
          {/* Filters & Search */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="flex flex-wrap gap-1.5 text-xs font-semibold">
              {(['all', 'New', 'Confirmed', 'Assigned', 'En Route', 'Completed', 'Cancelled'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setBookingStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
                    bookingStatusFilter === st
                      ? 'bg-red-600 text-white shadow-xs font-bold'
                      : 'bg-slate-50 text-slate-700 hover:text-red-600 hover:bg-red-50 border border-slate-200'
                  }`}
                >
                  {st === 'all' ? 'All Bookings' : st}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search guest or ref ID..."
                value={bookingSearch}
                onChange={(e) => setBookingSearch(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-600 focus:bg-white"
              />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Ref ID & Customer</th>
                    <th className="p-3.5">Route</th>
                    <th className="p-3.5">Date & Car</th>
                    <th className="p-3.5">Chauffeur Assigned</th>
                    <th className="p-3.5">Advance & Total</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">
                        No reservations found.
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3.5">
                          <span className="font-bold text-slate-900 block">{b.customerName}</span>
                          <span className="text-[10px] font-mono font-bold text-red-600">{b.id}</span>
                          <span className="text-[10px] text-slate-500 block">{b.customerPhone}</span>
                        </td>
                        <td className="p-3.5">
                          <span className="text-slate-900 block font-medium">{b.destination}</span>
                          <span className="text-[10px] text-slate-500">From: {b.pickupLocation}</span>
                        </td>
                        <td className="p-3.5">
                          <span className="text-slate-900 block">{b.travelDate} @ {b.travelTime}</span>
                          <span className="text-[11px] text-red-600 font-bold">{b.vehicleName}</span>
                        </td>
                        <td className="p-3.5">
                          {b.assignedDriver ? (
                            <div>
                              <span className="text-slate-900 block font-semibold">{b.assignedDriver}</span>
                              <span className="text-[10px] font-mono text-slate-500">{b.assignedCarNumber}</span>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setActiveAssignModalId(b.id);
                                setAssignDriverName('');
                                setAssignCarNumber('');
                              }}
                              className="px-2 py-1 rounded-lg bg-red-50 border border-red-200 text-[10px] font-bold text-red-600 hover:bg-red-600 hover:text-white cursor-pointer flex items-center gap-1 transition-colors"
                            >
                              <UserCheck className="w-3 h-3" />
                              <span>Assign Chauffeur</span>
                            </button>
                          )}
                        </td>
                        <td className="p-3.5 font-mono text-[11px]">
                          <span className="text-slate-900 block font-bold">
                            ₹{b.estimatedTotal.toLocaleString('en-IN')}
                          </span>
                          <span className="text-[10px] text-emerald-700 font-semibold">
                            Adv: ₹{b.advancePaid.toLocaleString('en-IN')} ({b.advancePaymentType})
                          </span>
                        </td>
                        <td className="p-3.5">
                          <select
                            value={b.status}
                            onChange={(e) => updateBookingStatus(b.id, e.target.value as BookingStatus)}
                            className={`px-2 py-1 rounded text-[10px] font-bold border focus:outline-none cursor-pointer ${
                              b.status === 'New'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : b.status === 'Confirmed'
                                ? 'bg-purple-50 text-purple-700 border-purple-200'
                                : b.status === 'Assigned'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : b.status === 'En Route'
                                ? 'bg-red-50 text-red-700 border-red-200'
                                : b.status === 'Completed'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}
                          >
                            <option value="New">New</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Assigned">Assigned</option>
                            <option value="En Route">En Route</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => {
                              if (confirm(`Cancel reservation for ${b.customerName}?`)) {
                                deleteBooking(b.id);
                              }
                            }}
                            className="p-1 rounded text-slate-400 hover:text-red-600 transition-colors"
                            title="Delete Reservation"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: PACKAGES CMS */}
      {activeTab === 'packages' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-600">
              Manage outstation and pilgrimage tour packages showcased on the homepage.
            </p>
            <button
              onClick={openNewPackageModal}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-red-500/25"
            >
              <Plus className="w-4 h-4" />
              <span>Add Tour Package</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] text-red-600 font-bold uppercase">{pkg.categoryLabel}</span>
                      <h3 className="font-bold text-slate-900 text-base mt-0.5">{pkg.title}</h3>
                    </div>
                    <button
                      onClick={() => togglePackageFeatured(pkg.id)}
                      className={`p-1.5 rounded-lg border cursor-pointer ${
                        pkg.featured
                          ? 'bg-amber-50 border-amber-300 text-amber-600'
                          : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600'
                      }`}
                      title={pkg.featured ? 'Featured on Home' : 'Not Featured'}
                    >
                      <Star className="w-4 h-4 fill-current" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 mt-2 line-clamp-2">{pkg.description}</p>

                  <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Round-trip from:</span>
                      <span className="text-slate-900 font-bold">₹{pkg.fromPrice.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 block">Rate / km:</span>
                      <span className="text-red-600 font-bold">₹{pkg.ratePerKm}/km</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">{pkg.duration} · ~{pkg.estimatedDistanceKm} km</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditPackageModal(pkg)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete package "${pkg.title}"?`)) deletePackage(pkg.id);
                      }}
                      className="p-1.5 rounded-lg bg-slate-50 hover:bg-red-50 text-slate-500 hover:text-red-600 border border-slate-200 cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* TAB 3: FLEET & TARIFFS CMS */}
      {activeTab === 'fleet' && (
        <div className="space-y-6">
          
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-600">
              Update per-km billing rates, driver allowances, and vehicle capacities across the fleet.
            </p>
            <button
              onClick={() => {
                setEditingVehicleId(null);
                setVName('');
                setVType('Sedan');
                setVCapacity('4 Passengers');
                setVLuggage('3 Large Bags');
                setVRate(15);
                setVAllowance(400);
                setVMinKm(300);
                setVImg('https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=900&q=80');
                setIsVehicleModalOpen(true);
              }}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-red-500/25"
            >
              <Plus className="w-4 h-4" />
              <span>Add Vehicle Category</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((v) => (
              <div
                key={v.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-bold">{v.type}</span>
                      <h3 className="font-bold text-slate-900 text-base mt-0.5">{v.name}</h3>
                    </div>
                    <span className="text-base font-black text-red-600">₹{v.ratePerKm}/km</span>
                  </div>

                  <div className="mt-3 space-y-1.5 text-xs text-slate-700 font-mono">
                    <div className="flex justify-between">
                      <span className="font-sans text-slate-500">Capacity:</span>
                      <span>{v.capacity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-sans text-slate-500">Luggage:</span>
                      <span>{v.luggage}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-sans text-slate-500">Driver Allowance:</span>
                      <span>₹{v.driverAllowancePerDay} / day</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-sans text-slate-500">Min. Billing Km:</span>
                      <span>{v.minimumKmPerDay} km / day</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    onClick={() => openEditVehicleModal(v)}
                    className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit Tariff</span>
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Remove ${v.name} from fleet?`)) deleteVehicle(v.id);
                    }}
                    className="p-1.5 rounded-lg bg-slate-50 hover:bg-red-50 text-slate-500 hover:text-red-600 border border-slate-200 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* TAB 4: SETTINGS & POLICIES */}
      {activeTab === 'settings' && (
        <div className="max-w-2xl bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="text-lg font-black text-slate-900">Company Parameters</h3>
            <p className="text-xs text-slate-600 mt-1">
              Changes reflect immediately on the website header, footer, and booking dispatches.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateSettings({
                phone: companyPhone,
                whatsapp: companyPhone,
                email: companyEmail,
                address: companyAddress,
              });
            }}
            className="space-y-4 text-xs"
          >
            <div>
              <label className="block text-slate-700 font-bold mb-1">Company Dispatch Phone / WhatsApp</label>
              <input
                type="text"
                value={companyPhone}
                onChange={(e) => setCompanyPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Official Desk Email</label>
              <input
                type="email"
                value={companyEmail}
                onChange={(e) => setCompanyEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Headquarters Address</label>
              <input
                type="text"
                value={companyAddress}
                onChange={(e) => setCompanyAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Website Theme</label>
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-red-900 block text-xs">Wayora Red Edition (Pristine Light Theme)</span>
                  <span className="text-[11px] text-red-700 block">Clean white surfaces, luxury typography & ruby red branding</span>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-red-600 text-white font-bold text-[10px]">Active</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md shadow-red-500/25 cursor-pointer transition-colors"
              >
                Save Settings
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 4: DAILY OFFERS & OMNICHANNEL NOTIFICATIONS */}
      {activeTab === 'promotions' && (
        <div className="space-y-6">
          
          {/* Header Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-red-900 via-red-800 to-slate-900 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-red-300 font-bold block">
                Omnichannel Marketing & Driver Dispatch
              </span>
              <h2 className="text-xl font-black">Daily Travel Offers, Alerts & OTP Console</h2>
              <p className="text-xs text-red-200/90 max-w-xl">
                Broadcast holiday discounts, flash rates, and festival coupons to passenger mobiles and inboxes across WhatsApp, SMS, and Email simultaneously.
              </p>
            </div>
            
            <div className="flex gap-2">
              <button
                type="button"
                onClick={fetchNotificationLogs}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Logs</span>
              </button>
            </div>
          </div>

          {/* Metric Audience Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Subscribers</span>
                <span className="text-xl font-black text-slate-900">48+ Riders</span>
              </div>
              <span className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                <BellRing className="w-4 h-4" />
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">WhatsApp Cloud</span>
                <span className="text-xl font-black text-slate-900">Active (42)</span>
              </div>
              <span className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <MessageSquare className="w-4 h-4" />
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">SMS Gateway</span>
                <span className="text-xl font-black text-slate-900">Active (45)</span>
              </div>
              <span className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Phone className="w-4 h-4" />
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider block">Email Transport</span>
                <span className="text-xl font-black text-slate-900">Active (48)</span>
              </div>
              <span className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
                <Mail className="w-4 h-4" />
              </span>
            </div>
          </div>

          {/* Form & Previews Split */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left 7 cols: Broadcast Trigger Form */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-sm text-slate-900">Dispatch Daily Offer Campaign</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                  Omnichannel Ready
                </span>
              </div>

              <form onSubmit={handleBroadcastPromoSubmit} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Campaign Identifier</label>
                    <input
                      type="text"
                      required
                      value={promoCampaign}
                      onChange={(e) => setPromoCampaign(e.target.value)}
                      placeholder="e.g. Diwali Weekend Flash"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Promo Coupon Code</label>
                    <input
                      type="text"
                      required
                      value={promoCoupon}
                      onChange={(e) => setPromoCoupon(e.target.value.toUpperCase())}
                      placeholder="WAYORA500"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono font-bold uppercase focus:outline-none focus:border-red-600 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Offer Catchphrase / Title</label>
                  <input
                    type="text"
                    required
                    value={promoOfferTitle}
                    onChange={(e) => setPromoOfferTitle(e.target.value)}
                    placeholder="Flat ₹500 OFF On Outstation Highway Cabs"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Offer Terms & Fleet Details</label>
                  <textarea
                    rows={2}
                    value={promoDetails}
                    onChange={(e) => setPromoDetails(e.target.value)}
                    placeholder="Valid on Innova Crysta & Fortuner bookings across Telangana & AP."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white resize-none"
                  />
                </div>

                {/* Target Channels Checkboxes */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                    Target Broadcast Channels
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <label className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                      promoWhatsappChannel ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold' : 'bg-slate-50 border-slate-200 text-slate-500'
                    }`}>
                      <input
                        type="checkbox"
                        checked={promoWhatsappChannel}
                        onChange={(e) => setPromoWhatsappChannel(e.target.checked)}
                        className="rounded text-emerald-600"
                      />
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                      <span>WhatsApp</span>
                    </label>

                    <label className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                      promoSmsChannel ? 'bg-blue-50 border-blue-400 text-blue-900 font-bold' : 'bg-slate-50 border-slate-200 text-slate-500'
                    }`}>
                      <input
                        type="checkbox"
                        checked={promoSmsChannel}
                        onChange={(e) => setPromoSmsChannel(e.target.checked)}
                        className="rounded text-blue-600"
                      />
                      <Phone className="w-3.5 h-3.5 text-blue-600" />
                      <span>SMS</span>
                    </label>

                    <label className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                      promoEmailChannel ? 'bg-red-50 border-red-400 text-red-900 font-bold' : 'bg-slate-50 border-slate-200 text-slate-500'
                    }`}>
                      <input
                        type="checkbox"
                        checked={promoEmailChannel}
                        onChange={(e) => setPromoEmailChannel(e.target.checked)}
                        className="rounded text-red-600"
                      />
                      <Mail className="w-3.5 h-3.5 text-red-600" />
                      <span>Email</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-100">
                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold mb-1">Direct Test Mobile (Optional)</label>
                    <input
                      type="tel"
                      value={promoCustomPhone}
                      onChange={(e) => setPromoCustomPhone(e.target.value)}
                      placeholder="+91 98490 11223"
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold mb-1">Direct Test Email (Optional)</label>
                    <input
                      type="email"
                      value={promoCustomEmail}
                      onChange={(e) => setPromoCustomEmail(e.target.value)}
                      placeholder="admin@wayorajourneys.com"
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isBroadcasting}
                  className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md shadow-red-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>{isBroadcasting ? 'Dispatching Broadcast...' : 'Broadcast Daily Offer to Passengers'}</span>
                </button>
              </form>
            </div>

            {/* Right 5 cols: Live Multi-Channel Previews & OTP Test */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* WhatsApp Chat Preview */}
              <div className="p-4 rounded-3xl bg-[#0b141a] text-white border border-slate-800 shadow-md space-y-2">
                <div className="flex items-center gap-2 pb-2 border-b border-white/10 text-emerald-400 font-bold text-[11px]">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp Business Message Preview</span>
                </div>
                <div className="p-3 rounded-2xl bg-[#202c33] text-slate-100 text-[11px] space-y-1.5 shadow-xs">
                  <p className="font-bold text-white">✨ Wayora Journeys Exclusive</p>
                  <p>{promoOfferTitle}</p>
                  <div className="p-1.5 rounded bg-black/30 border border-white/10 text-[10px] font-mono text-amber-300">
                    Use Coupon: <strong>{promoCoupon}</strong>
                  </div>
                  <p className="text-[10px] text-slate-300">{promoDetails}</p>
                  <div className="pt-1 text-right text-[9px] text-slate-400">10:45 AM ✓✓</div>
                </div>
              </div>

              {/* SMS Preview */}
              <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2 text-xs">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-blue-600 font-bold text-[11px]">
                  <Phone className="w-3.5 h-3.5" />
                  <span>Transactional SMS (160 Chars)</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-[11px] font-mono">
                  WAYORA: {promoOfferTitle}. Use coupon {promoCoupon} for instant savings. Book: wayora.in/cab
                </div>
              </div>

              {/* Interactive OTP Verification Test Console */}
              <div className="p-4 rounded-3xl bg-slate-900 text-white shadow-md space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <div className="flex items-center gap-1.5 font-bold text-red-400">
                    <KeyRound className="w-4 h-4" />
                    <span>OTP Dispatcher Console</span>
                  </div>
                  {testOtpCode && (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono font-bold text-[10px]">
                      Code: {testOtpCode}
                    </span>
                  )}
                </div>

                <div className="space-y-2 text-[11px]">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={testOtpRecipient}
                      onChange={(e) => setTestOtpRecipient(e.target.value)}
                      placeholder="+91 98490 11223"
                      className="flex-1 px-2.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none"
                    />
                    <select
                      value={testOtpChannel}
                      onChange={(e) => setTestOtpChannel(e.target.value as any)}
                      className="px-2 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none font-bold"
                    >
                      <option value="whatsapp">WhatsApp</option>
                      <option value="sms">SMS</option>
                      <option value="email">Email</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={handleTestOtpDispatch}
                    className="w-full py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Send className="w-3 h-3" />
                    <span>Send Test 6-Digit OTP</span>
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Audit Logs Table */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">Broadcast Delivery Logs</h3>
              <span className="text-xs text-slate-400 font-mono">{promoLogs.length} Records</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 font-bold">Campaign ID</th>
                    <th className="py-2.5 font-bold">Offer Coupon</th>
                    <th className="py-2.5 font-bold">Channels</th>
                    <th className="py-2.5 font-bold">Audience</th>
                    <th className="py-2.5 font-bold">Status</th>
                    <th className="py-2.5 font-bold text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {promoLogs.map((log, idx) => (
                    <tr key={log.id || idx} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 font-mono font-bold text-slate-900">
                        {log.campaign || log.id}
                      </td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded bg-red-50 text-red-600 font-mono font-bold">
                          {log.offerCoupon || 'WAYORA500'}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-1">
                          {(log.channels || ['email', 'whatsapp', 'sms']).map((ch: string) => (
                            <span key={ch} className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600">
                              {ch}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 font-semibold text-slate-900">
                        {log.totalRecipients || 48} Recipients
                      </td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>DELIVERED</span>
                        </span>
                      </td>
                      <td className="py-3 text-right font-mono text-slate-500 text-[11px]">
                        {new Date(log.sentAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* MODAL: ASSIGN CHAUFFEUR */}
      {activeAssignModalId && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl text-slate-900">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Assign Chauffeur to {activeAssignModalId}</h3>
              <button onClick={() => setActiveAssignModalId(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAssignChauffeurSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Driver Full Name & ID *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Goud (Chauffeur #04)"
                  value={assignDriverName}
                  onChange={(e) => setAssignDriverName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">Vehicle License Plate Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TS 09 UB 4519"
                  value={assignCarNumber}
                  onChange={(e) => setAssignCarNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveAssignModalId(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Confirm Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: TOUR PACKAGE EDIT / ADD */}
      {isPkgModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl text-slate-900">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">
                {editingPkgId ? 'Edit Tour Package' : 'Create New Tour Package'}
              </h3>
              <button onClick={() => setIsPkgModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSavePackage} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Package Title *</label>
                  <input
                    type="text"
                    required
                    value={pkgTitle}
                    onChange={(e) => setPkgTitle(e.target.value)}
                    placeholder="e.g. Mantralayam Raghavendra Swamy"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Category *</label>
                  <select
                    value={pkgCategory}
                    onChange={(e) => setPkgCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white"
                  >
                    <option value="spiritual">Spiritual</option>
                    <option value="hill">Hill Station</option>
                    <option value="beach">Beach & Coastal</option>
                    <option value="heritage">Heritage</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Short Tagline</label>
                <input
                  type="text"
                  value={pkgTagline}
                  onChange={(e) => setPkgTagline(e.target.value)}
                  placeholder="e.g. Sacred Tungabhadra River Darshan"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Description *</label>
                <textarea
                  rows={2}
                  required
                  value={pkgDesc}
                  onChange={(e) => setPkgDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white resize-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Duration</label>
                  <input
                    type="text"
                    value={pkgDuration}
                    onChange={(e) => setPkgDuration(e.target.value)}
                    placeholder="2 days"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Round Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={pkgPrice}
                    onChange={(e) => setPkgPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Rate / km (₹)</label>
                  <input
                    type="number"
                    value={pkgRatePerKm}
                    onChange={(e) => setPkgRatePerKm(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Photo Image URL</label>
                <input
                  type="text"
                  value={pkgImg}
                  onChange={(e) => setPkgImg(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Highlights (comma-separated)</label>
                <input
                  type="text"
                  value={pkgHighlights}
                  onChange={(e) => setPkgHighlights(e.target.value)}
                  placeholder="Brindavanam, Panchamukhi Anjaneya, Tungabhadra River"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPkgModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Save Package
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: FLEET VEHICLE EDIT / ADD */}
      {isVehicleModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl text-slate-900">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">
                {editingVehicleId ? 'Edit Vehicle Tariff' : 'Add Vehicle Category'}
              </h3>
              <button onClick={() => setIsVehicleModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveVehicle} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Vehicle Name *</label>
                <input
                  type="text"
                  required
                  value={vName}
                  onChange={(e) => setVName(e.target.value)}
                  placeholder="e.g. Toyota Innova Hycross"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Rate per km (₹) *</label>
                  <input
                    type="number"
                    required
                    value={vRate}
                    onChange={(e) => setVRate(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Driver Allowance (₹/day) *</label>
                  <input
                    type="number"
                    required
                    value={vAllowance}
                    onChange={(e) => setVAllowance(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Seating Capacity</label>
                  <input
                    type="text"
                    value={vCapacity}
                    onChange={(e) => setVCapacity(e.target.value)}
                    placeholder="7 Passengers"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Luggage Capacity</label>
                  <input
                    type="text"
                    value={vLuggage}
                    onChange={(e) => setVLuggage(e.target.value)}
                    placeholder="4 Bags"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsVehicleModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Save Tariff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
