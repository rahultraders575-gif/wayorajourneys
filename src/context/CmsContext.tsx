import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  TourPackage, Vehicle, Booking, BlogPost, CompanySettings, 
  BookingStatus, ThemeMode, CaptainProfile, RiderProfile 
} from '../types';
import { 
  INITIAL_PACKAGES, INITIAL_VEHICLES, INITIAL_BOOKINGS, 
  INITIAL_BLOG_POSTS, INITIAL_SETTINGS, INITIAL_CAPTAINS,
  INITIAL_RIDERS 
} from '../data/initialData';

export type PageId = 'home' | 'booking' | 'packages' | 'fleet' | 'planner' | 'corporate' | 'blog' | 'about' | 'cms' | 'captain';

export interface BookingSearchDetails {
  tripType: string;
  fromCity: string;
  toCity: string;
  pickupDate: string;
  pickupTime: string;
  isBookingForFamily?: boolean;
  familyMemberName?: string;
  familyMemberPhone?: string;
  familyPickupAddress?: string;
  familyNotes?: string;
}

interface ToastInfo {
  id: string;
  message: string;
  type?: 'success' | 'info' | 'error';
}

interface CmsContextType {
  activePage: PageId;
  setActivePage: (page: PageId) => void;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  
  // Real Mobile App Framing & Layout Mode
  mobileShellMode: boolean;
  setMobileShellMode: React.Dispatch<React.SetStateAction<boolean>>;

  // Booking Search Details & Direct Navigation
  bookingSearchDetails: BookingSearchDetails;
  setBookingSearchDetails: React.Dispatch<React.SetStateAction<BookingSearchDetails>>;
  navigateToBooking: (details?: Partial<BookingSearchDetails>) => void;

  // Auto Geolocation Detect
  userLocation: string;
  setUserLocation: (loc: string) => void;
  userCoords: { lat: number; lng: number } | null;
  setUserCoords: (coords: { lat: number; lng: number } | null) => void;
  isLocating: boolean;
  detectUserLocation: (userInitiated?: boolean) => Promise<string | null>;

  // Packages CMS
  packages: TourPackage[];
  addPackage: (pkg: Omit<TourPackage, 'id'>) => void;
  updatePackage: (id: string, pkg: Partial<TourPackage>) => void;
  deletePackage: (id: string) => void;
  togglePackageFeatured: (id: string) => void;

  // Vehicles
  vehicles: Vehicle[];
  updateVehicle: (id: string, vehicle: Partial<Vehicle>) => void;
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => void;
  deleteVehicle: (id: string) => void;

  // Bookings Dispatch
  bookings: Booking[];
  addBooking: (bookingData: Omit<Booking, 'id' | 'createdAt' | 'status'>) => Booking;
  updateBookingStatus: (id: string, status: BookingStatus) => void;
  assignChauffeur: (id: string, driver: string, carNumber: string) => void;
  deleteBooking: (id: string) => void;

  // Captain / Chauffeur Partner Cockpit
  captains: CaptainProfile[];
  currentCaptain: CaptainProfile | null;
  loginCaptain: (captainIdOrPhone: string, pin?: string) => boolean;
  logoutCaptain: () => void;
  updateCaptainDuty: (duty: CaptainProfile['dutyStatus']) => void;
  updateTripOdometer: (
    bookingId: string, 
    startKm: number, 
    endKm?: number, 
    toll?: number, 
    parking?: number,
    finalAmount?: number
  ) => void;

  // Rider Authentication & User Profile
  currentRider: RiderProfile | null;
  loginRider: (data: { name: string; phone: string; email?: string; city?: string }) => void;
  logoutRider: () => void;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;

  // General Data
  blogs: BlogPost[];
  settings: CompanySettings;
  updateSettings: (newSettings: Partial<CompanySettings>) => void;

  // Booking Modal
  isBookingModalOpen: boolean;
  modalDefaultTour: string;
  openBookingModal: (tourTitle?: string) => void;
  closeBookingModal: () => void;

  // Toasts
  toasts: ToastInfo[];
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  removeToast: (id: string) => void;

  // Persistence
  resetToDefault: () => void;
  exportDatabaseJson: () => string;
  importDatabaseJson: (jsonStr: string) => boolean;
}

