import React, { useEffect, useRef } from 'react';

export interface FlyingBirdsProps {
  /** Optional custom CSS classes for the canvas container */
  className?: string;
  /** Number of birds in total across flocks and solo soarers */
  birdCount?: number;
  /** Maximum vertical coverage as a percentage of height (0.1 to 1.0) */
  skyCoverage?: number;
  /** Primary flight direction */
  primaryDirection?: 'right' | 'left' | 'mixed';
  /** Silhouetted color tone */
  colorTone?: 'natural' | 'warm-silhouette' | 'dusk';
  /** Mouse / scroll reactivity for subtle aerodynamic displacement */
  interactive?: boolean;
}

interface Bird {
  // Position in world
  x: number;
  y: number;
  z: number; // 0 (distant) to 1 (closer)

  // Velocity and heading
  vx: number;
  vy: number;
  targetVx: number;
  targetVy: number;
  heading: number;
  banking: number; // roll angle when turning

  // Flight dynamics
  mode: 'flapping' | 'gliding' | 'soaring';
  modeTimer: number;
  flapPhase: number;
  flapSpeed: number;
  wingAngle: number;
  prevWingAngle: number;
  glideWingTilt: number;

  // Physical traits
  wingSpan: number;
  bodyLength: number;
  bodyWidth: number;
  tailLength: number;
  soaringRadius?: number;
  soaringAngle?: number;
  soaringCenterX?: number;
  soaringCenterY?: number;

  // Flocking
  flockId: number;
  flockLeader: boolean;
  baseAltitude: number;
}

