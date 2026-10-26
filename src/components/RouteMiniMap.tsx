import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  MapPin, Navigation, Clock, ShieldCheck, Compass, 
  Layers, ZoomIn, ZoomOut, Car, Sparkles, Check,
  AlertCircle, Fuel, Zap, Route, RefreshCw, Flag, ArrowRight
} from 'lucide-react';
import { 
  calculateTripRouteAndPrice, 
  lookupCityCoords, 
  CITY_COORDINATES, 
  LatLng,
  fetchLiveRouteGeometry
} from '../utils/geoDistancePrice';

export interface RouteOption {
  id: string;
  name: string;
  highway: string;
  distanceKm: number;
  durationFormatted: string;
  trafficStatus: 'smooth' | 'moderate' | 'heavy';
  trafficDelayMinutes: number;
  tollCount: number;
  tollCostInr: number;
  scenicHighlights: string[];
  recommended?: boolean;
}

export interface RouteMiniMapProps {
  origin: string;
  destination: string;
  originCoords?: LatLng | null;
  destinationCoords?: LatLng | null;
  distanceKm?: number | string;
  duration?: string;
  bookingRef?: string;
  vehicleName?: string;
  tollIncluded?: boolean;
  isDark?: boolean;
  className?: string;
  showControls?: boolean;
  onSelectRoute?: (route: RouteOption) => void;
}

