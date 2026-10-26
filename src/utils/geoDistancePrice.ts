/**
 * Wayora Journeys Geo & Distance Engine
 * Real-time geolocation, coordinate calculation, and exact fare computation.
 */

export interface LatLng {
  lat: number;
  lng: number;
}

export interface MapLocationItem {
  name: string;
  displayName: string;
  lat: number;
  lng: number;
  category?: 'city' | 'temple' | 'hillstation' | 'beach' | 'airport';
}

export interface RouteCalculationResult {
  origin: string;
  originCoords?: LatLng;
  destination: string;
  destinationCoords?: LatLng;
  distanceKm: number;
  durationMinutes: number;
  durationFormatted: string;
  departureFormatted: string;
  reachTimeFormatted: string;
  reachDateFormatted: string;
  isNextDay: boolean;
  fullReachString: string;
  isGpsAccurate: boolean;
  isLiveMapRoute: boolean;
  highwaySummary: string;
  rates: {
    sedan: { ratePerKm: number; totalFare: number; advance25: number; name: string };
    innova: { ratePerKm: number; totalFare: number; advance25: number; name: string };
    suv: { ratePerKm: number; totalFare: number; advance25: number; name: string };
    tempo: { ratePerKm: number; totalFare: number; advance25: number; name: string };
    ev: { ratePerKm: number; totalFare: number; advance25: number; name: string };
  };
  inclusions: {
    gst: string;
    toll: string;
    driverAllowance: number;
    nightCharges: number;
  };
}

// Well-known coordinates across South, Central & North India for instant lookups
export const CITY_COORDINATES: Record<string, LatLng> = {
  // Hubs
  hyderabad: { lat: 17.385, lng: 78.4867 },
  'hiteccity': { lat: 17.4435, lng: 78.3772 },
  'gachibowli': { lat: 17.4401, lng: 78.3489 },
  'secunderabad': { lat: 17.4399, lng: 78.4983 },
  'rgiairport': { lat: 17.2403, lng: 78.4294 },
  'shamshabad': { lat: 17.2403, lng: 78.4294 },

  // Spiritual & Outstation Destinations
  tirupati: { lat: 13.6288, lng: 79.4192 },
  srisailam: { lat: 16.0737, lng: 78.8686 },
  vijayawada: { lat: 16.5062, lng: 80.6480 },
  visakhapatnam: { lat: 17.6868, lng: 83.2185 },
  araku: { lat: 18.3273, lng: 82.8775 },
  warangal: { lat: 17.9689, lng: 79.5941 },
  nagarjunasagar: { lat: 16.5772, lng: 79.3142 },
  yadagirigutta: { lat: 17.5872, lng: 78.9431 },
  shirdi: { lat: 19.7667, lng: 74.4764 },
  goa: { lat: 15.2993, lng: 74.1240 },
  bengaluru: { lat: 12.9716, lng: 77.5946 },
  chennai: { lat: 13.0827, lng: 80.2707 },
  hampi: { lat: 15.3350, lng: 76.4600 },
  ooty: { lat: 11.4102, lng: 76.6950 },
  mysore: { lat: 12.2958, lng: 76.6394 },
  munnar: { lat: 10.0889, lng: 77.0595 },
  kashi: { lat: 25.3176, lng: 82.9739 },
  rameswaram: { lat: 9.2876, lng: 79.3129 },
  mantralayam: { lat: 15.9372, lng: 77.4296 },
  tuljapur: { lat: 18.0133, lng: 76.0713 },
  kurnool: { lat: 15.8281, lng: 78.0373 },
  anantapur: { lat: 14.6819, lng: 77.6006 },
  pune: { lat: 18.5204, lng: 73.8567 },
  mumbai: { lat: 19.0760, lng: 72.8777 },
  delhi: { lat: 28.6139, lng: 77.2090 },
  jaipur: { lat: 26.9124, lng: 75.7873 },
  udaipur: { lat: 24.5854, lng: 73.7125 },
  agra: { lat: 27.1767, lng: 78.0081 },
  coorg: { lat: 12.3375, lng: 75.8069 },
  kodaikanal: { lat: 10.2381, lng: 77.4892 },
  wayanad: { lat: 11.6854, lng: 76.1320 },
  pondicherry: { lat: 11.9416, lng: 79.8083 },
  mahabaleshwar: { lat: 17.9237, lng: 73.6586 },
  lonavala: { lat: 18.7557, lng: 73.4091 },
  kochi: { lat: 9.9312, lng: 76.2673 },
  madurai: { lat: 9.9252, lng: 78.1198 },
  ayodhya: { lat: 26.7922, lng: 82.1998 },
  rishikesh: { lat: 30.0869, lng: 78.2676 },
};

