// 3D Volumetric Heart Point Cloud Generator using the Continuous Taubin 3D Solid
// Generates uniform volumetric stardust: crisp outer shell + luminous interior stellar core

export interface HeartParticleData3D {
  positions: Float32Array;
  colors: Float32Array;
  sizes: Float32Array;
  phases: Float32Array;
  layerTypes: Float32Array;
  originalPositions: Float32Array;
}

/**
 * Continuous 3D Taubin Heart Equation with Art-Directed Cleft Definition:
 * (x^2 + y^2 + 2.25*z^2 - 1)^3 - x^2 * y^3 - 0.1125 * z^2 * y^3 <= 0
 * Where X is horizontal width, Y is vertical height (top lobes peak at +Y, tip points to -Y),
 * and Z is volumetric depth (front/rear).
 */
export function isInsideHeart3D(x: number, y: number, z: number): { inside: boolean; val: number } {
  // Art-directed cleft enhancement: softly defines the iconic center heart cleft
  let modY = y;
  if (y > 0.3) {
    const cleftDip = Math.exp(-x * x * 10.0) * (y - 0.3) * 0.38;
    modY += cleftDip;
  }

  const a = x * x + modY * modY + 2.25 * z * z - 1.0;
  const val = a * a * a - x * x * modY * modY * modY - 0.1125 * z * z * modY * modY * modY;
  return { inside: val <= 0.0, val };
}

// Art-directed 3D color palette
const COLOR_ELECTRIC_CYAN: [number, number, number][] = [
  [0.0, 0.96, 1.0],   // Neon Cyan
  [0.0, 0.88, 1.0],   // Electric Cyan
  [0.0, 0.70, 1.0],   // Deep Sky Blue
  [0.0, 0.54, 1.0],   // Vivid Electric Blue
  [0.05, 0.44, 0.98], // Pure Electric Blue
  [0.08, 0.65, 0.96], // Luminous Azure
];

const COLOR_ICE_BLUE: [number, number, number][] = [
  [0.55, 0.85, 1.0], // Soft Ice Blue
  [0.72, 0.92, 1.0], // Frost Cyan
  [0.65, 0.95, 1.0], // Pale Ice Shimmer
  [0.80, 0.86, 1.0], // Celestial Ice
];

function pickColorRGB(): { rgb: [number, number, number]; isWhite: boolean } {
  const roll = Math.random();
  if (roll < 0.035) {
    // ~3.5% rare diamond stardust pure white
    return { rgb: [1.0, 1.0, 1.0], isWhite: true };
  } else if (roll < 0.18) {
    // ~14.5% ice-blue highlights
    const choice = COLOR_ICE_BLUE[Math.floor(Math.random() * COLOR_ICE_BLUE.length)];
    return { rgb: choice, isWhite: false };
  } else {
    // ~82% electric blue & neon cyan
    const choice = COLOR_ELECTRIC_CYAN[Math.floor(Math.random() * COLOR_ELECTRIC_CYAN.length)];
    return { rgb: choice, isWhite: false };
  }
}

/**
 * Generates true 3D volumetric heart point cloud with uniform organic distribution
 */
export function generate3DHeartParticles(count: number): HeartParticleData3D {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const phases = new Float32Array(count);
  const layerTypes = new Float32Array(count);
  const originalPositions = new Float32Array(count * 3);

  // 68% shell particles for a clean, luminous silhouette; 32% interior stellar volume
  const targetShell = Math.floor(count * 0.68);
  let shellCount = 0;
  let interiorCount = 0;
  let i = 0;

  // Scale to 3D world units
  const scaleX = 12.5;
  const scaleY = 11.2;
  const scaleZ = 7.6;
  const yOffset = -0.06; // Fine-tunes vertical center

  let attempts = 0;
  const maxAttempts = count * 30;

  while (i < count && attempts < maxAttempts) {
    attempts++;

    // Sample randomly within normalized Taubin bounding box
    const nx = (Math.random() * 2 - 1) * 1.35;
    const ny = (Math.random() * 2 - 1) * 1.35;
    const nz = (Math.random() * 2 - 1) * 0.75;

    const { inside, val } = isInsideHeart3D(nx, ny, nz);
    if (!inside) continue;

    // val <= 0 is inside. Near 0 (val > -0.16) is shell, deeper (val <= -0.16) is interior
    const isShell = val > -0.16;

    if (isShell && shellCount >= targetShell && interiorCount < (count - targetShell)) {
      if (Math.random() < 0.65) continue;
    }

    const idx3 = i * 3;

    // Convert to world space
    const wx = nx * scaleX + (Math.random() - 0.5) * 0.16;
    const wy = (ny + yOffset) * scaleY + (Math.random() - 0.5) * 0.16;
    const wz = nz * scaleZ + (Math.random() - 0.5) * 0.16;

    positions[idx3] = wx;
    positions[idx3 + 1] = wy;
    positions[idx3 + 2] = wz;

    originalPositions[idx3] = wx;
    originalPositions[idx3 + 1] = wy;
    originalPositions[idx3 + 2] = wz;

    // Pick color
    const { rgb, isWhite } = pickColorRGB();
    colors[idx3] = rgb[0];
    colors[idx3 + 1] = rgb[1];
    colors[idx3 + 2] = rgb[2];

    // Particle sizes
    let size = isShell ? Math.random() * 0.45 + 1.35 : Math.random() * 0.35 + 1.1;
    if (isWhite) {
      size = Math.random() * 0.5 + 1.9;
    }
    sizes[i] = size;

    phases[i] = Math.random() * Math.PI * 2;
    layerTypes[i] = isShell ? 0 : 1;

    if (isShell) shellCount++;
    else interiorCount++;
    i++;
  }

  return {
    positions,
    colors,
    sizes,
    phases,
    layerTypes,
    originalPositions,
  };
}
