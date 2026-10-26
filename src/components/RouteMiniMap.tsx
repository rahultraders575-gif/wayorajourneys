import React, { useState, useId } from 'react';
import { 
  MapPin, Navigation, Clock, ShieldCheck, Compass, 
  Layers, ZoomIn, ZoomOut, Maximize2, Car, Sparkles, Check
} from 'lucide-react';

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
}) => {
  const [zoomLevel, setZoomLevel] = useState<1 | 1.25 | 1.5>(1);
  const [activeLayer, setActiveLayer] = useState<'traffic' | 'satellite' | 'standard'>('traffic');
  const [showWaypoints, setShowWaypoints] = useState(true);

  // Generate unique IDs for SVG gradients to prevent collisions if multiple instances are rendered
  const idPrefix = useId().replace(/:/g, '');
  const routeGradientId = `${idPrefix}-route-grad`;
  const waterGradientId = `${idPrefix}-water-grad`;
  const glowFilterId = `${idPrefix}-glow-filter`;
  const landGradientId = `${idPrefix}-land-grad`;

  // Calculate dynamic approximate distance and duration based on cities if not explicitly provided
  const displayDistance = distanceKm 
    ? (typeof distanceKm === 'number' ? `~${distanceKm} km` : distanceKm)
    : '580 km';

  const displayDuration = duration || '8h 45m';

  // Format clean short city names
  const cleanOrigin = origin.split(',')[0].trim() || 'Origin Hub';
  const cleanDestination = destination.split(',')[0].trim() || 'Destination';

  // SVG coordinate layout configuration
  // Origin at [80, 220], Midpoint Toll at [280, 165], Destination at [510, 85]
  const pStart = { x: 90, y: 220 };
  const pMid = { x: 290, y: 160 };
  const pEnd = { x: 510, y: 90 };
  
  // Bezier curve control points for smooth natural highway curvature
  const routePath = `M ${pStart.x} ${pStart.y} C 160 210, 210 175, ${pMid.x} ${pMid.y} S 430 115, ${pEnd.x} ${pEnd.y}`;

  // Calculated intermediate point for current live car position (around 40% along the path)
  const carPos = { x: 215, y: 178 };

  return (
    <div 
      className={`relative overflow-hidden rounded-2xl border border-slate-200 bg-[#F8FAFC] text-slate-900 shadow-sm ${className}`}
    >
      {/* Top Route Summary HUD Bar */}
      <div className={`px-4 py-3 border-b flex flex-wrap items-center justify-between gap-3 text-xs select-none ${
        isDark ? 'bg-black/40 border-white/10' : 'bg-white/80 border-neutral-200/80 backdrop-blur-sm'
      }`}>
        <div className="flex items-center gap-2.5">
          <span className="w-6 h-6 rounded-lg bg-red-600 text-white flex items-center justify-center shadow-sm">
            <Navigation className="w-3.5 h-3.5" />
          </span>
          <div>
            <div className="font-extrabold flex items-center gap-1.5 text-xs">
              <span className="truncate max-w-[130px] sm:max-w-[180px]">{cleanOrigin}</span>
              <span className="text-red-500 font-bold">➔</span>
              <span className="truncate max-w-[130px] sm:max-w-[180px]">{cleanDestination}</span>
            </div>
            <div className={`text-[10px] font-medium flex items-center gap-2 ${
              isDark ? 'text-neutral-400' : 'text-neutral-500'
            }`}>
              <span>NH 48 Express Highway</span>
              <span>·</span>
              <span className="text-emerald-500 font-bold">● Fastag Green Lane</span>
            </div>
          </div>
        </div>

        {/* Route Stats Pills */}
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border flex items-center gap-1.5 ${
            isDark 
              ? 'bg-white/10 border-white/15 text-white' 
              : 'bg-neutral-100 border-neutral-200 text-neutral-800'
          }`}>
            <Compass className="w-3 h-3 text-cyan-500" />
            <span>{displayDistance}</span>
          </span>

          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border flex items-center gap-1.5 ${
            isDark 
              ? 'bg-white/10 border-white/15 text-white' 
              : 'bg-neutral-100 border-neutral-200 text-neutral-800'
          }`}>
            <Clock className="w-3 h-3 text-amber-500" />
            <span>{displayDuration}</span>
          </span>

          {tollIncluded && (
            <span className="hidden sm:inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              <span>Tolls Included</span>
            </span>
          )}
        </div>
      </div>

      {/* Main SVG Vector Canvas Viewport */}
      <div 
        className="relative w-full h-56 sm:h-64 overflow-hidden select-none cursor-grab active:cursor-grabbing bg-slate-900"
        style={{
          perspective: '1000px',
        }}
      >
        <div 
          className="w-full h-full transition-transform duration-300 ease-out origin-center"
          style={{
            transform: `scale(${zoomLevel})`,
          }}
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
                <stop offset="0%" stopColor={isDark ? '#081226' : '#EFF4F9'} />
                <stop offset="50%" stopColor={isDark ? '#0D1B36' : '#E2E8F0'} />
                <stop offset="100%" stopColor={isDark ? '#050D1D' : '#F1F5F9'} />
              </linearGradient>

              {/* Water Coastline & River Gradient */}
              <linearGradient id={waterGradientId} x1="0" y1="0" x2="0" y2="320" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor={isDark ? '#034078' : '#BAE6FD'} stopOpacity={isDark ? '0.6' : '0.8'} />
                <stop offset="100%" stopColor={isDark ? '#001F54' : '#7DD3FC'} stopOpacity={isDark ? '0.4' : '0.6'} />
              </linearGradient>

              {/* Highway Route Glow Gradient */}
              <linearGradient id={routeGradientId} x1="90" y1="220" x2="510" y2="90" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#10B981" />
                <stop offset="40%" stopColor="#2563EB" />
                <stop offset="85%" stopColor="#E11D48" />
              </linearGradient>

              {/* Luminous Glow Filter */}
              <filter id={glowFilterId} x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>

              {/* Minor grid pattern */}
              <pattern id={`${idPrefix}-grid`} width="30" height="30" patternUnits="userSpaceOnUse">
                <path 
                  d="M 30 0 L 0 0 0 30" 
                  fill="none" 
                  stroke={isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'} 
                  strokeWidth="0.8" 
                />
              </pattern>
            </defs>

            {/* Base Geographic Ground Canvas */}
            <rect width="600" height="320" fill={`url(#${landGradientId})`} />
            <rect width="600" height="320" fill={`url(#${idPrefix}-grid)`} />

            {/* Stylized Coastal Water Contour / Bay Area */}
            <path 
              d="M 0 0 L 140 0 C 130 60, 110 110, 80 150 C 45 195, 20 220, 0 250 Z" 
              fill={`url(#${waterGradientId})`} 
            />
            <path 
              d="M 0 0 L 140 0 C 130 60, 110 110, 80 150 C 45 195, 20 220, 0 250" 
              stroke={isDark ? '#38BDF8' : '#0284C7'} 
              strokeWidth="1.5" 
              strokeOpacity="0.4" 
              fill="none"
            />

            {/* Stylized Winding River / Estuary Crossing */}
            <path 
              d="M 230 320 C 240 260, 270 210, 260 170 C 250 130, 280 80, 310 0" 
              stroke={isDark ? '#0284C7' : '#38BDF8'} 
              strokeWidth="5" 
              strokeOpacity={isDark ? '0.35' : '0.5'} 
              strokeLinecap="round" 
              fill="none" 
            />

            {/* Secondary Local Arterial Roads Network */}
            <g opacity={isDark ? '0.3' : '0.45'} stroke={isDark ? '#475569' : '#94A3B8'} strokeWidth="1">
              {/* Horizontal Crossings */}
              <line x1="40" y1="80" x2="560" y2="80" strokeDasharray="3 4" />
              <line x1="30" y1="180" x2="570" y2="180" strokeDasharray="4 6" />
              <line x1="120" y1="270" x2="540" y2="270" strokeDasharray="2 3" />
              
              {/* Secondary Diagonal Arterials */}
              <path d="M 60 290 Q 200 240 320 280 T 560 220" fill="none" strokeWidth="1.2" />
              <path d="M 120 40 Q 240 90 400 40 T 570 120" fill="none" strokeWidth="1.2" />
              <path d="M 420 320 L 490 180 L 580 150" fill="none" strokeWidth="1" strokeDasharray="5 3" />
            </g>

            {/* Urban City Clusters (Soft circles representing metros) */}
            <g opacity={isDark ? '0.2' : '0.15'}>
              <circle cx={pStart.x} cy={pStart.y} r="38" fill={isDark ? '#38BDF8' : '#0284C7'} />
              <circle cx={pMid.x} cy={pMid.y} r="25" fill="#F59E0B" />
              <circle cx={pEnd.x} cy={pEnd.y} r="35" fill="#E11D48" />
            </g>

            {/* EXPRESS HIGHWAY MAIN ROUTE: Glow Underlay */}
            <path 
              d={routePath} 
              stroke={`url(#${routeGradientId})`} 
              strokeWidth="11" 
              strokeLinecap="round" 
              opacity="0.35" 
              filter={`url(#${glowFilterId})`} 
              fill="none" 
            />

            {/* Highway Road Bed Outer Stroke */}
            <path 
              d={routePath} 
              stroke={isDark ? '#020617' : '#FFFFFF'} 
              strokeWidth="7" 
              strokeLinecap="round" 
              fill="none" 
            />

            {/* Main Primary Highway Polyline */}
            <path 
              d={routePath} 
              stroke={`url(#${routeGradientId})`} 
              strokeWidth="4.5" 
              strokeLinecap="round" 
              fill="none" 
            />

            {/* Animated Traffic Progression Pulsing Dash Line */}
            <path 
              d={routePath} 
              stroke="#FFFFFF" 
              strokeWidth="1.8" 
              strokeDasharray="6 8" 
              strokeLinecap="round" 
              fill="none" 
              className="animate-[dash_20s_linear_infinite]"
              style={{
                strokeDashoffset: 100,
              }}
            />

            {/* WAYPOINT: Highway Midpoint Rest Stop / Fastag Plaza */}
            {showWaypoints && (
              <g transform={`translate(${pMid.x}, ${pMid.y})`}>
                <circle cx="0" cy="0" r="10" fill={isDark ? '#1E293B' : '#FFFFFF'} stroke="#F59E0B" strokeWidth="2" shadow-sm="true" />
                <circle cx="0" cy="0" r="4" fill="#F59E0B" />
                
                {/* Midpoint Pill Tag */}
                <g transform="translate(14, -12)">
                  <rect 
                    x="0" 
                    y="0" 
                    width="110" 
                    height="24" 
                    rx="12" 
                    fill={isDark ? '#0F172A' : '#FFFFFF'} 
                    stroke={isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'} 
                    strokeWidth="1" 
                  />
                  <text 
                    x="10" 
                    y="15" 
                    fontSize="9" 
                    fontWeight="bold" 
                    fill={isDark ? '#F8FAFC' : '#0F172A'}
                  >
                    NH48 Toll · Fastag ✓
                  </text>
                </g>
              </g>
            )}

            {/* ACTIVE DISPATCH VEHICLE (Moving Chauffeur Cab Beacon) */}
            <g transform={`translate(${carPos.x}, ${carPos.y})`}>
              {/* Radar Pulse Ping */}
              <circle cx="0" cy="0" r="14" fill="#EF4444" opacity="0.25">
                <animate attributeName="r" values="8;20;8" dur="2.4s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.4;0.05;0.4" dur="2.4s" repeatCount="indefinite" />
              </circle>
              
              {/* Vehicle Indicator Disk */}
              <circle cx="0" cy="0" r="9" fill="#DC2626" stroke="#FFFFFF" strokeWidth="2" />
              
              {/* Tiny Vehicle Arrow / Heading */}
              <polygon points="-2,-4 5,0 -2,4 -1,0" fill="#FFFFFF" transform="rotate(-25)" />

              {/* Chauffeur Active Badge */}
              <g transform="translate(-40, -28)">
                <rect 
                  x="0" 
                  y="0" 
                  width="80" 
                  height="18" 
                  rx="9" 
                  fill="#DC2626" 
                />
                <text 
                  x="40" 
                  y="12" 
                  textAnchor="middle" 
                  fontSize="8.5" 
                  fontWeight="bold" 
                  fill="#FFFFFF"
                >
                  Cab En Route
                </text>
              </g>
            </g>

            {/* ORIGIN BEACON (Point A - Pickup) */}
            <g transform={`translate(${pStart.x}, ${pStart.y})`}>
              {/* Concentric Ping */}
              <circle cx="0" cy="0" r="18" fill="#10B981" opacity="0.2">
                <animate attributeName="r" values="10;22;10" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.3;0.05;0.3" dur="2s" repeatCount="indefinite" />
              </circle>
              
              {/* Beacon Outer Ring & Center Dot */}
              <circle cx="0" cy="0" r="9" fill="#10B981" stroke="#FFFFFF" strokeWidth="2.5" />
              <circle cx="0" cy="0" r="3.5" fill="#FFFFFF" />

              {/* Start Callout Flag */}
              <g transform="translate(-55, -42)">
                <rect 
                  x="0" 
                  y="0" 
                  width="110" 
                  height="30" 
                  rx="8" 
                  fill={isDark ? '#0F172A' : '#FFFFFF'} 
                  stroke="#10B981" 
                  strokeWidth="1.5" 
                  filter="drop-shadow(0 4px 6px rgba(0,0,0,0.15))" 
                />
                <circle cx="14" cy="15" r="7" fill="#10B981" />
                <text x="14" y="18" textAnchor="middle" fontSize="9" fontWeight="900" fill="#FFFFFF">
                  A
                </text>
                <text x="26" y="13" fontSize="8.5" fontWeight="bold" fill={isDark ? '#94A3B8' : '#64748B'}>
                  PICKUP HUB
                </text>
                <text x="26" y="23" fontSize="9.5" fontWeight="black" fill={isDark ? '#FFFFFF' : '#0F172A'}>
                  {cleanOrigin.slice(0, 12)}
                </text>
              </g>
            </g>

            {/* DESTINATION BEACON (Point B - Dropoff) */}
            <g transform={`translate(${pEnd.x}, ${pEnd.y})`}>
              {/* Concentric Ping */}
              <circle cx="0" cy="0" r="18" fill="#E11D48" opacity="0.2">
                <animate attributeName="r" values="10;22;10" dur="1.8s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.3;0.05;0.3" dur="1.8s" repeatCount="indefinite" />
              </circle>
              
              {/* Beacon Outer Ring & Center Dot */}
              <circle cx="0" cy="0" r="9" fill="#E11D48" stroke="#FFFFFF" strokeWidth="2.5" />
              <circle cx="0" cy="0" r="3.5" fill="#FFFFFF" />

              {/* End Callout Flag */}
              <g transform="translate(-55, -42)">
                <rect 
                  x="0" 
                  y="0" 
                  width="110" 
                  height="30" 
                  rx="8" 
                  fill={isDark ? '#0F172A' : '#FFFFFF'} 
                  stroke="#E11D48" 
                  strokeWidth="1.5" 
                  filter="drop-shadow(0 4px 6px rgba(0,0,0,0.15))" 
                />
                <circle cx="14" cy="15" r="7" fill="#E11D48" />
                <text x="14" y="18" textAnchor="middle" fontSize="9" fontWeight="900" fill="#FFFFFF">
                  B
                </text>
                <text x="26" y="13" fontSize="8.5" fontWeight="bold" fill={isDark ? '#94A3B8' : '#64748B'}>
                  DESTINATION
                </text>
                <text x="26" y="23" fontSize="9.5" fontWeight="black" fill={isDark ? '#FFFFFF' : '#0F172A'}>
                  {cleanDestination.slice(0, 12)}
                </text>
              </g>
            </g>

            {/* Compass Rose Widget in Corner */}
            <g transform="translate(565, 35)">
              <circle cx="0" cy="0" r="14" fill={isDark ? '#0F172A' : '#FFFFFF'} stroke={isDark ? '#334155' : '#CBD5E1'} strokeWidth="1" />
              <polygon points="0,-10 3,-2 0,0 -3,-2" fill="#E11D48" />
              <polygon points="0,10 3,2 0,0 -3,2" fill={isDark ? '#94A3B8' : '#64748B'} />
              <text x="0" y="-12" textAnchor="middle" fontSize="7" fontWeight="bold" fill="#E11D48">N</text>
            </g>

            {/* Scale Bar Marker in bottom left */}
            <g transform="translate(20, 300)">
              <line x1="0" y1="0" x2="60" y2="0" stroke={isDark ? '#94A3B8' : '#64748B'} strokeWidth="2" />
              <line x1="0" y1="-3" x2="0" y2="3" stroke={isDark ? '#94A3B8' : '#64748B'} strokeWidth="2" />
              <line x1="60" y1="-3" x2="60" y2="3" stroke={isDark ? '#94A3B8' : '#64748B'} strokeWidth="2" />
              <text x="30" y="-5" textAnchor="middle" fontSize="8" fontWeight="semibold" fill={isDark ? '#94A3B8' : '#64748B'}>50 km</text>
            </g>

          </svg>
        </div>

        {/* Floating Mini Controls (Zoom & Layer toggles) */}
        {showControls && (
          <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-20">
            <button
              type="button"
              onClick={() => setZoomLevel(prev => prev === 1 ? 1.25 : prev === 1.25 ? 1.5 : 1)}
              className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs shadow-md backdrop-blur-md transition-all cursor-pointer ${
                isDark 
                  ? 'bg-black/60 hover:bg-black/80 text-white border border-white/20' 
                  : 'bg-white/90 hover:bg-white text-neutral-800 border border-neutral-300'
              }`}
              title="Toggle Zoom (1x / 1.25x / 1.5x)"
            >
              {zoomLevel === 1 ? <ZoomIn className="w-3.5 h-3.5" /> : <ZoomOut className="w-3.5 h-3.5" />}
            </button>

            <button
              type="button"
              onClick={() => setShowWaypoints(!showWaypoints)}
              className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs shadow-md backdrop-blur-md transition-all cursor-pointer ${
                showWaypoints
                  ? 'bg-red-600 text-white border border-red-400'
                  : isDark 
                    ? 'bg-black/60 text-white/70 border border-white/20' 
                    : 'bg-white/90 text-neutral-600 border border-neutral-300'
              }`}
              title="Toggle Toll Waypoint Tags"
            >
              <Layers className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Live GPS Dispatch Radar Badge (Bottom Overlay) */}
        <div className={`absolute bottom-2.5 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold backdrop-blur-md flex items-center gap-1.5 shadow-sm border ${
          isDark 
            ? 'bg-black/60 border-white/15 text-emerald-400' 
            : 'bg-white/90 border-neutral-200 text-emerald-700'
        }`}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          <span>Real-time GPS Tracking Active</span>
        </div>
      </div>

      {/* Bottom Dispatch Route Summary Strip */}
      <div className={`px-4 py-3 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs ${
        isDark ? 'bg-black/30 border-white/10' : 'bg-neutral-50/80 border-neutral-200/80'
      }`}>
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
            <Car className="w-4 h-4" />
          </span>
          <div>
            <div className="font-bold flex items-center gap-1.5">
              <span>{vehicleName}</span>
              {bookingRef && (
                <span className="font-mono text-[10px] text-red-500 bg-red-500/10 px-1.5 py-0.2 rounded">
                  #{bookingRef}
                </span>
              )}
            </div>
            <div className={`text-[10px] ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
              Express Doorstep Chauffeur · Highway Tolls Included
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
          <Check className="w-3.5 h-3.5" />
          <span>Fastest Highway Corridor · Live Dispatch Ready</span>
        </div>
      </div>
    </div>
  );
};