/**
 * Curated top destination presets for one-tap booking & live map auto-fetch
 */
export const POPULAR_DESTINATION_PRESETS = [
  { name: 'Tirupati Balaji', location: 'Tirupati, Andhra Pradesh', icon: '🛕' },
  { name: 'Srisailam Jyotirlinga', location: 'Srisailam, Andhra Pradesh', icon: '🕉️' },
  { name: 'Goa Beaches', location: 'Goa, India', icon: '🏖️' },
  { name: 'Bengaluru Silicon City', location: 'Bengaluru, Karnataka', icon: '🏙️' },
  { name: 'Shirdi Sai Baba', location: 'Shirdi, Maharashtra', icon: '✨' },
  { name: 'Araku Valley & Borra', location: 'Araku, Andhra Pradesh', icon: '⛰️' },
  { name: 'Vijayawada Kanaka Durga', location: 'Vijayawada, Andhra Pradesh', icon: '🏛️' },
  { name: 'Ooty Queen of Hills', location: 'Ooty, Tamil Nadu', icon: '🌲' },
];

/**
 * Standard cab tariff structure (rate per km in INR)
 */
export const CAB_RATES: Record<string, { rate: number; name: string; driverPerDay: number }> = {
  sedan: { rate: 13, name: 'Executive Sedan (Dzire/Etios)', driverPerDay: 400 },
  innova: { rate: 19, name: 'Innova Crysta Luxury', driverPerDay: 500 },
  suv: { rate: 28, name: 'Toyota Fortuner VIP', driverPerDay: 600 },
  tempo: { rate: 26, name: 'Tempo Traveller (12-Seater)', driverPerDay: 700 },
  ev: { rate: 14, name: 'Urban Green EV', driverPerDay: 400 },
};

/**
 * Calculate Great Circle distance between two coordinates in Kilometers (Haversine Formula)
 */
