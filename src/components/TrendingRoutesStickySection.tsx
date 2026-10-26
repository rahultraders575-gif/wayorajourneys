import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useCms } from '../context/CmsContext';
import { useLenis } from '../context/LenisContext';
import { ImageWithFallback } from './ImageWithFallback';
import { 
  Clock, MapPin, ArrowRight, ChevronLeft, ChevronRight, 
  ShieldCheck, Navigation, Car 
} from 'lucide-react';

interface RouteItem {
  id: string;
  name: string;
  tagline: string;
  time: string;
  km: string;
  price: string;
  vehicles: string;
  highlights: string[];
  img: string;
}

const TRENDING_ROUTES: RouteItem[] = [
  {
    id: 'tirupati',
    name: 'Tirupati Tirumala',
    tagline: 'Lord Venkateswara Balaji Darshan Pilgrimage',
    time: '8–9 Hours',
    km: '1,120 km RT',
    price: '₹16,800',
    vehicles: 'Dzire · Innova Crysta · Fortuner',
    highlights: ['Ghat Road Expert Chauffeur', 'Zero Toll Surge', 'Darshan Drop'],
    img: '/images/tirupati.jpg',
  },
  {
    id: 'srisailam',
    name: 'Srisailam Jyotirlinga',
    tagline: 'Mallikarjuna Swamy Temple & Tiger Reserve Ghats',
    time: '4.5 Hours',
    km: '450 km RT',
    price: '₹6,000',
    vehicles: 'Sedan · Innova Crysta',
    highlights: ['Forest Checkpost Clearance', 'Dam Viewpoint Stop', 'Round Trip'],
    img: '/images/srisailam.jpg',
  },
  {
    id: 'goa',
    name: 'Goa Coastal Highway',
    tagline: 'Scenic Western Ghats Express to North & South Goa',
    time: '13–14 Hours',
    km: '1,360 km RT',
    price: '₹20,400',
    vehicles: 'Innova Crysta · Fortuner VIP',
    highlights: ['Multi-State Border Permit', 'Luggage Carrier Equipped', 'Resort Drop'],
    img: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'araku',
    name: 'Araku Valley & Borra',
    tagline: 'Coffee Plantations & Eastern Ghats Hill Station Tour',
    time: '12 Hours',
    km: '1,240 km RT',
    price: '₹18,600',
    vehicles: 'Innova Crysta · 7-Seater SUV',
    highlights: ['Hill Station Driving Specialist', 'Sightseeing Halts', 'AC Fleet'],
    img: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'shirdi',
    name: 'Shirdi Sai Darshan',
    tagline: 'Direct Expressway Chauffeur Ride to Shirdi & Shani Shingnapur',
    time: '12 Hours',
    km: '1,300 km RT',
    price: '₹19,500',
    vehicles: 'Executive Sedan · Innova Crysta',
    highlights: ['Samruddhi Mahamarg Highway', 'Senior Citizen Friendly', 'Fixed Fare'],
    img: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'hampi',
    name: 'Hampi Heritage Trail',
    tagline: 'UNESCO World Heritage Vijayanagara Ruins & Tungabhadra',
    time: '7–8 Hours',
    km: '760 km RT',
    price: '₹11,400',
    vehicles: 'Executive Sedan · Innova Crysta',
    highlights: ['Monument Hub Pickup', 'Highway Tolls Included', 'Experienced Driver'],
    img: '/images/hampi.jpg',
  },
];

