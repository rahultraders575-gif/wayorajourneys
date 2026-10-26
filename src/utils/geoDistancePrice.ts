/**
 * Wayora Journeys Geo & Distance Engine
 * Real-time geolocation, coordinate calculation, and exact fare computation.
 */

export interface LatLng {
  lat: number;
  lng: number;
}

export interface RouteCalculationResult {
  origin: string;
  originCoords?: LatLng;
  destination: string;
  destinationCoords?: LatLng;
  distanceKm: number;
  durationMinutes: number;
  durationFormatted: string;
  isGpsAccurate: boolean;
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

// Well-known coordinates across South & Central India for instant distance lookups
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
};

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
 * Universal Route & Price Calculator
 * Supports: One-way, Round-trip, Live GPS coordinates
 */
export function calculateTripRouteAndPrice(params: {
  originName: string;
  originCoords?: LatLng | null;
  destinationName: string;
  destinationCoords?: LatLng | null;
  tripType?: 'Round Trip' | 'One-Way Drop' | 'ROUND_TRIP' | 'ONE_WAY';
  driverDays?: number;
}): RouteCalculationResult {
  const { originName, originCoords, destinationName, destinationCoords, tripType = 'Round Trip', driverDays = 1 } = params;

  // Resolve origin coords
  let oCoords = originCoords || lookupCityCoords(originName) || CITY_COORDINATES.hyderabad;
  // Resolve destination coords
  let dCoords = destinationCoords || lookupCityCoords(destinationName) || CITY_COORDINATES.tirupati;

  // Compute road distance
  let oneWayDistanceKm = calculateHaversineDistanceKm(oCoords, dCoords);

  // Minimum local outstation billing baseline
  if (oneWayDistanceKm < 35) {
    // Local / Airport / City transfer
    oneWayDistanceKm = Math.max(35, oneWayDistanceKm);
  }

  const isRoundTrip = tripType === 'Round Trip' || tripType === 'ROUND_TRIP';
  const billableDistanceKm = isRoundTrip ? oneWayDistanceKm * 2 : oneWayDistanceKm;

  // Approximate driving speed on Indian highways (~55 km/h avg including tolls and traffic)
  const durationMinutes = Math.round((oneWayDistanceKm / 55) * 60);

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
    isGpsAccurate: Boolean(originCoords),
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
