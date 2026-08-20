import Phaser from 'phaser';
import { type BiomeSegment, resolveBiomeTransition } from '@/domain/Biome';
import type { BiomeId } from '@/domain/types';
import { BIOME_TRANSITION_DISTANCE } from '@/game/constants';
import { BIOME_PALETTES } from '@/game/systems/BiomePalettes';

const SKY_DEPTH = -30;
const GROUND_BAND_DEPTH = -10;

function interpolateColor(fromColor: number, toColor: number, progress: number): number {
  const from = Phaser.Display.Color.ValueToColor(fromColor);
  const to = Phaser.Display.Color.ValueToColor(toColor);
  return Phaser.Display.Color.Interpolate.ColorWithColor(from, to, 100, progress * 100).color;
}

/** The two flat-colored backdrops behind all streamed decor: the sky, and the solid ground-band
 * wash beneath the ground line that the streamed ground bumps (see DecorStreamManager) sit on
 * top of. Both stay simple enough to keep the old crossfade behavior — unlike individual decor
 * shapes, which now switch biome the instant construction crosses a segment boundary (see
 * DecorStreamManager/DecorPlacement), a flat color has no "shape" to construct, so smoothly
 * interpolating it over BIOME_TRANSITION_DISTANCE stays cheap and reads better than a hard snap.
 * Gameplay itself still snaps exactly at the boundary via Convoy.currentBiome() — this is purely
 * a visual cue, same as before. */
export class Backdrop {
  private readonly sky: Phaser.GameObjects.Rectangle;
  private readonly groundBand: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene, initialBiomeId: BiomeId, width: number, height: number, groundY: number) {
    const palette = BIOME_PALETTES[initialBiomeId];

    this.sky = scene.add.rectangle(0, 0, width, height, palette.skyColor);
    this.sky.setOrigin(0, 0);
    this.sky.setDepth(SKY_DEPTH);

    this.groundBand = scene.add.rectangle(0, groundY, width, height - groundY, palette.groundBase);
    this.groundBand.setOrigin(0, 0);
    this.groundBand.setDepth(GROUND_BAND_DEPTH);
  }

  update(distance: number, segments: BiomeSegment[]): void {
    const transition = resolveBiomeTransition(segments, distance, BIOME_TRANSITION_DISTANCE);
    this.applyTransition(transition.current.id, transition.next?.id ?? null, transition.progress);
  }

  resize(width: number, height: number, groundY: number, distance: number, segments: BiomeSegment[]): void {
    this.sky.setSize(width, height);
    this.groundBand.setPosition(0, groundY);
    this.groundBand.setSize(width, height - groundY);
    this.update(distance, segments);
  }

  private applyTransition(currentBiomeId: BiomeId, nextBiomeId: BiomeId | null, progress: number): void {
    const current = BIOME_PALETTES[currentBiomeId];
    if (!nextBiomeId) {
      this.sky.setFillStyle(current.skyColor);
      this.groundBand.setFillStyle(current.groundBase);
      return;
    }

    const next = BIOME_PALETTES[nextBiomeId];
    this.sky.setFillStyle(interpolateColor(current.skyColor, next.skyColor, progress));
    this.groundBand.setFillStyle(interpolateColor(current.groundBase, next.groundBase, progress));
  }
}