export function calculateHaversineDistanceKm(c1: LatLng, c2: LatLng): number {
  const R = 6371; // Earth radius in km
  const dLat = ((c2.lat - c1.lat) * Math.PI) / 180;
  const dLng = ((c2.lng - c1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((c1.lat * Math.PI) / 180) *
      Math.cos((c2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const crowFlies = R * c;

  // Road Highway curvature factor (Indian National Highways have typical 1.25x - 1.30x actual road vs crow-flies)
  return Math.round(crowFlies * 1.28);
}

/**
 * Find known coordinates for a query string
 */
export function lookupCityCoords(query: string): LatLng | null {
  if (!query) return null;
  const clean = query.toLowerCase().replace(/[^a-z0-9]/g, '');

  for (const [key, coords] of Object.entries(CITY_COORDINATES)) {
    if (clean.includes(key) || key.includes(clean)) {
      return coords;
    }
  }

  // Fallback lookups for popular landmark aliases
  if (clean.includes('shamshabad') || clean.includes('airport') || clean.includes('rgia')) {
    return CITY_COORDINATES.rgiairport;
  }
  if (clean.includes('tirumala') || clean.includes('balaji')) {
    return CITY_COORDINATES.tirupati;
  }
  if (clean.includes('charminar') || clean.includes('banjara') || clean.includes('jubilee')) {
    return CITY_COORDINATES.hyderabad;
  }
  if (clean.includes('kashi') || clean.includes('varanasi') || clean.includes('banaras')) {
    return CITY_COORDINATES.kashi;
  }
  if (clean.includes('mallikarjuna')) {
    return CITY_COORDINATES.srisailam;
  }

  return null;
}

/**
 * Formats duration in hours and minutes
 */
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h <= 0) return `${m} mins`;
  if (m === 0) return `${h} hrs`;
  return `${h}h ${m}m`;
}

/**
 * Calculates accurate Reach Time / Arrival Time based on departure date, time, and travel duration
 */
export function calculateReachTime(params: {
  departureDate?: string;
  departureTime?: string;
  durationMinutes: number;
}): {
  departureFormatted: string;
  reachTimeFormatted: string;
  reachDateFormatted: string;
  isNextDay: boolean;
  fullReachString: string;
} {
  const { departureDate, departureTime = '06:00', durationMinutes } = params;

  // Parse time
  const [hourStr, minStr] = departureTime.split(':');
  const depHour = parseInt(hourStr || '6', 10);
  const depMin = parseInt(minStr || '0', 10);

  // Format Departure time (12h AM/PM)
  const depPeriod = depHour >= 12 ? 'PM' : 'AM';
  const depHour12 = depHour % 12 === 0 ? 12 : depHour % 12;
  const departureFormatted = `${depHour12}:${depMin.toString().padStart(2, '0')} ${depPeriod}`;

  // Base departure timestamp
  let baseDate = new Date();
  if (departureDate && departureDate.includes('-')) {
    const [y, m, d] = departureDate.split('-').map(Number);
    baseDate = new Date(y, m - 1, d, depHour, depMin, 0);
  } else {
    baseDate.setHours(depHour, depMin, 0, 0);
  }

  // Reach timestamp
  const reachDate = new Date(baseDate.getTime() + durationMinutes * 60 * 1000);

  const reachHour = reachDate.getHours();
  const reachMin = reachDate.getMinutes();
  const reachPeriod = reachHour >= 12 ? 'PM' : 'AM';
  const reachHour12 = reachHour % 12 === 0 ? 12 : reachHour % 12;
  const reachTimeFormatted = `${reachHour12}:${reachMin.toString().padStart(2, '0')} ${reachPeriod}`;

  const isNextDay = reachDate.getDate() !== baseDate.getDate();
  const daysDiff = Math.round((reachDate.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));

  let reachDateFormatted = 'Same Day';
  if (daysDiff === 1 || isNextDay) {
    reachDateFormatted = 'Next Day (+1)';
  } else if (daysDiff > 1) {
    reachDateFormatted = `+${daysDiff} Days`;
  }

  const fullReachString = isNextDay
    ? `Reach ${reachTimeFormatted} (${reachDateFormatted})`
    : `Reach by ${reachTimeFormatted} Today`;

  return {
    departureFormatted,
    reachTimeFormatted,
    reachDateFormatted,
    isNextDay,
    fullReachString,
  };
}

/**
 * Auto-fetch live driving route and real-time distance from OpenStreetMap OSRM Routing Engine
 */
export async function fetchLiveMapRoute(
  origin: LatLng,
  destination: LatLng
): Promise<{ distanceKm: number; durationMinutes: number; summary: string } | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2600); // 2.6s timeout

    const url = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=false&steps=false`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) return null;
    const data = await res.json();
    if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
      const best = data.routes[0];
      const distanceKm = Math.round(best.distance / 1000);
      const durationMinutes = Math.round(best.duration / 60);
      return {
        distanceKm: Math.max(35, distanceKm),
        durationMinutes: Math.max(30, durationMinutes),
        summary: best.legs?.[0]?.summary || 'National Express Highway Corridor',
      };
    }
  } catch {
    // Network or timeout - fallback to Haversine
  }
  return null;
}

/**
 * Parse coordinates and place names from Google Maps URLs or direct Lat,Lng coordinates
 * Supports:
 * - Direct lat,lng: "17.4435, 78.3772"
 * - https://www.google.com/maps/place/Place+Name/@17.4435,78.3772,17z/...
 * - https://maps.google.com/?q=17.4435,78.3772
 * - https://www.google.com/maps/search/?api=1&query=17.4435,78.3772
 * - https://www.google.com/maps/dir/.../17.4435,78.3772
 * - data=...!3d17.443521!4d78.377218
 */
export function parseGoogleMapsInput(input: string): { lat: number; lng: number; placeName?: string } | null {
  if (!input) return null;
  const str = input.trim();

  // 1. Direct Lat, Lng format: "17.4435, 78.3772" or "17.4435,78.3772"
  const directCoordMatch = str.match(/^(-?\d{1,2}\.\d+)[,\s]+(-?\d{1,3}\.\d+)$/);
  if (directCoordMatch) {
    const lat = parseFloat(directCoordMatch[1]);
    const lng = parseFloat(directCoordMatch[2]);
    if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return { lat, lng, placeName: `Custom Pin (${lat.toFixed(4)}, ${lng.toFixed(4)})` };
    }
  }

  // 2. Google Maps URL patterns
  // Pattern A: @lat,lng,zoom
  const atMatch = str.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  // Pattern B: q=lat,lng or query=lat,lng or ll=lat,lng
  const queryMatch = str.match(/[?&](?:q|query|ll)=(-?\d+\.\d+),(-?\d+\.\d+)/);
  // Pattern C: !3dlat!4dlng (Google Maps Protobuf)
  const protoMatch = str.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
  // Pattern D: /dir/.../lat,lng
  const dirMatch = str.match(/\/dir\/.*?\/(-?\d+\.\d+),(-?\d+\.\d+)/);

  let lat: number | null = null;
  let lng: number | null = null;

  if (atMatch) {
    lat = parseFloat(atMatch[1]);
    lng = parseFloat(atMatch[2]);
  } else if (queryMatch) {
    lat = parseFloat(queryMatch[1]);
    lng = parseFloat(queryMatch[2]);
  } else if (protoMatch) {
    lat = parseFloat(protoMatch[1]);
    lng = parseFloat(protoMatch[2]);
  } else if (dirMatch) {
    lat = parseFloat(dirMatch[1]);
    lng = parseFloat(dirMatch[2]);
  }

  // Try extracting human place title from URL path: /place/Place+Name/
  let placeName: string | undefined = undefined;
  const placePathMatch = str.match(/\/place\/([^/@?]+)/);
  if (placePathMatch && placePathMatch[1]) {
    placeName = decodeURIComponent(placePathMatch[1].replace(/\+/g, ' ')).trim();
  }

  if (lat !== null && lng !== null && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
    return {
      lat,
      lng,
      placeName: placeName || `Google Maps Pin (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
    };
  }

  return null;
}