export const TrendingRoutesStickySection: React.FC = () => {
  const { openBookingModal } = useCms();
  const { lenis } = useLenis();

  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const currentTranslateRef = useRef(0);
  const targetTranslateRef = useRef(0);
  const maxScrollRef = useRef(0);
  const rafIdRef = useRef<number | null>(null);

  const [activeStep, setActiveStep] = useState(0);

  // Measure scrollable track width
  const calculateBounds = useCallback(() => {
    if (!trackRef.current) return;
    const track = trackRef.current;
    maxScrollRef.current = Math.max(0, track.scrollWidth - track.clientWidth);
  }, []);

  // Update target translation based on container scroll progress
  const onScroll = useCallback(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const scrollDistance = container.offsetHeight - window.innerHeight;
    if (scrollDistance <= 0) return;

    // Progress 0 to 1
    const progress = Math.min(Math.max(-rect.top / scrollDistance, 0), 1);
    targetTranslateRef.current = progress * maxScrollRef.current;

    // Update active step indicator
    const totalSteps = Math.ceil(TRENDING_ROUTES.length / 2);
    const step = Math.min(Math.floor(progress * totalSteps), totalSteps - 1);
    setActiveStep((prev) => (prev !== step ? step : prev));
  }, []);

  useEffect(() => {
    calculateBounds();
    onScroll();

    let isRunning = true;

    // High performance 60/120fps LERP animation loop
    const renderLoop = () => {
      if (!isRunning) return;

      const diff = targetTranslateRef.current - currentTranslateRef.current;
      if (Math.abs(diff) > 0.05) {
        currentTranslateRef.current += diff * 0.12;
      } else {
        currentTranslateRef.current = targetTranslateRef.current;
      }

      const tx = currentTranslateRef.current;
      if (trackRef.current) {
        trackRef.current.style.transform = `translate3d(-${tx.toFixed(2)}px, 0, 0)`;
      }

      if (progressBarRef.current && maxScrollRef.current > 0) {
        const pct = Math.min(100, Math.max(5, (tx / maxScrollRef.current) * 100));
        progressBarRef.current.style.width = `${pct.toFixed(2)}%`;
      }

      rafIdRef.current = requestAnimationFrame(renderLoop);
    };

    rafIdRef.current = requestAnimationFrame(renderLoop);

    if (lenis) {
      lenis.on('scroll', onScroll);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    
    const handleResize = () => {
      calculateBounds();
      onScroll();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      isRunning = false;
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      if (lenis) lenis.off('scroll', onScroll);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [lenis, onScroll, calculateBounds]);

  // Stepper controls
  const scrollToStep = (direction: 'next' | 'prev') => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const scrollDistance = container.offsetHeight - window.innerHeight;
    const totalSteps = Math.ceil(TRENDING_ROUTES.length / 2);
    const stepRatio = 1 / Math.max(totalSteps - 1, 1);

    const targetStep = direction === 'next' 
      ? Math.min(activeStep + 1, totalSteps - 1)
      : Math.max(activeStep - 1, 0);

    const targetProgress = targetStep * stepRatio;
    const targetScrollY = container.offsetTop + targetProgress * scrollDistance;

    if (lenis) {
      lenis.scrollTo(targetScrollY, { duration: 1.0 });
    } else {
      window.scrollTo({ top: targetScrollY, behavior: 'smooth' });
    }
  };

  return (
    <section 
      ref={containerRef} 
      className="relative h-[280vh] sm:h-[300vh] bg-slate-50 border-b border-slate-200"
    >
      {/* Sticky Viewport Stage */}
      <div className="sticky top-0 h-screen w-full flex flex-col justify-center overflow-hidden bg-white/95 backdrop-blur-md">
        
        {/* Top Header Bar */}
        <div className="max-w-7xl xl:max-w-[1360px] mx-auto w-full px-4 sm:px-6 lg:px-8 mb-6 sm:mb-8 shrink-0">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            
            <div>
              <span className="text-[11px] font-bold text-red-600 uppercase tracking-wider block mb-1">
                Quick Dispatch Hubs
              </span>
              
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 leading-tight">
                Trending Highway Routes <span className="text-red-600">from Hyderabad</span>
              </h2>
              
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1 flex items-center gap-2">
                <Navigation className="w-3.5 h-3.5 text-red-600" />
                <span>Average door-to-door transit times with verified highway chauffeurs.</span>
              </p>
            </div>

            {/* Stepper Controls & Counter */}
            <div className="flex items-center gap-3 self-start md:self-end">
              
              {/* Progress Pill Bar */}
              <div className="hidden sm:flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-full border border-slate-200 shadow-inner">
                {Array.from({ length: Math.ceil(TRENDING_ROUTES.length / 2) }).map((_, idx) => (
                  <span
                    key={idx}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      activeStep === idx 
                        ? 'w-6 bg-red-600' 
                        : 'w-2 bg-slate-300 hover:bg-slate-400'
                    }`}
                  />
                ))}
              </div>

              {/* Prev / Next Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => scrollToStep('prev')}
                  className="w-10 h-10 rounded-full bg-white hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shadow-xs hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  aria-label="Previous routes"
                  title="Previous routes"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollToStep('next')}
                  className="w-10 h-10 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-md shadow-red-600/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  aria-label="Next routes"
                  title="Next routes"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

            </div>

          </div>
        </div>

        {/* Horizontal Track Container (Exactly 2 Cards Visible Per Viewport on Desktop) */}
        <div className="w-full overflow-hidden px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl xl:max-w-[1360px] mx-auto">
            <div
              ref={trackRef}
              className="flex items-stretch gap-6 sm:gap-8 will-change-transform pb-2"
              style={{ transform: 'translate3d(0, 0, 0)' }}
            >
              {TRENDING_ROUTES.map((route) => (
                <div
                  key={route.id}
                  onClick={() => openBookingModal(`Route: ${route.name}`)}
                  className="group relative flex-none w-[86vw] sm:w-[calc(50%-16px)] lg:w-[calc(50%-16px)] bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 hover:border-red-500 shadow-sm hover:shadow-2xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    {/* High-Impact Image Banner with Duration Tag */}
                    <div className="relative h-48 sm:h-56 lg:h-60 rounded-2xl overflow-hidden mb-4 bg-slate-100">
                      <ImageWithFallback
                        src={route.img}
                        alt={route.name}
                        fallbackTitle={route.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      
                      {/* Dark gradient for legibility */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-900/90 backdrop-blur-md text-white text-xs font-bold shadow-md">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          {route.time}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md text-slate-800 text-[11px] font-bold shadow-md">
                          <MapPin className="w-3 h-3 text-red-600" />
                          {route.km}
                        </span>
                      </div>

                      {/* Bottom Image Overlay Tagline */}
                      <div className="absolute bottom-3 left-3 right-3 text-white">
                        <span className="text-[11px] font-semibold tracking-wide text-white/90 line-clamp-1 drop-shadow-sm">
                          {route.tagline}
                        </span>
                      </div>
                    </div>

                    {/* Route Details */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-lg sm:text-xl font-black text-slate-900 group-hover:text-red-600 transition-colors">
                          {route.name}
                        </h3>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold whitespace-nowrap">
                          Instant Dispatch
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                        <Car className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{route.vehicles}</span>
                      </div>

                      {/* Highlights Pill Badges */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {route.highlights.map((h, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-[10px] font-semibold text-slate-600 border border-slate-200/60"
                          >
                            <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" />
                            {h}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Pricing and Action Footer */}
                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl sm:text-2xl font-black text-red-600 tracking-tight">
                          {route.price}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">/ all-inclusive</span>
                      </div>
                      <span className="text-[10px] text-emerald-600 font-bold block">
                        Tolls & Chauffeur Allowance Included
                      </span>
                    </div>

                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/20 group-hover:scale-102 transition-all cursor-pointer whitespace-nowrap"
                    >
                      <span>Book Cab</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>

                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Scroll Progress Bar */}
        <div className="max-w-7xl xl:max-w-[1360px] mx-auto w-full px-4 sm:px-6 lg:px-8 mt-4 shrink-0">
          <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
            <div 
              ref={progressBarRef}
              className="h-full bg-red-600 rounded-full"
              style={{ width: '5%' }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium mt-2">
            <span>← Scroll down to slide through highway routes →</span>
            <span>2 Routes Per View · Verified Cabs</span>
          </div>
        </div>

      </div>
    </section>
  );
};