export const RouteMiniMap: React.FC<RouteMiniMapProps> = ({
  origin = 'Mumbai',
  destination = 'Srisailam',
  originCoords,
  destinationCoords,
  distanceKm,
  duration,
  bookingRef,
  vehicleName = 'Luxury Chauffeur Sedan',
  tollIncluded = true,
  isDark = false,
  className = '',
  showControls = true,
  onSelectRoute,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);
  const routeGlowRef = useRef<L.Polyline | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const [mapLayer, setMapLayer] = useState<'streets' | 'voyager' | 'dark'>('streets');
  const [selectedRouteId, setSelectedRouteId] = useState<string>('route-primary');
  const [liveRoadCoordinates, setLiveRoadCoordinates] = useState<[number, number][] | null>(null);
  const [isLoadingGeometry, setIsLoadingGeometry] = useState(false);

  // Format clean real city names (never generic "Origin Hub")
  const cleanOrigin = origin && origin.toLowerCase() !== 'origin hub' && origin.trim().length > 0
    ? origin.split(',')[0].trim()
    : 'Mumbai';
  const cleanDestination = destination && destination.trim().length > 0
    ? destination.split(',')[0].trim()
    : 'Srisailam';

  // Resolve true geographical coordinates
  const resolvedOriginCoords: LatLng = originCoords || lookupCityCoords(origin) || CITY_COORDINATES.mumbai || { lat: 19.0760, lng: 72.8777 };
  const resolvedDestCoords: LatLng = destinationCoords || lookupCityCoords(destination) || CITY_COORDINATES.srisailam || { lat: 16.0737, lng: 78.8686 };

  // Compute live route distance and duration calculation
  const computed = calculateTripRouteAndPrice({
    originName: cleanOrigin,
    destinationName: cleanDestination,
    originCoords: resolvedOriginCoords,
    destinationCoords: resolvedDestCoords,
    tripType: 'One-Way Drop',
  });

  const baseKm = typeof distanceKm === 'number' ? distanceKm : (computed.distanceKm || 272);
  const baseMinutes = computed.durationMinutes || 211;

  // Available Corridor Routes
  const availableRoutes: RouteOption[] = [
    {
      id: 'route-primary',
      name: 'Via National Express Corridor (Fastest)',
      highway: 'NH 44 / NH 48 Expressway',
      distanceKm: baseKm,
      durationFormatted: duration || computed.durationFormatted || '3h 31m',
      trafficStatus: 'smooth',
      trafficDelayMinutes: 0,
      tollCount: 6,
      tollCostInr: 480,
      scenicHighlights: ['Smooth 6-Lane Expressway', 'Fastag Automated Toll Plazas', '24/7 Food Courts'],
      recommended: true,
    },
    {
      id: 'route-scenic',
      name: 'Via Scenic Highway Corridor (Alternative)',
      highway: 'State Highway · Green Belt',
      distanceKm: Math.round(baseKm * 1.08),
      durationFormatted: `${Math.floor((baseMinutes + 46) / 60)}h ${(baseMinutes + 46) % 60}m`,
      trafficStatus: 'moderate',
      trafficDelayMinutes: 18,
      tollCount: 4,
      tollCostInr: 320,
      scenicHighlights: ['Lush Forest Reserves', 'Low Heavy Vehicle Traffic', 'Scenic Viewpoints'],
      recommended: false,
    },
    {
      id: 'route-bypass',
      name: 'Via Outer Ring Expressway (ORR)',
      highway: 'Outer Ring Expressway (ORR)',
      distanceKm: Math.round(baseKm * 1.14),
      durationFormatted: `${Math.floor((baseMinutes + 66) / 60)}h ${(baseMinutes + 66) % 60}m`,
      trafficStatus: 'smooth',
      trafficDelayMinutes: 5,
      tollCount: 7,
      tollCostInr: 560,
      scenicHighlights: ['Zero City Congestion', 'High-Speed Bypass', 'EV Superchargers'],
      recommended: false,
    },
  ];

  const activeRoute = availableRoutes.find(r => r.id === selectedRouteId) || availableRoutes[0];

  useEffect(() => {
    if (onSelectRoute) {
      onSelectRoute(activeRoute);
    }
  }, [selectedRouteId]);

  // Fetch real highway polyline from OpenStreetMap OSRM
  useEffect(() => {
    let active = true;
    const fetchGeometry = async () => {
      setIsLoadingGeometry(true);
      try {
        const coords = await fetchLiveRouteGeometry(resolvedOriginCoords, resolvedDestCoords);
        if (active && coords && coords.length > 5) {
          setLiveRoadCoordinates(coords);
        }
      } catch {
        // silent fallback
      } finally {
        if (active) setIsLoadingGeometry(false);
      }
    };

    fetchGeometry();
    return () => {
      active = false;
    };
  }, [resolvedOriginCoords.lat, resolvedOriginCoords.lng, resolvedDestCoords.lat, resolvedDestCoords.lng]);

  // Generate fallback curved highway coordinates if offline
  const generateFallbackCoordinates = (start: LatLng, end: LatLng, variant: string): [number, number][] => {
    const points: [number, number][] = [];
    const steps = 40;
    
    const curveOffset = variant === 'route-scenic' ? 0.12 : variant === 'route-bypass' ? -0.09 : 0.03;

    const midLat = (start.lat + end.lat) / 2;
    const midLng = (start.lng + end.lng) / 2;
    const dLat = end.lat - start.lat;
    const dLng = end.lng - start.lng;

    const perpLat = -dLng * curveOffset;
    const perpLng = dLat * curveOffset;

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const wobble = Math.sin(t * Math.PI * 4) * 0.015;
      const lat = (1 - t) * (1 - t) * start.lat + 2 * (1 - t) * t * (midLat + perpLat) + t * t * end.lat + wobble;
      const lng = (1 - t) * (1 - t) * start.lng + 2 * (1 - t) * t * (midLng + perpLng) + t * t * end.lng + wobble;
      points.push([lat, lng]);
    }
    return points;
  };

  // Initialize and update Real Leaflet Map
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    // Safely re-initialize Leaflet without container errors
    if ((container as any)._leaflet_id) {
      (container as any)._leaflet_id = null;
    }
    container.innerHTML = '';

    const startLat = resolvedOriginCoords.lat;
    const startLng = resolvedOriginCoords.lng;
    const endLat = resolvedDestCoords.lat;
    const endLng = resolvedDestCoords.lng;

    const map = L.map(container, {
      center: [(startLat + endLat) / 2, (startLng + endLng) / 2],
      zoom: 8,
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: true,
    });
    mapInstanceRef.current = map;

    // Direct High-Resolution Real Map Tiles
    let tileUrl = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
    if (mapLayer === 'voyager') {
      tileUrl = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
    } else if (mapLayer === 'dark') {
      tileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    }

    L.tileLayer(tileUrl, {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;

    // Use live OSRM road coordinates if available; else fallback to curved highway
    const routePoints: [number, number][] = liveRoadCoordinates && liveRoadCoordinates.length > 5
      ? liveRoadCoordinates
      : generateFallbackCoordinates(resolvedOriginCoords, resolvedDestCoords, selectedRouteId);

    // Outer Glow / Road Border
    routeGlowRef.current = L.polyline(routePoints, {
      color: '#B91C1C',
      weight: 7,
      opacity: 0.5,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(map);

    // Core High-Speed Highway Polyline
    routePolylineRef.current = L.polyline(routePoints, {
      color: '#EF4444',
      weight: 4,
      opacity: 0.95,
      lineCap: 'round',
      lineJoin: 'round',
      dashArray: selectedRouteId === 'route-scenic' ? '8, 8' : undefined,
    }).addTo(map);

    // Custom Origin Marker Icon (Green Pill with Real City Name)
    const originIcon = L.divIcon({
      className: 'custom-real-map-marker',
      html: `
        <div style="transform: translate(-50%, -100%);" class="flex items-center gap-1.5 bg-emerald-600 text-white font-black text-xs px-3 py-1.5 rounded-full shadow-2xl border-2 border-white whitespace-nowrap cursor-pointer">
          <span class="w-2 h-2 rounded-full bg-white animate-ping"></span>
          <span>${cleanOrigin}</span>
        </div>
      `,
      iconSize: [0, 0],
    });

    // Custom Destination Marker Icon (Red Pill with Real City Name)
    const destIcon = L.divIcon({
      className: 'custom-real-map-marker',
      html: `
        <div style="transform: translate(-50%, -100%);" class="flex items-center gap-1.5 bg-red-600 text-white font-black text-xs px-3 py-1.5 rounded-full shadow-2xl border-2 border-white whitespace-nowrap cursor-pointer">
          <svg style="width: 14px; height: 14px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
          <span>${cleanDestination}</span>
        </div>
      `,
      iconSize: [0, 0],
    });

    // Midpoint Toll Plaza Marker Icon
    const midIndex = Math.floor(routePoints.length * 0.5);
    const midPoint = routePoints[midIndex] || [(startLat + endLat) / 2, (startLng + endLng) / 2];
    const tollIcon = L.divIcon({
      className: 'custom-real-map-marker',
      html: `
        <div style="transform: translate(-50%, -50%);" class="flex items-center gap-1 bg-amber-500 text-slate-900 font-bold text-[10px] px-2.5 py-0.5 rounded-full shadow-md border border-white whitespace-nowrap">
          <svg style="width: 12px; height: 12px;" viewBox="0 0 24 24" fill="currentColor"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          <span>Fastag Toll Plaza</span>
        </div>
      `,
      iconSize: [0, 0],
    });

    // Live Vehicle Dispatch Marker Icon (35% along the route)
    const carIndex = Math.floor(routePoints.length * 0.35);
    const carPoint = routePoints[carIndex] || [(startLat * 0.65 + endLat * 0.35), (startLng * 0.65 + endLng * 0.35)];
    const carIcon = L.divIcon({
      className: 'custom-real-map-marker',
      html: `
        <div style="transform: translate(-50%, -50%);" class="flex items-center gap-1.5 bg-slate-900 text-white font-bold text-[10px] px-2.5 py-1 rounded-full shadow-lg border border-emerald-400 whitespace-nowrap">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Live Dispatch #WY-9374</span>
        </div>
      `,
      iconSize: [0, 0],
    });

    L.marker([startLat, startLng], { icon: originIcon }).addTo(markersGroup);
    L.marker([endLat, endLng], { icon: destIcon }).addTo(markersGroup);
    L.marker(midPoint, { icon: tollIcon }).addTo(markersGroup);
    L.marker(carPoint, { icon: carIcon }).addTo(markersGroup);

    // Fit bounds gracefully with padding
    const bounds = L.latLngBounds([
      [startLat, startLng],
      [endLat, endLng],
    ]);
    map.fitBounds(bounds, { padding: [55, 55], maxZoom: 13 });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [
    cleanOrigin, 
    cleanDestination, 
    resolvedOriginCoords.lat, 
    resolvedOriginCoords.lng, 
    resolvedDestCoords.lat, 
    resolvedDestCoords.lng, 
    selectedRouteId, 
    mapLayer, 
    liveRoadCoordinates
  ]);

  const handleZoomIn = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
  };

  const handleResetBounds = () => {
    if (mapInstanceRef.current) {
      const bounds = L.latLngBounds([
        [resolvedOriginCoords.lat, resolvedOriginCoords.lng],
        [resolvedDestCoords.lat, resolvedDestCoords.lng],
      ]);
      mapInstanceRef.current.fitBounds(bounds, { padding: [55, 55], maxZoom: 13 });
    }
  };

  return (
    <div 
      className={`relative overflow-hidden rounded-3xl border border-slate-200 bg-[#F8FAFC] text-slate-900 shadow-sm ${className}`}
    >
      {/* Top Route Summary HUD Bar */}
      <div className={`px-5 py-3.5 border-b flex flex-wrap items-center justify-between gap-3 text-xs select-none ${
        isDark ? 'bg-black/40 border-white/10' : 'bg-white/95 border-neutral-200/80 backdrop-blur-sm'
      }`}>
        <div className="flex items-center gap-2.5">
          <span className="w-7 h-7 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-xs">
            <Navigation className="w-4 h-4" />
          </span>
          <div>
            <div className="font-black flex items-center gap-1.5 text-xs sm:text-sm text-slate-900">
              <span className="truncate max-w-[130px] sm:max-w-[190px]">{cleanOrigin}</span>
              <ArrowRight className="w-3.5 h-3.5 text-red-500 shrink-0" />
              <span className="truncate max-w-[130px] sm:max-w-[190px]">{cleanDestination}</span>
            </div>
            <div className="text-[10px] font-semibold text-slate-500 flex items-center gap-2 mt-0.5">
              <span className="text-red-600 font-bold">{activeRoute.highway}</span>
              <span>·</span>
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Traffic Updated
              </span>
            </div>
          </div>
        </div>

        {/* Live Route Distance, Time & Toll Inclusions */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 border border-slate-200 text-slate-800 flex items-center gap-1.5 shadow-2xs">
            <Compass className="w-3.5 h-3.5 text-cyan-600" />
            <span>~{activeRoute.distanceKm} km</span>
          </span>

          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 border border-amber-200 text-amber-900 flex items-center gap-1.5 shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Drive {activeRoute.durationFormatted}</span>
          </span>

          <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-1.5 shadow-2xs">
            <Flag className="w-3.5 h-3.5 text-emerald-600" />
            <span>{computed.fullReachString}</span>
          </span>

          {tollIncluded && (
            <span className="hidden sm:inline-flex px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 border border-emerald-200 text-emerald-800 items-center gap-1.5 shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>{activeRoute.tollCount} Tolls Included</span>
            </span>
          )}
        </div>
      </div>

      {/* Real Interactive Leaflet Highway Map Viewport */}
      <div className="relative w-full h-72 sm:h-84 select-none bg-slate-100">
        <div 
          ref={mapContainerRef} 
          className="w-full h-full z-0" 
          style={{ minHeight: '100%', minWidth: '100%' }}
        />

        {/* Real-time Highway Radar Indicator Badge */}
        <div className="absolute bottom-3 left-3 z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/90 backdrop-blur-md text-white font-bold text-[10px] shadow-lg border border-slate-700/80">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Real-time GPS Highway Radar Active</span>
          </span>
        </div>

        {/* Floating Interactive Controls (Zoom, Layers, Reset) */}
        {showControls && (
          <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5">
            <div className="flex flex-col rounded-xl bg-white/95 backdrop-blur-md shadow-md border border-slate-200 overflow-hidden">
              <button
                type="button"
                onClick={handleZoomIn}
                className="p-2 text-slate-700 hover:text-red-600 hover:bg-slate-50 transition-colors cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <div className="h-px bg-slate-200" />
              <button
                type="button"
                onClick={handleZoomOut}
                className="p-2 text-slate-700 hover:text-red-600 hover:bg-slate-50 transition-colors cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleResetBounds}
              className="p-2 rounded-xl bg-white/95 backdrop-blur-md text-slate-700 hover:text-red-600 shadow-md border border-slate-200 transition-colors cursor-pointer"
              title="Reset Route View"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                setMapLayer((prev) => prev === 'streets' ? 'voyager' : prev === 'voyager' ? 'dark' : 'streets');
              }}
              className="p-2 rounded-xl bg-white/95 backdrop-blur-md text-slate-700 hover:text-red-600 shadow-md border border-slate-200 transition-colors cursor-pointer"
              title={`Switch Map Layer (Current: ${mapLayer})`}
            >
              <Layers className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Select Available Highway Corridor (3 Highway Options) */}
      <div className="p-4 sm:p-5 bg-white border-t border-slate-200/90">
        <div className="flex items-center justify-between mb-3 text-xs">
          <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
            <Route className="w-3.5 h-3.5 text-red-600" />
            Select Available Route Corridor (3 Highway Options)
          </span>
          <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">
            Click to preview distance & time
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {availableRoutes.map((route) => {
            const isSelected = selectedRouteId === route.id;
            return (
              <button
                key={route.id}
                type="button"
                onClick={() => setSelectedRouteId(route.id)}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative ${
                  isSelected
                    ? 'bg-white border-red-500 shadow-md ring-2 ring-red-500/20'
                    : 'bg-slate-50 hover:bg-slate-100/70 border-slate-200'
                }`}
              >
                {route.recommended && (
                  <span className="absolute -top-2 right-3 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-red-600 text-white shadow-xs">
                    Fastest Route
                  </span>
                )}

                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900 text-xs block truncate pr-2">
                    {route.highway}
                  </span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-red-600 shrink-0" />}
                </div>

                <div className="flex items-center gap-2 text-xs font-black text-slate-900 mb-2">
                  <span className="text-red-600">~{route.distanceKm} km</span>
                  <span className="text-slate-300">·</span>
                  <span>{route.durationFormatted}</span>
                </div>

                <div className="flex flex-wrap gap-1">
                  {route.scenicHighlights.slice(0, 2).map((highlight, idx) => (
                    <span 
                      key={idx}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium truncate max-w-full"
                    >
                      {highlight}
                    </span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>

        {/* Assigned Fleet Dispatch Badge */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200">
              <Car className="w-4 h-4" />
            </span>
            <div>
              <span className="font-bold text-slate-900 block">
                {vehicleName}
                <span className="ml-1.5 text-[10px] font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                  #WY-9374
                </span>
              </span>
              <span className="text-[11px] text-slate-500 block">
                Selected Corridor: <strong className="text-slate-700">{activeRoute.name}</strong> · Fastag Plazas Included
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span>Live Highway Dispatch Available</span>
          </div>
        </div>

      </div>

    </div>
  );
};
