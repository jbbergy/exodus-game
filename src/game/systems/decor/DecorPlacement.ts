import type { BiomeDefinition, BiomeSegment } from '@/domain/Biome';
import { BG_TILE_WIDTH } from '@/game/constants';
import { BIOME_PALETTES, type BiomePalette } from '@/game/systems/BiomePalettes';
import type {
  BackgroundDescriptor,
  ForegroundElementDescriptor,
  GroundBumpDescriptor,
  MountainPanelDescriptor,
} from '@/game/systems/decor/DecorTypes';

/** Real-world-distance span one "repeat" covers for a layer scrolling at `factor` — derived from
 * the old fixed 900px tile width so density/spacing matches what the game looked like before
 * decor became individually streamed objects (see world<->screen projection in
 * DecorStreamManager: a layer with a smaller factor needs a proportionally larger world span to
 * fill one screen-width, exactly like a distant parallax layer should). */
export function periodWorld(factor: number): number {
  return BG_TILE_WIDTH / factor;
}

/** Deterministic pseudo-random in [0, 1) — no mutable RNG state, so any world-x range can be
 * queried directly (needed for a full rebuild on resize) without replaying generation history. */
function hash(seed: number): number {
  const s = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return s - Math.floor(s);
}

function jitter(seed: number, range: number): number {
  return (hash(seed) * 2 - 1) * range;
}

function darken(color: number, factor: number): number {
  const r = (color >> 16) & 0xff;
  const g = (color >> 8) & 0xff;
  const b = color & 0xff;
  return (Math.round(r * factor) << 16) | (Math.round(g * factor) << 8) | Math.round(b * factor);
}

const POSITION_JITTER_FRACTION = 0.015;
const SIZE_JITTER_FRACTION = 0.2;

// Large foreground elements (houses, tall spires) are only allowed to spawn on every Nth cycle
// (see foregroundElementsInRange) — this is what guarantees two of them can never land back to
// back and gang up on the convoy's view/clicks, on top of each one's own `frequency` roll.
const LARGE_ELEMENT_MIN_GAP_CYCLES = 4;

function inRange(x: number, start: number, end: number): boolean {
  return x >= start && x < end;
}

function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

interface BiomeRange {
  biome: BiomeDefinition;
  /** World x every repeat-cycle for this stretch is anchored against, so a biome's decor pattern
   * always starts fresh exactly at its own segment boundary — never at some unrelated global
   * origin that could otherwise land a cycle boundary (and therefore a style choice) in the
   * middle of a *different* biome. */
  phaseOrigin: number;
  from: number;
  to: number;
}

/** Splits [worldXStart, worldXEnd) into the biome segments it actually overlaps — a repeat
 * period can be wider than a short biome segment (e.g. the background layer's 3600-unit period
 * vs. a ~2000-unit segment), so a range handed to a generator must never be treated as "one
 * biome" without first being cut at every segment boundary it crosses; otherwise a single
 * repeat-cycle could straddle two biomes and get assigned only one of their styles. Extends past
 * the last defined segment with that same last biome, matching resolveBiomeAt's "convoy stays in
 * the last biome indefinitely" fallback. */
function biomeRangesOverlapping(segments: BiomeSegment[], worldXStart: number, worldXEnd: number): BiomeRange[] {
  const ranges: BiomeRange[] = [];

  for (const segment of segments) {
    const from = Math.max(worldXStart, segment.startDistance);
    const to = Math.min(worldXEnd, segment.endDistance);
    if (from < to) ranges.push({ biome: segment.biome, phaseOrigin: segment.startDistance, from, to });
  }

  const last = segments[segments.length - 1];
  const tailFrom = Math.max(worldXStart, last.endDistance);
  if (tailFrom < worldXEnd) {
    ranges.push({ biome: last.biome, phaseOrigin: last.startDistance, from: tailFrom, to: worldXEnd });
  }

  return ranges;
}

/** Background layer: for each biome stretch the requested range overlaps, dispatches to whichever
 * style that biome uses (mountains/forest/ruins) — this per-segment split is the entire "biome
 * transition" mechanism now: no crossfade, decor simply starts drawing from the next biome's pool
 * the instant construction crosses into its segment. */