const CmsContext = createContext<CmsContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PACKAGES: 'wayora_red_packages_v1',
  VEHICLES: 'wayora_red_vehicles_v1',
  BOOKINGS: 'wayora_red_bookings_v1',
  SETTINGS: 'wayora_red_settings_v1',
  THEME: 'wayora_red_theme_mode_v1',
  CAPTAINS: 'wayora_red_captains_v1',
  ACTIVE_CAPTAIN_ID: 'wayora_red_active_captain_id_v1',
  MOBILE_SHELL: 'wayora_red_mobile_shell_v2',
  USER_LOCATION: 'wayora_red_user_location_v1',
  RIDER: 'wayora_red_current_rider_v1',
};

export const CmsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activePage, setActivePage] = useState<PageId>('home');
  const [themeMode, setThemeModeState] = useState<ThemeMode>('white');

  // Mobile App frame simulation toggle: Defaults to false so desktop is automatically normal full width!
  const [mobileShellMode, setMobileShellMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MOBILE_SHELL);
      return saved !== null ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  // Auto Geolocation state
  const [userLocation, setUserLocation] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.USER_LOCATION) || 'Banjara Hills, Hyderabad';
    } catch {
      return 'Banjara Hills, Hyderabad';
    }
  });
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Dedicated Booking Page Search Details
  const [bookingSearchDetails, setBookingSearchDetails] = useState<BookingSearchDetails>({
    tripType: 'Outstation One-way',
    fromCity: 'Mumbai',
    toCity: 'Goa',
    pickupDate: 'Fri, 16 Oct 2026',
    pickupTime: '03:00 AM',
  });

  const navigateToBooking = (details?: Partial<BookingSearchDetails>) => {
    if (details) {
      setBookingSearchDetails((prev) => ({ ...prev, ...details }));
    }
    setActivePage('booking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Rider Authentication Profile (Defaults to demo rider for instant ready-to-test flow)
  const [currentRider, setCurrentRider] = useState<RiderProfile | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RIDER);
      return saved ? JSON.parse(saved) : INITIAL_RIDERS[0];
    } catch {
      return INITIAL_RIDERS[0];
    }
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    if (currentRider) {
      localStorage.setItem(STORAGE_KEYS.RIDER, JSON.stringify(currentRider));
    } else {
      localStorage.removeItem(STORAGE_KEYS.RIDER);
    }
  }, [currentRider]);

  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [modalDefaultTour, setModalDefaultTour] = useState('');
  const [toasts, setToasts] = useState<ToastInfo[]>([]);

  // Initialize packages
  const [packages, setPackages] = useState<TourPackage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PACKAGES);
      return saved ? JSON.parse(saved) : INITIAL_PACKAGES;
    } catch {
      return INITIAL_PACKAGES;
    }
  });

  // Initialize vehicles
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.VEHICLES);
      return saved ? JSON.parse(saved) : INITIAL_VEHICLES;
    } catch {
      return INITIAL_VEHICLES;
    }
  });

  // Initialize bookings
  const [bookings, setBookings] = useState<Booking[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
      return saved ? JSON.parse(saved) : INITIAL_BOOKINGS;
    } catch {
      return INITIAL_BOOKINGS;
    }
  });

  // Initialize settings
  const [settings, setSettings] = useState<CompanySettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  // Initialize Captains
  const [captains, setCaptains] = useState<CaptainProfile[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CAPTAINS);
      return saved ? JSON.parse(saved) : INITIAL_CAPTAINS;
    } catch {
      return INITIAL_CAPTAINS;
    }
  });

  // Current logged in captain
  const [currentCaptainId, setCurrentCaptainId] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.ACTIVE_CAPTAIN_ID) || null;
    } catch {
      return null;
    }
  });

  const [blogs] = useState<BlogPost[]>(INITIAL_BLOG_POSTS);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PACKAGES, JSON.stringify(packages));
    } catch (e) {
      console.error(e);
    }
  }, [packages]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(vehicles));
    } catch (e) {
      console.error(e);
    }
  }, [vehicles]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
    } catch (e) {
      console.error(e);
    }
  }, [bookings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error(e);
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CAPTAINS, JSON.stringify(captains));
    } catch (e) {
      console.error(e);
    }
  }, [captains]);

  useEffect(() => {
    try {
      if (currentCaptainId) {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_CAPTAIN_ID, currentCaptainId);
      } else {
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_CAPTAIN_ID);
      }
    } catch (e) {
      console.error(e);
    }
  }, [currentCaptainId]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MOBILE_SHELL, JSON.stringify(mobileShellMode));
    } catch (e) {
      console.error(e);
    }
  }, [mobileShellMode]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_LOCATION, userLocation);
    } catch (e) {
      console.error(e);
    }
  }, [userLocation]);

  // Real Geolocation Auto-Detection with Browser Permission & Reverse Geocoding
  const detectUserLocation = async (userInitiated = false): Promise<string | null> => {
    setIsLocating(true);
    if (!navigator.geolocation) {
      if (userInitiated) {
        showToast('Geolocation is not supported by your browser', 'error');
      }
      setIsLocating(false);
      return null;
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          let detected = '';

          // Attempt fast reverse geocoding to obtain exact neighborhood & city
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3500);
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`,
              { signal: controller.signal, headers: { 'Accept-Language': 'en' } }
            );
            clearTimeout(timeoutId);

            if (response.ok) {
              const data = await response.json();
              const addr = data.address || {};
              const locality = addr.suburb || addr.neighbourhood || addr.residential || addr.road || addr.city_district;
              const city = addr.city || addr.town || addr.state_district || addr.county || addr.state;
              if (locality && city && locality !== city) {
                detected = `${locality}, ${city}`;
              } else if (city) {
                detected = addr.state && addr.state !== city ? `${city}, ${addr.state}` : city;
              }
            }
          } catch {
            // Reverse geocode timed out or blocked by CORS, proceed with coordinate heuristic
          }

          // Fallback coordinate heuristic if reverse geocoding was unavailable
          if (!detected) {
            if (Math.abs(lat - 17.44) < 0.25 && Math.abs(lng - 78.38) < 0.25) {
              detected = 'HITEC City, Hyderabad';
            } else if (Math.abs(lat - 17.38) < 0.25 && Math.abs(lng - 78.48) < 0.25) {
              detected = 'Banjara Hills, Hyderabad';
            } else if (Math.abs(lat - 19.07) < 0.35 && Math.abs(lng - 72.87) < 0.35) {
              detected = 'BKC / Airport, Mumbai';
            } else if (Math.abs(lat - 12.97) < 0.35 && Math.abs(lng - 77.59) < 0.35) {
              detected = 'Indiranagar, Bengaluru';
            } else if (Math.abs(lat - 28.61) < 0.35 && Math.abs(lng - 77.20) < 0.35) {
              detected = 'Connaught Place, New Delhi';
            } else if (Math.abs(lat - 13.08) < 0.35 && Math.abs(lng - 80.27) < 0.35) {
              detected = 'T. Nagar, Chennai';
            } else if (lat !== 0 || lng !== 0) {
              detected = `Current Location (${lat.toFixed(3)}°N, ${lng.toFixed(3)}°E)`;
            } else {
              detected = 'Hyderabad, Telangana';
            }
          }

          setUserLocation(detected);
          setUserCoords({ lat, lng });
          setIsLocating(false);
          showToast(`Live location detected: ${detected}`, 'success');
          resolve(detected);
        },
        (err) => {
          setIsLocating(false);
          if (err.code === 1) {
            // PERMISSION_DENIED
            showToast('Location permission denied. Please allow location access in your browser bar.', 'error');
          } else if (err.code === 2) {
            // POSITION_UNAVAILABLE
            showToast('Unable to detect GPS position. Please enter pickup city manually.', 'info');
          } else if (err.code === 3) {
            // TIMEOUT
            showToast('Location request timed out. Please try again.', 'info');
          } else {
            console.warn('Geolocation fallback:', err.message);
          }
          resolve(null);
        },
        { timeout: 9000, enableHighAccuracy: true, maximumAge: 60000 }
      );
    });
  };

  useEffect(() => {
    // Check permission silently on mount without triggering an aggressive pop-up if already denied
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' }).then((status) => {
        if (status.state === 'granted') {
          detectUserLocation(false);
        }
      }).catch(() => {
        // Ignore permission query error
      });
    }
  }, []);

  // Toast Helpers
  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Modal handlers
  const openBookingModal = (tourTitle = '') => {
    setModalDefaultTour(tourTitle);
    setIsBookingModalOpen(true);
  };

  const closeBookingModal = () => {
    setIsBookingModalOpen(false);
  };

  // Package CMS operations
  const addPackage = (pkg: Omit<TourPackage, 'id'>) => {
    const newId = pkg.title.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.floor(Math.random() * 1000);
    const newPackage: TourPackage = { ...pkg, id: newId };
    setPackages((prev) => [newPackage, ...prev]);
    showToast(`Added package "${pkg.title}" to catalog`, 'success');
  };

  const updatePackage = (id: string, updatedFields: Partial<TourPackage>) => {
    setPackages((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updatedFields } : item))
    );
    showToast('Package updated successfully', 'success');
  };

  const deletePackage = (id: string) => {
    setPackages((prev) => prev.filter((item) => item.id !== id));
    showToast('Package deleted from catalog', 'info');
  };

  const togglePackageFeatured = (id: string) => {
    setPackages((prev) =>
      prev.map((item) => (item.id === id ? { ...item, featured: !item.featured } : item))
    );
    showToast('Featured status updated', 'info');
  };

  // Vehicle CMS operations
  const updateVehicle = (id: string, updatedFields: Partial<Vehicle>) => {
    setVehicles((prev) =>
      prev.map((v) => (v.id === id ? { ...v, ...updatedFields } : v))
    );
    showToast('Fleet details updated', 'success');
  };

  const addVehicle = (vehicle: Omit<Vehicle, 'id'>) => {
    const newId = 'car-' + Math.random().toString(36).substring(2, 7);
    setVehicles((prev) => [...prev, { ...vehicle, id: newId }]);
    showToast(`Vehicle "${vehicle.name}" added to fleet`, 'success');
  };

  const deleteVehicle = (id: string) => {
    setVehicles((prev) => prev.filter((v) => v.id !== id));
    showToast('Vehicle removed from fleet', 'info');
  };

  // Booking Operations
  const addBooking = (bookingData: Omit<Booking, 'id' | 'createdAt' | 'status'>): Booking => {
    const newId = 'WY-' + Math.floor(1000 + Math.random() * 9000);
    const nowStr = new Date().toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const newBooking: Booking = {
      ...bookingData,
      id: newId,
      createdAt: nowStr,
      status: 'New',
    };

    setBookings((prev) => [newBooking, ...prev]);
    showToast(`Booking ${newId} dispatched to central pool`, 'success');

    // Asynchronously dispatch booking to backend server
    if (typeof window !== 'undefined') {
      fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBooking),
      }).catch(() => {
        // Fallback gracefully to client state when backend is offline
      });
    }

    return newBooking;
  };

  const updateBookingStatus = (id: string, status: BookingStatus) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status } : b))
    );
    showToast(`Booking ${id} status set to ${status}`, 'info');
  };

  const assignChauffeur = (id: string, driver: string, carNumber: string) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === id ? { ...b, assignedDriver: driver, assignedCarNumber: carNumber, status: 'Assigned' } : b
      )
    );
    showToast(`Chauffeur ${driver} assigned to ${id}`, 'success');
  };

  const deleteBooking = (id: string) => {
    setBookings((prev) => prev.filter((b) => b.id !== id));
    showToast(`Booking ${id} deleted`, 'info');
  };

  const updateSettings = (newSettings: Partial<CompanySettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    showToast('Company settings saved', 'success');
  };

  // Captain Partner System
  const currentCaptain = captains.find((c) => c.id === currentCaptainId) || null;

  const loginCaptain = (idOrPhone: string, pin?: string): boolean => {
    const found = captains.find(
      (c) => c.id === idOrPhone || c.phone === idOrPhone || c.name.toLowerCase().includes(idOrPhone.toLowerCase())
    );

    if (found) {
      if (pin && found.pin !== pin) {
        showToast('Incorrect 4-digit PIN for Captain', 'error');
        return false;
      }
      setCurrentCaptainId(found.id);
      showToast(`Welcome Captain ${found.name}! Cockpit active.`, 'success');
      setActivePage('captain');
      return true;
    }
    showToast('Captain not found in fleet roster', 'error');
    return false;
  };

  const logoutCaptain = () => {
    setCurrentCaptainId(null);
    showToast('Captain signed out of mobile cockpit', 'info');
  };

  const updateCaptainDuty = (duty: CaptainProfile['dutyStatus']) => {
    if (!currentCaptainId) return;
    setCaptains((prev) =>
      prev.map((c) => (c.id === currentCaptainId ? { ...c, dutyStatus: duty } : c))
    );
    showToast(`Duty status updated to ${duty}`, 'info');
  };

  const updateTripOdometer = (
    bookingId: string, 
    startKm: number, 
    endKm?: number, 
    toll = 0, 
    parking = 0,
    finalAmount?: number
  ) => {
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id !== bookingId) return b;
        const updatedStatus: BookingStatus = endKm ? 'Completed' : 'En Route';
        return {
          ...b,
          startKm,
          endKm: endKm || b.endKm,
          tollCharges: toll,
          parkingCharges: parking,
          finalPaidAmount: finalAmount || b.estimatedTotal,
          status: updatedStatus,
        };
      })
    );

    if (endKm && currentCaptainId) {
      // Add trip incentive to captain earnings
      setCaptains((prev) =>
        prev.map((c) =>
          c.id === currentCaptainId
            ? { ...c, totalTrips: c.totalTrips + 1, todayEarnings: c.todayEarnings + 800 }
            : c
        )
      );
    }

    showToast(`Trip ${bookingId} odometer & fare updated!`, 'success');
  };

  const resetToDefault = () => {
    setPackages(INITIAL_PACKAGES);
    setVehicles(INITIAL_VEHICLES);
    setBookings(INITIAL_BOOKINGS);
    setSettings(INITIAL_SETTINGS);
    setCaptains(INITIAL_CAPTAINS);
    setCurrentCaptainId(null);
    localStorage.clear();
    showToast('All CMS & Captain data reset to defaults', 'info');
  };

  const exportDatabaseJson = () => {
    const dump = {
      packages,
      vehicles,
      bookings,
      settings,
      captains,
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(dump, null, 2);
  };

  const importDatabaseJson = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.packages && Array.isArray(data.packages)) setPackages(data.packages);
      if (data.vehicles && Array.isArray(data.vehicles)) setVehicles(data.vehicles);
      if (data.bookings && Array.isArray(data.bookings)) setBookings(data.bookings);
      if (data.captains && Array.isArray(data.captains)) setCaptains(data.captains);
      if (data.settings) setSettings(data.settings);
      showToast('Database imported successfully', 'success');
      return true;
    } catch (e) {
      console.error(e);
      showToast('Invalid JSON file format', 'error');
      return false;
    }
  };

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, mode);
    } catch (e) {
      console.error(e);
    }
    showToast(`Theme updated to ${mode === 'alternating' ? 'Alternating B&W' : mode === 'white' ? 'Crisp White' : 'Deep Black'}`, 'info');
  };

  // Rider Authentication handlers
  const loginRider = (data: { name: string; phone: string; email?: string; city?: string }) => {
    const rider: RiderProfile = {
      id: 'rider-' + Math.floor(1000 + Math.random() * 9000),
      name: data.name.trim(),
      phone: data.phone.trim(),
      email: data.email?.trim() || '',
      city: data.city?.trim() || userLocation || 'Hyderabad',
      createdAt: new Date().toISOString().split('T')[0]
    };
    setCurrentRider(rider);
    setIsAuthModalOpen(false);
    showToast(`Welcome ${rider.name}! Rider profile active.`, 'success');
  };

  const logoutRider = () => {
    setCurrentRider(null);
    showToast('Signed out from rider profile', 'info');
  };

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  return (
    <CmsContext.Provider
      value={{
        activePage,
        setActivePage,
        themeMode,
        setThemeMode,
        mobileShellMode,
        setMobileShellMode,
        bookingSearchDetails,
        setBookingSearchDetails,
        navigateToBooking,
        userLocation,
        setUserLocation,
        userCoords,
        setUserCoords,
        isLocating,
        detectUserLocation,
        packages,
        addPackage,
        updatePackage,
        deletePackage,
        togglePackageFeatured,
        vehicles,
        updateVehicle,
        addVehicle,
        deleteVehicle,
        bookings,
        addBooking,
        updateBookingStatus,
        assignChauffeur,
        deleteBooking,
        captains,
        currentCaptain,
        loginCaptain,
        logoutCaptain,
        updateCaptainDuty,
        updateTripOdometer,
        currentRider,
        loginRider,
        logoutRider,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        blogs,
        settings,
        updateSettings,
        isBookingModalOpen,
        modalDefaultTour,
        openBookingModal,
        closeBookingModal,
        toasts,
        showToast,
        removeToast,
        resetToDefault,
        exportDatabaseJson,
        importDatabaseJson,
      }}
    >
      {children}
    </CmsContext.Provider>
  );
};

export const useCms = (): CmsContextType => {
  const context = useContext(CmsContext);
  if (!context) {
    throw new Error('useCms must be used within a CmsProvider');
  }
  return context;
};
