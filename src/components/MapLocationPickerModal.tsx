import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  MapPin, Search, Check, X, Navigation, Compass, 
  ExternalLink, Sparkles, RefreshCw, Layers, Link as LinkIcon
} from 'lucide-react';
import { 
  parseGoogleMapsInput, 
  reverseGeocodeLocation, 
  searchMapLocations,
  calculateHaversineDistanceKm,
  formatDuration,
  MapLocationItem
} from '../utils/geoDistancePrice';

export interface MapLocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmLocation: (location: { name: string; displayName: string; lat: number; lng: number }) => void;
  initialLat?: number;
  initialLng?: number;
  initialName?: string;
  originCoords?: { lat: number; lng: number } | null;
}

export const MapLocationPickerModal: React.FC<MapLocationPickerModalProps> = ({
  isOpen,
  onClose,
  onConfirmLocation,
  initialLat = 13.6288,
  initialLng = 79.4192,
  initialName = 'Tirupati, Andhra Pradesh',
  originCoords,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number }>({
    lat: initialLat,
    lng: initialLng,
  });
  const [placeName, setPlaceName] = useState(initialName);
  const [formattedAddress, setFormattedAddress] = useState(initialName);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);

  // Search input state inside modal
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MapLocationItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [pastedLinkDetected, setPastedLinkDetected] = useState(false);

  // Sync initial coords when opened
  useEffect(() => {
    if (isOpen) {
      const lat = initialLat || 13.6288;
      const lng = initialLng || 79.4192;
      setCurrentCoords({ lat, lng });
      setPlaceName(initialName);
      setFormattedAddress(initialName);
    }
  }, [isOpen, initialLat, initialLng, initialName]);

  // Reverse geocode when coordinates change
  const updateAddressForCoords = async (lat: number, lng: number) => {
    setIsReverseGeocoding(true);
    try {
      const rev = await reverseGeocodeLocation(lat, lng);
      setPlaceName(rev.name);
      setFormattedAddress(rev.displayName);
    } catch {
      setPlaceName(`Custom Pin (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
    } finally {
      setIsReverseGeocoding(false);
    }
  };

  // Initialize Leaflet map instance once the modal DOM renders
  useEffect(() => {
    if (!isOpen) return;

    let map: L.Map | null = null;
    let timer: any = null;

    const setupMap = () => {
      const container = mapContainerRef.current;
      if (!container) return;

      // Clean up previous instance or leaflet IDs to prevent map container errors
      if ((container as any)._leaflet_id) {
        (container as any)._leaflet_id = null;
      }
      container.innerHTML = '';

      const lat = currentCoords.lat || initialLat || 13.6288;
      const lng = currentCoords.lng || initialLng || 79.4192;

      map = L.map(container, {
        center: [lat, lng],
        zoom: 13,
        zoomControl: true,
      });
      mapInstanceRef.current = map;

      // Direct OpenStreetMap high-speed tile layer
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      // Custom Red Chauffeur Pin Icon
      const pinHtml = `
        <div style="position: relative; width: 42px; height: 42px; display: flex; align-items: center; justify-content: center;">
          <span style="position: absolute; width: 38px; height: 38px; background-color: rgba(225, 29, 72, 0.35); border-radius: 50%; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
          <div style="position: relative; width: 32px; height: 32px; background: #E11D48; border: 2.5px solid #FFFFFF; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); box-shadow: 0 4px 16px rgba(225,29,72,0.5); display: flex; align-items: center; justify-content: center;">
            <div style="width: 10px; height: 10px; background: white; border-radius: 50%; transform: rotate(45deg);"></div>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-wayora-pin',
        html: pinHtml,
        iconSize: [42, 42],
        iconAnchor: [21, 42],
      });

      const marker = L.marker([lat, lng], {
        icon: customIcon,
        draggable: true,
      }).addTo(map);
      markerRef.current = marker;

      // Click anywhere to move marker
      map.on('click', (e) => {
        marker.setLatLng(e.latlng);
        setCurrentCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
        updateAddressForCoords(e.latlng.lat, e.latlng.lng);
      });

      // Drag marker
      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        setCurrentCoords({ lat: pos.lat, lng: pos.lng });
        updateAddressForCoords(pos.lat, pos.lng);
      });

      // Multiple size invalidation triggers to guarantee full rendering inside modal
      setTimeout(() => map?.invalidateSize(), 150);
      setTimeout(() => map?.invalidateSize(), 400);
      setTimeout(() => map?.invalidateSize(), 800);
    };

    timer = setTimeout(setupMap, 100);

    return () => {
      if (timer) clearTimeout(timer);
      if (map) {
        map.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isOpen]);

  // Handle Search Input inside Modal (supports text & Google Maps links)
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setPastedLinkDetected(false);
      return;
    }

    const trimmed = searchQuery.trim();
    const isGoogleLink = parseGoogleMapsInput(trimmed);
    setPastedLinkDetected(Boolean(isGoogleLink));

    const timeout = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchMapLocations(trimmed);
        setSearchResults(results);
        setShowSearchResults(true);
      } catch {
        // silent
      } finally {
        setIsSearching(false);
      }
    }, 280);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  // Fly to selected search result
  const handleSelectSearchResult = (item: MapLocationItem) => {
    setCurrentCoords({ lat: item.lat, lng: item.lng });
    setPlaceName(item.name);
    setFormattedAddress(item.displayName);
    setShowSearchResults(false);
    setSearchQuery('');

    if (mapInstanceRef.current && markerRef.current) {
      markerRef.current.setLatLng([item.lat, item.lng]);
      mapInstanceRef.current.flyTo([item.lat, item.lng], 14, { duration: 1.2 });
    }
  };

  // Paste from clipboard helper
  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard?.readText();
      if (text) {
        setSearchQuery(text);
      }
    } catch {
      // ignore
    }
  };

  // Estimate distance from origin
  const estDistanceKm = originCoords
    ? calculateHaversineDistanceKm(originCoords, currentCoords)
    : null;
  const estDurationFormatted = estDistanceKm
    ? formatDuration(Math.round((estDistanceKm / 55) * 60))
    : null;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Top Header Bar */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-sm shrink-0">
              <MapPin className="w-5 h-5 text-white" />
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>Choose Destination On Map</span>
                <span className="text-[10px] bg-red-100 text-red-700 font-extrabold px-2 py-0.5 rounded-full uppercase">
                  Live GPS
                </span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Click anywhere to drop pin, drag the red marker, or paste a Google Maps link.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white hover:bg-slate-200 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar & Google Maps Link Input Strip */}
        <div className="p-3.5 bg-white border-b border-slate-100 relative z-20">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setShowSearchResults(true)}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search hotel, street, resort, or paste Google Maps link (e.g. https://maps.app.goo.gl/...)"
                className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm font-bold bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 text-slate-900 placeholder:text-slate-400 placeholder:font-normal"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={handlePasteFromClipboard}
              className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
              title="Paste link from clipboard"
            >
              <LinkIcon className="w-3.5 h-3.5 text-red-600" />
              <span>Paste Google Link</span>
            </button>

          </div>

          {/* Autocomplete Search Dropdown */}
          {showSearchResults && searchResults.length > 0 && (
            <div className="absolute left-3.5 right-3.5 top-full mt-1.5 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 max-h-60 overflow-y-auto z-30 animate-in fade-in">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 flex items-center justify-between border-b border-slate-100 mb-1">
                <span>Select Destination Match</span>
                {isSearching && <RefreshCw className="w-2.5 h-2.5 animate-spin text-red-500" />}
              </div>
              {searchResults.map((item, idx) => (
                <button
                  key={`${item.name}-${idx}`}
                  type="button"
                  onClick={() => handleSelectSearchResult(item)}
                  className="w-full text-left px-3 py-2 hover:bg-red-50 rounded-xl transition-colors flex items-start gap-2.5 cursor-pointer"
                >
                  <MapPin className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-slate-800 truncate">
                      {item.name}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {item.displayName}
                    </div>
                  </div>
                  {item.category === 'googlemaps' && (
                    <span className="text-[9px] font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full shrink-0">
                      Google Maps Link
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Leaflet Interactive Map Viewport with guaranteed height & z-index */}
        <div className="relative w-full h-[420px] sm:h-[480px] bg-slate-100 overflow-hidden">
          <div 
            ref={mapContainerRef} 
            className="w-full h-full" 
            style={{ width: '100%', height: '100%', minHeight: '420px', zIndex: 1 }}
          />

          {/* Map Overlay Instruction Banner */}
          <div className="absolute top-3 left-3 z-[400] pointer-events-none">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/85 backdrop-blur-sm text-white text-[11px] font-bold shadow-lg">
              <Compass className="w-3.5 h-3.5 text-red-400" />
              <span>Click or drag pin to exact drop point</span>
            </span>
          </div>

          {/* Coordinates readout badge */}
          <div className="absolute top-3 right-14 z-[400] pointer-events-none">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm text-slate-700 text-[10px] font-mono font-bold shadow-sm border border-slate-200">
              <span>{currentCoords.lat.toFixed(5)}° N, {currentCoords.lng.toFixed(5)}° E</span>
            </span>
          </div>
        </div>

        {/* Bottom Destination Confirmation Card */}
        <div className="p-4 sm:p-5 bg-white border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black text-red-600 uppercase tracking-widest flex items-center gap-1">
                <MapPin className="w-3 h-3 text-red-600" />
                PINNED DESTINATION DROP
              </span>
              {isReverseGeocoding && (
                <span className="text-[10px] text-amber-600 flex items-center gap-1">
                  <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                  <span>Fetching address...</span>
                </span>
              )}
            </div>

            <div className="text-sm sm:text-base font-black text-slate-900 truncate">
              {placeName}
            </div>
            <div className="text-xs text-slate-500 font-medium truncate mt-0.5">
              {formattedAddress}
            </div>

            {estDistanceKm && (
              <div className="mt-1.5 flex items-center gap-2 text-xs font-bold text-slate-700">
                <span className="text-red-600">~{estDistanceKm} km highway distance</span>
                <span>·</span>
                <span className="text-amber-600">Est. drive {estDurationFormatted}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                onConfirmLocation({
                  name: placeName,
                  displayName: formattedAddress,
                  lat: currentCoords.lat,
                  lng: currentCoords.lng,
                });
                onClose();
              }}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-red-600/25 cursor-pointer flex items-center gap-2"
            >
              <Check className="w-4 h-4 text-white" />
              <span>Confirm Destination</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