export function backgroundElementsInRange(
  segments: BiomeSegment[],
  factor: number,
  worldXStart: number,
  worldXEnd: number,
): BackgroundDescriptor[] {
  const period = periodWorld(factor);
  const out: BackgroundDescriptor[] = [];

  for (const range of biomeRangesOverlapping(segments, worldXStart, worldXEnd)) {
    const palette = BIOME_PALETTES[range.biome.id];
    const firstCycle = Math.floor((range.from - range.phaseOrigin) / period) - 1;
    const lastCycle = Math.ceil((range.to - range.phaseOrigin) / period) + 1;

    for (let c = firstCycle; c <= lastCycle; c++) {
      const cycleStart = range.phaseOrigin + c * period;

      if (palette.backgroundStyle === 'forest') {
        (palette.backgroundTrees ?? []).forEach((tree, p) => {
          const seed = range.phaseOrigin + c * 977 + p * 37;
          const worldX = cycleStart + tree.xFraction * period + jitter(seed + 1, period * POSITION_JITTER_FRACTION);
          if (!inRange(worldX, range.from, range.to)) return;
          const sizeMul = 1 + jitter(seed + 2, SIZE_JITTER_FRACTION);
          out.push({
            kind: 'tree',
            worldX,
            widthFraction: tree.widthFraction * sizeMul,
            heightFraction: tree.heightFraction * sizeMul,
            color: tree.color,
          });
        });
      } else if (palette.backgroundStyle === 'ruins') {
        (palette.backgroundRuins ?? []).forEach((ruin, p) => {
          const seed = range.phaseOrigin + c * 977 + p * 37;
          const worldX = cycleStart + ruin.xFraction * period + jitter(seed + 1, period * POSITION_JITTER_FRACTION);
          if (!inRange(worldX, range.from, range.to)) return;
          const sizeMul = 1 + jitter(seed + 2, SIZE_JITTER_FRACTION);
          out.push({
            kind: 'ruin',
            worldX,
            widthFraction: ruin.widthFraction * sizeMul,
            heightFraction: ruin.heightFraction * sizeMul,
            color: palette.backgroundBump,
          });
        });
      } else {
        out.push(...mountainPanelsForCycle(palette, range.phaseOrigin, c, cycleStart, period, range.from, range.to));
      }
    }
  }

  return out;
}

/** One cycle's worth of ridge panels — anchored to ground level at both cycle boundaries (same
 * seam behavior the old single-polygon-per-tile draw had at each tile edge), with real peaks
 * jittered in between. Cycles are phase-anchored to the biome's own segment start (see
 * biomeRangesOverlapping), so a panel never straddles a biome boundary. */
function mountainPanelsForCycle(
  palette: BiomePalette,
  phaseOrigin: number,
  cycle: number,
  cycleStart: number,
  period: number,
  rangeFrom: number,
  rangeTo: number,
): MountainPanelDescriptor[] {
  const realPeaks = (palette.backgroundPeaks ?? []).map((peak, p) => {
    const seed = phaseOrigin + cycle * 977 + p * 37;
    return {
      worldX: cycleStart + peak.xFraction * period + jitter(seed + 1, period * (POSITION_JITTER_FRACTION * 0.7)),
      heightFraction: peak.heightFraction * (1 + jitter(seed + 2, SIZE_JITTER_FRACTION * 0.75)),
    };
  });

  const points = [{ worldX: cycleStart, heightFraction: 0 }, ...realPeaks, { worldX: cycleStart + period, heightFraction: 0 }];
  const panels: MountainPanelDescriptor[] = [];

  for (let k = 0; k < points.length - 1; k++) {
    const left = points[k];
    const right = points[k + 1];
    if (!inRange(right.worldX, rangeFrom, rangeTo)) continue;

    const shaded = k > 0 && k < points.length - 2 && (k - 1) % 2 === 0;
    panels.push({
      kind: 'mountainPanel',
      leftWorldX: left.worldX,
      leftHeightFraction: left.heightFraction,
      rightWorldX: right.worldX,
      rightHeightFraction: right.heightFraction,
      shaded,
      color: palette.backgroundBase,
      shadowColor: palette.backgroundBump,
    });
  }

  return panels;
}

const GROUND_BUMP_POOL = [
  { xFraction: 0.25, widthFraction: 0.3, heightFraction: 0.25, centerYFraction: 0.4 },
  { xFraction: 0.7, widthFraction: 0.35, heightFraction: 0.3, centerYFraction: 0.55 },
];

