import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useCms } from '../context/CmsContext';
import { useLenis } from '../context/LenisContext';
import { ArrowRight, Compass, Key, Globe, Shield, Sparkles, ChevronDown } from 'lucide-react';
import { FlyingBirds } from './FlyingBirds';

export const RoyalDoorwaySection: React.FC = () => {
  const { openBookingModal } = useCms();
  const { lenis } = useLenis();

  const trackRef = useRef<HTMLDivElement>(null);
  
  // UNIFIED DOOR RIG WRAPPER: Contains casing and door leaf so they NEVER detach while scaling
  const doorRigWrapperRef = useRef<HTMLDivElement>(null);
  
  const interiorWorldRef = useRef<HTMLDivElement>(null);
  const worldGreetingRef = useRef<HTMLDivElement>(null);
  const doorLeafContainerRef = useRef<HTMLDivElement>(null);
  const doorLeaf3DRef = useRef<HTMLDivElement>(null);
  const doorTopPanelRef = useRef<HTMLDivElement>(null);
  const doorTopInnerPanelRef = useRef<HTMLDivElement>(null);
  const pottedPlantRef = useRef<HTMLDivElement>(null);
  const posterHeaderRef = useRef<HTMLDivElement>(null);
  const posterLeftContentRef = useRef<HTMLDivElement>(null);
  const posterFooterRibbonRef = useRef<HTMLDivElement>(null);
  const scrollProgressLineRef = useRef<HTMLDivElement>(null);
  const destinationOverlayRef = useRef<HTMLDivElement>(null);
  const inWorldFooterRef = useRef<HTMLDivElement>(null);
  const bottomExitBlendRef = useRef<HTMLDivElement>(null);

  // SVG paths
  const maskDoorPathRef = useRef<SVGPathElement>(null);
  const rimCasingShadowRef = useRef<SVGPathElement>(null);
  const rimOuterCasingRef = useRef<SVGPathElement>(null);
  const rimInnerJambRef = useRef<SVGPathElement>(null);
  const rimGoldFiligreeRef = useRef<SVGPathElement>(null);

  // Geometry cache
  const geomRef = useRef({
    vw: 0,
    vh: 0,
    doorW: 0,
    doorH: 0,
    archRadius: 0,
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    archCenterY: 0,
    centerX: 0,
    centerY: 0
  });

  // Zoom and mouse physics state
  const currentZoomRef = useRef(0);
  const targetZoomRef = useRef(0);
  const rawProgressRef = useRef(0);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const rafIdRef = useRef<number | null>(null);

  const ZOOM_THRESHOLD = 0.85;

  /* -------------------------------------------------------------
     1. GEOMETRY ENGINE: MIDDLE-ALIGNED, WELL-PROPORTIONED ARCHWAY
     ------------------------------------------------------------- */
  const calculateDoorwayGeometry = useCallback(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const isMobile = vw < 768;

    // Small, refined, proportional doorway
    const doorW = isMobile ? Math.min(vw * 0.62, 260) : Math.min(vw * 0.28, 350);
    const doorH = isMobile ? Math.min(vh * 0.62, 460) : Math.min(vh * 0.68, 540);
    const archRadius = doorW / 2;

    const left = isMobile ? (vw - doorW) / 2 : vw * 0.48;
    const right = left + doorW;

    // Center doorway vertically in the middle of the viewport
    const top = Math.max(75, Math.round((vh - doorH) / 2));
    const bottom = top + doorH;
    const archCenterY = top + archRadius;
    const centerX = left + doorW / 2;
    const centerY = top + doorH / 2;

    geomRef.current = {
      vw, vh, doorW, doorH, archRadius, left, right, top, bottom, archCenterY, centerX, centerY
    };

    // SVG Path: Flat bottom, vertical left jamb, semicircular arch top, vertical right jamb
    const pathD = `
      M ${left}, ${bottom}
      L ${left}, ${archCenterY}
      A ${archRadius}, ${archRadius} 0 0, 1 ${right}, ${archCenterY}
      L ${right}, ${bottom}
      Z
    `;

    if (maskDoorPathRef.current) maskDoorPathRef.current.setAttribute('d', pathD);
    if (rimCasingShadowRef.current) rimCasingShadowRef.current.setAttribute('d', pathD);
    if (rimOuterCasingRef.current) rimOuterCasingRef.current.setAttribute('d', pathD);
    if (rimInnerJambRef.current) rimInnerJambRef.current.setAttribute('d', pathD);
    if (rimGoldFiligreeRef.current) rimGoldFiligreeRef.current.setAttribute('d', pathD);

    // Apply geometry to door leaf container (shared coordinate space with casing)
    if (doorLeafContainerRef.current && doorLeaf3DRef.current) {
      doorLeafContainerRef.current.style.left = `${left}px`;
      doorLeafContainerRef.current.style.top = `${top}px`;
      doorLeafContainerRef.current.style.width = `${doorW}px`;
      doorLeafContainerRef.current.style.height = `${doorH}px`;

      doorLeaf3DRef.current.style.width = `${doorW}px`;
      doorLeaf3DRef.current.style.height = `${doorH}px`;
      doorLeaf3DRef.current.style.borderTopRightRadius = `${archRadius}px`;
      doorLeaf3DRef.current.style.borderTopLeftRadius = `${archRadius}px`;
      doorLeaf3DRef.current.style.transformOrigin = 'right center';
    }

    // Top inset panel matching the arch contour
    const panelRadius = Math.max(0, archRadius - 14);
    if (doorTopPanelRef.current) {
      doorTopPanelRef.current.style.borderTopRightRadius = `${panelRadius}px`;
      doorTopPanelRef.current.style.borderTopLeftRadius = `${panelRadius}px`;
    }
    if (doorTopInnerPanelRef.current) {
      const innerRadius = Math.max(0, panelRadius - 8);
      doorTopInnerPanelRef.current.style.borderTopRightRadius = `${innerRadius}px`;
      doorTopInnerPanelRef.current.style.borderTopLeftRadius = `${innerRadius}px`;
    }

    // Unified Door Rig Wrapper scales from the doorway opening center
    if (doorRigWrapperRef.current) {
      doorRigWrapperRef.current.style.transformOrigin = `${centerX}px ${centerY}px`;
    }

    // Centered greeting inside the doorway aperture
    if (worldGreetingRef.current) {
      worldGreetingRef.current.style.left = `${centerX}px`;
      worldGreetingRef.current.style.top = `${top + archRadius * 0.28}px`;
    }

    // Potted plant positioning
    if (pottedPlantRef.current) {
      const plantLeft = right + (isMobile ? -10 : 20);
      const plantBottom = vh - bottom;
      pottedPlantRef.current.style.left = `${plantLeft}px`;
      pottedPlantRef.current.style.bottom = `${plantBottom - 10}px`;
    }
  }, []);

  /* -------------------------------------------------------------
     2. SCROLL PROGRESS ENGINE (LENIS DRIVEN)
     ------------------------------------------------------------- */
  const calculateScrollProgress = useCallback(() => {
    if (!trackRef.current) return { zoom: 0, raw: 0 };
    const rect = trackRef.current.getBoundingClientRect();
    const scrollDistance = -rect.top;
    const spacerHeight = trackRef.current.offsetHeight - window.innerHeight;
    if (spacerHeight <= 0) return { zoom: 0, raw: 0 };

    const raw = Math.max(0, Math.min(1, scrollDistance / spacerHeight));
    const zoom = Math.min(1, raw / ZOOM_THRESHOLD);
    return { zoom, raw };
  }, [ZOOM_THRESHOLD]);

  useEffect(() => {
    calculateDoorwayGeometry();
    window.addEventListener('resize', calculateDoorwayGeometry);

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = ((e.clientX / window.innerWidth) - 0.5) * 2;
      mouseRef.current.targetY = ((e.clientY / window.innerHeight) - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Initial progress computation
    const initProgress = calculateScrollProgress();
    targetZoomRef.current = initProgress.zoom;
    rawProgressRef.current = initProgress.raw;

    // Lenis listener for ultra-fluid physics scroll updates
    let lenisUnsubscribe: (() => void) | undefined;
    const updateProgress = () => {
      const p = calculateScrollProgress();
      targetZoomRef.current = p.zoom;
      rawProgressRef.current = p.raw;
    };

    if (lenis) {
      lenis.on('scroll', updateProgress);
      lenisUnsubscribe = () => {
        lenis.off('scroll', updateProgress);
      };
    } else {
      window.addEventListener('scroll', updateProgress, { passive: true });
      lenisUnsubscribe = () => {
        window.removeEventListener('scroll', updateProgress);
      };
    }

    /* -------------------------------------------------------------
       3. HIGH-FRAMERATE RAF RENDER LOOP (BUTTER-SMOOTH INERTIA)
       ------------------------------------------------------------- */
    function renderAnimation() {
      // Fine-tuned micro-lerping for fluid high-framerate rendering matching prototype
      currentZoomRef.current += (targetZoomRef.current - currentZoomRef.current) * 0.085;
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.04;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.04;

      const z = currentZoomRef.current;
      const raw = rawProgressRef.current;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      if (scrollProgressLineRef.current) {
        scrollProgressLineRef.current.style.width = `${Math.min(100, Math.round(z * 100))}%`;
      }

      // 1. ZOOM ENTIRE UNIFIED DOOR RIG FORWARD (CASING + DOOR LEAF TOGETHER - CANNOT DETACH!)
      if (doorRigWrapperRef.current) {
        const portalScale = 1 + Math.pow(z, 2.4) * 28.0;
        doorRigWrapperRef.current.style.transform = `scale(${portalScale.toFixed(3)}) translateZ(0)`;

        if (z > 0.48) {
          const fade = Math.max(0, 1 - ((z - 0.48) / 0.30));
          doorRigWrapperRef.current.style.opacity = fade.toFixed(3);
        } else {
          doorRigWrapperRef.current.style.opacity = '1';
        }
      }

      // 2. 3D DOOR LEAF: ROTATES SMOOTHLY ON HINGE INSIDE THE RIG
      if (doorLeaf3DRef.current) {
        const initialAngle = -52;
        const targetAngle = -115;
        const currentAngle = initialAngle + (targetAngle - initialAngle) * Math.min(1, z * 1.6);
        doorLeaf3DRef.current.style.transform = `rotateY(${currentAngle.toFixed(2)}deg)`;
      }

      // 3. Move interior world forward (smooth 3D dolly with subtle parallax)
      if (interiorWorldRef.current) {
        const worldScale = 1.0 + z * 0.30;
        const parallaxX = mx * (1 - z * 0.75) * 16;
        const parallaxY = my * (1 - z * 0.75) * 10;
        interiorWorldRef.current.style.transform = `translate3d(${parallaxX.toFixed(2)}px, ${parallaxY.toFixed(2)}px, 0) scale(${worldScale.toFixed(3)})`;
      }

      // 4. Greeting centered inside the aperture fades out as approached
      if (worldGreetingRef.current) {
        const greetingFade = Math.max(0, 1 - (z / 0.45));
        worldGreetingRef.current.style.opacity = greetingFade.toFixed(3);
        worldGreetingRef.current.style.transform = `translate3d(-50%, 0, 0) scale(${(1 + z * 0.15).toFixed(3)})`;
      }

      // In-world destination overlay: fades in as door opens, fully visible in world view (left-side top space)
      if (destinationOverlayRef.current) {
        const destOpacity = Math.max(0, Math.min(1, (z - 0.22) / 0.35));
        destinationOverlayRef.current.style.opacity = destOpacity.toFixed(3);
        destinationOverlayRef.current.style.transform = `translate3d(0, ${(1 - destOpacity) * -16}px, 0)`;
        destinationOverlayRef.current.style.pointerEvents = destOpacity > 0.4 ? 'auto' : 'none';
      }

      // In-world bottom status footer: gracefully reveals at bottom, eliminating black empty void downside
      if (inWorldFooterRef.current) {
        const footerOpacity = Math.max(0, Math.min(1, (z - 0.30) / 0.30));
        inWorldFooterRef.current.style.opacity = footerOpacity.toFixed(3);
        inWorldFooterRef.current.style.transform = `translate3d(0, ${(1 - footerOpacity) * 12}px, 0)`;
        inWorldFooterRef.current.style.pointerEvents = footerOpacity > 0.4 ? 'auto' : 'none';
      }

      // Bottom exit blend: smoothly transitions the bottom into light slate near the end of track so it never flashes black
      if (bottomExitBlendRef.current) {
        const exitOpacity = Math.max(0, Math.min(1, (raw - 0.78) / 0.22));
        bottomExitBlendRef.current.style.opacity = exitOpacity.toFixed(3);
      }

      // 5. Dissolve Poster UI elements (preserves vertical middle alignment)
      const uiFade = Math.min(1, z / 0.24);
      const uiOpacity = (1 - uiFade).toFixed(3);
      const uiShiftLeft = -(uiFade * 40);

      if (posterHeaderRef.current) {
        posterHeaderRef.current.style.opacity = uiOpacity;
      }
      if (posterLeftContentRef.current) {
        posterLeftContentRef.current.style.opacity = uiOpacity;
        posterLeftContentRef.current.style.transform = `translate3d(${uiShiftLeft.toFixed(1)}px, -50%, 0)`;
      }
      if (posterFooterRibbonRef.current) {
        posterFooterRibbonRef.current.style.opacity = uiOpacity;
      }
      if (pottedPlantRef.current) {
        pottedPlantRef.current.style.opacity = uiOpacity;
        pottedPlantRef.current.style.transform = `scale(${(1 + z * 1.5).toFixed(2)}) translateZ(0)`;
      }

      rafIdRef.current = requestAnimationFrame(renderAnimation);
    }

    rafIdRef.current = requestAnimationFrame(renderAnimation);

    return () => {
      window.removeEventListener('resize', calculateDoorwayGeometry);
      window.removeEventListener('mousemove', handleMouseMove);
      if (lenisUnsubscribe) lenisUnsubscribe();
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, [lenis, calculateDoorwayGeometry, calculateScrollProgress]);

  /* -------------------------------------------------------------
     4. INTERACTIVE LENIS CAMERA PASSTHROUGH TRIGGER
     ------------------------------------------------------------- */
  const handlePassThroughDoor = () => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const currentScroll = window.scrollY || window.pageYOffset;
    const spacerHeight = trackRef.current.offsetHeight - window.innerHeight;
    const targetScroll = currentScroll + rect.top + spacerHeight * ZOOM_THRESHOLD;

    if (lenis) {
      lenis.scrollTo(targetScroll, { duration: 2.2 });
    } else {
      window.scrollTo({
        top: targetScroll,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div 
      ref={trackRef} 
      id="royal-doorway-track" 
      className="relative w-full bg-slate-50"
      style={{ height: '175vh' }}
    >
      {/* =========================================================================
           1. FIXED FULL-SCREEN 3D VIEWPORT (KEYHOLE-ARCHITECTURE ENGINE)
           ========================================================================= */}
      <div 
        id="fixed-viewport"
        className="sticky top-0 w-full h-screen h-[100dvh] overflow-hidden bg-[#FDFBF7] select-none z-20 pointer-events-none"
        style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}
      >
        
        {/* -------------------------------------------------------------
             LAYER A: FULL-WIDTH PANORAMIC WATERFRONT CITY SCENERY
             ------------------------------------------------------------- */}
        <div 
          ref={interiorWorldRef} 
          id="interior-world" 
          className="absolute inset-0 w-screen min-w-full h-full flex items-center justify-center overflow-hidden gpu-layer pointer-events-none"
        >
          {/* High Resolution Full-Width Waterfront / Journey Backdrop Behind Door */}
          <div id="city-backdrop" className="absolute inset-0 w-screen min-w-full h-full gpu-layer">
            <img 
              id="backdrop-img"
              src="/images/door.png" 
              alt="Royal Journey Destination View"
              className="w-screen min-w-full h-full object-cover object-center filter saturate-[1.08] brightness-[1.02] contrast-[1.04] transition-transform duration-700 ease-out scale-[1.05]"
            />
            
            {/* Realistic Flying Birds in Sky (Minimal & Distant) */}
            <FlyingBirds birdCount={6} skyCoverage={0.34} primaryDirection="mixed" colorTone="natural" />

            {/* Royal Ambient Lighting Overlays (Sunlit & Radiant - No Black Void Downside) */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-[#D4AF37]/15 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#2d050b]/20 via-transparent to-transparent pointer-events-none" />
          </div>

          {/* In-World Royal Welcome Signboard (Centered directly inside doorway aperture) */}
          <div 
            ref={worldGreetingRef} 
            id="world-greeting" 
            className="absolute z-10 flex flex-col items-center justify-center text-center px-2 pointer-events-none transition-all duration-300 gpu-layer"
            style={{ transform: 'translate3d(-50%, 0, 0)' }}
          >
            <span className="font-mono text-[9px] uppercase tracking-[0.35em] text-[#D4AF37] font-bold mb-1.5 whitespace-nowrap">
              Grand Departure Awaits
            </span>
            <h2 
              className="text-base sm:text-lg md:text-xl font-serif font-bold text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)] leading-tight whitespace-nowrap"
              style={{ fontFamily: '"Cinzel", "Playfair Display", Georgia, serif' }}
            >
              Need a<br />
              <span className="text-[#D4AF37] font-extrabold">ride?</span>
            </h2>
            <div className="w-12 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mt-2 shadow-md" />
          </div>
        </div>

        {/* -------------------------------------------------------------
             LAYER A.2: IN-WORLD DESTINATION HERO OVERLAY (Left-Side Space, Top-Side)
             Appears gracefully in the open sky space on the top-left as you step into the scenic world
             ------------------------------------------------------------- */}
        <div 
          ref={destinationOverlayRef} 
          id="world-destination-overlay"
          className="absolute top-10 sm:top-14 lg:top-20 left-6 sm:left-12 lg:left-20 z-25 flex flex-col items-start max-w-lg pointer-events-none transition-transform duration-300 gpu-layer"
          style={{ opacity: 0 }}
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/45 backdrop-blur-md border border-[#D4AF37]/60 mb-3 shadow-2xl">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] animate-pulse" />
            <span className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.28em] text-[#F8F4EB] font-bold">
              First Class Concierge
            </span>
          </div>

          <h2 
            className="text-4xl sm:text-5xl lg:text-6xl font-serif font-extrabold uppercase tracking-tight text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)] leading-[0.94]"
            style={{ fontFamily: '"Cinzel", "Playfair Display", Georgia, serif' }}
          >
            NEED A<br />
            <span className="text-[#D4AF37] drop-shadow-[0_2px_14px_rgba(212,175,55,0.7)]">RIDE?</span>
          </h2>

          <div className="my-3.5 flex items-center gap-2">
            <div className="w-12 h-1 bg-[#D4AF37] rounded-full shadow-md" />
            <div className="w-3 h-1 bg-white/70 rounded-full" />
          </div>

          <p 
            className="text-white/95 text-sm sm:text-base lg:text-lg font-serif mb-5 leading-snug drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)] max-w-sm"
            style={{ fontFamily: '"Cinzel", "Playfair Display", Georgia, serif' }}
          >
            <span className="text-[#D4AF37] font-bold">Reserve</span> your transit.<br />
            <span className="text-white font-bold">Arrive</span> in royal distinction.
          </p>

          <div className="flex flex-wrap items-center gap-3 pointer-events-auto">
            <button 
              type="button"
              onClick={() => openBookingModal('Royal Gateway Transit')}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-[#800020] via-[#6B1124] to-[#4A0E17] text-[#F8F4EB] font-serif font-bold text-xs uppercase tracking-[0.2em] px-7 py-3.5 rounded-full shadow-2xl hover:scale-105 active:scale-95 border border-[#D4AF37] transition-all cursor-pointer"
              style={{ fontFamily: '"Cinzel", "Playfair Display", Georgia, serif' }}
            >
              <span>RESERVE TRANSIT</span>
              <div className="w-5 h-5 rounded-full bg-[#D4AF37] text-[#1a0307] flex items-center justify-center">
                <ArrowRight className="w-3 h-3 stroke-[3]" />
              </div>
            </button>
          </div>
        </div>

        {/* -------------------------------------------------------------
             LAYER A.3: IN-WORLD LUXURY TRANSIT FOOTER BAR (Down Side)
             Fills downside with an elegant status bar so there is never empty dark void
             ------------------------------------------------------------- */}
        <div 
          ref={inWorldFooterRef}
          id="in-world-footer"
          className="absolute bottom-6 sm:bottom-8 inset-x-4 sm:inset-x-12 lg:inset-x-20 z-25 flex flex-col sm:flex-row items-center justify-between gap-3 bg-black/60 backdrop-blur-md border border-[#D4AF37]/45 px-5 sm:px-7 py-3 rounded-2xl pointer-events-none shadow-2xl transition-all duration-300"
          style={{ opacity: 0 }}
        >
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <div className="flex flex-col text-left">
              <span className="text-white text-xs sm:text-sm font-serif font-bold tracking-wide">
                Private Highway Chauffeur Ready &bull; Instant Dispatch
              </span>
              <span className="text-neutral-300 text-[10px] sm:text-[11px] font-medium">
                Srisailam &bull; Tirupati &bull; Goa &bull; Shirdi &bull; Round-Trip Highway Fleet
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 pointer-events-auto">
            <button 
              type="button"
              onClick={() => openBookingModal('Grand Transit Concierge')}
              className="bg-gradient-to-r from-[#D4AF37] via-[#f3d97b] to-[#AA771C] text-neutral-950 font-serif font-bold text-[11px] sm:text-xs uppercase tracking-wider px-5 py-2 rounded-xl shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>Book Chauffeur</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* -------------------------------------------------------------
             UNIFIED DOOR RIG (CASING + DOOR LEAF TOGETHER)
             The SVG solid wall and casing sit in front of the door leaf (z-20 vs z-10),
             which completely covers any outside edge overlay while revealing the door
             and backdrop cleanly through the arched aperture!
             ------------------------------------------------------------- */}
        <div 
          ref={doorRigWrapperRef}
          id="door-rig-wrapper"
          className="absolute inset-0 w-full h-full z-20 pointer-events-none gpu-layer origin-center"
        >
          {/* LAYER 1: 3D ROYAL BURGUNDY LACQUER DOOR LEAF (Behind Arch Casing, z-10) */}
          <div 
            ref={doorLeafContainerRef} 
            id="door-leaf-container" 
            className="absolute z-10 perspective-stage pointer-events-none flex items-center justify-center gpu-layer"
          >
            <div 
              ref={doorLeaf3DRef} 
              id="door-leaf-3d" 
              onClick={handlePassThroughDoor}
              className="preserve-3d relative bg-gradient-to-b from-[#800020] via-[#6B1124] to-[#4A0E17] border-4 border-[#AA771C] shadow-[0_24px_55px_rgba(18,2,4,0.65)] cursor-pointer pointer-events-auto transition-transform gpu-layer"
              style={{ 
                transformOrigin: 'right center', 
                transform: 'rotateY(-52deg)' 
              }}
              title="Click to pass through royal grand doorway"
            >
              {/* Polished Deep Wood Lacquer Sheen & Vignette */}
              <div className="absolute inset-0 bg-gradient-to-l from-[#4A0E17]/60 via-transparent to-black/40 pointer-events-none" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(212,175,55,0.15),transparent_70%)] pointer-events-none" />

              {/* 3 Classical Architectural Gilded Inset Panels */}
              <div className="relative w-full h-full p-3 sm:p-4 flex flex-col justify-between">
                
                {/* Top Arched Panel */}
                <div 
                  ref={doorTopPanelRef} 
                  id="door-top-panel" 
                  className="w-full h-[28%] bg-gradient-to-b from-[#6B1124] to-[#4A0E17] border border-[#D4AF37]/70 royal-door-recess relative flex items-center justify-center"
                >
                  <div 
                    ref={doorTopInnerPanelRef}
                    className="w-[88%] h-[82%] border border-[#D4AF37]/35 flex items-center justify-center"
                  >
                    <span className="w-4 h-4 rounded-full border border-[#D4AF37]/50 flex items-center justify-center opacity-60">
                      <span className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full" />
                    </span>
                  </div>
                </div>

                {/* Mid Panel */}
                <div className="w-full h-[32%] bg-gradient-to-b from-[#6B1124] to-[#4A0E17] rounded-sm border border-[#D4AF37]/70 royal-door-recess relative flex items-center justify-center">
                  <div className="w-[88%] h-[84%] border border-[#D4AF37]/35 flex items-center justify-center">
                    <span className="w-3.5 h-3.5 rotate-45 border border-[#D4AF37]/45 opacity-60" />
                  </div>
                </div>

                {/* Lower Panel */}
                <div className="w-full h-[32%] bg-gradient-to-b from-[#6B1124] to-[#4A0E17] rounded-sm border border-[#D4AF37]/70 royal-door-recess relative flex items-center justify-center">
                  <div className="w-[88%] h-[84%] border border-[#D4AF37]/35 flex items-center justify-center">
                    <span className="w-3.5 h-3.5 rotate-45 border border-[#D4AF37]/45 opacity-60" />
                  </div>
                </div>

              </div>

              {/* Heavy Polished Brass & Gold Door Handle Escutcheon Plate */}
              <div className="absolute left-3.5 sm:left-4 top-[50%] -translate-y-1/2 flex items-center pointer-events-none">
                <div className="w-3 h-16 bg-gradient-to-b from-[#D4AF37] via-[#FFF2B2] to-[#8C6214] rounded-sm shadow-2xl flex items-center justify-center border border-[#6B4708]">
                  {/* Door Handle Lever */}
                  <div className="w-8 sm:w-10 h-2 bg-gradient-to-b from-[#FFF2B2] via-[#D4AF37] to-[#734E09] rounded-full shadow-[0_8px_14px_rgba(0,0,0,0.6)] -ml-6 sm:-ml-8 border border-[#523706]" />
                  {/* Keyhole Accent */}
                  <div className="absolute bottom-2.5 w-1 h-2 bg-[#2d050b] rounded-full" />
                </div>
              </div>

              {/* Subtle Enter Badge */}
              <div className="absolute bottom-2.5 right-2.5 bg-black/60 backdrop-blur-xs text-[#D4AF37] text-[8px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border border-[#D4AF37]/30">
                Click to Enter
              </div>

            </div>
          </div>

          {/* LAYER 2: ARCHITECTURAL BURGUNDY & GOLD CASING + MASKED WALL (In Front of Door Leaf, z-20) */}
          <svg id="portal-svg" className="w-full h-full absolute inset-0 z-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              {/* Mask: Off-white canvas covers screen; black cutout reveals scenery */}
              <mask id="door-cutout-mask">
                <rect width="100%" height="100%" fill="#ffffff" />
                <path ref={maskDoorPathRef} id="mask-door-path" d="" fill="#000000" />
              </mask>

              {/* Royal Burgundy & Burnished Gold Archway Gradients */}
              <linearGradient id="frame-bevel-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#4a0e17" />
                <stop offset="25%" stopColor="#800020" />
                <stop offset="50%" stopColor="#D4AF37" />
                <stop offset="75%" stopColor="#800020" />
                <stop offset="100%" stopColor="#4a0e17" />
              </linearGradient>

              <linearGradient id="inner-jamb-shadow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#120204" stopOpacity="0.95" />
                <stop offset="45%" stopColor="#4a0e17" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#120204" stopOpacity="0.98" />
              </linearGradient>

              {/* Heavy Regal Archway Drop Shadow */}
              <filter id="casing-soft-shadow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="16" />
                <feOffset dx="0" dy="24" />
                <feComponentTransfer><feFuncA type="linear" slope="0.45" /></feComponentTransfer>
                <feMerge>
                  <feMergeNode />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Outer Pearl White Solid Masked Wall (Completely covers any outside door edges) */}
            <rect width="100%" height="100%" mask="url(#door-cutout-mask)" fill="#FDFBF7" />

            {/* Gilded & Burgundy Casing Extrusions */}
            <path ref={rimCasingShadowRef} id="rim-casing-shadow" d="" fill="none" stroke="#120204" strokeWidth="36" opacity="0.35" filter="url(#casing-soft-shadow)" />
            <path ref={rimOuterCasingRef} id="rim-outer-casing" d="" fill="none" stroke="url(#frame-bevel-grad)" strokeWidth="26" strokeLinecap="round" strokeLinejoin="round" />
            <path ref={rimInnerJambRef} id="rim-inner-jamb" d="" fill="none" stroke="url(#inner-jamb-shadow)" strokeWidth="14" strokeLinecap="round" />
            <path ref={rimGoldFiligreeRef} id="rim-gold-filigree" d="" fill="none" stroke="#D4AF37" strokeWidth="2.5" opacity="0.95" />
          </svg>

        </div>

        {/* -------------------------------------------------------------
             LAYER D: GILDED URN PLANTER (Lower Right)
             ------------------------------------------------------------- */}
        <div 
          ref={pottedPlantRef} 
          id="potted-plant" 
          className="absolute z-28 pointer-events-none flex flex-col items-center gpu-layer"
        >
          {/* Deep Emerald Laurel Foliage */}
          <div className="w-28 sm:w-36 md:w-44 h-36 sm:h-48 relative -mb-5">
            <svg viewBox="0 0 200 240" className="w-full h-full drop-shadow-[0_16px_22px_rgba(0,0,0,0.4)]">
              <path d="M 100 220 Q 95 140 60 70" stroke="#102810" strokeWidth="4" fill="none" />
              <path d="M 100 220 Q 105 130 145 60" stroke="#163816" strokeWidth="4.5" fill="none" />
              <path d="M 100 220 Q 100 120 100 30" stroke="#0e230e" strokeWidth="5" fill="none" />
              <path d="M 60 70 C 20 40 10 90 50 120 C 70 110 80 80 60 70 Z" fill="#1c4724" />
              <path d="M 145 60 C 185 30 195 80 155 110 C 135 100 125 70 145 60 Z" fill="#173a1e" />
              <path d="M 100 30 C 70 0 130 0 100 30 Z" fill="#255b2f" />
              <path d="M 75 120 C 40 130 45 165 80 160 Z" fill="#133119" />
              <path d="M 125 115 C 160 125 155 160 120 155 Z" fill="#1c4724" />
            </svg>
          </div>
          {/* Fluted Alabaster & Gilded Brass Urn */}
          <div className="w-20 sm:w-28 h-20 sm:h-28 bg-gradient-to-b from-[#f5ede0] via-[#e3d6c1] to-[#b3a184] rounded-b-3xl rounded-t-lg shadow-2xl border-t-4 border-[#D4AF37] flex items-center justify-center relative">
            <div className="w-full h-2 bg-[#1a0307]/20 -mt-10" />
            <div className="absolute bottom-2 w-10 h-1 bg-[#AA771C]/50 rounded-full" />
          </div>
        </div>

        {/* -------------------------------------------------------------
             LAYER E: EDITORIAL POSTER TYPOGRAPHY & ROYAL CONTROLS
             ------------------------------------------------------------- */}
        
        {/* Main Left Editorial Catchphrase (Desktop: Vertically Middle-Aligned on Left; Mobile: Hidden to avoid overlapping doorway) */}
        <div 
          ref={posterLeftContentRef} 
          id="poster-left-content" 
          className="absolute z-30 pointer-events-auto transition-opacity duration-300 gpu-layer hidden lg:block lg:top-1/2 lg:left-12 xl:left-20 max-w-lg"
          style={{ transform: 'translate3d(0, -50%, 0)' }}
        >
          {/* Crown / Crest Iconography */}
          <div className="flex items-center gap-2 mb-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#800020] font-bold flex items-center gap-1.5 bg-[#800020]/10 px-3 py-1 rounded-full border border-[#800020]/25">
              <Sparkles className="w-3.5 h-3.5 text-[#AA771C]" />
              NEED A RIDE? &bull; CONCIERGE
            </span>
            <div className="w-8 h-[1px] bg-[#AA771C]" />
          </div>

          <h1 
            className="text-4xl sm:text-5xl lg:text-5xl xl:text-6xl font-serif font-extrabold uppercase tracking-tight text-[#1a0307] leading-[0.94]"
            style={{ fontFamily: '"Cinzel", "Playfair Display", Georgia, serif' }}
          >
            WHERE WOULD YOU<br />
            <span className="text-[#800020]">LIKE TO GO?</span>
          </h1>

          <div className="my-4 flex items-center gap-2">
            <div className="w-12 h-1 bg-[#800020] rounded-full" />
            <div className="w-3 h-1 bg-[#D4AF37] rounded-full" />
          </div>

          <div 
            className="text-lg sm:text-xl font-serif text-neutral-800 mb-6 leading-snug"
            style={{ fontFamily: '"Cinzel", "Playfair Display", Georgia, serif' }}
          >
            <p><span className="text-[#800020] font-bold">Reserve</span> your transit.</p>
            <p><span className="text-[#AA771C] font-bold">Arrive</span> in distinction.</p>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button 
              type="button"
              id="poster-book-btn" 
              onClick={() => openBookingModal('Royal Grand Transit')}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-[#800020] via-[#6B1124] to-[#4A0E17] text-[#F8F4EB] font-serif font-bold text-xs uppercase tracking-[0.2em] px-7 py-3.5 rounded-full shadow-xl shadow-red-950/25 hover:scale-105 active:scale-95 border border-[#D4AF37]/50 transition-all cursor-pointer"
              style={{ fontFamily: '"Cinzel", "Playfair Display", Georgia, serif' }}
            >
              <span>RESERVE TRANSIT</span>
              <div className="w-5 h-5 rounded-full bg-[#D4AF37] text-[#1a0307] flex items-center justify-center">
                <ArrowRight className="w-3 h-3 stroke-[3]" />
              </div>
            </button>

            {/* Lenis Smooth Step Through Button */}
            <button
              type="button"
              onClick={handlePassThroughDoor}
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-full border border-[#D4AF37] hover:border-[#800020] bg-white/90 hover:bg-white text-xs font-serif font-bold uppercase tracking-wider text-[#1a0307] transition-all shadow-md hover:scale-105 active:scale-95 cursor-pointer"
              style={{ fontFamily: '"Cinzel", "Playfair Display", Georgia, serif' }}
            >
              <span>Step Through Door</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#800020] animate-bounce" />
            </button>
          </div>

          {/* Scroll Prompt */}
          <div className="mt-6 flex items-center gap-2 text-xs text-neutral-600 font-medium font-mono">
            <Compass className="w-4 h-4 text-[#800020] animate-spin" style={{ animationDuration: '8s' }} />
            <span>Scroll down with Lenis to pass through the royal aperture</span>
          </div>
        </div>

        {/* Mobile-Exclusive Floating Step Button (Clean, Non-Colliding) */}
        <div className="lg:hidden absolute bottom-14 inset-x-0 z-30 flex items-center justify-center gap-2 px-4 pointer-events-auto">
          <button
            type="button"
            onClick={handlePassThroughDoor}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#D4AF37] bg-white/95 text-xs font-serif font-bold uppercase tracking-wider text-[#1a0307] shadow-lg active:scale-95 transition-all"
            style={{ fontFamily: '"Cinzel", "Playfair Display", Georgia, serif' }}
          >
            <span>Step Through Door</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#800020] animate-bounce" />
          </button>
        </div>

        {/* Bottom Ribbon */}
        <div 
          ref={posterFooterRibbonRef} 
          id="poster-footer-ribbon" 
          className="absolute bottom-3 inset-x-4 sm:inset-x-12 lg:inset-x-20 z-30 bg-gradient-to-r from-[#2d050b] via-[#800020] to-[#2d050b] text-[#F8F4EB] py-2 px-6 rounded-2xl flex items-center justify-between shadow-xl border border-[#D4AF37]/40 pointer-events-auto transition-all duration-300 gpu-layer"
        >
          <button 
            type="button"
            id="ribbon-book-btn" 
            onClick={() => openBookingModal('Chauffeur Dispatch')}
            className="flex items-center gap-2 bg-[#D4AF37] hover:bg-[#c49f2b] text-[#1a0307] px-4 py-1.5 rounded-full text-xs font-serif font-black uppercase tracking-wider transition-transform hover:scale-105 active:scale-95 cursor-pointer"
            style={{ fontFamily: '"Cinzel", "Playfair Display", Georgia, serif' }}
          >
            <Key className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Book Chauffeur</span>
          </button>

          <div 
            className="flex items-center gap-2 text-xs sm:text-sm font-serif font-bold tracking-widest uppercase text-[#F8F4EB]"
            style={{ fontFamily: '"Cinzel", "Playfair Display", Georgia, serif' }}
          >
            <Globe className="w-4 h-4 text-[#D4AF37]" />
            <span>Wayora &bull; Royal Chauffeur Maison</span>
          </div>

          <div className="hidden md:flex items-center gap-2 text-[10px] font-mono tracking-widest uppercase text-[#D4AF37]">
            <Shield className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Bespoke Private Transit</span>
          </div>
        </div>

        {/* Scroll Progress Indicator */}
        <div className="absolute bottom-0 inset-x-0 h-1 bg-[#1a0307]/10 z-40">
          <div 
            ref={scrollProgressLineRef} 
            id="scroll-progress-line" 
            className="h-full bg-gradient-to-r from-[#800020] to-[#D4AF37] w-0 transition-all duration-75"
          />
        </div>

        {/* Soft bottom blend to seamlessly exit into next section without black or blank jumps */}
        <div 
          ref={bottomExitBlendRef}
          className="absolute bottom-0 inset-x-0 h-32 sm:h-44 bg-gradient-to-t from-slate-50 via-slate-50/80 to-transparent pointer-events-none z-35"
          style={{ opacity: 0 }}
        />

      </div>
    </div>
  );
};