/**
 * Reverse Geocode coordinates to address and location name using OpenStreetMap
 */
export async function reverseGeocodeLocation(lat: number, lng: number): Promise<{
  name: string;
  displayName: string;
  road?: string;
  city?: string;
  state?: string;
}> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2600);
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'Accept-Language': 'en' },
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const primary =
        data.name ||
        addr.amenity ||
        addr.building ||
        addr.hotel ||
        addr.tourism ||
        addr.neighbourhood ||
        addr.suburb ||
        addr.road ||
        addr.village ||
        addr.town ||
        addr.city ||
        'Custom Destination Pin';

      const secondary = [
        addr.suburb || addr.neighbourhood,
        addr.city || addr.town || addr.district,
        addr.state,
        addr.postcode,
      ]
        .filter(Boolean)
        .join(', ');

      return {
        name: primary,
        displayName: data.display_name || `${primary}, ${secondary}`,
        road: addr.road,
        city: addr.city || addr.town || addr.district,
        state: addr.state,
      };
    }
  } catch {
    // Fallback
  }

  return {
    name: `Custom Pin (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
    displayName: `Pinned at Latitude ${lat.toFixed(5)}, Longitude ${lng.toFixed(5)}`,
  };
}

/**
 * Live search and autocomplete for custom destinations, Google Maps links, and landmarks
 */
export async function searchMapLocations(query: string): Promise<MapLocationItem[]> {
  if (!query || query.trim().length < 2) return [];
  const qClean = query.trim();

  // 0. Detect pasted Google Maps link or direct Lat,Lng coordinates
  const parsedGMap = parseGoogleMapsInput(qClean);
  if (parsedGMap) {
    const rev = await reverseGeocodeLocation(parsedGMap.lat, parsedGMap.lng);
    return [
      {
        name: parsedGMap.placeName && !parsedGMap.placeName.startsWith('Custom Pin')
          ? parsedGMap.placeName
          : rev.name,
        displayName: `📍 Google Maps Verified: ${rev.displayName}`,
        lat: parsedGMap.lat,
        lng: parsedGMap.lng,
        category: 'googlemaps',
      },
    ];
  }

  const qLower = qClean.toLowerCase();

  // 1. Instant local index lookup
  const localMatches: MapLocationItem[] = [];
  for (const [key, coords] of Object.entries(CITY_COORDINATES)) {
    if (key.includes(qLower) || qLower.includes(key)) {
      const formatted = key.charAt(0).toUpperCase() + key.slice(1);
      localMatches.push({
        name: formatted,
        displayName: `${formatted}, India (Highway Chauffeur Hub)`,
        lat: coords.lat,
        lng: coords.lng,
        category: 'city',
      });
    }
  }

  // 2. Query OpenStreetMap Nominatim for any custom address, hotel, resort, colony, pin code, or landmark
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2600);
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      qClean
    )}&countrycodes=in&addressdetails=1&limit=8`;
    const res = await fetch(nominatimUrl, {
      signal: controller.signal,
      headers: {
        'Accept-Language': 'en',
      },
    });
    clearTimeout(timeout);

    if (res.ok) {
      const items = await res.json();
      const osmMatches: MapLocationItem[] = items.map((item: any) => ({
        name: item.name || item.display_name.split(',')[0],
        displayName: item.display_name,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        category:
          item.type === 'aerodrome'
            ? 'airport'
            : item.type === 'place_of_worship'
            ? 'temple'
            : item.class === 'tourism' || item.type === 'hotel' || item.type === 'resort'
            ? 'hotel'
            : 'custom',
      }));

      const combined = [...localMatches, ...osmMatches];
      const seen = new Set<string>();
      return combined.filter((item) => {
        const id = item.name.toLowerCase();
        if (seen.has(id)) return false;
        seen.add(id);
        return true;
      }).slice(0, 8);
    }
  } catch {
    // Fall back to local
  }

  return localMatches.slice(0, 8);
}

