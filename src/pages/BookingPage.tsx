import React, { useState, useEffect, useMemo } from 'react';
import { useCms } from '../context/CmsContext';
import { RouteMiniMap } from '../components/RouteMiniMap';
import { 
  Car, Star, Check, MapPin, Calendar, Clock, 
  ShieldCheck, Phone, CheckCircle2, Search, Sliders,
  Wifi, Wind, ArrowRight, User, Sparkles, ChevronRight,
  Compass, Navigation, X, RefreshCw, Users, Heart
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
import { FamilyRideModal, FamilyRideDetails } from '../components/FamilyRideModal';

export const BookingPage: React.FC = () => {

  const { 
    setActivePage, openAuthModal, currentRider,
    addBooking, showToast, bookingSearchDetails, setBookingSearchDetails,
    userLocation, userCoords, isLocating, detectUserLocation
  } = useCms();

  // Sub-navigation view inside Booking Page:
  // 'details' = Screen 1 (Car Details & Location)
  // 'form'    = Screen 2 (Your Details & Confirmation)
  // 'search'  = Screen 3 (Search Results & Filter View)
  const [currentView, setCurrentView] = useState<'details' | 'form' | 'search'>('details');

  // Sub-tabs on top of Car Details: 'info' | 'ratings' | 'location'
  const [carDetailsTab, setCarDetailsTab] = useState<'info' | 'ratings' | 'location'>('info');

  // Top Search ribbon states
  const [tripType, setTripType] = useState(bookingSearchDetails.tripType || 'Outstation One-way');
  const [fromLocation, setFromLocation] = useState(bookingSearchDetails.fromCity || userLocation || 'Kengeri, Bengaluru');
  const [toLocation, setToLocation] = useState(bookingSearchDetails.toCity || 'Tirupati, Andhra Pradesh');
  const [pickupDate, setPickupDate] = useState(() => {
    if (bookingSearchDetails.pickupDate && bookingSearchDetails.pickupDate.includes('-')) {
      return bookingSearchDetails.pickupDate;
    }
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [pickupTime, setPickupTime] = useState(bookingSearchDetails.pickupTime || '06:00');

  // Family Ride / Book for Someone Else States
  const [isBookingForFamily, setIsBookingForFamily] = useState(bookingSearchDetails.isBookingForFamily || false);
  const [familyMemberName, setFamilyMemberName] = useState(bookingSearchDetails.familyMemberName || '');
  const [familyMemberPhone, setFamilyMemberPhone] = useState(bookingSearchDetails.familyMemberPhone || '');
  const [familyPickupAddress, setFamilyPickupAddress] = useState(bookingSearchDetails.familyPickupAddress || '');
  const [familyNotes, setFamilyNotes] = useState(bookingSearchDetails.familyNotes || '');
  const [familyAssistanceTags, setFamilyAssistanceTags] = useState<string[]>(['🧰 Doorstep Luggage Help']);
  const [showFamilyModal, setShowFamilyModal] = useState(false);

  // Live Location detector for FROM field
  const handleGetLiveLocation = async () => {
    const loc = await detectUserLocation(true);
    if (loc) {
      setFromLocation(loc);
      setIsBookingForFamily(false);
      showToast(`GPS verified: ${loc}`, 'success');
    }
  };

  const handleApplyFamilyRide = (details: FamilyRideDetails) => {
    setIsBookingForFamily(true);
    setFamilyMemberName(details.passengerName);
    setFamilyMemberPhone(details.passengerPhone);
    setFamilyNotes(details.notes || '');
    if (details.assistanceTags) setFamilyAssistanceTags(details.assistanceTags);
    if (details.doorstepAddress) {
      setFamilyPickupAddress(details.doorstepAddress);
      setFromLocation(details.doorstepAddress);
    }
    showToast(`Ride booked for ${details.passengerName || 'Family'}!`, 'success');
  };

  const handleResetFamilyRide = () => {
    setIsBookingForFamily(false);
    setFamilyMemberName('');
    setFamilyMemberPhone('');
    setFamilyPickupAddress('');
    setFamilyNotes('');
    if (userLocation) setFromLocation(userLocation);
    showToast('Switched to booking for myself', 'info');
  };

  const [destinationCoords, setDestinationCoords] = useState<{ lat: number; lng: number } | null>(CITY_COORDINATES.tirupati);
  const [destinationSuggestions, setDestinationSuggestions] = useState<MapLocationItem[]>([]);
  const [showDestSuggestions, setShowDestSuggestions] = useState(false);
  const [isSearchingPlaces, setIsSearchingPlaces] = useState(false);
  const [isFetchingMapRoute, setIsFetchingMapRoute] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [liveMapData, setLiveMapData] = useState<{ distanceKm?: number; durationMinutes?: number; summary?: string } | null>(null);

  // Debounced auto-fetch place suggestions from Maps
  useEffect(() => {
    if (!toLocation || toLocation.trim().length < 2) {
      setDestinationSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingPlaces(true);
      try {
        const results = await searchMapLocations(toLocation);
        setDestinationSuggestions(results);
      } catch {
        // silent
      } finally {
        setIsSearchingPlaces(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [toLocation]);

  // Handle selecting a destination
  const handleSelectDestination = (dest: { name: string; displayName?: string; lat?: number; lng?: number }) => {
    setToLocation(dest.name);
    if (dest.lat && dest.lng) {
      setDestinationCoords({ lat: dest.lat, lng: dest.lng });
    }
    setShowDestSuggestions(false);
  };

  // Auto-fetch real-time road driving route & duration from OpenStreetMap OSRM
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
        // silent
      } finally {
        if (active) setIsFetchingMapRoute(false);
      }
    };

    fetchRoute();
    return () => {
      active = false;
    };
  }, [fromLocation, toLocation, userCoords, destinationCoords]);

  // Dynamic route distance, travel duration & reach time calculation
  const [routeCalc, setRouteCalc] = useState(() =>
    calculateTripRouteAndPrice({
      originName: fromLocation,
      originCoords: userCoords,
      destinationName: toLocation,
      destinationCoords,
      tripType: tripType as any,
      departureDate: pickupDate,
      departureTime: pickupTime,
    })
  );

  useEffect(() => {
    const calc = calculateTripRouteAndPrice({
      originName: fromLocation,
      originCoords: userCoords,
      destinationName: toLocation,
      destinationCoords,
      tripType: tripType as any,
      departureDate: pickupDate,
      departureTime: pickupTime,
      liveDistanceKm: liveMapData?.distanceKm,
      liveDurationMinutes: liveMapData?.durationMinutes,
      highwaySummary: liveMapData?.summary,
    });
    setRouteCalc(calc);
  }, [fromLocation, toLocation, tripType, userCoords, destinationCoords, pickupDate, pickupTime, liveMapData]);

  // Passenger "Your Details" form states
  const [title, setTitle] = useState('Mr');
  const [firstName, setFirstName] = useState(currentRider ? currentRider.name.split(' ')[0] : 'Aarav');
  const [lastName, setLastName] = useState(currentRider ? currentRider.name.split(' ')[1] || 'Sharma' : 'Sharma');
  const [email, setEmail] = useState(currentRider?.email || 'aarav.sharma@example.com');
  const [countryCode, setCountryCode] = useState('+91 (India)');
  const [mobileNumber, setMobileNumber] = useState(currentRider ? currentRider.phone : '+91 98490 11223');
  const [hasCoupon, setHasCoupon] = useState(true);
  const [couponCode, setCouponCode] = useState('WAYORA500');
  const [couponApplied, setCouponApplied] = useState(true);
  const [bookingSuccessId, setBookingSuccessId] = useState<string | null>(null);

  // Search Results & Filter states
  const [sortOrder, setSortOrder] = useState<'cheapest' | 'best' | 'quickest'>('cheapest');
  const [seatFilter, setSeatFilter] = useState('4 seat');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [priceMax, setPriceMax] = useState(35000);
  const [filterAc, setFilterAc] = useState(true);
  const [filterNewCar, setFilterNewCar] = useState(true);
  const [filterNonStop, setFilterNonStop] = useState(false);

  // Verified luxury cars data with high-resolution, matching vehicle photos & dynamic ₹ INR fares
  const carSpecs = useMemo(() => [
    {
      id: 'car-innova',
      name: 'Toyota Innova Crysta Luxury',
      category: 'Branded',
      ratePerKm: 19,
      minKm: 300,
      seats: '6+1 Seat',
      doors: '5 Doors',
      transmission: 'Automatic',
      ac: true,
      wifi: true,
      parking: true,
      rating: 4.9,
      reviews: 312,
      image: 'https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=1000&q=80',
    },
    {
      id: 'car-dzire',
      name: 'Maruti Suzuki Dzire Prime',
      category: 'Economy',
      ratePerKm: 14,
      minKm: 250,
      seats: '4 Seat',
      doors: '4 Doors',
      transmission: 'Manual',
      ac: true,
      wifi: false,
      parking: true,
      rating: 4.8,
      reviews: 184,
      image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1000&q=80',
    },
    {
      id: 'car-fortuner',
      name: 'Toyota Fortuner VIP Cruiser',
      category: 'SUV',
      ratePerKm: 24,
      minKm: 300,
      seats: '7 Seat',
      doors: '5 Doors',
      transmission: '4x4 Automatic',
      ac: true,
      wifi: true,
      parking: true,
      rating: 4.9,
      reviews: 142,
      image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1000&q=80',
    },
    {
      id: 'car-jaguar',
      name: 'Jaguar XF Luxury Saloon',
      category: 'Luxury',
      ratePerKm: 38,
      minKm: 250,
      seats: '4 Seat',
      doors: '4 Doors',
      transmission: 'Automatic',
      ac: true,
      wifi: true,
      parking: true,
      rating: 4.9,
      reviews: 275,
      image: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1000&q=80',
    },
    {
      id: 'car-mercedes',
      name: 'Mercedes-Benz E-Class VIP',
      category: 'Luxury',
      ratePerKm: 48,
      minKm: 250,
      seats: '4 Seat',
      doors: '4 Doors',
      transmission: 'Automatic',
      ac: true,
      wifi: true,
      parking: true,
      rating: 5.0,
      reviews: 198,
      image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1000&q=80',
    },
  ], []);

  // Compute live available cars with real-time Indian ₹ INR pricing
  const availableCars = useMemo(() => {
    const isRound = tripType.toLowerCase().includes('round');
    const km = Math.max(routeCalc.distanceKm || 300, 200);

    return carSpecs.map((car) => {
      const calcKm = Math.max(km, car.minKm);
      const baseFare = Math.round(calcKm * car.ratePerKm);
      const totalFare = baseFare + (isRound ? 800 : 500); // Tolls & Driver Batta allowance included
      const originalPrice = Math.round(totalFare * 1.25);

      return {
        ...car,
        airport: `${fromLocation} Chauffeur Hub & Doorstep Pickup`,
        price: totalFare,
        originalPrice,
      };
    });
  }, [carSpecs, tripType, routeCalc.distanceKm, fromLocation]);

  const [selectedCarId, setSelectedCarId] = useState('car-innova');
  const selectedCar = availableCars.find((c) => c.id === selectedCarId) || availableCars[0];
  const setSelectedCar = (car: (typeof availableCars)[0]) => setSelectedCarId(car.id);

  const handleApplyCoupon = () => {
    if (couponCode.trim().toUpperCase() === 'WAYORA500' || couponCode.trim().toUpperCase() === 'DHSHJAB09D') {
      setCouponApplied(true);
      showToast('Coupon applied! ₹500 discount saved.', 'success');
    } else {
      showToast('Invalid coupon code. Try WAYORA500', 'error');
    }
  };

  const handleFinalBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const primaryPassengerName = isBookingForFamily && familyMemberName 
      ? familyMemberName 
      : `${title} ${firstName} ${lastName}`.trim();
    const primaryPassengerPhone = isBookingForFamily && familyMemberPhone 
      ? familyMemberPhone 
      : mobileNumber;

    const familyDetailString = isBookingForFamily 
      ? ` · [👨‍👩‍👧 RIDE FOR FAMILY: Passenger: ${familyMemberName || 'Family Member'} (${familyMemberPhone || 'No Phone'}) · Booker: ${title} ${firstName} ${lastName} (${mobileNumber}) · Special Assistance: ${familyNotes || 'Doorstep care'}]`
      : '';

    const newBooking = addBooking({
      customerName: primaryPassengerName,
      customerPhone: primaryPassengerPhone,
      pickupLocation: fromLocation,
      destination: toLocation,
      travelDate: pickupDate,
      travelTime: pickupTime,
      passengers: parseInt(selectedCar.seats) || 4,
      vehicleName: selectedCar.name,
      ratePerKm: 14,
      advancePaymentType: '100%',
      estimatedTotal: couponApplied ? selectedCar.price - 20 : selectedCar.price,
      advancePaid: couponApplied ? selectedCar.price - 20 : selectedCar.price,
      tripType: tripType === 'Outstation One-way' ? 'ONE_WAY' : 'ROUND_TRIP',
      notes: `Booked via Car Booking Page · Email: ${email} · Coupon: ${couponApplied ? couponCode : 'None'}${familyDetailString}`
    });

    setBookingSuccessId(newBooking.id);
    showToast(`Booking ${newBooking.id} confirmed successfully! Chauffeur dispatch assigned.`, 'success');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      
      {/* ================= UNIVERSAL MINIMAL PAGE TITLE BANNER ================= */}
      <section className="bg-white border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-5 sm:py-6 shadow-2xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium mb-1">
              <button onClick={() => setActivePage('home')} className="hover:text-red-600 transition-colors">Home</button>
              <ChevronRight className="w-3 h-3 text-slate-300" />
              <span className="text-slate-700 font-semibold">Chauffeur Booking</span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
              Reserve Your Chauffeur Driven Vehicle
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              All-inclusive highway tariffs, airport transfers, commercial fleet & certified captains.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              All-Inclusive Tariffs
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 border border-red-200 font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-red-600" />
              Zero Surge Guarantee
            </span>
          </div>
        </div>
      </section>

      {/* ================= COMPACT HORIZONTAL SEARCH / ROUTE RIBBON ================= */}
      <section className="bg-white border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-4 sticky top-18 sm:top-20 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3">
          
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 sm:gap-3 flex-1">
            
            {/* TRIP TYPE */}
            <div className="bg-slate-50 hover:bg-slate-100/80 transition-colors border border-slate-200 rounded-xl px-3 py-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">TYPE</span>
              <select 
                value={tripType}
                onChange={(e) => setTripType(e.target.value)}
                className="w-full bg-transparent text-xs sm:text-sm font-bold text-slate-800 focus:outline-none cursor-pointer truncate mt-0.5"
              >
                <option value="Outstation One-way">Outstation One-way</option>
                <option value="Outstation Round-trip">Outstation Round-trip</option>
                <option value="Airport Transfer">Airport Transfer</option>
                <option value="Hourly Rental">Hourly Rental (8h / 80km)</option>
                <option value="Office Commute">Office Commute / Corporate</option>
              </select>
            </div>

            {/* FROM (Live Location or Book for Family or Custom Pickup) */}
            <div className={`bg-slate-50 hover:bg-slate-100/80 transition-colors border rounded-xl px-3 py-2 relative ${
              isBookingForFamily ? 'border-rose-300 ring-1 ring-rose-100 bg-rose-50/20' : 'border-slate-200'
            }`}>
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <span>FROM</span>
                  {isBookingForFamily && (
                    <span className="text-[9px] font-extrabold text-rose-700 bg-rose-100/90 px-1 py-0.2 rounded">
                      Family
                    </span>
                  )}
                </span>

                <div className="flex items-center gap-1 shrink-0">
                  {/* Live GPS Location Button */}
                  <button
                    type="button"
                    onClick={handleGetLiveLocation}
                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded border transition-colors flex items-center gap-1 cursor-pointer ${
                      !isBookingForFamily && userLocation && fromLocation === userLocation
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-white hover:bg-red-50 text-slate-700 hover:text-red-700 border-slate-200'
                    }`}
                    title="Auto-detect current live GPS location"
                  >
                    <span className="relative flex h-1.5 w-1.5">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 ${isLocating ? 'inline-flex' : 'hidden'}`} />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-600" />
                    </span>
                    <RefreshCw className={`w-2 h-2 ${isLocating ? 'animate-spin' : ''}`} />
                    <span>{isLocating ? 'GPS...' : 'Live'}</span>
                  </button>

                  {/* Book for Family Button */}
                  <button
                    type="button"
                    onClick={() => setShowFamilyModal(true)}
                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded border transition-colors flex items-center gap-1 cursor-pointer ${
                      isBookingForFamily
                        ? 'bg-rose-600 text-white border-rose-600 shadow-2xs font-extrabold'
                        : 'bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-700 border-slate-200'
                    }`}
                    title="Book ride for family or parents"
                  >
                    <span>👨‍👩‍👧</span>
                    <span>{isBookingForFamily ? 'Family' : 'Family'}</span>
                  </button>
                </div>
              </div>

              <input
                type="text"
                value={fromLocation}
                onChange={(e) => setFromLocation(e.target.value)}
                placeholder={isBookingForFamily ? "Family doorstep city or address" : "Mumbai"}
                className="w-full bg-transparent text-xs sm:text-sm font-bold text-slate-800 focus:outline-none truncate mt-0.5"
              />

              {isBookingForFamily && (
                <div 
                  onClick={() => setShowFamilyModal(true)}
                  className="text-[10px] text-rose-600 font-semibold truncate cursor-pointer hover:underline flex items-center gap-1 mt-0.5"
                >
                  <span>For: {familyMemberName || 'Family Member'}</span>
                  {familyMemberPhone && <span className="text-slate-400">({familyMemberPhone})</span>}
                </div>
              )}
            </div>

            {/* TO (DESTINATION DROP WITH MAPS AUTO-FETCH) */}
            <div className="bg-slate-50 hover:bg-slate-100/80 transition-colors border border-slate-200 rounded-xl px-3 py-2 relative">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">TO</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setShowMapPicker(true)}
                    className="text-[9px] font-bold text-red-600 bg-red-50 hover:bg-red-100 px-1.5 py-0.2 rounded border border-red-200 transition-colors cursor-pointer"
                    title="Choose destination on live map"
                  >
                    📍 Map
                  </button>
                  {isFetchingMapRoute ? (
                    <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded flex items-center gap-1 animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                      <span>Maps...</span>
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded flex items-center gap-0.5">
                      <Check className="w-2.5 h-2.5 text-emerald-600" />
                      <span>Live</span>
                    </span>
                  )}
                </div>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={toLocation}
                  onFocus={() => setShowDestSuggestions(true)}
                  onChange={(e) => {
                    setToLocation(e.target.value);
                    setShowDestSuggestions(true);
                  }}
                  placeholder="Goa, Tirupati, Bengaluru"
                  className="w-full bg-transparent text-xs sm:text-sm font-bold text-slate-800 focus:outline-none truncate mt-0.5 pr-4"
                />
              </div>

              {/* Map Autocomplete Suggestions Dropdown */}
              {showDestSuggestions && (
                <div className="absolute left-0 top-full mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2.5 z-50 animate-in fade-in zoom-in-95 max-h-64 overflow-y-auto">
                  <div className="flex items-center justify-between px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
                    <span>Maps Destination</span>
                    <button
                      type="button"
                      onClick={() => setShowDestSuggestions(false)}
                      className="text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  {destinationSuggestions.length > 0 ? (
                    destinationSuggestions.map((item, idx) => (
                      <button
                        key={`${item.name}-${idx}`}
                        type="button"
                        onClick={() => handleSelectDestination(item)}
                        className="w-full text-left px-2 py-1.5 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2 group/item cursor-pointer"
                      >
                        <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-slate-800 truncate">
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
                      {isSearchingPlaces ? 'Searching OpenStreetMap...' : 'Type any city or temple'}
                    </div>
                  )}

                  <div className="mt-2 pt-2 border-t border-slate-100 grid grid-cols-2 gap-1">
                    {POPULAR_DESTINATION_PRESETS.slice(0, 4).map((p) => (
                      <button
                        key={p.name}
                        type="button"
                        onClick={() => handleSelectDestination({ name: p.location })}
                        className="text-left px-2 py-1 rounded bg-slate-50 hover:bg-red-50 text-[10px] font-semibold text-slate-700 truncate cursor-pointer"
                      >
                        {p.icon} {p.name.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* PICK-UP DATE */}
            <div className="bg-slate-50 hover:bg-slate-100/80 transition-colors border border-slate-200 rounded-xl px-3 py-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">PICK-UP DATE</span>
              <input
                type="date"
                value={pickupDate.includes('-') ? pickupDate : new Date().toISOString().split('T')[0]}
                onChange={(e) => setPickupDate(e.target.value)}
                className="w-full bg-transparent text-xs sm:text-sm font-bold text-slate-800 focus:outline-none cursor-pointer mt-0.5"
              />
            </div>

            {/* PICK-UP TIME */}
            <div className="bg-slate-50 hover:bg-slate-100/80 transition-colors border border-slate-200 rounded-xl px-3 py-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">PICK-UP TIME</span>
              <input
                type="time"
                value={pickupTime.includes(':') && pickupTime.length <= 5 ? pickupTime : '06:00'}
                onChange={(e) => setPickupTime(e.target.value)}
                className="w-full bg-transparent text-xs sm:text-sm font-bold text-slate-800 focus:outline-none cursor-pointer mt-0.5"
              />
            </div>

          </div>

          {/* Action CTA: Search Cabs */}
          <div className="shrink-0 flex items-center">
            <button
              type="button"
              onClick={() => {
                setBookingSearchDetails({
                  tripType,
                  fromCity: fromLocation,
                  toCity: toLocation,
                  pickupDate,
                  pickupTime,
                  isBookingForFamily,
                  familyMemberName,
                  familyMemberPhone,
                  familyPickupAddress,
                  familyNotes,
                });
                setCurrentView('search');
                showToast(`Searching cabs from ${fromLocation} to ${toLocation}`, 'info');
              }}
              className="w-full xl:w-auto px-7 py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 active:scale-95 text-white font-extrabold text-xs sm:text-sm tracking-wider uppercase transition-all shadow-md shadow-red-600/25 cursor-pointer text-center flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span>Search Cabs</span>
            </button>
          </div>

        </div>
      </section>

      {/* Dynamic Live Highway Radar Banner */}
      <div className="bg-gradient-to-r from-slate-50 via-white to-red-50/20 border-b border-slate-200/90 px-4 sm:px-6 lg:px-8 py-3 text-xs shadow-2xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex items-center flex-wrap gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-600 text-white font-black text-[10px] shadow-xs tracking-wider uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
              <span>LIVE RADAR</span>
            </span>
            <div className="flex items-center gap-1.5 text-slate-900 font-bold text-xs sm:text-sm">
              <span className="truncate max-w-[140px] sm:max-w-[200px]">{fromLocation.split(',')[0]}</span>
              <span className="text-red-500 font-black">➔</span>
              <span className="text-red-700 truncate max-w-[140px] sm:max-w-[200px]">{toLocation.split(',')[0]}</span>
            </div>

            {isBookingForFamily ? (
              <button
                type="button"
                onClick={() => setShowFamilyModal(true)}
                className="bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-lg border border-rose-200 text-rose-800 font-extrabold flex items-center gap-1 shadow-2xs cursor-pointer transition-colors"
                title="Click to view or edit family ride details"
              >
                <span>👨‍👩‍👧</span>
                <span>Ride for Family: {familyMemberName || 'Family'}</span>
              </button>
            ) : userLocation && fromLocation === userLocation ? (
              <span className="bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 text-emerald-800 font-extrabold flex items-center gap-1 shadow-2xs">
                <span>📍</span>
                <span>Live GPS Pickup</span>
              </span>
            ) : null}

            <span className="bg-white px-2.5 py-1 rounded-lg border border-slate-200/80 text-slate-700 font-bold flex items-center gap-1 shadow-2xs">
              <Compass className="w-3.5 h-3.5 text-red-500" />
              <span>{routeCalc.distanceKm} km</span>
            </span>

            <span className="bg-white px-2.5 py-1 rounded-lg border border-slate-200/80 text-slate-700 font-bold flex items-center gap-1 shadow-2xs">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>Drive {routeCalc.durationFormatted}</span>
            </span>

            <span className="bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 text-emerald-800 font-extrabold flex items-center gap-1 shadow-2xs">
              <span>🏁</span>
              <span>{routeCalc.fullReachString}</span>
            </span>

            {routeCalc.isLiveMapRoute && routeCalc.highwaySummary && (
              <span className="hidden xl:inline-flex items-center gap-1 text-[10px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                <Navigation className="w-3 h-3 text-blue-600" />
                <span className="truncate max-w-[140px]">{routeCalc.highwaySummary}</span>
              </span>
            )}
          </div>

          <div className="text-[11px] text-emerald-700 font-bold flex items-center gap-1.5 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200/80 shrink-0">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>All-Inclusive Guaranteed Tariff (Tolls + Driver Batta + GST)</span>
          </div>
        </div>
      </div>

      {/* ================= STEPPER PROGRESS BAR ================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-2 w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="inline-flex items-center bg-white p-1 rounded-2xl border border-slate-200 shadow-xs text-xs">
          <button
            type="button"
            onClick={() => setCurrentView('details')}
            className={`px-4 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              currentView === 'details' ? 'bg-red-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            1. Car Details & Specs
          </button>
          <button
            type="button"
            onClick={() => setCurrentView('form')}
            className={`px-4 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              currentView === 'form' ? 'bg-red-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            2. Your Details & Fare
          </button>
          <button
            type="button"
            onClick={() => setCurrentView('search')}
            className={`px-4 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              currentView === 'search' ? 'bg-red-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            3. All Fleet ({availableCars.length})
          </button>
        </div>

        <span className="text-xs text-slate-400 font-medium">
          Direct Airport Transfers & Intercity Chauffeurs
        </span>
      </div>

      {/* ================= BODY VIEWS ================= */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 w-full">
        
        {/* ================= VIEW 1: CAR DETAILS ================= */}
        {currentView === 'details' && (
          <div className="space-y-6">
            
            {/* TOP CARD: Car Details Header & Specs */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200/90">
              
              {/* Header row with sub-tabs */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                  <span className="text-xs font-bold text-red-600 uppercase tracking-widest block">Selected Fleet</span>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                    Vehicle Specifications & Pricing
                  </h2>
                </div>

                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setCarDetailsTab('info')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      carDetailsTab === 'info'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Info and price
                  </button>
                  <button
                    type="button"
                    onClick={() => setCarDetailsTab('ratings')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      carDetailsTab === 'ratings'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Guest Ratings
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCarDetailsTab('location');
                      const mapEl = document.getElementById('route-map-section');
                      if (mapEl) mapEl.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                      carDetailsTab === 'location'
                        ? 'bg-red-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Live Map & Routes ({routeCalc.distanceKm} km)</span>
                  </button>
                </div>
              </div>

              {/* Main Vehicle Showcase */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-6">
                
                {/* Left: Car Image */}
                <div className="lg:col-span-5 flex items-center justify-center p-6 bg-slate-50/80 rounded-2xl border border-slate-100">
                  <img
                    src={selectedCar.image}
                    alt={selectedCar.name}
                    className="w-full max-h-64 object-contain drop-shadow-md hover:scale-102 transition-transform duration-300"
                  />
                </div>

                {/* Right: Specifications & Pricing */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 rounded-md bg-red-600 text-white text-xs font-black">
                          {selectedCar.rating} ★
                        </span>
                        <span className="text-xs font-bold text-slate-800">
                          Excellent
                        </span>
                        <span className="text-xs text-slate-400">
                          · {selectedCar.reviews} Verified Reviews
                        </span>
                      </div>

                      <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                        {selectedCar.name}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-red-600" />
                        {selectedCar.airport}
                      </p>
                    </div>

                    {/* Pricing block */}
                    <div className="text-left sm:text-right">
                      <div className="inline-flex items-center gap-1.5 text-xs">
                        <span className="bg-red-50 text-red-600 font-bold px-2 py-0.5 rounded-full text-[10px]">
                          20% OFF
                        </span>
                        <span className="text-slate-400 line-through text-[11px]">
                          Save ₹{(selectedCar.originalPrice - selectedCar.price).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="mt-1">
                        <span className="text-3xl font-black text-slate-900">
                          ₹{selectedCar.price.toLocaleString('en-IN')}
                        </span>
                        <span className="text-xs font-bold text-slate-500 ml-1">
                          INR / All-Inclusive
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCurrentView('form')}
                        className="mt-3 px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-red-600/25 cursor-pointer inline-flex items-center gap-2"
                      >
                        <span>BOOK THIS VEHICLE</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Amenities Row */}
                  <div className="pt-2">
                    <span className="text-xs font-bold text-slate-700 block mb-2">
                      Included Amenities & Capacity
                    </span>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                      <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
                        <User className="w-4 h-4 text-red-600" />
                        {selectedCar.seats}
                      </span>
                      <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
                        <Wind className="w-4 h-4 text-red-600" />
                        AC Climate Control
                      </span>
                      <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
                        <Wifi className="w-4 h-4 text-red-600" />
                        Free Onboard Wi-Fi
                      </span>
                      <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        Commercial Yellow Plate
                      </span>
                    </div>
                  </div>

                  {/* Inclusions checklist with red checkboxes */}
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-5 text-xs font-semibold text-slate-700">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <CheckCircle2 className="w-4 h-4 text-red-600 shrink-0" />
                      <span>Free Rescheduling & Amendments</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <CheckCircle2 className="w-4 h-4 text-red-600 shrink-0" />
                      <span>All Tolls & State Taxes Included</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <CheckCircle2 className="w-4 h-4 text-red-600 shrink-0" />
                      <span>Comprehensive Chauffeur Insurance</span>
                    </label>
                  </div>

                </div>

              </div>

            </div>

            {/* BOTTOM CARD: Chauffeur Hub Location & Map View */}
            <div id="route-map-section" className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200/90 scroll-mt-28">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <span className="text-xs font-bold text-red-600 uppercase tracking-widest block">Live Navigation</span>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                    Live Highway Map & Available Routes
                  </h3>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
                    🛣️ {routeCalc.distanceKm} km Total
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200">
                    ⏱️ Drive {routeCalc.durationFormatted}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    🏁 {routeCalc.fullReachString}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                
                {/* Left address information */}
                <div className="lg:col-span-6 space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-100">
                      <MapPin className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        Pick Up & Dispatch Lounge
                      </h4>
                      <p className="text-xs text-slate-700 font-semibold mt-0.5">
                        Wayora Executive Chauffeur Hub · {fromLocation}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Doorstep pickup, Airport Terminal Arrival Gate & Hotel Chauffeur Handover
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-100">
                      <Clock className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        Service Availability
                      </h4>
                      <p className="text-xs text-slate-700 font-semibold mt-0.5">
                        24 Hours · 7 Days A Week
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Round-the-clock captain dispatch with live GPS radar tracking
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                      <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        Destination Drop-off
                      </h4>
                      <p className="text-xs text-slate-700 font-semibold mt-0.5">
                        Doorstep Delivery in {toLocation}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        No return fare charges on outstation one-way drops
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right interactive map preview */}
                <div className="lg:col-span-6">
                  <RouteMiniMap
                    origin={fromLocation}
                    destination={toLocation}
                    distanceKm={routeCalc.distanceKm}
                    duration={routeCalc.durationFormatted}
                    vehicleName={selectedCar.name}
                    tollIncluded={true}
                    isDark={false}
                  />
                </div>

              </div>

            </div>

          </div>
        )}

        {/* ================= VIEW 2: YOUR DETAILS FORM ================= */}
        {currentView === 'form' && (
          <div className="space-y-6">
            
            <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xs border border-slate-200/90">
              
              {/* Stepper Progress bar: Taxi - Selected ---- Taxi - Details */}
              <div className="flex items-center justify-center gap-4 sm:gap-8 pb-8 border-b border-slate-100 max-w-md mx-auto">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-600">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px]">
                    ✓
                  </span>
                  <span>Vehicle Selected</span>
                </div>

                <div className="w-16 sm:w-24 h-0.5 bg-slate-200" />

                <div className="flex items-center gap-2 text-xs font-bold text-red-600">
                  <span className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px]">
                    ●
                  </span>
                  <span>Passenger Details</span>
                </div>
              </div>

              {/* Title & Subtitle */}
              <div className="pt-6 pb-6">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Passenger & Contact Details
                </h2>
                <p className="text-xs text-slate-500 font-medium max-w-2xl mt-1 leading-relaxed">
                  Your chauffeur assignment and live trip tracking link will be sent to the contact details provided below.
                </p>
              </div>

              {/* Rider Selection: Myself vs Family Member */}
              <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3 sm:p-4 mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800">Who is traveling in this cab?</span>
                  {isBookingForFamily && (
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                      Family Care Active
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 bg-slate-200/70 p-1 rounded-xl shrink-0">
                  <button
                    type="button"
                    onClick={handleResetFamilyRide}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      !isBookingForFamily
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <User className="w-3.5 h-3.5 text-red-600" />
                    <span>Traveling Myself</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowFamilyModal(true)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      isBookingForFamily
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-rose-600'
                    }`}
                  >
                    <span>👨‍👩‍👧</span>
                    <span>Booking for Family / Others</span>
                  </button>
                </div>
              </div>

              {/* If Booking for Family, show Family Passenger Card */}
              {isBookingForFamily && (
                <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-rose-50 via-red-50/50 to-amber-50/30 border border-rose-200 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center text-sm shadow-xs">
                        👨‍👩‍👧
                      </span>
                      <div>
                        <div className="text-xs font-black text-slate-900">
                          Family Passenger: {familyMemberName || 'Family Member'} {familyMemberPhone ? `· ${familyMemberPhone}` : ''}
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium">
                          Chauffeur will coordinate directly with this passenger at {fromLocation}.
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowFamilyModal(true)}
                      className="text-xs font-bold text-rose-700 hover:text-rose-800 bg-white px-3 py-1 rounded-lg border border-rose-200 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                    >
                      Edit Details
                    </button>
                  </div>

                  {familyNotes && (
                    <div className="text-xs text-rose-800 bg-white/90 p-2.5 rounded-xl border border-rose-100 font-medium">
                      <strong>Chauffeur Instructions:</strong> {familyNotes}
                    </div>
                  )}
                </div>
              )}

              {/* Form fields */}
              <form onSubmit={handleFinalBookingSubmit} className="space-y-5">
                
                {/* Row 1: Title, First Name (Fixed typo), Last Name */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                  
                  {/* Title */}
                  <div className="sm:col-span-3">
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">
                      Title
                    </label>
                    <select
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 cursor-pointer"
                    >
                      <option value="Mr">Mr</option>
                      <option value="Mrs">Mrs</option>
                      <option value="Ms">Ms</option>
                      <option value="Dr">Dr</option>
                    </select>
                  </div>

                  {/* First Name (Fixed spelling) */}
                  <div className="sm:col-span-4">
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Aarav"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                    />
                  </div>

                  {/* Last Name */}
                  <div className="sm:col-span-5">
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Sharma"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                    />
                  </div>

                </div>

                {/* Row 2: Email */}
                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="aarav.sharma@example.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  />
                </div>

                {/* Row 3: Country Code & Mobile (Fixed spelling) */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                  <div className="sm:col-span-5">
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">
                      Country Code
                    </label>
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 cursor-pointer"
                    >
                      <option value="+91 (India)">+91 (India)</option>
                      <option value="+1 (USA)">+1 (USA)</option>
                      <option value="+44 (UK)">+44 (UK)</option>
                      <option value="+971 (UAE)">+971 (UAE)</option>
                      <option value="+65 (Singapore)">+65 (Singapore)</option>
                      <option value="+880 (Bangladesh)">+880 (Bangladesh)</option>
                    </select>
                  </div>

                  <div className="sm:col-span-7">
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      required
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      placeholder="+91 98490 11223"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                    />
                  </div>
                </div>

                {/* Coupon Block with Checkbox */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                    <input
                      type="checkbox"
                      checked={hasCoupon}
                      onChange={(e) => setHasCoupon(e.target.checked)}
                      className="rounded text-red-600 focus:ring-0 accent-red-600"
                    />
                    <span>I have a promotional coupon code</span>
                  </label>

                  {hasCoupon && (
                    <div className="flex items-center gap-2 max-w-md pt-1">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="Enter your coupon code"
                        className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none uppercase"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                      >
                        Apply
                      </button>
                    </div>
                  )}

                  {couponApplied && (
                    <div className="text-xs text-emerald-600 font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Coupon WAYORA500 active: ₹500 discount applied</span>
                    </div>
                  )}
                </div>

                {/* Fare Summary & Confirmation CTA */}
                <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
                  <div>
                    <div className="text-xs text-slate-500 font-medium">Selected Chauffeur Vehicle:</div>
                    <div className="text-base font-black text-slate-900">{selectedCar.name}</div>
                    <div className="text-xs text-emerald-600 font-bold">
                      Total Fare: ₹{(couponApplied ? Math.max(0, selectedCar.price - 500) : selectedCar.price).toLocaleString('en-IN')} (All Taxes, Tolls & GST Included)
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-black text-sm tracking-wider uppercase transition-all shadow-xl shadow-red-600/30 cursor-pointer"
                  >
                    CONFIRM & BOOK CHAUFFEUR
                  </button>
                </div>

              </form>

              {/* Booking Success Confirmation Screen with Route Summary Mini-Map */}
              {bookingSuccessId && (
                <div className="mt-8 rounded-3xl bg-white border border-emerald-300 shadow-2xl p-6 sm:p-8 space-y-6 animate-in fade-in">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 shrink-0">
                        <Check className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-lg font-black text-slate-900">Journey Confirmed & Chauffeur Dispatched!</h4>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                            ACTIVE RIDE
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                          Booking Reference ID: <span className="font-mono font-bold text-red-600">#{bookingSuccessId}</span> · Chauffeur dispatch pool assigned
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 font-semibold">Total Paid:</span>
                      <span className="text-lg font-black text-emerald-600">
                        ₹{(couponApplied ? Math.max(0, selectedCar.price - 500) : selectedCar.price).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* MINI-MAP VISUALIZATION: ROUTE SUMMARY */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-red-600" />
                        Live Highway Route Summary & Radar
                      </span>
                      <span className="text-[11px] font-bold text-red-700 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full">
                        GPS Live Tracking
                      </span>
                    </div>
                    
                    <RouteMiniMap
                      origin={fromLocation}
                      destination={toLocation}
                      distanceKm={routeCalc.distanceKm}
                      duration={routeCalc.durationFormatted}
                      bookingRef={bookingSuccessId}
                      vehicleName={selectedCar.name}
                      tollIncluded={true}
                      isDark={false}
                    />
                  </div>

                  {/* Passenger & Schedule Summary Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-bold block mb-1 uppercase">Passenger</span>
                      <span className="font-bold text-slate-900 block">{title} {firstName} {lastName}</span>
                      <span className="text-[11px] text-slate-500 block">{mobileNumber}</span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-bold block mb-1 uppercase">Pickup Time</span>
                      <span className="font-bold text-slate-900 block">{pickupDate}</span>
                      <span className="text-[11px] text-slate-500 block">{pickupTime}</span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-bold block mb-1 uppercase">Assigned Fleet</span>
                      <span className="font-bold text-slate-900 block">{selectedCar.name}</span>
                      <span className="text-[11px] text-emerald-600 font-bold block">AC · GPS · Tolls Paid</span>
                    </div>
                  </div>

                  {/* Action CTAs */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => setActivePage('captain')}
                        className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm"
                      >
                        View in Captain Cockpit
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          showToast('SMS & WhatsApp confirmation sent with live driver link', 'success');
                        }}
                        className="px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300 transition-colors cursor-pointer"
                      >
                        Share Live Route
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setBookingSuccessId(null);
                        setCurrentView('details');
                      }}
                      className="text-xs font-bold text-red-600 hover:text-red-700 transition-colors cursor-pointer"
                    >
                      Book Another Ride ➔
                    </button>
                  </div>

                </div>
              )}

            </div>

          </div>
        )}

        {/* ================= VIEW 3: SEARCH RESULTS & FILTERS ================= */}
        {currentView === 'search' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: Filter Sidebar */}
            <div className="lg:col-span-4 bg-white rounded-3xl p-6 shadow-xs border border-slate-200/90 space-y-6">
              
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="text-lg font-black text-slate-900">
                  Filters
                </h3>
                <button 
                  type="button" 
                  onClick={() => {
                    setPriceMax(35000);
                    setSeatFilter('4 seat');
                    setCategoryFilter('All');
                  }}
                  className="text-xs text-slate-400 hover:text-slate-900 cursor-pointer"
                >
                  Reset
                </button>
              </div>

              {/* Price Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>Maximum Price</span>
                  <span className="text-red-600">₹{priceMax.toLocaleString('en-IN')}</span>
                </div>

                <input
                  type="range"
                  min="2000"
                  max="45000"
                  step="500"
                  value={priceMax}
                  onChange={(e) => setPriceMax(Number(e.target.value))}
                  className="w-full accent-red-600 cursor-pointer"
                />
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>₹2,000</span>
                  <span>₹45,000+</span>
                </div>
              </div>

              {/* Looking for (Seat count) */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Seating Capacity
                </label>
                <select
                  value={seatFilter}
                  onChange={(e) => setSeatFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="4 seat">4 Seater (Sedan / Executive)</option>
                  <option value="6 seat">6+1 Seater (Innova Crysta)</option>
                  <option value="7 seat">7 Seater (Fortuner SUV)</option>
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Fleet Category
                </label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="All">All Fleet</option>
                  <option value="Luxury">Luxury Saloon</option>
                  <option value="Branded">Premium MUV</option>
                  <option value="SUV">Luxury SUV</option>
                  <option value="Economy">Economy</option>
                </select>
              </div>

              {/* Popular Filters Checkboxes */}
              <div className="space-y-2.5 pt-2 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-700 block mb-1">
                  Preferences
                </span>
                
                <label className="flex items-center gap-2.5 text-xs text-slate-600 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={filterAc} 
                    onChange={(e) => setFilterAc(e.target.checked)} 
                    className="rounded text-red-600 focus:ring-0 accent-red-600" 
                  />
                  <span>Climate Control AC</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs text-slate-600 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={filterNewCar} 
                    onChange={(e) => setFilterNewCar(e.target.checked)} 
                    className="rounded text-red-600 focus:ring-0 accent-red-600" 
                  />
                  <span>New Vehicle (&lt; 2 Years)</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs text-slate-600 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={filterNonStop} 
                    onChange={(e) => setFilterNonStop(e.target.checked)} 
                    className="rounded text-red-600 focus:ring-0 accent-red-600" 
                  />
                  <span>Express Direct Non-Stop</span>
                </label>
              </div>

            </div>

            {/* Right Column: Search Results List */}
            <div className="lg:col-span-8 space-y-4">
              
              {/* Sort Order Filter Tabs */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-slate-200 shadow-xs text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setSortOrder('cheapest')}
                    className={`px-4 py-1.5 rounded-xl transition-all cursor-pointer ${
                      sortOrder === 'cheapest' ? 'bg-red-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Lowest Fare
                  </button>
                  <button
                    type="button"
                    onClick={() => setSortOrder('best')}
                    className={`px-4 py-1.5 rounded-xl transition-all cursor-pointer ${
                      sortOrder === 'best' ? 'bg-red-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Top Rated
                  </button>
                  <button
                    type="button"
                    onClick={() => setSortOrder('quickest')}
                    className={`px-4 py-1.5 rounded-xl transition-all cursor-pointer ${
                      sortOrder === 'quickest' ? 'bg-red-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    VIP Luxury
                  </button>
                </div>

                <span className="text-xs text-slate-400 font-semibold hidden sm:inline">
                  Showing {availableCars.length} available chauffeurs
                </span>
              </div>

              {/* Car Cards List */}
              <div className="space-y-4">
                {availableCars.map((car) => (
                  <div
                    key={car.id}
                    className="bg-white rounded-3xl p-5 shadow-xs border border-slate-200/90 hover:shadow-md transition-all flex flex-col sm:flex-row items-center justify-between gap-5"
                  >
                    {/* Car Thumbnail */}
                    <div className="w-full sm:w-48 h-32 rounded-2xl bg-slate-50 p-2 flex items-center justify-center shrink-0 border border-slate-100">
                      <img
                        src={car.image}
                        alt={car.name}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0 space-y-1.5 w-full">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-black">
                          {car.rating} ★
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {car.category} · {car.seats} · {car.transmission}
                        </span>
                      </div>
                      <h4 className="text-base font-black text-slate-900 truncate">
                        {car.name}
                      </h4>
                      <p className="text-xs text-slate-500 truncate flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0" />
                        {car.airport}
                      </p>
                    </div>

                    {/* Price & Action Buttons */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 shrink-0">
                      <div className="text-right">
                        <div className="text-[10px] text-red-600 font-bold">
                          ₹{car.ratePerKm}/km
                        </div>
                        <div className="text-xl font-black text-slate-900">
                          ₹{car.price.toLocaleString('en-IN')}
                        </div>
                        <div className="text-[10px] text-emerald-600 font-bold">
                          All Taxes & Tolls Included
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCar(car);
                            setCurrentView('details');
                          }}
                          className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:border-red-500 text-slate-800 hover:text-red-600 text-xs font-bold transition-colors cursor-pointer"
                        >
                          View Specs
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCar(car);
                            setCurrentView('form');
                          }}
                          className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs shadow-red-600/30"
                        >
                          BOOK NOW
                        </button>
                      </div>
                    </div>

                  </div>
                ))}
              </div>

            </div>

          </div>
        )}

      </main>

      {/* Interactive Choose-On-Map Destination Modal */}
      <MapLocationPickerModal
        isOpen={showMapPicker}
        onClose={() => setShowMapPicker(false)}
        initialLat={destinationCoords?.lat || 13.6288}
        initialLng={destinationCoords?.lng || 79.4192}
        initialName={toLocation}
        originCoords={userCoords || CITY_COORDINATES.hyderabad}
        onConfirmLocation={(loc) => {
          setToLocation(loc.name);
          setDestinationCoords({ lat: loc.lat, lng: loc.lng });
        }}
      />

      {/* Book Ride for Family or Someone Else Modal */}
      <FamilyRideModal
        isOpen={showFamilyModal}
        onClose={() => setShowFamilyModal(false)}
        initialDetails={{
          enabled: isBookingForFamily,
          passengerName: familyMemberName,
          passengerPhone: familyMemberPhone,
          doorstepAddress: familyPickupAddress || fromLocation,
          notes: familyNotes,
          assistanceTags: familyAssistanceTags,
        }}
        onApply={handleApplyFamilyRide}
        onReset={handleResetFamilyRide}
        currentLiveLocation={userLocation || undefined}
      />

    </div>
  );
};