export function groundBumpsInRange(segments: BiomeSegment[], factor: number, worldXStart: number, worldXEnd: number): GroundBumpDescriptor[] {
  const period = periodWorld(factor);
  const out: GroundBumpDescriptor[] = [];

  for (const range of biomeRangesOverlapping(segments, worldXStart, worldXEnd)) {
    const palette = BIOME_PALETTES[range.biome.id];
    const firstCycle = Math.floor((range.from - range.phaseOrigin) / period) - 1;
    const lastCycle = Math.ceil((range.to - range.phaseOrigin) / period) + 1;

    for (let c = firstCycle; c <= lastCycle; c++) {
      const cycleStart = range.phaseOrigin + c * period;

      GROUND_BUMP_POOL.forEach((bump, p) => {
        const seed = range.phaseOrigin + c * 977 + p * 37;
        const worldX = cycleStart + bump.xFraction * period + jitter(seed + 1, period * POSITION_JITTER_FRACTION);
        if (!inRange(worldX, range.from, range.to)) return;
        const sizeMul = 1 + jitter(seed + 2, SIZE_JITTER_FRACTION);
        out.push({
          kind: 'groundBump',
          worldX,
          widthFraction: bump.widthFraction * sizeMul,
          heightFraction: bump.heightFraction * sizeMul,
          centerYFraction: bump.centerYFraction,
          color: palette.groundBump,
        });
      });
    }
  }

  return out;
}

export function foregroundElementsInRange(
  segments: BiomeSegment[],
  factor: number,
  worldXStart: number,
  worldXEnd: number,
): ForegroundElementDescriptor[] {
  const period = periodWorld(factor);
  const out: ForegroundElementDescriptor[] = [];

  for (const range of biomeRangesOverlapping(segments, worldXStart, worldXEnd)) {
    const palette = BIOME_PALETTES[range.biome.id];
    const firstCycle = Math.floor((range.from - range.phaseOrigin) / period) - 1;
    const lastCycle = Math.ceil((range.to - range.phaseOrigin) / period) + 1;

    for (let c = firstCycle; c <= lastCycle; c++) {
      const cycleStart = range.phaseOrigin + c * period;
      // Only every LARGE_ELEMENT_MIN_GAP_CYCLES-th cycle is even eligible to carry a large
      // element — combined with the single-winner pick below, this makes it structurally
      // impossible (not just unlikely) for two large elements to end up next to each other,
      // whether it's the same one repeating or two different ones in the same biome.
      const isLargeEligibleCycle = mod(c, LARGE_ELEMENT_MIN_GAP_CYCLES) === 0;
      const largeCandidates: { element: (typeof palette.foregroundElements)[number]; p: number }[] = [];

      palette.foregroundElements.forEach((element, p) => {
        if ((element.frequency ?? 1) < 1) {
          largeCandidates.push({ element, p });
          return;
        }
        const seed = range.phaseOrigin + c * 977 + p * 37;
        const worldX = cycleStart + element.xFraction * period + jitter(seed + 1, period * POSITION_JITTER_FRACTION);
        if (!inRange(worldX, range.from, range.to)) return;
        const sizeMul = 1 + jitter(seed + 2, SIZE_JITTER_FRACTION);
        out.push({
          kind: 'foreground',
          worldX,
          widthFraction: element.widthFraction * sizeMul,
          heightFraction: element.heightFraction * sizeMul,
          shape: element.shape,
          color: element.color,
        });
      });

      if (!isLargeEligibleCycle || largeCandidates.length === 0) continue;

      // Weighted single pick among this cycle's large candidates (own salt, distinct from the
      // per-element seeds below) — at most one large element per eligible cycle, never several
      // stacked together.
      const roll = hash(range.phaseOrigin + c * 977 + 991);
      let acc = 0;
      for (const { element, p } of largeCandidates) {
        acc += element.frequency ?? 0;
        if (roll >= acc) continue;

        const seed = range.phaseOrigin + c * 977 + p * 37;
        const worldX = cycleStart + element.xFraction * period + jitter(seed + 1, period * POSITION_JITTER_FRACTION);
        if (inRange(worldX, range.from, range.to)) {
          const sizeMul = 1 + jitter(seed + 2, SIZE_JITTER_FRACTION);
          out.push({
            kind: 'foreground',
            worldX,
            widthFraction: element.widthFraction * sizeMul,
            heightFraction: element.heightFraction * sizeMul,
            shape: element.shape,
            color: element.color,
          });
        }
        break;
      }
    }
  }

  return out;
}

export { darken };