/**
 * Universal Route & Price Calculator
 * Supports: One-way, Round-trip, Live GPS, Custom Departure Time, and Live Map overrides
 */
export function calculateTripRouteAndPrice(params: {
  originName: string;
  originCoords?: LatLng | null;
  destinationName: string;
  destinationCoords?: LatLng | null;
  tripType?: 'Round Trip' | 'One-Way Drop' | 'ROUND_TRIP' | 'ONE_WAY' | string;
  driverDays?: number;
  departureDate?: string;
  departureTime?: string;
  liveDistanceKm?: number;
  liveDurationMinutes?: number;
  highwaySummary?: string;
}): RouteCalculationResult {
  const {
    originName,
    originCoords,
    destinationName,
    destinationCoords,
    tripType = 'Round Trip',
    driverDays = 1,
    departureDate,
    departureTime = '06:00',
    liveDistanceKm,
    liveDurationMinutes,
    highwaySummary = 'National Highway Corridor',
  } = params;

  // Resolve origin coords
  const oCoords = originCoords || lookupCityCoords(originName) || CITY_COORDINATES.hyderabad;
  // Resolve destination coords
  const dCoords = destinationCoords || lookupCityCoords(destinationName) || CITY_COORDINATES.tirupati;

  // Compute road distance: use live map measurement if available, otherwise Haversine curvature
  let oneWayDistanceKm = liveDistanceKm || calculateHaversineDistanceKm(oCoords, dCoords);

  // Minimum local outstation billing baseline
  if (oneWayDistanceKm < 35) {
    oneWayDistanceKm = Math.max(35, oneWayDistanceKm);
  }

  const isRoundTrip = tripType === 'Round Trip' || tripType === 'ROUND_TRIP' || tripType === 'Outstation Round-trip';
  const billableDistanceKm = isRoundTrip ? oneWayDistanceKm * 2 : oneWayDistanceKm;

  // Driving duration in minutes
  const durationMinutes =
    liveDurationMinutes || Math.round((oneWayDistanceKm / 55) * 60);

  // Calculate Reach / Arrival Time details
  const reachDetails = calculateReachTime({
    departureDate,
    departureTime,
    durationMinutes,
  });

  // Calculate pricing for each cab category
  const driverDaysCount = Math.max(1, driverDays || (isRoundTrip ? Math.ceil(billableDistanceKm / 450) : 1));

  const calculateForCab = (key: keyof typeof CAB_RATES) => {
    const cab = CAB_RATES[key];
    const totalDriver = cab.driverPerDay * driverDaysCount;
    const baseTotal = billableDistanceKm * cab.rate;
    const totalFare = Math.round(baseTotal + totalDriver);
    const advance25 = Math.round(totalFare * 0.25);

    return {
      name: cab.name,
      ratePerKm: cab.rate,
      totalFare,
      advance25,
    };
  };

  return {
    origin: originName,
    originCoords: oCoords,
    destination: destinationName,
    destinationCoords: dCoords,
    distanceKm: billableDistanceKm,
    durationMinutes,
    durationFormatted: formatDuration(durationMinutes),
    departureFormatted: reachDetails.departureFormatted,
    reachTimeFormatted: reachDetails.reachTimeFormatted,
    reachDateFormatted: reachDetails.reachDateFormatted,
    isNextDay: reachDetails.isNextDay,
    fullReachString: reachDetails.fullReachString,
    isGpsAccurate: Boolean(originCoords),
    isLiveMapRoute: Boolean(liveDistanceKm),
    highwaySummary,
    rates: {
      sedan: calculateForCab('sedan'),
      innova: calculateForCab('innova'),
      suv: calculateForCab('suv'),
      tempo: calculateForCab('tempo'),
      ev: calculateForCab('ev'),
    },
    inclusions: {
      gst: '5% GST Included',
      toll: 'Toll & State Tax Included',
      driverAllowance: driverDaysCount * 400,
      nightCharges: 0,
    },
  };
}

