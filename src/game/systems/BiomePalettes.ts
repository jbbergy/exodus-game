import type { BiomeId } from '@/domain/types';

export type BackgroundStyle = 'mountains' | 'forest' | 'ruins';
export type ForegroundShape = 'block' | 'roof' | 'spike' | 'round';

/** A jagged skyline is built from a chain of ridge panels strung through these peaks/valleys
 * (see DecorPlacement.mountainPanelsForCycle) — using a hand-authored, irregular sequence (not
 * evenly spaced, not symmetric) is what keeps it from reading as a repeating "bump" pattern. */
export interface MountainPeak {
  xFraction: number;
  /** Fraction of viewport height, measured up from the ground line. */
  heightFraction: number;
}

export interface ForestTree {
  xFraction: number;
  widthFraction: number;
  heightFraction: number;
  color: number;
}

export interface RuinPiece {
  xFraction: number;
  widthFraction: number;
  heightFraction: number;
}

export interface ForegroundElement {
  /** Fraction of BG_TILE_WIDTH — where the element sits within one repeat period of the streamed
   * decor (see DecorPlacement.periodWorld). Kept sparse (2-3 per period) so a tall one only
   * briefly covers the convoy as it scrolls past, the way a large house would. */
  xFraction: number;
  /** Fraction of the live viewport width (not BG_TILE_WIDTH — see DecorStreamManager), so e.g. a
   * house at 0.3 always reads as ~30% of the screen wide regardless of window size. */
  widthFraction: number;
  /** Fraction of viewport height, measured up from the ground line. */
  heightFraction: number;
  shape: ForegroundShape;
  color: number;
  /** Fraction of *eligible* cycles this element spawns in (deterministic roll, see
   * DecorPlacement.foregroundElementsInRange) — defaults to 1 (every cycle, always eligible)
   * when omitted. Any value below 1 marks the element "large": it only becomes eligible on every
   * LARGE_ELEMENT_MIN_GAP_CYCLES-th cycle, and at most one large element wins that cycle even if
   * a biome defines several — together that guarantees two large elements (houses, tall spires)
   * can never land back to back and gang up on the convoy's view/clicks. Small ones can stay
   * frequent (omit `frequency` entirely). */
  frequency?: number;
}

export interface BiomePalette {
  id: BiomeId;
  /** Flat sky color — crossfaded directly between biomes, no gradient/texture needed. */
  skyColor: number;
  backgroundBase: number;
  backgroundBump: number;
  backgroundStyle: BackgroundStyle;
  backgroundPeaks?: MountainPeak[];
  backgroundTrees?: ForestTree[];
  backgroundRuins?: RuinPiece[];
  /** Derived from backgroundBase/Bump so the ground band reads as the same terrain, just closer. */
  groundBase: number;
  groundBump: number;
  foregroundElements: ForegroundElement[];
}

