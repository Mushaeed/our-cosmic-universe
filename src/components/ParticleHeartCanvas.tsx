import React, { useEffect, useRef, useCallback, useState } from 'react';
import { generateHeartCoordinates, type HeartCoordinate } from '../utils/heartMath';
import { COSMIC_THEMES, type CosmicThemeId, type MiniHeart, type Particle } from '../types';
import { soundManager } from '../utils/audio';

interface ParticleHeartCanvasProps {
  onFormed?: () => void;
  interactive?: boolean;
  theme?: CosmicThemeId;
  active?: boolean;
}

interface GlowSprites {
  [color: string]: HTMLCanvasElement;
}

// Global persistent cache for pre-rendered theme sprites across swatch clicks
const themeSpriteCache = new Map<CosmicThemeId, GlowSprites>();
const themeHeartSpriteCache = new Map<CosmicThemeId, GlowSprites>();

// Pre-rendered unified particle sprite (both soft aura and bright star center)
const createUnifiedParticleSprite = (color: string, radius = 16): HTMLCanvasElement => {
  const c = document.createElement('canvas');
  c.width = radius * 2;
  c.height = radius * 2;
  const ctx = c.getContext('2d')!;

  // 1. Soft Outer Aura (Radial Gradient)
  const grad = ctx.createRadialGradient(radius, radius, 0, radius, radius, radius);
  grad.addColorStop(0, color);
  grad.addColorStop(0.3, color.startsWith('#') ? `${color}bb` : color);
  grad.addColorStop(0.65, color.startsWith('#') ? `${color}33` : 'rgba(0,180,255,0.2)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(radius, radius, radius, 0, Math.PI * 2);
  ctx.fill();

  // 2. Crisp Defined Core Center (Pinpoint star)
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(radius, radius, radius * 0.22, 0, Math.PI * 2);
  ctx.fill();

  return c;
};

// Pre-rendered 36x36 mini heart sprite (eliminates trigonometric loop per frame)
const createMiniHeartSprite = (color: string): HTMLCanvasElement => {
  const c = document.createElement('canvas');
  c.width = 36;
  c.height = 36;
  const ctx = c.getContext('2d')!;
  ctx.translate(18, 18);
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let t = 0; t < Math.PI * 2; t += 0.2) {
    const sinT = Math.sin(t);
    const x = 0.65 * 16 * Math.pow(sinT, 3);
    const y = -0.65 * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    if (t === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  return c;
};

const getOrInitSprites = (themeId: CosmicThemeId): GlowSprites => {
  if (themeSpriteCache.has(themeId)) {
    return themeSpriteCache.get(themeId)!;
  }
  const themeConfig = COSMIC_THEMES[themeId] || COSMIC_THEMES.blue;
  const colors = Array.from(new Set(['#ffffff', ...themeConfig.stardust, themeConfig.primary, themeConfig.secondary]));
  const sprites: GlowSprites = {};
  colors.forEach((c) => {
    sprites[c] = createUnifiedParticleSprite(c, 16);
  });
  themeSpriteCache.set(themeId, sprites);
  return sprites;
};

const getOrInitHeartSprites = (themeId: CosmicThemeId): GlowSprites => {
  if (themeHeartSpriteCache.has(themeId)) {
    return themeHeartSpriteCache.get(themeId)!;
  }
  const themeConfig = COSMIC_THEMES[themeId] || COSMIC_THEMES.blue;
  const colors = Array.from(new Set(['#ffffff', ...themeConfig.stardust, themeConfig.primary]));
  const sprites: GlowSprites = {};
  colors.forEach((c) => {
    sprites[c] = createMiniHeartSprite(c);
  });
  themeHeartSpriteCache.set(themeId, sprites);
  return sprites;
};

export const ParticleHeartCanvas: React.FC<ParticleHeartCanvasProps> = ({
  onFormed,
  interactive = true,
  theme = 'blue',
  active = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const textOverlayRef = useRef<HTMLDivElement | null>(null);

  // Reactive refs to avoid tearing down canvas on state changes
  const themeRef = useRef<CosmicThemeId>(theme);
  themeRef.current = theme;

  const onFormedRef = useRef(onFormed);
  onFormedRef.current = onFormed;

  const interactiveRef = useRef(interactive);
  interactiveRef.current = interactive;

  const activeRef = useRef(active);
  activeRef.current = active;

  const [centerPos, setCenterPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const stateRef = useRef<{
    particles: Particle[];
    burstSparks: Particle[];
    miniHearts: MiniHeart[];
    heartCoords: HeartCoordinate[];
    initialScatterCoords: { x: number; y: number }[];
    time: number;
    introTime: number;
    isAssembled: boolean;
    mouse: { x: number; y: number; targetX: number; targetY: number };
    dimensions: { width: number; height: number; dpr: number };
    sprites: GlowSprites;
    heartSprites: GlowSprites;
    hasNotifiedFormed: boolean;
    hasPlayedChime: boolean;
    reducedMotion: boolean;
  }>({
    particles: [],
    burstSparks: [],
    miniHearts: [],
    heartCoords: [],
    initialScatterCoords: [],
    time: 0,
    introTime: 0,
    isAssembled: false,
    mouse: { x: 0, y: 0, targetX: 0, targetY: 0 },
    dimensions: { width: 0, height: 0, dpr: 1 },
    sprites: {},
    heartSprites: {},
    hasNotifiedFormed: false,
    hasPlayedChime: false,
    reducedMotion: false,
  });

  // Floating mini particle hearts on tap
  const spawnMiniHearts = (x: number, y: number, count = 3) => {
    const hearts: MiniHeart[] = [];
    const themeConfig = COSMIC_THEMES[themeRef.current] || COSMIC_THEMES.blue;
    const colors = themeConfig.stardust;

    for (let i = 0; i < count; i++) {
      hearts.push({
        x: x + (Math.random() - 0.5) * 30,
        y: y + (Math.random() - 0.5) * 20,
        scale: Math.random() * 0.4 + 0.4,
        alpha: 0.8,
        rotation: (Math.random() - 0.5) * 0.3,
        vy: -(Math.random() * 1.0 + 0.8),
        vx: (Math.random() - 0.5) * 0.8,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 0,
        maxLife: Math.random() * 30 + 55,
      });
    }

    stateRef.current.miniHearts.push(...hearts);
  };

  // Tap-to-burst click interaction
  const triggerBurst = useCallback((clientX?: number, clientY?: number) => {
    const state = stateRef.current;
    const { width, height } = state.dimensions;
    if (width === 0 || height === 0) return;
    if (!state.isAssembled) return;

    const clickX = clientX !== undefined ? clientX : width / 2;
    const clickY = clientY !== undefined ? clientY : height * 0.38;

    // Canvas clicks strictly spawn bursts without altering audio playback or unmuting
    soundManager.playBurstSound();
    spawnMiniHearts(clickX, clickY, 3);

    const forceMultiplier = state.reducedMotion ? 0.3 : 1.0;

    // Restrained outward wave (smooth return with spring restoring force)
    for (let i = 0; i < state.particles.length; i++) {
      const p = state.particles[i];
      const dx = p.x - clickX;
      const dy = p.y - clickY;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;

      if (dist < 310) {
        const impulse = (1 - dist / 310) * 8.5 * forceMultiplier;
        const angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 0.3;
        const speed = (Math.random() * 4 + 2) * impulse;

        p.vx += Math.cos(angle) * speed;
        p.vy += Math.sin(angle) * speed;
        p.vz += (Math.random() - 0.5) * 4 * forceMultiplier;
      }
    }

    // Delicate sparkling theme diamond pinpricks
    const themeConfig = COSMIC_THEMES[themeRef.current] || COSMIC_THEMES.blue;
    const sparkColors = Array.from(new Set(['#ffffff', ...themeConfig.stardust, themeConfig.primary]));
    for (let i = 0; i < 22; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (Math.random() * 5 + 2) * forceMultiplier;
      state.burstSparks.push({
        targetX: 0,
        targetY: 0,
        targetZ: 0,
        x: clickX,
        y: clickY,
        z: 0,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        vz: (Math.random() - 0.5) * 2,
        size: Math.random() * 1.2 + 0.8,
        baseSize: 1.2,
        color: sparkColors[Math.floor(Math.random() * sparkColors.length)],
        alpha: 0.9,
        baseAlpha: 0.9,
        shimmerSpeed: 0.1,
        shimmerPhase: Math.random() * Math.PI * 2,
        type: 'burst',
        active: true,
        life: 0,
        maxLife: Math.random() * 25 + 20,
      });
    }
  }, []);

  // Asynchronous / Non-Blocking Theme Sprites:
  // When theme changes, do NOT synchronously generate 10+ offscreen canvases and gradients on the main thread during the click event.
  // Defer sprite generation using requestAnimationFrame or setTimeout(..., 0) so the color swatch UI updates with 0ms instant touch feedback.
  useEffect(() => {
    const applyColorsToParticles = (activeThemeId: CosmicThemeId) => {
      const themeConfig = COSMIC_THEMES[activeThemeId] || COSMIC_THEMES.blue;
      const colors = themeConfig.stardust;

      const particles = stateRef.current.particles;
      for (let i = 0; i < particles.length; i++) {
        if (particles[i].color !== '#ffffff') {
          particles[i].color = colors[i % colors.length];
        }
      }

      const heartCoords = stateRef.current.heartCoords;
      for (let i = 0; i < heartCoords.length; i++) {
        if (heartCoords[i].color !== '#ffffff') {
          heartCoords[i].color = colors[i % colors.length];
        }
      }
    };

    // If both sprites are already in cache, update in-place immediately in 0ms!
    if (themeSpriteCache.has(theme) && themeHeartSpriteCache.has(theme)) {
      stateRef.current.sprites = themeSpriteCache.get(theme)!;
      stateRef.current.heartSprites = themeHeartSpriteCache.get(theme)!;
      applyColorsToParticles(theme);
      return;
    }

    // Otherwise, defer the expensive offscreen canvas generation so the swatch UI paints immediately with 0ms touch response
    let animId: number;
    const timeoutId = setTimeout(() => {
      animId = requestAnimationFrame(() => {
        const sprites = getOrInitSprites(theme);
        const heartSprites = getOrInitHeartSprites(theme);

        if (themeRef.current === theme) {
          stateRef.current.sprites = sprites;
          stateRef.current.heartSprites = heartSprites;
          applyColorsToParticles(theme);
        }
      });
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      if (animId) cancelAnimationFrame(animId);
    };
  }, [theme]);

  // Main Canvas Render Lifecycle: Unbound from 'theme' to guarantee 0 FPS drops during swatch clicks
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    stateRef.current.reducedMotion = mediaQuery.matches;
    stateRef.current.sprites = getOrInitSprites(themeRef.current);
    stateRef.current.heartSprites = getOrInitHeartSprites(themeRef.current);

    const handleResize = () => {
      const container = containerRef.current;
      if (!container || !canvas) return;

      const rect = container.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      // Optimize Mobile DPR: Cap DPR to 1.5 on mobile (<640px) to prevent 4K buffer lag
      const isMobile = width < 640;
      const maxDpr = isMobile ? 1.5 : 2;
      const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      stateRef.current.dimensions = { width, height, dpr };

      // Drastically Cut Particle Count: 750 on mobile, 1300 on desktop
      const particleCount = isMobile ? 750 : 1300;

      const targetHeartWidth = isMobile
        ? Math.min(335, Math.max(275, width * 0.83))
        : Math.min(475, Math.max(405, Math.min(width * 0.42, (height - 230) * 0.82)));

      const reservedBottom = isMobile ? 220 : 250;
      const availableStageHeight = height - reservedBottom;
      const centerX = width * 0.5;
      const centerY = Math.max(targetHeartWidth * 0.35 + 30, availableStageHeight * 0.48) + (isMobile ? 36 : 0);

      setCenterPos({ x: centerX, y: centerY });

      const existingParticles = stateRef.current.particles;
      const isAlreadyAssembled = stateRef.current.isAssembled;

      if (isAlreadyAssembled && existingParticles.length > 0) {
        stateRef.current.heartCoords = generateHeartCoordinates(existingParticles.length, themeRef.current);
        const heartCoords = stateRef.current.heartCoords;
        for (let i = 0; i < existingParticles.length; i++) {
          existingParticles[i].targetX = heartCoords[i].x;
          existingParticles[i].targetY = heartCoords[i].y;
          existingParticles[i].targetZ = heartCoords[i].z;
        }
      } else {
        stateRef.current.heartCoords = generateHeartCoordinates(particleCount, themeRef.current);
        const heartCoords = stateRef.current.heartCoords;
        const particles: Particle[] = [];
        const initialScatter: { x: number; y: number }[] = [];

        for (let i = 0; i < heartCoords.length; i++) {
          const coord = heartCoords[i];

          // Phase A: Initial stardust positions drift in a gentle loose cloud around the center
          const angle = Math.random() * Math.PI * 2;
          const dist = Math.random() * (isMobile ? 140 : 220) + 40;
          const scatterX = Math.cos(angle) * dist;
          const scatterY = Math.sin(angle) * dist * 0.7;

          initialScatter.push({ x: scatterX, y: scatterY });

          particles.push({
            targetX: coord.x,
            targetY: coord.y,
            targetZ: coord.z,
            x: centerX + scatterX,
            y: centerY + scatterY,
            z: coord.z,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            vz: (Math.random() - 0.5) * 0.3,
            size: coord.size,
            baseSize: coord.size,
            color: coord.color,
            alpha: 0.1,
            baseAlpha: coord.baseAlpha,
            shimmerSpeed: Math.random() * 0.04 + 0.02,
            shimmerPhase: coord.phase,
            type: 'core',
            active: true,
          });
        }

        stateRef.current.particles = particles;
        stateRef.current.initialScatterCoords = initialScatter;
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const handlePointerMove = (e: PointerEvent) => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      stateRef.current.mouse.targetX = e.clientX - rect.left;
      stateRef.current.mouse.targetY = e.clientY - rect.top;
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (!interactiveRef.current) return;
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      triggerBurst(e.clientX - rect.left, e.clientY - rect.top);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    canvas.addEventListener('pointerdown', handlePointerDown);

    let animationFrameId: number;
    let lastTime = performance.now();
    let lastThrottleTime = 0;

    const render = (now: number) => {
      // 1. Mobile GPU Optimization: Throttle canvas animation loop to 15-20 FPS (~55ms)
      // while user is actively on the form screen (hidden behind card) to eliminate GPU overhead
      if (!activeRef.current) {
        if (now - lastThrottleTime < 55) {
          animationFrameId = requestAnimationFrame(render);
          return;
        }
        lastThrottleTime = now;
        lastTime = now;

        // Skip heavy particle spring physics, 3D trigonometry & draw calls while on form screen
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      const state = stateRef.current;
      const { width, height, dpr } = state.dimensions;

      if (width === 0 || height === 0) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      state.time += dt;
      state.introTime += dt;

      const time = state.time;
      const introTime = state.introTime;

      // Responsive center & commanding heart presence
      const isMobile = width < 640;
      const targetHeartWidth = isMobile
        ? Math.min(335, Math.max(275, width * 0.83))
        : Math.min(475, Math.max(405, Math.min(width * 0.42, (height - 230) * 0.82)));

      const reservedBottom = isMobile ? 220 : 250;
      const availableStageHeight = height - reservedBottom;
      const centerX = width * 0.5;
      const centerY = Math.max(targetHeartWidth * 0.35 + 30, availableStageHeight * 0.48) + (isMobile ? 36 : 0);

      const baseScale = targetHeartWidth / 32;

      // Smooth mouse follow
      state.mouse.x += (state.mouse.targetX - state.mouse.x) * 0.08;
      state.mouse.y += (state.mouse.targetY - state.mouse.y) * 0.08;

      // Animate HTML "I Love You" Overlay
      if (textOverlayRef.current) {
        if (introTime < 1.3) {
          const progress = Math.min(1.0, introTime / 0.5);
          const ease = 1 - Math.pow(1 - progress, 3);
          const scale = 0.85 + 0.15 * ease;
          const opacity = ease;
          textOverlayRef.current.style.opacity = `${opacity.toFixed(4)}`;
          textOverlayRef.current.style.transform = `translate(-50%, -50%) scale(${scale.toFixed(4)})`;
        } else if (introTime < 2.6) {
          const cp = (introTime - 1.3) / 1.3;
          const ease = cp * cp * (3 - 2 * cp);
          const scale = 1.0 - 0.78 * ease;
          const opacity = Math.max(0, 1.0 - 0.25 * ease);
          textOverlayRef.current.style.opacity = `${opacity.toFixed(4)}`;
          textOverlayRef.current.style.transform = `translate(-50%, -50%) scale(${scale.toFixed(4)})`;
        } else {
          textOverlayRef.current.style.opacity = '0';
          textOverlayRef.current.style.pointerEvents = 'none';
        }
      }

      // Check for completion of intro (heart is assembled at 3.4s)
      if (introTime >= 3.4 && !state.isAssembled) {
        state.isAssembled = true;
        if (!state.hasNotifiedFormed && onFormedRef.current) {
          state.hasNotifiedFormed = true;
          onFormedRef.current();
        }
      }

      // Play celestial chime right at transformation bloom (t = 2.6s) ONLY if in interactive viewer mode
      if (introTime >= 2.6 && !state.hasPlayedChime) {
        state.hasPlayedChime = true;
        if (interactiveRef.current) {
          soundManager.playBurstSound();
        }
      }

      // Heart idle breathing oscillation
      let breath = 0;
      if (state.isAssembled && !state.reducedMotion) {
        breath = Math.sin((time * Math.PI) / 2) * 0.015;
      }
      const activeScale = baseScale * (1.0 + breath);

      // Subtle 2D/3D perspective tilt
      const idleYaw = Math.sin(time * 0.4) * 0.04;
      const idlePitch = Math.cos(time * 0.35) * 0.03;
      const mouseYaw = ((state.mouse.x - width / 2) / width) * 0.22;
      const mousePitch = -((state.mouse.y - height / 2) / height) * 0.2;
      const rotY = idleYaw + mouseYaw;
      const rotX = idlePitch + mousePitch;

      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);

      ctx.save();
      ctx.scale(dpr, dpr);

      // Pass 1: Clear trail fade while preserving background transparency
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
      ctx.fillRect(0, 0, width, height);

      // Pass 2: Heart Particle Physics & Compression-to-Heart Interpolation
      const fov = 400;

      for (let i = 0; i < state.particles.length; i++) {
        const p = state.particles[i];
        const scatter = state.initialScatterCoords[i] || { x: 0, y: 0 };

        // 3D rotation of target coordinates
        const rx = p.targetX * cosY + p.targetZ * sinY;
        const rzTemp = -p.targetX * sinY + p.targetZ * cosY;
        const ry = p.targetY * cosX - rzTemp * sinX;
        const rz = p.targetY * sinX + rzTemp * cosX;

        const perspective = fov / (fov + rz);

        const microWobbleX = Math.sin(time * 1.5 + p.shimmerPhase) * 0.7;
        const microWobbleY = Math.cos(time * 1.3 + p.shimmerPhase * 1.2) * 0.7;

        // Final target position on screen
        const finalScreenX = centerX + (rx * activeScale + microWobbleX) * perspective;
        const finalScreenY = centerY + (ry * activeScale + microWobbleY) * perspective;

        let targetScreenX = finalScreenX;
        let targetScreenY = finalScreenY;

        if (introTime < 1.3) {
          // Phase A: Gentle stardust drifting around center
          const driftX = Math.sin(time * 0.8 + p.shimmerPhase) * 12;
          const driftY = Math.cos(time * 0.7 + p.shimmerPhase) * 10;
          targetScreenX = centerX + scatter.x + driftX;
          targetScreenY = centerY + scatter.y + driftY;

          p.x += (targetScreenX - p.x) * 0.08;
          p.y += (targetScreenY - p.y) * 0.08;
          p.alpha = p.baseAlpha * 0.55;
        } else if (introTime < 2.6) {
          // Phase B: Compression into radiant point
          const cp = (introTime - 1.3) / 1.3;
          const ease = cp * cp * (3 - 2 * cp);

          targetScreenX = centerX + scatter.x * (1 - ease);
          targetScreenY = centerY + scatter.y * (1 - ease);

          const dx = targetScreenX - p.x;
          const dy = targetScreenY - p.y;
          p.x += dx * 0.12;
          p.y += dy * 0.12;

          p.alpha = p.baseAlpha * (0.6 + 0.4 * ease);
        } else if (introTime < 3.8) {
          // Phase C: Transformation - bloom outward into the heart!
          const tp = (introTime - 2.6) / 1.2;
          const ease = 1 - Math.pow(1 - tp, 3);

          targetScreenX = centerX * (1 - ease) + finalScreenX * ease;
          targetScreenY = centerY * (1 - ease) + finalScreenY * ease;

          const dx = targetScreenX - p.x;
          const dy = targetScreenY - p.y;
          p.x += dx * 0.14;
          p.y += dy * 0.14;

          p.alpha = p.baseAlpha * Math.min(1.0, 0.7 + 0.3 * tp);
        } else {
          // Phase D: Assembled heart with damped spring physics
          const dx = targetScreenX - p.x;
          const dy = targetScreenY - p.y;

          p.vx += dx * 0.065;
          p.vy += dy * 0.065;

          p.vx *= 0.85;
          p.vy *= 0.85;

          p.x += p.vx;
          p.y += p.vy;

          const shimmer = Math.sin(time * 3 + p.shimmerPhase) * 0.18 + 0.82;
          p.alpha = p.baseAlpha * shimmer;
        }
      }

      // Pass 3: Single-Pass Unified Stardust Rendering (Replaces separate Pass 5 & Pass 6)
      // Eliminates 4,200+ distinct canvas operations per frame down to ~800 hardware sprite blits
      ctx.globalCompositeOperation = 'lighter';
      const defaultSprite = state.sprites[themeRef.current] || state.sprites['#ffffff'] || Object.values(state.sprites)[0];

      for (let i = 0; i < state.particles.length; i++) {
        const p = state.particles[i];
        if (p.alpha <= 0.05) continue;

        const sprite = state.sprites[p.color] || defaultSprite;
        if (sprite) {
          const size = p.size * 3.4;
          ctx.globalAlpha = p.alpha;
          ctx.drawImage(
            sprite,
            p.x - size / 2,
            p.y - size / 2,
            size,
            size
          );
        }
      }

      // Pass 4: Render Controlled Burst Sparks
      if (state.burstSparks.length > 0) {
        ctx.globalCompositeOperation = 'source-over';
        for (let i = state.burstSparks.length - 1; i >= 0; i--) {
          const s = state.burstSparks[i];
          s.x += s.vx;
          s.y += s.vy;
          s.vx *= 0.92;
          s.vy *= 0.92;
          s.life = (s.life || 0) + 1;

          const maxLife = s.maxLife || 30;
          const lifeProgress = s.life / maxLife;
          s.alpha = Math.max(0, (1 - lifeProgress) * s.baseAlpha);

          if (s.life >= maxLife) {
            state.burstSparks.splice(i, 1);
            continue;
          }

          ctx.fillStyle = s.color;
          ctx.globalAlpha = s.alpha * 0.9;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size * (1 - lifeProgress * 0.3), 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Pass 5: Render Floating Mini Hearts (Pre-rendered 36x36 Offscreen Sprites)
      if (state.miniHearts.length > 0) {
        ctx.globalCompositeOperation = 'source-over';
        const defaultHeartSprite = state.heartSprites['#ffffff'] || Object.values(state.heartSprites)[0];

        for (let i = state.miniHearts.length - 1; i >= 0; i--) {
          const h = state.miniHearts[i];
          h.x += h.vx;
          h.y += h.vy;
          h.vy *= 0.98;
          h.rotation += 0.015;
          h.life += 1;

          const lifeRatio = h.life / h.maxLife;
          h.alpha = Math.max(0, (1 - lifeRatio) * 0.75);

          if (h.life >= h.maxLife) {
            state.miniHearts.splice(i, 1);
            continue;
          }

          const heartSprite = state.heartSprites[h.color] || defaultHeartSprite;
          if (heartSprite) {
            ctx.save();
            ctx.translate(h.x, h.y);
            ctx.rotate(h.rotation);
            ctx.scale(h.scale, h.scale);
            ctx.globalAlpha = h.alpha;
            ctx.drawImage(heartSprite, -18, -18, 36, 36);
            ctx.restore();
          }
        }
      }

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [triggerBurst]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full z-[3] cursor-pointer overflow-hidden select-none bg-transparent"
    >
      <canvas ref={canvasRef} className="block w-full h-full" />

      {/* Cinematic "I Love You" Compression Typography Overlay */}
      <div
        ref={textOverlayRef}
        className="intro-love-overlay"
        style={{
          left: centerPos.x ? `${centerPos.x}px` : '50%',
          top: centerPos.y ? `${centerPos.y}px` : '38%',
          transform: 'translate(-50%, -50%) scale(0.85)',
          opacity: 0,
        }}
      >
        <span className="intro-love-text">
          I Love You
        </span>
      </div>
    </div>
  );
};

export default ParticleHeartCanvas;
