import React, { useState, useEffect } from 'react';
import { useCms, PageId } from '../context/CmsContext';
import { ImageWithFallback } from '../components/ImageWithFallback';
import { RoyalDoorwaySection } from '../components/RoyalDoorwaySection';
import { TrendingRoutesStickySection } from '../components/TrendingRoutesStickySection';
import { TripType } from '../types';
import {
  ArrowRight, ShieldCheck, MapPin, Calendar, Clock, Users,
  Sparkles, Award, Star, Compass, Phone, MessageSquare, CheckCircle2,
  Briefcase, Car, ChevronRight, Gauge, RefreshCw, Navigation,
  Wallet, Globe, HelpCircle, ChevronDown, Check, Copy, Tag, Building2,
  UserCheck, User, Menu, ChevronUp, Shield, X, Luggage, Plane, Hotel, Home, BookOpen
} from 'lucide-react';

import { 
  calculateTripRouteAndPrice, 
  fetchLiveMapRoute, 
  searchMapLocations, 
  POPULAR_DESTINATION_PRESETS,
  MapLocationItem,
  CITY_COORDINATES
} from '../utils/geoDistancePrice';
import { MapLocationPickerModal } from '../components/MapLocationPickerModal';


export const HomePage: React.FC = () => {
  const {
    packages, vehicles, openBookingModal, setActivePage, activePage,
    settings, themeMode, userLocation, userCoords, isLocating, detectUserLocation,
    currentRider, openAuthModal, currentCaptain, navigateToBooking
  } = useCms();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Navigation items with related icons for the minimal header
  const navItems: { id: PageId; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Home', icon: <Home className="w-3.5 h-3.5" /> },
    { id: 'booking', label: 'Car Booking', icon: <Car className="w-3.5 h-3.5" /> },
    { id: 'packages', label: 'Tours', icon: <Compass className="w-3.5 h-3.5" /> },
    { id: 'fleet', label: 'Fleet & Rates', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
    { id: 'planner', label: 'Route Planner', icon: <MapPin className="w-3.5 h-3.5" /> },
    { id: 'corporate', label: 'Corporate', icon: <Briefcase className="w-3.5 h-3.5" /> },
    { id: 'blog', label: 'Guides', icon: <BookOpen className="w-3.5 h-3.5" /> },
    { id: 'about', label: 'About & Support', icon: <HelpCircle className="w-3.5 h-3.5" /> },
  ];

  const handleNavClick = (id: PageId) => {
    setActivePage(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cab Booking Trip Modes: Round Trip | One-Way Drop | Hourly Rental
  const [tripMode, setTripMode] = useState<'Round Trip' | 'One-Way Drop' | 'Hourly Rental'>('Round Trip');

  // Cab Classes & Vehicle Types
  const cabClasses = [
    { id: 'sedan', name: 'Executive Sedan', model: 'Dzire / Etios · AC', rate: '₹13/km', seats: '4 Pax', bags: '2 Bags' },
    { id: 'innova', name: 'Innova Crysta', model: '6+1 Luxury Captain · AC', rate: '₹19/km', seats: '6+1 Pax', bags: '4 Bags' },
    { id: 'suv', name: 'Toyota Fortuner VIP', model: '7-Seater Luxury SUV', rate: '₹28/km', seats: '7 Pax', bags: '5 Bags' },
    { id: 'tempo', name: 'Tempo Traveller', model: '12-Seater Pushback Luxury', rate: '₹26/km', seats: '12 Pax', bags: '10 Bags' },
    { id: 'ev', name: 'Urban Green EV', model: 'Tata Tigor / Nexon EV', rate: '₹14/km', seats: '4 Pax', bags: '2 Bags' },
  ];
  const [selectedCabIndex, setSelectedCabIndex] = useState(1); // Default Innova Crysta
  const selectedCab = cabClasses[selectedCabIndex];

  // Form Fields strictly tailored to Car / Cab Booking
  const [fromCity, setFromCity] = useState(userLocation || 'Hyderabad, Telangana');
  const [fromAddress, setFromAddress] = useState('Hitec City / Airport / Doorstep');
  const [toCity, setToCity] = useState('Tirupati, Andhra Pradesh');
  const [toDropDetails, setToDropDetails] = useState('Temple Darshan / Hotel Drop');
  const [destinationCoords, setDestinationCoords] = useState<{ lat: number; lng: number } | null>(CITY_COORDINATES.tirupati);
  const [destinationSuggestions, setDestinationSuggestions] = useState<MapLocationItem[]>([]);
  const [showDestSuggestions, setShowDestSuggestions] = useState(false);
  const [isSearchingPlaces, setIsSearchingPlaces] = useState(false);
  const [isFetchingMapRoute, setIsFetchingMapRoute] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [liveMapData, setLiveMapData] = useState<{ distanceKm?: number; durationMinutes?: number; summary?: string } | null>(null);

  const [departureDate, setDepartureDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [departureTime, setDepartureTime] = useState('06:00');
  const [returnDate, setReturnDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  });
  const [returnTime, setReturnTime] = useState('21:00');
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);

  // Dropdown toggles
  const [showClassDropdown, setShowClassDropdown] = useState(false);

  // Sync auto-detected location into pickup field
  useEffect(() => {
    if (userLocation) {
      setFromCity(userLocation);
      setFromAddress('GPS Verified · Doorstep Pickup');
    }
  }, [userLocation]);

  // Debounced auto-fetch place suggestions from Maps (OpenStreetMap & Highway Directory) as user types
  useEffect(() => {
    if (!toCity || toCity.trim().length < 2) {
      setDestinationSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingPlaces(true);
      try {
        const results = await searchMapLocations(toCity);
        setDestinationSuggestions(results);
      } catch {
        // silent
      } finally {
        setIsSearchingPlaces(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [toCity]);

  // Handle selecting a destination from map suggestions or popular quick presets
  const handleSelectDestination = (dest: { name: string; displayName?: string; lat?: number; lng?: number }) => {
    setToCity(dest.name);
    if (dest.displayName) {
      const parts = dest.displayName.split(',');
      setToDropDetails(parts.slice(1, 3).join(',').trim() || 'Verified Map Landmark Drop');
    }
    if (dest.lat && dest.lng) {
      setDestinationCoords({ lat: dest.lat, lng: dest.lng });
    }
    setShowDestSuggestions(false);
  };

  // Auto-fetch real-time driving road route & duration from OpenStreetMap OSRM
  useEffect(() => {
    const originC = userCoords || CITY_COORDINATES.hyderabad;
    const destC = destinationCoords || CITY_COORDINATES.tirupati;

    let active = true;
    const fetchRoute = async () => {
      setIsFetchingMapRoute(true);
      try {
        const route = await fetchLiveMapRoute(originC, destC);
        if (active && route) {
          setLiveMapData(route);
        }
      } catch {
        // silent fallback
      } finally {
        if (active) setIsFetchingMapRoute(false);
      }
    };

    fetchRoute();
    return () => {
      active = false;
    };
  }, [fromCity, toCity, userCoords, destinationCoords]);

  // Real-time automatic route & price & reach time calculation
  const [routeCalc, setRouteCalc] = useState(() =>
    calculateTripRouteAndPrice({
      originName: fromCity,
      originCoords: userCoords,
      destinationName: toCity,
      destinationCoords,
      tripType: tripMode,
      departureDate,
      departureTime,
    })
  );

  // Recalculate whenever live location, pickup city, destination, departure time, or map route changes
  useEffect(() => {
    const calc = calculateTripRouteAndPrice({
      originName: fromCity,
      originCoords: userCoords,
      destinationName: toCity,
      destinationCoords,
      tripType: tripMode,
      departureDate,
      departureTime,
      liveDistanceKm: liveMapData?.distanceKm,
      liveDurationMinutes: liveMapData?.durationMinutes,
      highwaySummary: liveMapData?.summary,
    });
    setRouteCalc(calc);
  }, [fromCity, toCity, tripMode, userCoords, destinationCoords, departureDate, departureTime, liveMapData]);

  const handleGetLiveLocation = async () => {
    const loc = await detectUserLocation(true);
    if (loc) {
      setFromCity(loc);
      setFromAddress('GPS Verified · Doorstep Pickup');
    }
  };

  const handleHeroSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    navigateToBooking({
      tripType: tripMode === 'One-Way Drop' ? 'Outstation One-way' : 'Outstation Round-trip',
      fromCity,
      toCity,
      pickupDate: departureDate,
      pickupTime: departureTime,
    });
  };

  const handleCopyCoupon = (code: string) => {
    try {
      navigator.clipboard?.writeText(code);
    } catch {
      // ignore
    }
    setCopiedCoupon(code);
    setTimeout(() => setCopiedCoupon(null), 2500);
  };

  const handleBookOffer = (offerTitle: string, code: string) => {
    handleCopyCoupon(code);
    openBookingModal(`${offerTitle} (Coupon: ${code})`);
  };

  const specialOffers = [
    {
      id: 'offer-1',
      category: 'INTERCITY SPECIAL',
      title: 'Flat ₹500 OFF On Outstation',
      subtitle: 'One-way & round trip highway cabs',
      coupon: 'WAYORA500',
      img: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'offer-2',
      category: 'PILGRIM SPECIAL',
      title: '15% OFF Temple Tour Cabs',
      subtitle: 'Tirupati, Srisailam & Shirdi round-trips',
      coupon: 'DARSHAN15',
      img: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'offer-3',
      category: 'AIRPORT TRANSFER',
      title: 'Flat ₹250 OFF Airport Cabs',
      subtitle: 'On-time flight pickup with zero wait fee',
      coupon: 'AIRPORT250',
      img: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=400&q=80',
    },
  ];

  const featuredPackages = packages.filter((p) => p.featured).slice(0, 6);

  // Theme styling helpers - Clean luxury light theme with red & white accents:
  const isLightMode = true;
  const isDarkMode = false;

  return (
    <div className="space-y-0 pb-0 bg-slate-50 text-slate-900">

      {/* ================= SECTION 1: HERO SECTION WITH INTEGRATED SITE HEADER ================= */}
      <section className="relative overflow-hidden bg-slate-50 text-slate-900 pb-20 sm:pb-28">

        {/* Top Stage Layer with Professional Focused Car Booking Hero */}
        <div className="relative bg-white text-slate-900 overflow-hidden shadow-xs border-b border-slate-200/60">

          {/* Panoramic City Skyline & Highway Overlook Hero Background with Left-side Contrast Overlay */}
          <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0">
            <img
              src="/images/hh.jpg"
              alt="Metropolitan city skyline and scenic highway overlook"
              className="w-full h-full object-cover object-center lg:object-[center_60%] filter contrast-[1.02] saturate-[1.05]"
            />
            {/* Contrast overlay: On mobile, full vertical protective gradient ensuring 100% crisp typography; On desktop, elegant left-side gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/95 via-white/85 to-white/30 sm:bg-gradient-to-r sm:from-white sm:via-white/95 sm:to-transparent lg:w-[54%]" />
          </div>

          {/* 1. MINIMAL SITE HEADER ON HERO (NEXORA Minimal Light Style) */}
          <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-3.5 transition-all shadow-xs">
            <div className="max-w-7xl xl:max-w-[1360px] mx-auto flex items-center justify-between gap-4">

              {/* Wordmark Logo */}
              <button
                type="button"
                onClick={() => handleNavClick('home')}
                className="flex items-center gap-2.5 cursor-pointer group shrink-0"
                title="Wayora Journeys"
              >
                <img
                  src="/images/wayora-logo-light.jpg"
                  alt="Wayora Journeys Brand Logo"
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-contain shadow-xs border border-slate-200/80 bg-white p-0.5 group-hover:scale-105 transition-transform"
                />
                <div className="flex flex-col text-left">
                  <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 leading-none">
                    Wayora<span className="text-red-600">Journeys</span>
                  </span>
                  <span className="hidden sm:block text-[9px] text-slate-500 font-bold tracking-widest uppercase mt-0.5">
                    Reliable Travel · Professional Service
                  </span>
                </div>
              </button>

              {/* Minimal Clean Navigation Links (Pure typography, minimal and professional) */}
              <nav className="hidden lg:flex items-center gap-1.5 xl:gap-2 shrink-0">
                {navItems.map((item) => {
                  const isActive = activePage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`whitespace-nowrap shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${isActive
                        ? 'bg-red-50 text-red-600 border border-red-200/80 shadow-xs font-bold'
                        : 'text-slate-700 hover:text-red-600 hover:bg-slate-100/80'
                        }`}
                    >
                      <span className="whitespace-nowrap">{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Right Zone: Partner CTA & Rider Profile Pill */}
              <div className="flex items-center gap-2 xl:gap-3 shrink-0">

                {/* Become a Partner Button */}
                <button
                  type="button"
                  onClick={() => handleNavClick('captain')}
                  className="hidden xl:flex items-center gap-1.5 bg-slate-100/90 hover:bg-slate-200/80 text-slate-800 text-xs font-semibold px-3 py-1.5 rounded-full border border-slate-200 transition-all cursor-pointer shadow-xs hover:scale-102 shrink-0 whitespace-nowrap"
                >
                  <UserCheck className="w-3.5 h-3.5 text-red-600" />
                  <span>Become a Partner</span>
                  <ChevronDown className="w-3 h-3 text-slate-500" />
                </button>

                {/* Rider Profile Pill */}
                <button
                  type="button"
                  onClick={openAuthModal}
                  className="flex items-center gap-2 bg-slate-100/90 hover:bg-slate-200/80 text-slate-900 text-xs font-semibold pl-1.5 pr-3 py-1.5 rounded-full border border-slate-200 transition-all cursor-pointer shadow-xs hover:scale-102 shrink-0 whitespace-nowrap"
                >
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                    alt="User Profile"
                    className="w-6 h-6 rounded-full object-cover ring-1 ring-white shrink-0"
                  />
                  <span className="truncate max-w-[80px] sm:max-w-[110px] whitespace-nowrap">
                    {currentRider ? currentRider.name : 'Aarav Sharma'}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-500 shrink-0" />
                </button>

                {/* Mobile Menu Toggle Button */}
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="lg:hidden p-2 text-slate-800 hover:text-red-600 rounded-xl bg-slate-100 border border-slate-200"
                  aria-label="Toggle navigation"
                >
                  {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                </button>

              </div>

            </div>

            {/* Mobile Expanded Menu Drawer */}
            {mobileMenuOpen && (
              <div className="lg:hidden mt-3 pt-3 border-t border-slate-200 space-y-1.5 animate-in fade-in bg-white/95 rounded-2xl p-3 shadow-lg">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold hover:bg-slate-100 text-slate-800 transition-colors"
                  >
                    <span className="text-red-600">{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
                <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleNavClick('captain')}
                    className="py-2 text-center text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center gap-1.5"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-red-600" />
                    <span>Captain</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNavClick('cms')}
                    className="py-2 text-center text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center gap-1.5"
                  >
                    <Shield className="w-3.5 h-3.5 text-red-600" />
                    <span>CMS Admin</span>
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigateToBooking({
                      tripType: tripMode === 'One-Way Drop' ? 'Outstation One-way' : 'Outstation Round-trip',
                      fromCity,
                      toCity,
                      pickupDate: departureDate,
                      pickupTime: departureTime,
                    });
                  }}
                  className="w-full py-2.5 text-center text-xs font-bold rounded-xl bg-red-600 text-white hover:bg-red-700 shadow-md flex items-center justify-center gap-1.5 mt-1"
                >
                  <Car className="w-3.5 h-3.5" />
                  <span>Book Cab Now</span>
                </button>
              </div>
            )}
          </header>

          {/* 2. SUBHEADER TRUST STRIP */}
          <div className="relative z-20 bg-white/70 backdrop-blur-xs border-b border-slate-200/60 px-4 sm:px-6 lg:px-8 py-2">
            <div className="max-w-7xl xl:max-w-[1360px] mx-auto flex flex-wrap items-center justify-between gap-3 text-xs text-slate-700">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-50 border border-red-200 text-[10px] font-bold text-red-700">
                  <Sparkles className="w-3 h-3 text-red-600" />
                  INDIA&apos;S #1 CHAUFFEUR RIDE
                </span>
                <span className="hidden sm:inline text-slate-600 font-medium">
                  Zero Cancellation Guarantee · All-Inclusive Tolls & GST
                </span>
              </div>
              <div className="flex items-center gap-4 text-[11px] font-medium text-slate-600">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Commercial Yellow Plate Fleet
                </span>
                <span className="hidden md:flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  Guaranteed On-Time Pickup
                </span>
              </div>
            </div>
          </div>

          {/* 3. HERO SKY STAGE (NEXORA Style Clean Layout with Left Typography & Right-focused Car) */}
          <div className="max-w-7xl xl:max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 lg:pt-28 xl:pt-36 pb-48 sm:pb-20 lg:pb-72 xl:pb-50 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

              {/* Left Column: High-contrast Dark Typography on White Overlay */}
              <div className="lg:col-span-7 space-y-6 sm:space-y-7">
                <div className="inline-flex flex-wrap items-center gap-1.5 sm:gap-2 px-4 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-slate-200/90 text-xs font-semibold text-slate-800 shadow-xs max-w-full">
                  <span className="flex items-center gap-1.5 shrink-0">
                    <Car className="w-3.5 h-3.5 text-red-600" />
                    <span>Outstation & Highway Cabs</span>
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className="flex items-center gap-1 text-slate-700 font-bold shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>4.9★ Verified</span>
                  </span>
                </div>

                <h1 className="text-3xl sm:text-5xl xl:text-6xl font-black tracking-tight text-slate-900 leading-[1.08]">
                  Book your ride <br className="hidden sm:inline" />
                  <span className="text-red-600">in seconds.</span>
                </h1>
              </div>

              {/* Right Column: 100% open space showcasing the focused luxury chauffeur car */}
              <div className="hidden lg:block lg:col-span-5 pointer-events-none select-none" />

            </div>
          </div>

        </div>

        {/* 4. MAIN CONTENT BODY (Comfortable -mt overlap with balanced layout) */}
        <div className="max-w-7xl xl:max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 -mt-20 sm:-mt-24 lg:-mt-28 relative z-20">
          <div className="flex flex-col lg:flex-row items-stretch gap-6 lg:gap-8">

            {/* LEFT FLOATING SIDEBAR (Car Booking Nav & Club Column) */}
            <div className="hidden lg:flex flex-col justify-between w-60 xl:w-64 shrink-0 bg-gradient-to-b from-red-800 via-rose-700 to-red-600 text-white rounded-[32px] p-6 lg:p-7 shadow-2xl relative overflow-hidden border border-white/20 min-h-[600px]">

              {/* Cloud bottom ambiance */}
              <div
                className="absolute inset-x-0 bottom-0 h-48 opacity-25 mix-blend-screen pointer-events-none bg-cover bg-bottom"
                style={{
                  backgroundImage: `url('https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=600&q=80')`
                }}
              />

              <div className="relative z-10">
                {/* Brand Logo & Menu */}
                <div className="flex items-center justify-between pb-7">
                  <span className="text-xl font-black tracking-tight select-none text-white flex items-center gap-2.5">
                    <img
                      src="/images/wayora-logo-dark.jpg"
                      alt="Wayora Journeys Brand Logo"
                      className="w-8 h-8 rounded-xl object-contain shadow-sm ring-1 ring-white/20 bg-black p-0.5"
                    />
                    <span>Wayora</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setActivePage('fleet')}
                    className="text-white/80 hover:text-white p-1 cursor-pointer transition-colors"
                    title="View Fleet"
                  >
                    <Gauge className="w-5 h-5" />
                  </button>
                </div>

                {/* Vertical Navigation Items strictly for Car/Chauffeur Services */}
                <nav className="space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTripMode('Round Trip');
                      window.scrollTo({ top: 180, behavior: 'smooth' });
                    }}
                    className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-semibold transition-colors text-left cursor-pointer ${tripMode === 'Round Trip'
                      ? 'bg-white/25 text-white backdrop-blur-md shadow-inner'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                      }`}
                  >
                    <Car className="w-4 h-4 text-white" />
                    <span>Outstation Cabs</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTripMode('One-Way Drop');
                      window.scrollTo({ top: 180, behavior: 'smooth' });
                    }}
                    className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-semibold transition-colors text-left cursor-pointer ${tripMode === 'One-Way Drop'
                      ? 'bg-white/25 text-white backdrop-blur-md shadow-inner'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                      }`}
                  >
                    <Navigation className="w-4 h-4" />
                    <span>One-Way Drops</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTripMode('Hourly Rental');
                      window.scrollTo({ top: 180, behavior: 'smooth' });
                    }}
                    className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-semibold transition-colors text-left cursor-pointer ${tripMode === 'Hourly Rental'
                      ? 'bg-white/25 text-white backdrop-blur-md shadow-inner'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                      }`}
                  >
                    <Clock className="w-4 h-4" />
                    <span>Hourly Rental</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActivePage('packages')}
                    className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl hover:bg-white/10 text-white/80 hover:text-white font-medium text-xs transition-colors cursor-pointer text-left"
                  >
                    <Compass className="w-4 h-4" />
                    <span>Tour Packages</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActivePage('fleet')}
                    className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl hover:bg-white/10 text-white/80 hover:text-white font-medium text-xs transition-colors cursor-pointer text-left"
                  >
                    <Gauge className="w-4 h-4" />
                    <span>Fleet & Tariffs</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActivePage('corporate')}
                    className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl hover:bg-white/10 text-white/80 hover:text-white font-medium text-xs transition-colors cursor-pointer text-left"
                  >
                    <Briefcase className="w-4 h-4" />
                    <span>Corporate Fleet</span>
                  </button>
                </nav>
              </div>

              {/* Bottom Wayora Miles VIP Pass Card */}
              <div className="pt-6 relative z-10">
                <div className="bg-white text-neutral-900 rounded-full px-3.5 py-2.5 flex items-center justify-between shadow-xl border border-white">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center shadow-sm shrink-0">
                      <Award className="w-3.5 h-3.5" />
                    </span>
                    <div className="text-left">
                      <div className="text-[11px] font-black leading-tight">Wayora Miles Pass</div>
                      <div className="text-[9px] text-neutral-500 font-semibold">Save ₹500/trip</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => openBookingModal('Wayora Miles VIP Pass ₹499/year')}
                    className="w-7 h-7 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-700 transition-colors cursor-pointer"
                    title="Activate VIP Club Pass"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: HERO FLOATING CAR BOOKING CARD & SPECIAL OFFERS */}
            <div className="flex-1 min-w-0 space-y-8 sm:space-y-10">

              {/* MAIN BOOKING CARD (White Floating Card from Reference with spacious padding) */}
              <div className="bg-white rounded-[32px] p-6 sm:p-8 lg:p-9 shadow-2xl border border-neutral-100/90 text-neutral-900 relative">

                {/* Trip Mode Switcher: Round Trip | One-Way Drop | Hourly Rental */}
                <div className="inline-flex items-center bg-[#F4F6F9] p-1.5 rounded-full mb-6 sm:mb-8 shadow-inner">
                  {(['Round Trip', 'One-Way Drop', 'Hourly Rental'] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setTripMode(mode)}
                      className={`px-5 sm:px-6 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${tripMode === mode
                        ? 'bg-white text-neutral-900 shadow-sm'
                        : 'text-neutral-500 hover:text-neutral-900'
                        }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>

                {/* Booking Inputs Grid (2 Rows strictly for Car Booking with generous spacing) */}
                <form onSubmit={handleHeroSearch} className="space-y-5">

                  {/* Row 1: FROM (PICKUP), TO (DESTINATION), CAB TYPE & SEATS */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-5">

                    {/* Tile 1: FROM (PICKUP LOCATION) */}
                    <div className="md:col-span-4 bg-[#F8FAFC] hover:bg-neutral-100/70 border border-neutral-200/70 rounded-2xl p-4 sm:p-5 transition-colors relative group">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-red-500" />
                          PICKUP CITY / ADDRESS
                        </span>
                        <button
                          type="button"
                          onClick={handleGetLiveLocation}
                          className="shrink-0 whitespace-nowrap text-[10px] font-bold text-red-600 hover:text-red-700 flex items-center gap-1.5 cursor-pointer bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-full transition-all border border-red-100 shadow-xs"
                          title="Get live location permission and auto-detect pickup"
                        >
                          <span className="relative flex h-2 w-2">
                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 ${isLocating ? 'inline-flex' : 'hidden'}`} />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600" />
                          </span>
                          <RefreshCw className={`w-2.5 h-2.5 ${isLocating ? 'animate-spin' : ''}`} />
                          <span>{isLocating ? 'Detecting GPS...' : 'Live Location'}</span>
                        </button>
                      </div>

                      <input
                        type="text"
                        required
                        value={fromCity}
                        onChange={(e) => setFromCity(e.target.value)}
                        placeholder="e.g. Hyderabad, Telangana"
                        className="w-full bg-transparent text-sm sm:text-base font-bold text-neutral-900 focus:outline-none placeholder-neutral-400"
                      />
                      <input
                        type="text"
                        value={fromAddress}
                        onChange={(e) => setFromAddress(e.target.value)}
                        placeholder="Hitec City, Airport, or Home Address"
                        className="w-full bg-transparent text-[11px] text-neutral-500 font-medium focus:outline-none truncate mt-0.5"
                      />
                    </div>

                    {/* Tile 2: TO (DESTINATION DROP WITH MAPS AUTO-FETCH) */}
                    <div className="md:col-span-4 bg-[#F8FAFC] hover:bg-neutral-100/70 border border-neutral-200/70 rounded-2xl p-4 sm:p-5 transition-colors relative group">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-red-500" />
                          DESTINATION DROP
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setShowMapPicker(true)}
                            className="text-[10px] font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2 py-0.5 rounded-full flex items-center gap-1 border border-red-200 transition-colors cursor-pointer shadow-2xs"
                            title="Open map and drop pin on exact doorstep, custom location, or hotel"
                          >
                            <Compass className="w-2.5 h-2.5 text-red-600" />
                            <span>Choose on Map</span>
                          </button>
                          {isFetchingMapRoute ? (
                            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full flex items-center gap-1 border border-amber-200 animate-pulse">
                              <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                              <span>Route...</span>
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
                              <Check className="w-2.5 h-2.5 text-emerald-600" />
                              <span>Map</span>
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={toCity}
                          onFocus={() => setShowDestSuggestions(true)}
                          onChange={(e) => {
                            setToCity(e.target.value);
                            setShowDestSuggestions(true);
                          }}
                          placeholder="City, hotel, resort, or paste Google Maps link"
                          className="w-full bg-transparent text-sm sm:text-base font-bold text-neutral-900 focus:outline-none placeholder-neutral-400 pr-6"
                        />
                        {toCity && (
                          <button
                            type="button"
                            onClick={() => {
                              setToCity('');
                              setShowDestSuggestions(false);
                            }}
                            className="absolute right-0 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 p-0.5 cursor-pointer"
                            title="Clear"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-1">
                        <input
                          type="text"
                          value={toDropDetails}
                          onChange={(e) => setToDropDetails(e.target.value)}
                          placeholder="Hotel, Landmark, or Doorstep Drop"
                          className="w-full bg-transparent text-[11px] text-neutral-500 font-medium focus:outline-none truncate"
                        />
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              const clip = await navigator.clipboard?.readText();
                              if (clip) {
                                setToCity(clip);
                                setShowDestSuggestions(true);
                              }
                            } catch {}
                          }}
                          className="text-[9px] font-bold text-slate-500 hover:text-red-600 bg-slate-100 hover:bg-red-50 px-2 py-0.5 rounded shrink-0 transition-colors cursor-pointer ml-1"
                          title="Paste Google Maps URL or coordinates from clipboard"
                        >
                          Paste Link
                        </button>
                      </div>

                      {/* Reach Time & Distance Summary Chip directly inside the Destination tile */}
                      <div className="mt-2.5 pt-2 border-t border-neutral-200/60 flex items-center justify-between text-[11px]">
                        <span className="text-slate-700 font-bold flex items-center gap-1">
                          <Compass className="w-3 h-3 text-red-500" />
                          <span>{routeCalc.distanceKm} km</span>
                          <span className="text-slate-400 font-normal">({routeCalc.durationFormatted})</span>
                        </span>
                        <span className="text-emerald-800 font-extrabold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/80 flex items-center gap-1 shadow-2xs">
                          <Clock className="w-3 h-3 text-emerald-600" />
                          <span>{routeCalc.reachTimeFormatted}</span>
                        </span>
                      </div>

                      {/* Map Autocomplete Suggestions Dropdown */}
                      {showDestSuggestions && (
                        <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2.5 z-40 animate-in fade-in zoom-in-95 max-h-72 overflow-y-auto">
                          <div className="flex items-center justify-between px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
                            <span>OpenStreetMap Indian Destinations</span>
                            {isSearchingPlaces && <RefreshCw className="w-2.5 h-2.5 animate-spin text-red-500" />}
                          </div>

                          {destinationSuggestions.length > 0 ? (
                            destinationSuggestions.map((item, idx) => (
                              <button
                                key={`${item.name}-${idx}`}
                                type="button"
                                onClick={() => handleSelectDestination(item)}
                                className="w-full text-left px-2.5 py-2 hover:bg-red-50 rounded-xl transition-colors flex items-start gap-2.5 group/item cursor-pointer"
                              >
                                <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5 group-hover/item:scale-110 transition-transform" />
                                <div className="min-w-0 flex-1">
                                  <div className="text-xs font-bold text-slate-800 group-hover/item:text-red-700 truncate">
                                    {item.name}
                                  </div>
                                  <div className="text-[10px] text-slate-400 truncate">
                                    {item.displayName}
                                  </div>
                                </div>
                              </button>
                            ))
                          ) : (
                            <div className="p-2 text-center text-xs text-slate-400">
                              {isSearchingPlaces ? 'Searching OpenStreetMap...' : 'Type any city or temple in India'}
                            </div>
                          )}

                          {/* Quick Popular Presets */}
                          <div className="mt-2 pt-2 border-t border-slate-100">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block px-2 mb-1.5">
                              Popular Outstation Presets
                            </span>
                            <div className="grid grid-cols-2 gap-1.5">
                              {POPULAR_DESTINATION_PRESETS.slice(0, 6).map((preset) => (
                                <button
                                  key={preset.name}
                                  type="button"
                                  onClick={() => handleSelectDestination({ name: preset.location })}
                                  className="text-left px-2 py-1.5 rounded-lg bg-slate-50 hover:bg-red-50 text-[10px] font-semibold text-slate-700 hover:text-red-700 transition-colors flex items-center gap-1.5 truncate cursor-pointer"
                                >
                                  <span>{preset.icon}</span>
                                  <span className="truncate">{preset.name}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Tile 3: CAB TYPE & SEATS CLASS */}
                    <div className="md:col-span-4 bg-[#F8FAFC] hover:bg-neutral-100/70 border border-neutral-200/70 rounded-2xl p-4 sm:p-5 transition-colors relative">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
                        CAB CLASS & SEATS
                      </span>
                      <div
                        onClick={() => setShowClassDropdown((prev) => !prev)}
                        className="flex items-center justify-between cursor-pointer select-none"
                      >
                        <div>
                          <div className="text-sm sm:text-base font-bold text-neutral-900 flex items-center gap-1.5">
                            <Car className="w-4 h-4 text-red-600" />
                            {selectedCab.name}
                          </div>
                          <div className="text-[11px] text-neutral-500 font-medium flex items-center gap-2 mt-0.5">
                            <span>{selectedCab.seats}</span>
                            <span>•</span>
                            <span className="text-red-600 font-bold">{selectedCab.rate}</span>
                          </div>
                        </div>
                        <ChevronDown className="w-4 h-4 text-neutral-400" />
                      </div>

                      {/* Dropdown Menu for Cab Selection */}
                      {showClassDropdown && (
                        <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-neutral-200 rounded-2xl shadow-2xl p-2 z-30 animate-in fade-in zoom-in-95">
                          <div className="text-[10px] font-bold text-neutral-400 px-3 py-1.5 uppercase tracking-wider">
                            Choose Vehicle Category
                          </div>
                          {cabClasses.map((cab, index) => (
                            <button
                              key={cab.id}
                              type="button"
                              onClick={() => {
                                setSelectedCabIndex(index);
                                setShowClassDropdown(false);
                              }}
                              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-colors text-left cursor-pointer ${selectedCabIndex === index
                                ? 'bg-red-50 text-red-950 font-bold border border-red-200'
                                : 'hover:bg-neutral-100 text-neutral-800'
                                }`}
                            >
                              <div>
                                <div className="font-bold flex items-center gap-1.5">
                                  <span>{cab.name}</span>
                                  <span className="text-[10px] bg-neutral-200 px-1.5 py-0.2 rounded-md font-normal">
                                    {cab.seats}
                                  </span>
                                </div>
                                <div className="text-[10px] text-neutral-500">{cab.model}</div>
                              </div>
                              <div className="text-right">
                                <div className="text-xs font-black text-red-600">{cab.rate}</div>
                                <div className="text-[9px] text-neutral-400">{cab.bags}</div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Row 2: PICKUP DATE, RETURN DATE, INCLUSIONS, SEARCH CABS BUTTON */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 sm:gap-5 items-stretch">

                    {/* Tile 4: PICKUP DATE & TIME */}
                    <div className="lg:col-span-3 bg-[#F8FAFC] hover:bg-neutral-100/70 border border-neutral-200/70 rounded-2xl p-4 sm:p-5 transition-colors relative group">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-red-500" />
                          PICKUP DATE & TIME
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              const today = new Date();
                              setDepartureDate(today.toISOString().split('T')[0]);
                              setDepartureTime('06:00');
                            }}
                            className="text-[9px] font-bold text-red-600 bg-red-50 hover:bg-red-100 px-2 py-0.5 rounded-md cursor-pointer transition-colors"
                          >
                            Today
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const tmrw = new Date();
                              tmrw.setDate(tmrw.getDate() + 1);
                              setDepartureDate(tmrw.toISOString().split('T')[0]);
                              setDepartureTime('06:00');
                            }}
                            className="text-[9px] font-bold text-red-600 bg-red-50 hover:bg-red-100 px-2 py-0.5 rounded-md cursor-pointer transition-colors"
                          >
                            Tomorrow
                          </button>
                        </div>
                      </div>

                      {/* Interactive HTML5 Date Input */}
                      <div className="flex items-center gap-2">
                        <input
                          type="date"
                          required
                          value={departureDate.includes('-') ? departureDate : new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                          onChange={(e) => setDepartureDate(e.target.value)}
                          className="w-full bg-white sm:bg-transparent border sm:border-0 border-neutral-200 rounded-lg px-2 sm:px-0 py-1 sm:py-0 text-sm sm:text-base font-bold text-neutral-900 focus:outline-none cursor-pointer"
                        />
                      </div>

                      {/* Interactive HTML5 Time Input */}
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <Clock className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                        <input
                          type="time"
                          value={departureTime.includes(':') && departureTime.length <= 5 ? departureTime : '06:00'}
                          onChange={(e) => setDepartureTime(e.target.value)}
                          className="bg-transparent text-xs font-semibold text-neutral-600 focus:outline-none cursor-pointer"
                        />
                        <span className="text-[10px] text-neutral-400">· Early Morning Chauffeur</span>
                      </div>
                    </div>

                    {/* Tile 5: RETURN DATE & TIME */}
                    <div className={`lg:col-span-3 border border-neutral-200/70 rounded-2xl p-4 sm:p-5 transition-colors relative ${
                      tripMode === 'One-Way Drop' ? 'bg-neutral-100/60 opacity-60' : 'bg-[#F8FAFC] hover:bg-neutral-100/70'
                    }`}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-neutral-400" />
                          RETURN DATE & TIME
                        </span>
                        {tripMode === 'One-Way Drop' ? (
                          <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                            One-Way
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              const ret = new Date();
                              ret.setDate(ret.getDate() + 3);
                              setReturnDate(ret.toISOString().split('T')[0]);
                              setReturnTime('21:00');
                            }}
                            className="text-[9px] font-bold text-slate-600 bg-slate-200/70 hover:bg-slate-200 px-2 py-0.5 rounded-md cursor-pointer transition-colors"
                          >
                            +3 Days
                          </button>
                        )}
                      </div>

                      {/* Interactive HTML5 Return Date Input */}
                      <div className="flex items-center gap-2">
                        <input
                          type={tripMode === 'One-Way Drop' ? 'text' : 'date'}
                          disabled={tripMode === 'One-Way Drop'}
                          value={tripMode === 'One-Way Drop' ? 'One-Way Drop' : (returnDate.includes('-') ? returnDate : new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0])}
                          onChange={(e) => setReturnDate(e.target.value)}
                          className="w-full bg-white sm:bg-transparent border sm:border-0 border-neutral-200 rounded-lg px-2 sm:px-0 py-1 sm:py-0 text-sm sm:text-base font-bold text-neutral-900 focus:outline-none disabled:cursor-not-allowed cursor-pointer"
                        />
                      </div>

                      {/* Interactive HTML5 Return Time Input */}
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <Clock className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                        <input
                          type={tripMode === 'One-Way Drop' ? 'text' : 'time'}
                          disabled={tripMode === 'One-Way Drop'}
                          value={tripMode === 'One-Way Drop' ? 'No Return Required' : (returnTime.includes(':') && returnTime.length <= 5 ? returnTime : '21:00')}
                          onChange={(e) => setReturnTime(e.target.value)}
                          className="bg-transparent text-xs font-semibold text-neutral-600 focus:outline-none disabled:cursor-not-allowed cursor-pointer"
                        />
                        {tripMode !== 'One-Way Drop' && (
                          <span className="text-[10px] text-neutral-400">· Evening Drop</span>
                        )}
                      </div>
                    </div>

                    {/* Tile 6: FARE INCLUSIONS */}
                    <div className="lg:col-span-2 bg-[#F8FAFC] hover:bg-neutral-100/70 border border-neutral-200/70 rounded-2xl p-4 sm:p-5 transition-colors flex flex-col justify-between">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                        TARIFF POLICY
                      </span>
                      <div>
                        <div className="text-sm font-bold text-emerald-700 flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>All Inclusive</span>
                        </div>
                        <div className="text-[10px] text-neutral-500 font-medium mt-0.5">
                          Tolls + Driver Beta + GST
                        </div>
                      </div>
                    </div>

                    {/* Tile 7: SEARCH CABS & FARES BUTTON */}
                    <div className="lg:col-span-4 h-full flex items-stretch">
                      <button
                        type="submit"
                        className="w-full h-full min-h-[64px] sm:min-h-[72px] bg-[#E11D48] hover:bg-[#BE123C] text-white font-extrabold text-sm sm:text-base tracking-wider uppercase rounded-2xl px-6 py-4 flex items-center justify-center gap-2.5 shadow-xl shadow-red-500/25 active:scale-98 transition-all cursor-pointer"
                      >
                        <Car className="w-5 h-5 text-white" />
                        <span>SEARCH CABS & FARES</span>
                        <ArrowRight className="w-4 h-4 text-white" />
                      </button>
                    </div>

                  </div>

                  {/* Dynamic Live Distance & Auto Calculated Fare Preview Bar */}
                  <div className="mt-4 pt-4 border-t border-neutral-200/80 flex flex-wrap items-center justify-between gap-3 text-xs bg-gradient-to-r from-red-50/70 via-white to-emerald-50/70 p-3.5 rounded-2xl border border-red-100/60 shadow-xs">
                    <div className="flex items-center flex-wrap gap-2.5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-600 text-white font-extrabold text-[11px] shadow-xs">
                        <Navigation className="w-3 h-3" />
                        <span>LIVE RADAR</span>
                      </span>
                      <div className="flex items-center gap-1.5 text-neutral-800 font-bold text-xs">
                        <span className="text-neutral-500 font-normal">Route:</span>
                        <span className="text-red-950 truncate max-w-[140px] sm:max-w-[200px]">
                          {fromCity.split(',')[0]}
                        </span>
                        <span className="text-red-500">➔</span>
                        <span className="text-red-950 truncate max-w-[140px] sm:max-w-[200px]">
                          {toCity.split(',')[0]}
                        </span>
                      </div>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-white px-2.5 py-0.5 rounded-full border border-slate-200 shadow-2xs">
                        <Compass className="w-3 h-3 text-red-500" />
                        <span>{routeCalc.distanceKm} km</span>
                        <span className="text-neutral-400 font-normal">({tripMode === 'One-Way Drop' ? 'One-Way' : 'Round Trip'})</span>
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-white px-2.5 py-0.5 rounded-full border border-slate-200 shadow-2xs">
                        <Clock className="w-3 h-3 text-amber-500" />
                        <span>Drive {routeCalc.durationFormatted}</span>
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 shadow-2xs">
                        <span>🏁</span>
                        <span>{routeCalc.fullReachString}</span>
                      </span>
                      {routeCalc.isLiveMapRoute && (
                        <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                          <Navigation className="w-2.5 h-2.5 text-blue-600" />
                          <span>{routeCalc.highwaySummary}</span>
                        </span>
                      )}
                    </div>

                    {/* Auto-Calculated Price for Selected Cab */}
                    <div className="flex items-center gap-3 ml-auto">
                      <div className="text-right">
                        <div className="text-[10px] text-neutral-500 font-semibold uppercase tracking-wider flex items-center justify-end gap-1">
                          <span>Auto Fare ({selectedCab.name.split(' ')[0]})</span>
                          <span className="text-emerald-600 font-bold">● Fixed</span>
                        </div>
                        <div className="text-base sm:text-lg font-black text-red-600 tracking-tight">
                          ₹{(
                            routeCalc.rates[selectedCab.id as keyof typeof routeCalc.rates]?.totalFare ||
                            Math.round(routeCalc.distanceKm * parseInt(selectedCab.rate.replace(/\D/g, '') || '15'))
                          ).toLocaleString('en-IN')}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => openBookingModal(`${selectedCab.name} · ${fromCity} to ${toCity}`)}
                        className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1"
                      >
                        <span>Lock Fare</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                </form>

              </div>

              {/* SPECIAL OFFER SECTION (Car & Cab Outstation Rental Discounts with generous spacing) */}
              <div className="space-y-5 pt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight flex items-center gap-2">
                      <Tag className="w-5 h-5 text-red-600" />
                      Special Cab Offers
                    </h3>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Verified coupon codes for outstation, temple runs and airport cabs
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActivePage('packages')}
                    className="text-xs font-semibold text-neutral-600 hover:text-red-600 transition-colors cursor-pointer"
                  >
                    View all offers →
                  </button>
                </div>

                {/* Responsive 3-Card Offer Grid with generous gap */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
                  {specialOffers.map((offer) => (
                    <div
                      key={offer.id}
                      className="bg-white rounded-[24px] p-4 sm:p-5 shadow-sm border border-neutral-200/70 hover:shadow-md transition-all flex items-center gap-4 group"
                    >
                      {/* Image Thumbnail with rounded corners */}
                      <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 shadow-inner bg-neutral-100">
                        <img
                          src={offer.img}
                          alt={offer.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>

                      {/* Text & Coupon Content */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <span className="text-[9px] font-bold text-red-600 uppercase tracking-wider block">
                          {offer.category}
                        </span>
                        <h4 className="text-sm font-extrabold text-neutral-900 leading-snug truncate">
                          {offer.title}
                        </h4>
                        <p className="text-[11px] text-neutral-500 truncate">
                          {offer.subtitle}
                        </p>

                        {/* Bottom Row: Coupon Code & Book Now Button */}
                        <div className="flex items-center justify-between pt-1.5">
                          <button
                            type="button"
                            onClick={() => handleCopyCoupon(offer.coupon)}
                            className="text-[10px] font-semibold text-neutral-500 hover:text-neutral-900 flex items-center gap-1 cursor-pointer bg-neutral-100 px-2 py-0.5 rounded-md hover:bg-neutral-200 transition-colors"
                            title="Click to copy coupon code"
                          >
                            <span>Code: <strong className="text-neutral-800">{offer.coupon}</strong></span>
                            {copiedCoupon === offer.coupon && (
                              <Check className="w-2.5 h-2.5 text-emerald-600" />
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleBookOffer(offer.title, offer.coupon)}
                            className="bg-rose-50 hover:bg-rose-100 text-[#E11D48] text-[10px] font-bold px-3 py-1 rounded-full transition-colors cursor-pointer shrink-0"
                          >
                            Book Cab
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

              </div>

            </div>

          </div>
        </div>

      </section>

      {/* ================= ROYAL GRAND DOORWAY EXPERIENCE ================= */}
      <RoyalDoorwaySection />

      {/* ================= SECTION 2: TRENDING HIGHWAY ROUTES (2 PER VIEW & STICKY HORIZONTAL SCROLL) ================= */}
      <TrendingRoutesStickySection />

      {/* ================= SECTION 3: CORE VALUE PILLARS (WHITE BG) ================= */}
      <section className={`py-20 border-b ${isDarkMode
        ? 'bg-[#0E0E12] text-white border-white/5'
        : 'bg-white text-neutral-900 border-neutral-200'
        }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-semibold text-red-600 uppercase tracking-widest block">
              Why Wayora Journeys
            </span>
            <h2 className={`text-3xl font-extrabold tracking-tight ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
              Safe, Sanitized & Professional Travel
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed">
              Every detail engineered for peaceful family vacations and reliable corporate business road trips.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

            {/* Pillar 1 */}
            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white transition-all hover:shadow-xl hover:border-red-300 group flex flex-col justify-between shadow-xs">
              <div className="h-40 overflow-hidden relative">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=600&q=80"
                  alt="Verified Chauffeurs"
                  fallbackTitle="Chauffeur Service"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-3 text-white font-bold text-sm flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-red-500" />
                  <span>Verified Drivers</span>
                </div>
              </div>
              <div className="p-5 space-y-1.5">
                <h4 className="font-bold text-sm text-slate-900">
                  Police Verified Chauffeurs
                </h4>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  Route expert chauffeurs skilled in safe night cruising, mountain ghat hairpins, and polite hospitality.
                </p>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white transition-all hover:shadow-xl hover:border-red-300 group flex flex-col justify-between shadow-xs">
              <div className="h-40 overflow-hidden relative">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=600&q=80"
                  alt="Sanitized Fleet"
                  fallbackTitle="Pristine Interior"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-3 text-white font-bold text-sm flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-red-500" />
                  <span>Sanitized AC</span>
                </div>
              </div>
              <div className="p-5 space-y-1.5">
                <h4 className="font-bold text-sm text-slate-900">
                  Clean & Comfortable
                </h4>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  Deep vacuumed upholstery, chilled dual-zone AC, fresh cabin fragrance, and zero smoke smell guarantee.
                </p>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white transition-all hover:shadow-xl hover:border-red-300 group flex flex-col justify-between shadow-xs">
              <div className="h-40 overflow-hidden relative">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=600&q=80"
                  alt="Transparent Pricing"
                  fallbackTitle="Odometer Transparency"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-3 text-white font-bold text-sm flex items-center gap-1.5">
                  <Gauge className="w-4 h-4 text-red-500" />
                  <span>Clear Per-Km</span>
                </div>
              </div>
              <div className="p-5 space-y-1.5">
                <h4 className="font-bold text-sm text-slate-900">
                  Transparent Billing
                </h4>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  Doorstep odometer readings. Clearly stated driver daily allowances and zero surge multiplier pricing.
                </p>
              </div>
            </div>

            {/* Pillar 4 */}
            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white transition-all hover:shadow-xl hover:border-red-300 group flex flex-col justify-between shadow-xs">
              <div className="h-40 overflow-hidden relative">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=600&q=80"
                  alt="24/7 Helpline"
                  fallbackTitle="Customer Concierge"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-3 text-white font-bold text-sm flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-red-500" />
                  <span>24/7 Dispatch</span>
                </div>
              </div>
              <div className="p-5 space-y-1.5">
                <h4 className="font-bold text-sm text-slate-900">
                  Live Trip Concierge
                </h4>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  Real-time GPS coordination and central dispatch support from our Ameerpet Hyderabad headquarters.
                </p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ================= SECTION 4: CURATED TOUR PACKAGES (DEEP BLACK OBSIDIAN) ================= */}
      <section className={`py-20 border-b ${isLightMode
        ? 'bg-neutral-100 text-neutral-900 border-neutral-200'
        : 'bg-[#09090C] text-white border-white/5'
        }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="text-xs font-semibold text-red-500 uppercase tracking-widest mb-1">
                Curated Road Expeditions
              </div>
              <h2 className={`text-3xl font-extrabold tracking-tight ${isLightMode ? 'text-neutral-900' : 'text-white'}`}>
                Popular Tour Packages
              </h2>
              <p className="text-neutral-400 text-xs sm:text-sm mt-1 max-w-xl">
                Round trip from your doorstep in Hyderabad and neighboring transit hubs. Transparent per-km pricing.
              </p>
            </div>
            <button
              onClick={() => {
                setActivePage('packages');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-xs font-bold text-red-500 hover:text-red-400 flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
            >
              <span>View all 12+ packages</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredPackages.map((pkg) => (
              <div
                key={pkg.id}
                className="rounded-2xl overflow-hidden border border-slate-200 bg-white hover:border-red-500 transition-all shadow-sm hover:shadow-xl group flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-52 w-full overflow-hidden bg-slate-100">
                    <ImageWithFallback
                      src={pkg.imageUrl}
                      alt={pkg.title}
                      fallbackTitle={pkg.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                    <div className="absolute top-3 left-3 flex items-center gap-2 text-[11px] font-semibold text-white bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10">
                      <Compass className="w-3.5 h-3.5 text-red-400" />
                      <span>{pkg.categoryLabel}</span>
                      <span className="text-white/40">·</span>
                      <span>{pkg.duration}</span>
                    </div>

                    <div className="absolute bottom-3 left-4 right-4">
                      <h3 className="text-lg font-bold text-white group-hover:text-red-400 transition-colors">
                        {pkg.title}
                      </h3>
                      <span className="text-[11px] text-neutral-300 font-medium">
                        {pkg.tagline}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <p className={`text-xs leading-relaxed line-clamp-2 ${isLightMode ? 'text-neutral-600' : 'text-neutral-400'}`}>
                      {pkg.description}
                    </p>

                    <div className="space-y-1 pt-1">
                      {pkg.highlights.slice(0, 3).map((h, i) => (
                        <div key={i} className={`flex items-center gap-1.5 text-[11px] ${isLightMode ? 'text-neutral-700' : 'text-neutral-300'}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>

                    <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-baseline justify-between mt-2">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Round trip from</span>
                        <span className="text-lg font-black text-slate-900">
                          ₹{pkg.fromPrice.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="text-right text-[11px] text-neutral-400">
                        ₹{pkg.ratePerKm} / km
                        <span className="block text-[10px] text-red-500 font-semibold">Doorstep pickup</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0 grid grid-cols-2 gap-3">
                  <button
                    onClick={() => openBookingModal(pkg.title)}
                    className="py-2.5 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer text-center"
                  >
                    Book Now
                  </button>
                  <a
                    href={`https://wa.me/919182471876?text=${encodeURIComponent(`Hi Wayora Journeys, I am interested in the ${pkg.title} tour package.`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="py-2.5 rounded-xl text-xs font-semibold transition-colors text-center flex items-center justify-center gap-1.5 border bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-red-600" />
                    <span>Enquiry</span>
                  </a>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ================= SECTION 5: FLEET & TRANSPARENT RATES (WHITE BG) ================= */}
      <section className={`py-20 border-b ${isDarkMode
        ? 'bg-[#101014] text-white border-white/5'
        : 'bg-white text-neutral-900 border-neutral-200'
        }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="text-xs font-semibold text-red-600 uppercase tracking-widest mb-1">
                Executive Chauffeur Fleet
              </div>
              <h2 className={`text-3xl font-extrabold tracking-tight ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
                Choose Your Ride
              </h2>
              <p className="text-neutral-500 text-xs sm:text-sm mt-1 max-w-xl">
                Well maintained, strictly air-conditioned, commercial yellow-board vehicles with active passenger insurance.
              </p>
            </div>
            <button
              onClick={() => {
                setActivePage('fleet');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
            >
              <span>Explore complete specs</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.slice(0, 3).map((car) => (
              <div
                key={car.id}
                className="rounded-2xl p-6 border border-slate-200 bg-white hover:border-red-500 transition-all flex flex-col justify-between group shadow-sm hover:shadow-xl"
              >
                <div>
                  <div className="h-44 rounded-xl overflow-hidden bg-slate-100 relative mb-4">
                    <ImageWithFallback
                      src={car.imageUrl}
                      alt={car.name}
                      fallbackTitle={car.name}
                      fallbackType="car"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded text-[10px] font-semibold text-white">
                      {car.type}
                    </div>
                    {car.popular && (
                      <div className="absolute top-3 right-3 bg-red-600 px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase tracking-wider">
                        Popular
                      </div>
                    )}
                  </div>

                  <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
                    {car.name}
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1">
                    {car.capacity} · {car.luggage}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {car.features.slice(0, 3).map((f, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-2 py-0.5 rounded border bg-slate-50 border-slate-200 text-slate-700"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-neutral-200/60 dark:border-neutral-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-neutral-500 block">Rate per km</span>
                    <span className={`text-lg font-black ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
                      ₹{car.ratePerKm}
                      <span className="text-xs font-normal text-neutral-500">/km</span>
                    </span>
                  </div>
                  <button
                    onClick={() => openBookingModal(car.name)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                  >
                    Select Car
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ================= SECTION 6: CORPORATE BUSINESS MOBILITY (DEEP BLACK OBSIDIAN) ================= */}
      <section className={`py-20 border-b ${isLightMode
        ? 'bg-neutral-100 text-neutral-900 border-neutral-200'
        : 'bg-[#09090C] text-white border-white/5'
        }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

            <div className="lg:col-span-7 space-y-6">
              <span className="text-xs font-bold text-red-500 uppercase tracking-widest block">
                Corporate Mobility
              </span>
              <h2 className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${isLightMode ? 'text-neutral-900' : 'text-white'}`}>
                Enterprise Fleet Management & Airport Shuttles
              </h2>
              <p className={`text-sm leading-relaxed ${isLightMode ? 'text-neutral-600' : 'text-neutral-300'}`}>
                Complete employee shift commute, VIP airport meet & greet transfers, and multi-day outstation business visits for enterprises in Hyderabad, HITEC City, and Financial District.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className={`p-4 rounded-xl border ${isLightMode ? 'bg-white border-neutral-200' : 'bg-neutral-900 border-neutral-800'
                  }`}>
                  <h4 className="font-bold text-sm text-red-500">Consolidated GST Invoicing</h4>
                  <p className="text-xs text-neutral-400 mt-1">
                    Single monthly digital tax bill with full route logs and 30-day corporate credit billing.
                  </p>
                </div>
                <div className={`p-4 rounded-xl border ${isLightMode ? 'bg-white border-neutral-200' : 'bg-neutral-900 border-neutral-800'
                  }`}>
                  <h4 className="font-bold text-sm text-red-500">Dedicated Account Officer</h4>
                  <p className="text-xs text-neutral-400 mt-1">
                    Direct account manager ensuring priority standby vehicle allocation 24/7.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    setActivePage('corporate');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-6 py-3.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-red-950 cursor-pointer"
                >
                  <span>Request Corporate MSA Proposal</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-3xl overflow-hidden border border-slate-200 shadow-xl relative h-80 bg-slate-100">
                <ImageWithFallback
                  src="/images/airport-vip.jpg"
                  alt="Airport VIP Chauffeur"
                  fallbackTitle="Executive Airport Transfer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
                  <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider block">
                    RGIA Airport Transfers
                  </span>
                  <h4 className="font-bold text-base">Meet & Greet Flight Executive Service</h4>
                  <p className="text-xs text-neutral-300">
                    Live flight radar tracking with doorstep flight pickup.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ================= SECTION 7: GUEST REVIEWS (CRISP WHITE BG) ================= */}
      <section className="py-20 border-b bg-slate-50 text-slate-900 border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">

          <div className="max-w-2xl space-y-1">
            <span className="text-xs font-bold text-red-600 uppercase tracking-widest block">
              Verified Feedback
            </span>
            <h2 className="text-3xl font-black tracking-tight text-slate-900">
              Over 10,000+ Completed Expeditions
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm">
              Real testimonials from family pilgrimages and executive transfers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-3 shadow-xs">
              <div className="flex items-center gap-1 text-red-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-red-500" />
                ))}
              </div>
              <p className="text-xs leading-relaxed italic text-slate-700">
                “Booked an Innova Crysta for our family trip to Tirumala. The driver Ramesh reached our house at 5:00 AM sharp in Banjara Hills, drove with great patience, and assisted our parents at the darshan point.”
              </p>
              <div className="pt-3 border-t border-slate-100 text-xs">
                <span className="font-bold block text-slate-900">
                  Dr. K. Srinivas Rao
                </span>
                <span className="text-slate-500 text-[11px]">Hyderabad to Tirupati Round Trip</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-3 shadow-xs">
              <div className="flex items-center gap-1 text-red-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-red-500" />
                ))}
              </div>
              <p className="text-xs leading-relaxed italic text-slate-700">
                “No hidden charges whatsoever. The distance calculation matched the odometer, and the part-pay 25% booking model made us feel completely secure. Car was exceptionally clean.”
              </p>
              <div className="pt-3 border-t border-slate-100 text-xs">
                <span className="font-bold block text-slate-900">
                  Sowmya Nambiar
                </span>
                <span className="text-slate-500 text-[11px]">Secunderabad to Srisailam</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-3 shadow-xs">
              <div className="flex items-center gap-1 text-red-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-red-500" />
                ))}
              </div>
              <p className="text-xs leading-relaxed italic text-slate-700">
                “We regularly hire Wayora for our leadership visits. Clean sedans, polite English-speaking chauffeurs, and consolidated monthly invoices that pass audit without hassle.”
              </p>
              <div className="pt-3 border-t border-slate-100 text-xs">
                <span className="font-bold block text-slate-900">
                  Vikramaditya S.
                </span>
                <span className="text-slate-500 text-[11px]">VP Operations, HITEC City</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ================= SECTION 8: READY TO GO CTA BANNER (VIBRANT RED & WHITE) ================= */}
      <section className="py-20 bg-gradient-to-r from-red-700 via-rose-600 to-red-700 text-white relative border-t border-red-500 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-rose-100 uppercase tracking-widest block bg-white/15 px-3 py-1 rounded-full w-fit mx-auto border border-white/20">
              Ready to Hit the Road?
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Reserve Your Premium Cab Today
            </h2>
            <p className="text-rose-100 text-xs sm:text-sm">
              Call our central dispatch desk directly or click below to lock in your car with just 25% refundable advance.
            </p>
          </div>

          <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            {settings.phone}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={() => openBookingModal('Express CTA')}
              className="px-8 py-3.5 rounded-xl bg-white hover:bg-rose-50 text-red-600 font-extrabold text-sm shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              Book Trip Online
            </button>
            <a
              href={`tel:${settings.phone}`}
              className="px-6 py-3.5 rounded-xl bg-red-800/80 hover:bg-red-800 text-white border border-white/20 text-sm font-semibold flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-md"
            >
              <Phone className="w-4 h-4 text-white" />
              <span>Call Dispatch Desk</span>
            </a>
            <a
              href={`https://wa.me/919182471876?text=${encodeURIComponent('Hi Wayora Journeys, I am ready to book a car trip.')}`}
              target="_blank"
              rel="noreferrer"
              className="px-6 py-3.5 rounded-xl bg-red-800/80 hover:bg-red-800 text-white border border-white/20 text-sm font-semibold flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-md"
            >
              <MessageSquare className="w-4 h-4 text-white" />
              <span>WhatsApp Us</span>
            </a>
          </div>
        </div>
      </section>

      {/* Interactive Choose-On-Map Destination Modal */}
      <MapLocationPickerModal
        isOpen={showMapPicker}
        onClose={() => setShowMapPicker(false)}
        initialLat={destinationCoords?.lat || 13.6288}
        initialLng={destinationCoords?.lng || 79.4192}
        initialName={toCity}
        originCoords={userCoords || CITY_COORDINATES.hyderabad}
        onConfirmLocation={(loc) => {
          setToCity(loc.name);
          setToDropDetails(loc.displayName);
          setDestinationCoords({ lat: loc.lat, lng: loc.lng });
        }}
      />

    </div>
  );
};