export const BIOME_PALETTES: Record<BiomeId, BiomePalette> = {
  origin: {
    id: 'origin',
    skyColor: 0xe3cfa6,
    backgroundBase: 0x5c7a4a,
    backgroundBump: 0x4a6a3a,
    backgroundStyle: 'forest',
    backgroundTrees: [
      { xFraction: 0.03, widthFraction: 0.09, heightFraction: 0.14, color: 0x4a6a3a },
      { xFraction: 0.08, widthFraction: 0.11, heightFraction: 0.19, color: 0x5c7a4a },
      { xFraction: 0.14, widthFraction: 0.08, heightFraction: 0.1, color: 0x4a6a3a },
      { xFraction: 0.3, widthFraction: 0.1, heightFraction: 0.16, color: 0x5c7a4a },
      { xFraction: 0.35, widthFraction: 0.07, heightFraction: 0.11, color: 0x4a6a3a },
      { xFraction: 0.55, widthFraction: 0.12, heightFraction: 0.21, color: 0x4a6a3a },
      { xFraction: 0.6, widthFraction: 0.08, heightFraction: 0.13, color: 0x5c7a4a },
      { xFraction: 0.78, widthFraction: 0.07, heightFraction: 0.09, color: 0x4a6a3a },
      { xFraction: 0.85, widthFraction: 0.1, heightFraction: 0.17, color: 0x5c7a4a },
      { xFraction: 0.93, widthFraction: 0.08, heightFraction: 0.12, color: 0x4a6a3a },
    ],
    groundBase: 0xd8bd90,
    groundBump: 0xc7aa7a,
    foregroundElements: [
      { xFraction: 0.12, widthFraction: 0.06, heightFraction: 0.05, shape: 'round', color: 0x8a7550 },
      { xFraction: 0.48, widthFraction: 0.13, heightFraction: 0.22, shape: 'round', color: 0x796348 },
      { xFraction: 0.78, widthFraction: 0.17, heightFraction: 0.58, shape: 'spike', color: 0x4a6a3a, frequency: 0.3 },
    ],
  },
  'desert-sand': {
    id: 'desert-sand',
    skyColor: 0xf7dcb8,
    backgroundBase: 0xb87a4a,
    backgroundBump: 0x9c6238,
    backgroundStyle: 'mountains',
    backgroundPeaks: [
      { xFraction: 0.05, heightFraction: 0.14 },
      { xFraction: 0.13, heightFraction: 0.32 },
      { xFraction: 0.2, heightFraction: 0.19 },
      { xFraction: 0.3, heightFraction: 0.42 },
      { xFraction: 0.38, heightFraction: 0.22 },
      { xFraction: 0.48, heightFraction: 0.36 },
      { xFraction: 0.58, heightFraction: 0.17 },
      { xFraction: 0.68, heightFraction: 0.47 },
      { xFraction: 0.78, heightFraction: 0.24 },
      { xFraction: 0.88, heightFraction: 0.33 },
      { xFraction: 0.95, heightFraction: 0.15 },
    ],
    groundBase: 0xe8c294,
    groundBump: 0xdba872,
    foregroundElements: [
      { xFraction: 0.18, widthFraction: 0.05, heightFraction: 0.06, shape: 'spike', color: 0x5f7a4a },
      { xFraction: 0.5, widthFraction: 0.19, heightFraction: 0.62, shape: 'spike', color: 0x9c6238, frequency: 0.3 },
      { xFraction: 0.82, widthFraction: 0.08, heightFraction: 0.12, shape: 'round', color: 0xc98a4e },
    ],
  },
  'desert-ice': {
    id: 'desert-ice',
    skyColor: 0xdcecf2,
    backgroundBase: 0xaecfdc,
    backgroundBump: 0x92bccd,
    backgroundStyle: 'mountains',
    backgroundPeaks: [
      { xFraction: 0.04, heightFraction: 0.18 },
      { xFraction: 0.11, heightFraction: 0.4 },
      { xFraction: 0.19, heightFraction: 0.22 },
      { xFraction: 0.27, heightFraction: 0.48 },
      { xFraction: 0.36, heightFraction: 0.26 },
      { xFraction: 0.46, heightFraction: 0.44 },
      { xFraction: 0.56, heightFraction: 0.2 },
      { xFraction: 0.66, heightFraction: 0.52 },
      { xFraction: 0.76, heightFraction: 0.28 },
      { xFraction: 0.86, heightFraction: 0.38 },
      { xFraction: 0.95, heightFraction: 0.17 },
    ],
    groundBase: 0xeaf4f8,
    groundBump: 0xd3e6ee,
    foregroundElements: [
      { xFraction: 0.22, widthFraction: 0.05, heightFraction: 0.07, shape: 'spike', color: 0x9cc9d8 },
      { xFraction: 0.55, widthFraction: 0.24, heightFraction: 0.62, shape: 'block', color: 0xb8d9e3, frequency: 0.25 },
      { xFraction: 0.87, widthFraction: 0.06, heightFraction: 0.1, shape: 'round', color: 0xdcf0f7 },
    ],
  },
  'ravaged-plain': {
    id: 'ravaged-plain',
    skyColor: 0xcac6b4,
    backgroundBase: 0x8b8a6d,
    backgroundBump: 0x6e6d54,
    backgroundStyle: 'forest',
    backgroundTrees: [
      { xFraction: 0.05, widthFraction: 0.04, heightFraction: 0.1, color: 0x6e6d54 },
      { xFraction: 0.22, widthFraction: 0.05, heightFraction: 0.16, color: 0x5a5942 },
      { xFraction: 0.24, widthFraction: 0.03, heightFraction: 0.07, color: 0x6e6d54 },
      { xFraction: 0.5, widthFraction: 0.04, heightFraction: 0.06, color: 0x6e6d54 },
      { xFraction: 0.68, widthFraction: 0.05, heightFraction: 0.14, color: 0x5a5942 },
      { xFraction: 0.88, widthFraction: 0.04, heightFraction: 0.08, color: 0x6e6d54 },
    ],
    groundBase: 0xaba98c,
    groundBump: 0x94926f,
    foregroundElements: [
      { xFraction: 0.2, widthFraction: 0.06, heightFraction: 0.04, shape: 'round', color: 0x6e6b52 },
      { xFraction: 0.58, widthFraction: 0.15, heightFraction: 0.45, shape: 'spike', color: 0x4f4d3a, frequency: 0.3 },
      { xFraction: 0.85, widthFraction: 0.07, heightFraction: 0.06, shape: 'round', color: 0x6e6b52 },
    ],
  },
  'abandoned-village': {
    id: 'abandoned-village',
    skyColor: 0xbeaf9c,
    backgroundBase: 0x8a7d6e,
    backgroundBump: 0x6e6255,
    backgroundStyle: 'ruins',
    backgroundRuins: [
      { xFraction: 0.04, widthFraction: 0.035, heightFraction: 0.14 },
      { xFraction: 0.1, widthFraction: 0.05, heightFraction: 0.3 },
      { xFraction: 0.22, widthFraction: 0.025, heightFraction: 0.09 },
      { xFraction: 0.35, widthFraction: 0.045, heightFraction: 0.22 },
      { xFraction: 0.48, widthFraction: 0.06, heightFraction: 0.36 },
      { xFraction: 0.6, widthFraction: 0.03, heightFraction: 0.15 },
      { xFraction: 0.72, widthFraction: 0.042, heightFraction: 0.26 },
      { xFraction: 0.85, widthFraction: 0.035, heightFraction: 0.11 },
      { xFraction: 0.92, widthFraction: 0.05, heightFraction: 0.2 },
    ],
    groundBase: 0x9c8f7d,
    groundBump: 0x7c6f5e,
    foregroundElements: [
      { xFraction: 0.1, widthFraction: 0.1, heightFraction: 0.07, shape: 'block', color: 0x5a4f42 },
      { xFraction: 0.45, widthFraction: 0.32, heightFraction: 0.65, shape: 'roof', color: 0x6e5c46, frequency: 0.2 },
      { xFraction: 0.78, widthFraction: 0.16, heightFraction: 0.22, shape: 'block', color: 0x71614c, frequency: 0.5 },
    ],
  },
};