export const FlyingBirds: React.FC<FlyingBirdsProps> = ({
  className = '',
  birdCount = 18,
  skyCoverage = 0.62,
  primaryDirection = 'mixed',
  colorTone = 'natural',
  interactive = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000, vx: 0, vy: 0, lastX: 0, lastY: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.parentElement?.clientHeight || window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Mouse movement interaction
    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive || !canvas) return;
      const rect = canvas.getBoundingClientRect();
      const currentX = e.clientX - rect.left;
      const currentY = e.clientY - rect.top;
      mouseRef.current.vx = currentX - mouseRef.current.lastX;
      mouseRef.current.vy = currentY - mouseRef.current.lastY;
      mouseRef.current.x = currentX;
      mouseRef.current.y = currentY;
      mouseRef.current.lastX = currentX;
      mouseRef.current.lastY = currentY;
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Initialize Birds with realistic flocking and solitary soaring profiles
    const birds: Bird[] = [];

    // Create 3 natural groups:
    // Group 0: Migrating high-altitude V-formation (5-7 distant birds)
    // Group 1: Mid-altitude cruising flock (4-6 birds)
    // Group 2: Majestic solitary soarers (2-3 hawks/eagles gliding on thermals)
    // Group 3: Free roaming birds across sky

    const initBird = (
      flockId: number,
      isLeader: boolean,
      offsetX = 0,
      offsetY = 0,
      initialDirection = 1
    ): Bird => {
      const isSoloSoarer = flockId === 2;
      const isDistantFlock = flockId === 0;

      // Depth perception: z from 0.15 (very far) to 0.95 (mid-foreground)
      const z = isDistantFlock
        ? 0.18 + Math.random() * 0.22
        : isSoloSoarer
        ? 0.65 + Math.random() * 0.3
        : 0.35 + Math.random() * 0.45;

      const baseSpeed = (1.1 + z * 1.6) * initialDirection;
      const scale = 0.55 + z * 0.75;
      const wingSpan = (isSoloSoarer ? 26 : 18) * scale;
      const bodyLength = (isSoloSoarer ? 16 : 11) * scale;
      const bodyWidth = (isSoloSoarer ? 3.4 : 2.5) * scale;
      const tailLength = (isSoloSoarer ? 7 : 4.5) * scale;

      const maxSkyY = height * skyCoverage;
      const y = Math.max(30, Math.min(maxSkyY - 30, (height * 0.08) + Math.random() * (maxSkyY - 60) + offsetY));
      const x = (Math.random() * (width + 300) - 150) + offsetX;

      return {
        x,
        y,
        z,
        vx: baseSpeed,
        vy: (Math.random() - 0.5) * 0.3,
        targetVx: baseSpeed,
        targetVy: 0,
        heading: initialDirection > 0 ? 0 : Math.PI,
        banking: 0,
        mode: isSoloSoarer ? 'soaring' : Math.random() > 0.4 ? 'flapping' : 'gliding',
        modeTimer: Math.floor(Math.random() * 120),
        flapPhase: Math.random() * Math.PI * 2,
        flapSpeed: (0.16 + (1 - z) * 0.08 + Math.random() * 0.04) * (isSoloSoarer ? 0.75 : 1),
        wingAngle: 0,
        prevWingAngle: 0,
        glideWingTilt: (Math.random() - 0.5) * 0.08,
        wingSpan,
        bodyLength,
        bodyWidth,
        tailLength,
        soaringRadius: isSoloSoarer ? 120 + Math.random() * 100 : undefined,
        soaringAngle: isSoloSoarer ? Math.random() * Math.PI * 2 : undefined,
        soaringCenterX: isSoloSoarer ? x : undefined,
        soaringCenterY: isSoloSoarer ? y : undefined,
        flockId,
        flockLeader: isLeader,
        baseAltitude: y,
      };
    };

    // Build the flocks
    // 1. Distant Migratory V-Flock (heading mostly rightward into the palace view)
    const vCount = Math.min(7, Math.max(4, Math.floor(birdCount * 0.35)));
    for (let i = 0; i < vCount; i++) {
      const isLeader = i === 0;
      const side = i % 2 === 0 ? 1 : -1;
      const rank = Math.ceil(i / 2);
      const offsetX = -rank * 32 + (Math.random() - 0.5) * 8;
      const offsetY = rank * 16 * side + (Math.random() - 0.5) * 6;
      birds.push(initBird(0, isLeader, offsetX, offsetY, 1));
    }

    // 2. Mid-Distance Dynamic Flock (crossing naturally)
    const midCount = Math.min(6, Math.max(3, Math.floor(birdCount * 0.3)));
    const midDir = primaryDirection === 'left' ? -1 : primaryDirection === 'right' ? 1 : Math.random() > 0.4 ? 1 : -1;
    for (let i = 0; i < midCount; i++) {
      birds.push(initBird(1, i === 0, (Math.random() - 0.5) * 120, (Math.random() - 0.5) * 40, midDir));
    }

    // 3. Majestic Soarers (Hawks/Eagles circling gracefully on thermal drafts)
    const soarerCount = Math.min(3, Math.max(1, Math.floor(birdCount * 0.15)));
    for (let i = 0; i < soarerCount; i++) {
      birds.push(initBird(2, false, 0, 0, 1));
    }

    // 4. Remaining independent ambient gliders
    const remaining = birdCount - birds.length;
    for (let i = 0; i < remaining; i++) {
      const dir = primaryDirection === 'left' ? -1 : primaryDirection === 'right' ? 1 : Math.random() > 0.35 ? 1 : -1;
      birds.push(initBird(3, false, 0, 0, dir));
    }

    // Animation Loop
    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = Math.min(32, time - lastTime) / 16.666; // Normalized frame delta (~1.0 at 60fps)
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      const maxSkyY = height * skyCoverage;

      // Sort birds by depth (z) so distant birds are naturally occluded by nearer birds
      birds.sort((a, b) => a.z - b.z);

      for (let i = 0; i < birds.length; i++) {
        const bird = birds[i];

        // 1. Flight Mode State Machine (flapping vs gliding vs thermal soaring)
        bird.modeTimer -= dt;

        if (bird.mode === 'soaring') {
          // Soaring in large gentle circular thermal arcs
          if (bird.soaringAngle !== undefined && bird.soaringRadius !== undefined) {
            bird.soaringAngle += 0.008 * dt;
            if (bird.soaringCenterX !== undefined) bird.soaringCenterX += 0.35 * dt;
            if (bird.soaringCenterY !== undefined) bird.soaringCenterY += Math.sin(time * 0.0008) * 0.1 * dt;

            const targetX = bird.soaringCenterX! + Math.cos(bird.soaringAngle) * bird.soaringRadius;
            const targetY = bird.soaringCenterY! + Math.sin(bird.soaringAngle) * (bird.soaringRadius * 0.38);

            bird.vx += (targetX - bird.x) * 0.05 * dt;
            bird.vy += (targetY - bird.y) * 0.05 * dt;

            // Occasional wing flap to regain altitude in thermal
            if (bird.modeTimer <= 0) {
              if (Math.random() < 0.25) {
                bird.mode = 'flapping';
                bird.modeTimer = 20 + Math.random() * 25; // 3-4 flaps
              } else {
                bird.modeTimer = 80 + Math.random() * 120;
              }
            }
          }
        } else if (bird.mode === 'flapping') {
          bird.flapPhase += bird.flapSpeed * dt;
          bird.wingAngle = Math.sin(bird.flapPhase);

          // Downstroke gives slight upward lift and forward momentum
          if (bird.wingAngle > 0.2 && bird.prevWingAngle <= 0.2) {
            bird.vy -= 0.12 * bird.z;
          }

          if (bird.modeTimer <= 0) {
            // Transition to smooth glide
            bird.mode = 'gliding';
            bird.modeTimer = 60 + Math.random() * 140; // Glide for 1 to 2.5 seconds
            bird.glideWingTilt = (Math.random() - 0.5) * 0.06;
          }
        } else {
          // Gliding: wings held steadily in dihedral aerodynamic bow
          bird.wingAngle += (bird.glideWingTilt - bird.wingAngle) * 0.1 * dt;
          // Gentle descent or subtle thermal lift
          bird.vy += 0.015 * dt;

          if (bird.modeTimer <= 0) {
            // Resume flapping
            bird.mode = 'flapping';
            bird.modeTimer = 35 + Math.random() * 70; // 5-10 flaps
            bird.flapPhase = 0;
          }
        }

        bird.prevWingAngle = bird.wingAngle;

        // 2. Air resistance / damping and target velocity tracking
        bird.vx += (bird.targetVx - bird.vx) * 0.03 * dt;
        bird.vy += (bird.targetVy - bird.vy) * 0.03 * dt;

        // Base altitude return (keep birds flying in scenic sky band)
        const altitudeDiff = bird.baseAltitude - bird.y;
        bird.vy += altitudeDiff * 0.0006 * dt;

        // Mouse breeze disturbance
        if (interactive && mouseRef.current.x > 0) {
          const dx = bird.x - mouseRef.current.x;
          const dy = bird.y - mouseRef.current.y;
          const distSq = dx * dx + dy * dy;
          const influenceRadius = 140;
          if (distSq < influenceRadius * influenceRadius && distSq > 1) {
            const dist = Math.sqrt(distSq);
            const force = (1 - dist / influenceRadius) * 1.5;
            bird.vx += (dx / dist) * force * dt;
            bird.vy += (dy / dist) * force * dt;
            // Frighten into flapping
            if (bird.mode === 'gliding') {
              bird.mode = 'flapping';
              bird.modeTimer = 40;
            }
          }
        }

        // Apply position
        bird.x += bird.vx * dt;
        bird.y += bird.vy * dt;

        // Calculate heading and banking based on movement direction
        const currentSpeed = Math.hypot(bird.vx, bird.vy);
        if (currentSpeed > 0.1) {
          const targetHeading = Math.atan2(bird.vy, bird.vx);
          // Smooth heading transition
          let angleDiff = targetHeading - bird.heading;
          while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
          while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
          bird.heading += angleDiff * 0.08 * dt;

          // Banking (tilt into turns)
          const targetBanking = Math.max(-0.45, Math.min(0.45, angleDiff * 6.5));
          bird.banking += (targetBanking - bird.banking) * 0.1 * dt;
        }

        // Screen boundary wrapping (smooth re-entry with randomized altitude)
        const margin = 80;
        if (bird.vx > 0 && bird.x > width + margin) {
          bird.x = -margin;
          bird.y = Math.max(30, Math.min(maxSkyY - 30, height * 0.08 + Math.random() * (maxSkyY - 50)));
          bird.baseAltitude = bird.y;
          if (bird.flockId === 2) {
            bird.soaringCenterX = bird.x + 200;
            bird.soaringCenterY = bird.y;
          }
        } else if (bird.vx < 0 && bird.x < -margin) {
          bird.x = width + margin;
          bird.y = Math.max(30, Math.min(maxSkyY - 30, height * 0.08 + Math.random() * (maxSkyY - 50)));
          bird.baseAltitude = bird.y;
          if (bird.flockId === 2) {
            bird.soaringCenterX = bird.x - 200;
            bird.soaringCenterY = bird.y;
          }
        }

        // Vertical safety clamps
        if (bird.y < 20) {
          bird.y = 20;
          bird.vy = Math.abs(bird.vy) * 0.8;
        } else if (bird.y > maxSkyY) {
          bird.y = maxSkyY;
          bird.vy = -Math.abs(bird.vy) * 0.8;
        }

        // 3. DRAW REALISTIC BIRD SILHOUETTE
        ctx.save();
        ctx.translate(bird.x, bird.y);
        ctx.rotate(bird.heading);

        // Banking tilt (perspective roll)
        ctx.transform(1, 0, Math.sin(bird.banking) * 0.35, Math.cos(bird.banking), 0, 0);

        // Depth-based realistic shading and opacity
        let alpha: number;
        let fillStyle: string;

        if (colorTone === 'natural') {
          // Atmospheric haze for distant birds, crisp silhouette for closer ones
          alpha = 0.38 + bird.z * 0.58;
          // Subtle sky-ambient tint matching Charminar / palace sky
          const darkTone = Math.round(18 + (1 - bird.z) * 25);
          const slateBlue = Math.round(24 + (1 - bird.z) * 35);
          fillStyle = `rgba(${darkTone}, ${darkTone + 4}, ${slateBlue}, ${alpha.toFixed(2)})`;
        } else if (colorTone === 'warm-silhouette') {
          alpha = 0.42 + bird.z * 0.55;
          fillStyle = `rgba(38, 20, 24, ${alpha.toFixed(2)})`;
        } else {
          alpha = 0.4 + bird.z * 0.55;
          fillStyle = `rgba(20, 24, 33, ${alpha.toFixed(2)})`;
        }

        ctx.fillStyle = fillStyle;
        ctx.strokeStyle = fillStyle;

        // Wing articulation mathematics:
        // Downstroke: wing sweeps down with curved outer primary feathers flexing upward
        // Upstroke: elbow flexes upward while wingtip folds down-inward (reduced wind profile)
        const span = bird.wingSpan;
        const wingY_elbow = bird.wingAngle * (span * 0.38);
        // Phase lag on outer wingtip creates natural feather flex
        const wingY_tip = (bird.wingAngle * 0.85 + Math.sin(bird.flapPhase - 0.45) * 0.3) * (span * 0.52);

        // DRAW WINGS (Fluid aerodynamic Bezier polygon)
        ctx.beginPath();

        // 1. Left Wing (Top wing from side-perspective)
        ctx.moveTo(bird.bodyLength * 0.15, -bird.bodyWidth * 0.5); // Shoulder
        ctx.quadraticCurveTo(
          -span * 0.1,
          -span * 0.45 + wingY_elbow * 0.7,
          -span * 0.35,
          -span * 0.85 + wingY_tip
        ); // Wingtip leading edge
        ctx.quadraticCurveTo(
          -span * 0.48,
          -span * 0.4 + wingY_elbow * 0.5,
          -bird.bodyLength * 0.35,
          -bird.bodyWidth * 0.3
        ); // Trailing edge returning to body

        // 2. Right Wing (Bottom wing from side-perspective)
        ctx.lineTo(-bird.bodyLength * 0.35, bird.bodyWidth * 0.3);
        ctx.quadraticCurveTo(
          -span * 0.48,
          span * 0.4 - wingY_elbow * 0.5,
          -span * 0.35,
          span * 0.85 - wingY_tip
        ); // Wingtip
        ctx.quadraticCurveTo(
          -span * 0.1,
          span * 0.45 - wingY_elbow * 0.7,
          bird.bodyLength * 0.15,
          bird.bodyWidth * 0.5
        ); // Shoulder return

        ctx.closePath();
        ctx.fill();

        // DRAW BODY & HEAD (Aerodynamic spindle with tapered tail)
        ctx.beginPath();
        // Beak / head tip
        ctx.moveTo(bird.bodyLength * 0.55, 0);
        // Forehead and upper neck
        ctx.quadraticCurveTo(
          bird.bodyLength * 0.25,
          -bird.bodyWidth * 0.65,
          0,
          -bird.bodyWidth * 0.55
        );
        // Back and rump
        ctx.quadraticCurveTo(
          -bird.bodyLength * 0.3,
          -bird.bodyWidth * 0.45,
          -bird.bodyLength * 0.5,
          -bird.bodyWidth * 0.25
        );
        // Tail feathers (spread fan or wedge)
        ctx.lineTo(-bird.bodyLength * 0.5 - bird.tailLength, -bird.bodyWidth * 0.6);
        ctx.lineTo(-bird.bodyLength * 0.5 - bird.tailLength * 0.85, 0); // Tail notch
        ctx.lineTo(-bird.bodyLength * 0.5 - bird.tailLength, bird.bodyWidth * 0.6);
        ctx.lineTo(-bird.bodyLength * 0.5, bird.bodyWidth * 0.25);
        // Belly and chest
        ctx.quadraticCurveTo(
          -bird.bodyLength * 0.3,
          bird.bodyWidth * 0.45,
          0,
          bird.bodyWidth * 0.65
        );
        // Throat to beak
        ctx.quadraticCurveTo(
          bird.bodyLength * 0.25,
          bird.bodyWidth * 0.55,
          bird.bodyLength * 0.55,
          0
        );
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [birdCount, skyCoverage, primaryDirection, colorTone, interactive]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none select-none z-10 ${className}`}
      style={{ display: 'block' }}
      aria-hidden="true"
    />
  );
};
export default FlyingBirds;
