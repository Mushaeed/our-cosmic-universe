import { COSMIC_THEMES, type CosmicThemeId } from '../types';

export interface HeartCoordinate {
  x: number;
  y: number;
  z: number;
  isContour: boolean;
  color: string;
  size: number;
  baseAlpha: number;
  phase: number;
}

/**
 * Mathematically balanced parametric heart curve.
 * Corrects the elongated lower tip into a natural, proportional, rounded lower point
 * with graceful symmetrical upper lobes and a clearly defined center cleft.
 *
 * Bounds: Width ~ 32.0, Height ~ 20.0
 * Centered vertically around (0, 0).
 */
export function getParametricHeartPoint(t: number): { x: number; y: number } {
  const sinT = Math.sin(t);
  const cosT = Math.cos(t);

  // Classic lateral lobe expansion
  const x = 16.0 * Math.pow(sinT, 3);

  // Harmonic vertical curve
  const rawY = -(14.5 * cosT - 5.5 * Math.cos(2 * t) - 2.0 * Math.cos(3 * t) - 0.7 * Math.cos(4 * t));

  // The raw cleft at t=0 is at rawY = -6.3
  const cleftY = -6.3;
  let relY = rawY - cleftY;

  // Compress lower half (relY > 0) to round the lower point and shorten the tip
  if (relY > 0) {
    relY = relY * 0.56;
  }

  // Re-center vertically around (0, 0)
  const y = relY + cleftY + 2.1;

  return { x, y };
}

// Precomputed boundary polygon for uniform rejection sampling inside the heart
const N_POLY = 180;
const BOUNDARY_POLY: { x: number; y: number }[] = [];
for (let i = 0; i < N_POLY; i++) {
  const t = (i / N_POLY) * Math.PI * 2;
  BOUNDARY_POLY.push(getParametricHeartPoint(t));
}

function isInsideHeartPolygon(x: number, y: number): boolean {
  let inside = false;
  for (let i = 0, j = BOUNDARY_POLY.length - 1; i < BOUNDARY_POLY.length; j = i++) {
    const xi = BOUNDARY_POLY[i].x, yi = BOUNDARY_POLY[i].y;
    const xj = BOUNDARY_POLY[j].x, yj = BOUNDARY_POLY[j].y;
    const intersect = ((yi > y) !== (yj > y)) && (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

function pickParticleColor(themeId: CosmicThemeId = 'blue'): { color: string; isHighlight: boolean; isWhite: boolean } {
  const roll = Math.random();
  const theme = COSMIC_THEMES[themeId] || COSMIC_THEMES.blue;
  const stardust = theme.stardust;

  if (roll < 0.08) {
    // Rare pure-white diamond stardust
    return { color: '#ffffff', isHighlight: true, isWhite: true };
  } else if (roll < 0.40) {
    // Secondary stardust tone
    const color = stardust[1] || theme.secondary;
    return { color, isHighlight: true, isWhite: false };
  } else {
    // Primary saturated stardust tone
    const color = stardust[0] || theme.primary;
    return { color, isHighlight: false, isWhite: false };
  }
}

/**
 * Generates an organic, volumetric cloud of points shaping the glowing heart.
 * Uses uniform boundary-aware sampling to guarantee zero centerline clustering,
 * a crisp, luminous perimeter, and an organically filled interior in the chosen theme palette.
 */
export function generateHeartCoordinates(count: number, themeId: CosmicThemeId = 'blue'): HeartCoordinate[] {
  const points: HeartCoordinate[] = [];

  // 46% along crisp contour perimeter; 54% interior volume
  const contourRatio = 0.46;
  const contourCount = Math.floor(count * contourRatio);
  const interiorCount = count - contourCount;

  // 1. Generate Contour & Edge particles (uniform arc-length sampling for a dense, crisp silhouette)
  for (let i = 0; i < contourCount; i++) {
    const t = (i / contourCount) * Math.PI * 2;
    const base = getParametricHeartPoint(t);

    // Controlled micro-scatter along normal/tangent
    const scatter = (Math.random() - 0.5) * 0.40;
    const zScatter = (Math.random() - 0.5) * 1.6;

    const { color, isHighlight, isWhite } = pickParticleColor(themeId);

    let size = Math.random() * 0.5 + 0.95;
    if (isWhite) {
      size = Math.random() * 0.4 + 1.35;
    } else if (isHighlight) {
      size = Math.random() * 0.4 + 1.15;
    }

    points.push({
      x: base.x + scatter,
      y: base.y + scatter,
      z: zScatter,
      isContour: true,
      color,
      size,
      baseAlpha: isWhite ? 0.95 : isHighlight ? 0.88 : Math.random() * 0.25 + 0.65,
      phase: Math.random() * Math.PI * 2,
    });
  }

  // 2. Generate Volumetric Interior particles (uniform rejection sampling)
  let sampled = 0;
  let attempts = 0;
  const maxAttempts = interiorCount * 20;

  while (sampled < interiorCount && attempts < maxAttempts) {
    attempts++;
    const rx = (Math.random() * 2 - 1) * 16.0;
    const ry = (Math.random() * 2 - 1) * 10.5;

    if (!isInsideHeartPolygon(rx, ry)) continue;

    // Normalizing distance from center to estimate 3D pillow depth
    const normDist = Math.sqrt((rx / 16.0) ** 2 + (ry / 10.5) ** 2);
    const maxZ = Math.sqrt(Math.max(0, 1 - Math.min(1, normDist) ** 2)) * 5.0;
    const z = (Math.random() * 2 - 1) * maxZ;

    const { color, isHighlight, isWhite } = pickParticleColor(themeId);

    let size = Math.random() * 0.4 + 0.85;
    if (isWhite) {
      size = Math.random() * 0.4 + 1.25;
    } else if (isHighlight) {
      size = Math.random() * 0.4 + 1.05;
    }

    points.push({
      x: rx,
      y: ry,
      z,
      isContour: false,
      color,
      size,
      baseAlpha: isWhite ? 0.9 : isHighlight ? 0.8 : Math.random() * 0.3 + 0.5,
      phase: Math.random() * Math.PI * 2,
    });
    sampled++;
  }

  return points;
}
