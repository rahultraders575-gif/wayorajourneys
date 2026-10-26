import React, { useState, useId, useEffect } from 'react';
import { 
  MapPin, Navigation, Clock, ShieldCheck, Compass, 
  Layers, ZoomIn, ZoomOut, Car, Sparkles, Check,
  AlertCircle, Fuel, Zap, Route
} from 'lucide-react';
import { calculateTripRouteAndPrice } from '../utils/geoDistancePrice';

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
  destination = 'Goa',
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
  const [zoomLevel, setZoomLevel] = useState<1 | 1.25 | 1.5>(1);
  const [activeLayer, setActiveLayer] = useState<'traffic' | 'satellite' | 'standard'>('traffic');
  const [showWaypoints, setShowWaypoints] = useState(true);
  const [selectedRouteId, setSelectedRouteId] = useState<string>('route-primary');

  // Generate unique IDs for SVG gradients to prevent collisions if multiple instances are rendered
  const idPrefix = useId().replace(/:/g, '');
  const routeGradientId = `${idPrefix}-route-grad`;
  const altRouteGradientId = `${idPrefix}-alt-route-grad`;
  const thirdRouteGradientId = `${idPrefix}-third-route-grad`;
  const waterGradientId = `${idPrefix}-water-grad`;
  const glowFilterId = `${idPrefix}-glow-filter`;
  const landGradientId = `${idPrefix}-land-grad`;

  // Compute live geometric route calculation
  const computed = calculateTripRouteAndPrice({
    originName: origin,
    destinationName: destination,
    tripType: 'One-Way Drop',
  });

  const baseKm = typeof distanceKm === 'number' ? distanceKm : (computed.distanceKm || 580);
  const baseMinutes = computed.durationMinutes || 420;

  // Format clean short city names
  const cleanOrigin = origin.split(',')[0].trim() || 'Origin Hub';
  const cleanDestination = destination.split(',')[0].trim() || 'Destination';

  // Available Corridor Routes
  const availableRoutes: RouteOption[] = [
    {
      id: 'route-primary',
      name: 'Via National Express Corridor (Fastest)',
      highway: 'NH 44 / NH 48 Expressway',
      distanceKm: baseKm,
      durationFormatted: duration || computed.durationFormatted || '8h 15m',
      trafficStatus: 'smooth',
      trafficDelayMinutes: 0,
      tollCount: 6,
      tollCostInr: 480,
      scenicHighlights: ['Smooth 6-Lane Expressway', 'Fastag Automated Toll Plazas', '24/7 Food Courts'],
      recommended: true,
    },
    {
      id: 'route-scenic',
      name: 'Via Scenic Ghat Corridor (Alternative)',
      highway: 'State Highway · Green Belt',
      distanceKm: Math.round(baseKm * 1.08),
      durationFormatted: `${Math.floor((baseMinutes + 45) / 60)}h ${(baseMinutes + 45) % 60}m`,
      trafficStatus: 'moderate',
      trafficDelayMinutes: 18,
      tollCount: 4,
      tollCostInr: 320,
      scenicHighlights: ['Lush Forest Reserves', 'Low Heavy Vehicle Traffic', 'Scenic Viewpoints'],
      recommended: false,
    },
    {
      id: 'route-bypass',
      name: 'Via Ring Road Bypass Corridor',
      highway: 'Outer Ring Expressway (ORR)',
      distanceKm: Math.round(baseKm * 1.14),
      durationFormatted: `${Math.floor((baseMinutes + 65) / 60)}h ${(baseMinutes + 65) % 60}m`,
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

  // SVG coordinate layout configuration
  // Origin at [80, 220], Midpoint Toll at [280, 165], Destination at [510, 85]
  const pStart = { x: 90, y: 220 };
  const pMid = { x: 290, y: 160 };
  const pEnd = { x: 510, y: 90 };
  
  // Primary Bezier route
  const primaryRoutePath = `M ${pStart.x} ${pStart.y} C 160 210, 210 175, ${pMid.x} ${pMid.y} S 430 115, ${pEnd.x} ${pEnd.y}`;
  // Alternative Scenic route (arches higher)
  const scenicRoutePath = `M ${pStart.x} ${pStart.y} C 180 140, 250 110, 320 120 S 440 70, ${pEnd.x} ${pEnd.y}`;
  // Alternative Bypass route (dips lower)
  const bypassRoutePath = `M ${pStart.x} ${pStart.y} C 150 260, 260 230, 350 200 S 460 135, ${pEnd.x} ${pEnd.y}`;

  // Calculated intermediate point for current live car position (around 40% along active path)
  const carPos = selectedRouteId === 'route-scenic'
    ? { x: 230, y: 130 }
    : selectedRouteId === 'route-bypass'
    ? { x: 245, y: 235 }
    : { x: 215, y: 178 };

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
              <span className="text-red-500 font-bold">➔</span>
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
            <span>{activeRoute.durationFormatted}</span>
          </span>

          {tollIncluded && (
            <span className="hidden sm:inline-flex px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 border border-emerald-200 text-emerald-800 items-center gap-1.5 shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>{activeRoute.tollCount} Tolls Included</span>
            </span>
          )}
        </div>
      </div>

      {/* Main Vector Highway Map Viewport */}
      <div 
        className="relative w-full h-64 sm:h-72 overflow-hidden select-none bg-slate-900"
        style={{ perspective: '1000px' }}
      >
        <div 
          className="w-full h-full transition-transform duration-300 ease-out origin-center"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          <svg 
            className="w-full h-full block" 
            viewBox="0 0 600 320" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Land Base Gradient */}
              <linearGradient id={landGradientId} x1="0" y1="0" x2="600" y2="320" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#081226" />
                <stop offset="50%" stopColor="#0D1B36" />
                <stop offset="100%" stopColor="#050D1D" />
              </linearGradient>

              {/* Highway Route Glow Gradient */}
              <linearGradient id={routeGradientId} x1="90" y1="220" x2="510" y2="90" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#10B981" />
                <stop offset="40%" stopColor="#3B82F6" />
                <stop offset="85%" stopColor="#E11D48" />
              </linearGradient>

              {/* Alternate Scenic Glow Gradient */}
              <linearGradient id={altRouteGradientId} x1="90" y1="220" x2="510" y2="90" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#059669" />
                <stop offset="50%" stopColor="#10B981" />
                <stop offset="100%" stopColor="#047857" />
              </linearGradient>

              {/* Alternate Bypass Glow Gradient */}
              <linearGradient id={thirdRouteGradientId} x1="90" y1="220" x2="510" y2="90" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#6366F1" />
                <stop offset="50%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#EC4899" />
              </linearGradient>

              {/* Luminous Glow Filter */}
              <filter id={glowFilterId} x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Map Canvas Background */}
            <rect width="600" height="320" fill={`url(#${landGradientId})`} />

            {/* Cartographic Coordinate Grid */}
            <g opacity="0.12" stroke="#38BDF8" strokeWidth="0.5">
              <line x1="0" y1="80" x2="600" y2="80" strokeDasharray="3 3" />
              <line x1="0" y1="160" x2="600" y2="160" strokeDasharray="3 3" />
              <line x1="0" y1="240" x2="600" y2="240" strokeDasharray="3 3" />
              <line x1="150" y1="0" x2="150" y2="320" strokeDasharray="3 3" />
              <line x1="300" y1="0" x2="300" y2="320" strokeDasharray="3 3" />
              <line x1="450" y1="0" x2="450" y2="320" strokeDasharray="3 3" />
            </g>

            {/* Stylized Highway Rivers and Coastline */}
            <path 
              d="M 230 320 C 240 260, 270 210, 260 170 C 250 130, 280 80, 310 0" 
              stroke="#0284C7" 
              strokeWidth="5" 
              strokeOpacity="0.35" 
              strokeLinecap="round" 
              fill="none" 
            />

            {/* Secondary Arterial Local Roads */}
            <g opacity="0.3" stroke="#475569" strokeWidth="1">
              <line x1="40" y1="80" x2="560" y2="80" strokeDasharray="3 4" />
              <line x1="30" y1="180" x2="570" y2="180" strokeDasharray="4 6" />
              <line x1="120" y1="270" x2="540" y2="270" strokeDasharray="2 3" />
              <path d="M 60 290 Q 200 240 320 280 T 560 220" fill="none" strokeWidth="1.2" />
              <path d="M 120 40 Q 240 90 400 40 T 570 120" fill="none" strokeWidth="1.2" />
            </g>

            {/* ROUTE 2: Scenic Corridor (Alternative) */}
            <path 
              d={scenicRoutePath} 
              stroke={selectedRouteId === 'route-scenic' ? `url(#${altRouteGradientId})` : '#334155'} 
              strokeWidth={selectedRouteId === 'route-scenic' ? '5' : '2.5'} 
              strokeLinecap="round" 
              strokeDasharray={selectedRouteId === 'route-scenic' ? 'none' : '5 4'}
              opacity={selectedRouteId === 'route-scenic' ? '1' : '0.45'} 
              fill="none" 
              className="cursor-pointer"
              onClick={() => setSelectedRouteId('route-scenic')}
            />

            {/* ROUTE 3: Ring Road Bypass (Alternative) */}
            <path 
              d={bypassRoutePath} 
              stroke={selectedRouteId === 'route-bypass' ? `url(#${thirdRouteGradientId})` : '#334155'} 
              strokeWidth={selectedRouteId === 'route-bypass' ? '5' : '2.5'} 
              strokeLinecap="round" 
              strokeDasharray={selectedRouteId === 'route-bypass' ? 'none' : '5 4'}
              opacity={selectedRouteId === 'route-bypass' ? '1' : '0.45'} 
              fill="none" 
              className="cursor-pointer"
              onClick={() => setSelectedRouteId('route-bypass')}
            />

            {/* ROUTE 1: PRIMARY MAIN EXPRESSWAY */}
            <path 
              d={primaryRoutePath} 
              stroke={`url(#${routeGradientId})`} 
              strokeWidth={selectedRouteId === 'route-primary' ? '5.5' : '2.5'} 
              strokeLinecap="round" 
              opacity={selectedRouteId === 'route-primary' ? '1' : '0.45'} 
              filter={selectedRouteId === 'route-primary' ? `url(#${glowFilterId})` : 'none'}
              fill="none" 
              className="cursor-pointer"
              onClick={() => setSelectedRouteId('route-primary')}
            />

            {/* Animated Light Flow on Active Route */}
            <path 
              d={selectedRouteId === 'route-scenic' ? scenicRoutePath : selectedRouteId === 'route-bypass' ? bypassRoutePath : primaryRoutePath} 
              stroke="#FFFFFF" 
              strokeWidth="2" 
              strokeDasharray="6 10" 
              strokeLinecap="round" 
              fill="none" 
              opacity="0.85"
            />

            {/* WAYPOINTS & TOLL PLAZAS */}
            {showWaypoints && (
              <>
                <g transform={`translate(${pMid.x}, ${pMid.y})`}>
                  <circle cx="0" cy="0" r="10" fill="#1E293B" stroke="#F59E0B" strokeWidth="2" />
                  <circle cx="0" cy="0" r="4" fill="#F59E0B" />
                  <g transform="translate(14, -12)">
                    <rect x="0" y="0" width="115" height="24" rx="12" fill="#0F172A" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                    <text x="10" y="15" fontSize="9" fontWeight="bold" fill="#F8FAFC">
                      Fastag Toll Plaza ✓
                    </text>
                  </g>
                </g>
              </>
            )}

            {/* LIVE DISPATCHED CAB BEACON */}
            <g transform={`translate(${carPos.x}, ${carPos.y})`}>
              <circle cx="0" cy="0" r="14" fill="#EF4444" opacity="0.3">
                <animate attributeName="r" values="8;20;8" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.4;0.05;0.4" dur="2s" repeatCount="indefinite" />
              </circle>
              <circle cx="0" cy="0" r="9" fill="#DC2626" stroke="#FFFFFF" strokeWidth="2" />
              <polygon points="-2,-4 5,0 -2,4 -1,0" fill="#FFFFFF" transform="rotate(-20)" />

              <g transform="translate(-40, -28)">
                <rect x="0" y="0" width="80" height="18" rx="9" fill="#DC2626" />
                <text x="40" y="12" textAnchor="middle" fontSize="8.5" fontWeight="bold" fill="#FFFFFF">
                  Live Dispatch
                </text>
              </g>
            </g>

            {/* ORIGIN (Point A - Pickup) */}
            <g transform={`translate(${pStart.x}, ${pStart.y})`}>
              <circle cx="0" cy="0" r="12" fill="#10B981" opacity="0.25" />
              <circle cx="0" cy="0" r="8" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" />
              <g transform="translate(-75, 12)">
                <rect x="0" y="0" width="150" height="32" rx="10" fill="#0F172A" stroke="#10B981" strokeWidth="1.5" />
                <circle cx="14" cy="16" r="7" fill="#10B981" />
                <text x="14" y="19" textAnchor="middle" fontSize="9" fontWeight="900" fill="#FFFFFF">A</text>
                <text x="26" y="14" fontSize="8" fontWeight="bold" fill="#94A3B8">PICKUP HUB</text>
                <text x="26" y="24" fontSize="9.5" fontWeight="black" fill="#FFFFFF">
                  {cleanOrigin.slice(0, 15)}
                </text>
              </g>
            </g>

            {/* DESTINATION (Point B - Drop) */}
            <g transform={`translate(${pEnd.x}, ${pEnd.y})`}>
              <circle cx="0" cy="0" r="14" fill="#E11D48" opacity="0.25" />
              <circle cx="0" cy="0" r="8" fill="#E11D48" stroke="#FFFFFF" strokeWidth="2" />
              <g transform="translate(-75, -42)">
                <rect x="0" y="0" width="150" height="32" rx="10" fill="#0F172A" stroke="#E11D48" strokeWidth="1.5" />
                <circle cx="14" cy="16" r="7" fill="#E11D48" />
                <text x="14" y="19" textAnchor="middle" fontSize="9" fontWeight="900" fill="#FFFFFF">B</text>
                <text x="26" y="14" fontSize="8" fontWeight="bold" fill="#94A3B8">DESTINATION</text>
                <text x="26" y="24" fontSize="9.5" fontWeight="black" fill="#FFFFFF">
                  {cleanDestination.slice(0, 15)}
                </text>
              </g>
            </g>

            {/* Compass Widget */}
            <g transform="translate(565, 35)">
              <circle cx="0" cy="0" r="14" fill="#0F172A" stroke="#334155" strokeWidth="1" />
              <polygon points="0,-10 3,-2 0,0 -3,-2" fill="#E11D48" />
              <polygon points="0,10 3,2 0,0 -3,2" fill="#94A3B8" />
              <text x="0" y="-12" textAnchor="middle" fontSize="7" fontWeight="bold" fill="#E11D48">N</text>
            </g>
          </svg>
        </div>

        {/* Floating Zoom & Waypoint Controls */}
        {showControls && (
          <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-20">
            <button
              type="button"
              onClick={() => setZoomLevel(prev => prev === 1 ? 1.25 : prev === 1.25 ? 1.5 : 1)}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-xs shadow-md backdrop-blur-md transition-all cursor-pointer bg-white/95 text-slate-800 border border-slate-300 hover:bg-white"
              title="Toggle Zoom"
            >
              {zoomLevel === 1 ? <ZoomIn className="w-4 h-4" /> : <ZoomOut className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={() => setShowWaypoints(!showWaypoints)}
              className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs shadow-md backdrop-blur-md transition-all cursor-pointer ${
                showWaypoints ? 'bg-red-600 text-white' : 'bg-white/95 text-slate-700'
              }`}
              title="Toggle Toll Waypoints"
            >
              <Layers className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Live Tracking Radar Tag */}
        <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full text-[11px] font-bold backdrop-blur-md flex items-center gap-2 shadow-sm border bg-black/60 border-white/15 text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>Real-time GPS Highway Radar Active</span>
        </div>
      </div>

      {/* Available Corridor Routes Selector Tabs */}
      <div className="p-4 bg-white border-t border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
            <Route className="w-4 h-4 text-red-600" />
            <span>Select Available Route Corridor (3 Highway Options)</span>
          </div>
          <span className="text-[10px] text-slate-400 font-semibold">Click to preview distance & time</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          {availableRoutes.map((route) => {
            const isSelected = selectedRouteId === route.id;
            return (
              <div
                key={route.id}
                onClick={() => setSelectedRouteId(route.id)}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative ${
                  isSelected
                    ? 'bg-red-50/70 border-red-500 shadow-xs ring-1 ring-red-500'
                    : 'bg-slate-50/70 hover:bg-slate-100/70 border-slate-200'
                }`}
              >
                {route.recommended && (
                  <span className="absolute -top-2 right-3 text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-red-600 text-white shadow-2xs">
                    FASTEST ROUTE
                  </span>
                )}

                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-black text-slate-900 truncate">
                    {route.highway}
                  </span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-red-600 shrink-0" />}
                </div>

                <div className="flex items-center gap-2.5 text-xs font-bold text-slate-800">
                  <span className="text-red-600 font-black">~{route.distanceKm} km</span>
                  <span>·</span>
                  <span className="text-slate-600">{route.durationFormatted}</span>
                </div>

                <div className="mt-1.5 flex flex-wrap gap-1 text-[10px] text-slate-500 font-medium">
                  {route.scenicHighlights.slice(0, 2).map((h, i) => (
                    <span key={i} className="bg-white/80 px-2 py-0.5 rounded-md border border-slate-200">
                      {h}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Dispatch Route Summary Strip */}
      <div className="px-5 py-3.5 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
            <Car className="w-4 h-4 text-emerald-600" />
          </span>
          <div>
            <div className="font-bold flex items-center gap-1.5 text-slate-900">
              <span>{vehicleName}</span>
              {bookingRef && (
                <span className="font-mono text-[10px] text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.2 rounded">
                  #{bookingRef}
                </span>
              )}
            </div>
            <div className="text-[10px] text-slate-500">
              Selected Corridor: <strong className="text-slate-800">{activeRoute.name}</strong> · Fastag Plazas Included
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          <Check className="w-3.5 h-3.5" />
          <span>Live Highway Dispatch Available</span>
        </div>
      </div>
    </div>
  );
};
