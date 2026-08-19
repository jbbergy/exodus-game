import Phaser from 'phaser';
import { type BiomeSegment, resolveBiomeTransition } from '@/domain/Biome';
import type { BiomeId } from '@/domain/types';
import { BIOME_TRANSITION_DISTANCE, bgTextureKey, type BgLayer } from '@/game/constants';
import { BIOME_PALETTES } from '@/game/systems/BiomePalettes';

const SKY_DEPTH = -30;

// Ground must sit under characters/cart (depth 4-10ish, see CharacterSprite/Cart) and above
// background; foreground must sit above them so a tall element (a hut, a rock spire) can
// visually cover the convoy while it scrolls past, like the convoy passing behind it. Only
// foreground blocks clicks — a character/cart genuinely hidden behind a foreground silhouette
// shouldn't be clickable through it, the way it visually reads.
const LAYER_CONFIG: { name: BgLayer; factor: number; depth: number; blocksInput?: boolean }[] = [
  { name: 'background', factor: 0.25, depth: -20 },
  { name: 'ground', factor: 1, depth: -10 },
  { name: 'foreground', factor: 1.6, depth: 15, blocksInput: true },
];

/** One decor layer as a pair of TileSprites, both pinned at (0, 0) and always scrolling
 * continuously — `current` (the biome we're in) and `incoming` (the next one queued up during a
 * transition, revealed through a shared screen-space mask growing in from the right). Neither
 * sprite's position ever moves: the reveal is done entirely through the mask, so the only source
 * of on-screen motion is tilePositionX at its normal constant rate — sliding the sprites
 * themselves on top of that was what made a transition look like the scroll sped up. */
class TransitionLayer {
  private readonly name: BgLayer;
  private readonly factor: number;
  private readonly current: Phaser.GameObjects.TileSprite;
  private readonly incoming: Phaser.GameObjects.TileSprite;
  /** Screen x below which `incoming` is still hidden by the wipe mask — kept in sync so its
   * click-blocking hit test agrees with what's actually visible, not just what's opaque. */
  private incomingRevealMinX = Infinity;

  constructor(
    scene: Phaser.Scene,
    name: BgLayer,
    initialBiomeId: BiomeId,
    width: number,
    height: number,
    factor: number,
    depth: number,
    mask: Phaser.Display.Masks.GeometryMask,
    blocksInput: boolean,
  ) {
    this.name = name;
    this.factor = factor;
    this.current = TransitionLayer.makeSprite(scene, bgTextureKey(initialBiomeId, name), width, height, depth);
    this.incoming = TransitionLayer.makeSprite(scene, bgTextureKey(initialBiomeId, name), width, height, depth + 1);
    this.incoming.setMask(mask);
    this.incoming.setVisible(false);

    if (blocksInput) {
      this.makeAlphaBlocking(scene, this.current, () => 0);
      this.makeAlphaBlocking(scene, this.incoming, () => this.incomingRevealMinX);
    }
  }

  private static makeSprite(scene: Phaser.Scene, key: string, width: number, height: number, depth: number): Phaser.GameObjects.TileSprite {
    const sprite = scene.add.tileSprite(0, 0, width, height, key);
    sprite.setOrigin(0, 0);
    sprite.setDepth(depth);
    return sprite;
  }

  /** Only the drawn (opaque) pixels of the tile should intercept clicks — everywhere else a tap
   * must fall through to the convoy underneath. A TileSprite's default hit area is its full
   * rectangle, so this replaces it with a custom test that checks that pixel's alpha instead.
   * TileSprite composites its current, already-scrolled view into an internal canvas each frame
   * (see TileSprite#updateCanvas) and `gameObject.texture` always points at that canvas — so the
   * clicked local (x, y) can be read directly, no need to undo tilePositionX by hand. */
  private makeAlphaBlocking(scene: Phaser.Scene, sprite: Phaser.GameObjects.TileSprite, revealMinX: () => number): void {
    sprite.setInteractive({
      hitArea: new Phaser.Geom.Rectangle(0, 0, Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER),
      hitAreaCallback: (_hitArea: unknown, x: number, y: number, gameObject: Phaser.GameObjects.TileSprite) => {
        if (x < revealMinX()) return false;
        const alpha = scene.textures.getPixelAlpha(x, y, gameObject.texture.key, gameObject.frame.name);
        return !!alpha && alpha > 0;
      },
    });
  }

  scroll(distanceDelta: number): void {
    this.current.tilePositionX += distanceDelta * this.factor;
    this.incoming.tilePositionX += distanceDelta * this.factor;
  }

  apply(currentBiomeId: BiomeId, nextBiomeId: BiomeId | null, progress: number, width: number, height: number): void {
    this.current.setTexture(bgTextureKey(currentBiomeId, this.name));
    this.current.setSize(width, height);

    if (nextBiomeId) {
      this.incoming.setTexture(bgTextureKey(nextBiomeId, this.name));
      this.incoming.setSize(width, height);
      this.incoming.setVisible(progress > 0);
      this.incomingRevealMinX = width * (1 - progress);
    } else {
      this.incoming.setVisible(false);
      this.incomingRevealMinX = Infinity;
    }
  }
}

export class ParallaxBackground {
  private readonly sky: Phaser.GameObjects.Rectangle;
  private readonly layers: TransitionLayer[];
  private readonly wipeMaskShape: Phaser.GameObjects.Graphics;
  private width: number;
  private height: number;
  private lastCurrentId: BiomeId;
  private lastNextId: BiomeId | null = null;
  private lastProgress = 0;

  constructor(scene: Phaser.Scene, initialBiomeId: BiomeId, width: number, height: number) {
    this.width = width;
    this.height = height;
    this.lastCurrentId = initialBiomeId;

    this.sky = scene.add.rectangle(0, 0, width, height, BIOME_PALETTES[initialBiomeId].skyColor);
    this.sky.setOrigin(0, 0);
    this.sky.setDepth(SKY_DEPTH);

    // Not added to the display list — it's purely a mask source, never rendered on its own.
    this.wipeMaskShape = scene.make.graphics({}, false);
    const mask = this.wipeMaskShape.createGeometryMask();

    this.layers = LAYER_CONFIG.map(
      ({ name, factor, depth, blocksInput }) =>
        new TransitionLayer(scene, name, initialBiomeId, width, height, factor, depth, mask, blocksInput ?? false),
    );
  }

  /** Scrolls every layer and continuously re-evaluates the biome transition — the next biome's
   * decor is progressively unmasked from the right (the "arrives from the right" half), which
   * simultaneously covers more of the current biome, whose last sliver of visibility ends up
   * pinned against the left edge (the "leaves via the left" half) — purely a function of world
   * distance. Independent of gameplay's own biome-change timing, which still snaps exactly at
   * the segment boundary (see Convoy.currentBiome). */
  update(distanceDelta: number, distance: number, segments: BiomeSegment[]): void {
    for (const layer of this.layers) layer.scroll(distanceDelta);

    const transition = resolveBiomeTransition(segments, distance, BIOME_TRANSITION_DISTANCE);
    this.applyTransition(transition.current.id, transition.next?.id ?? null, transition.progress);
  }

  /** Viewport resized (Scale.RESIZE): re-lay out at the new size using the last known transition
   * state — no scroll, and the caller is expected to have already regenerated the biome textures
   * at the new height (see BackgroundTextures.generateBiomeBackgrounds). */
  resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.applyTransition(this.lastCurrentId, this.lastNextId, this.lastProgress);
  }

  private applyTransition(currentBiomeId: BiomeId, nextBiomeId: BiomeId | null, progress: number): void {
    this.lastCurrentId = currentBiomeId;
    this.lastNextId = nextBiomeId;
    this.lastProgress = progress;

    for (const layer of this.layers) {
      layer.apply(currentBiomeId, nextBiomeId, progress, this.width, this.height);
    }

    this.wipeMaskShape.clear();
    if (nextBiomeId && progress > 0) {
      this.wipeMaskShape.fillStyle(0xffffff);
      this.wipeMaskShape.fillRect(this.width * (1 - progress), 0, this.width * progress, this.height);
    }

    this.sky.setSize(this.width, this.height);
    this.sky.setFillStyle(this.skyColorFor(currentBiomeId, nextBiomeId, progress));
  }

  private skyColorFor(currentBiomeId: BiomeId, nextBiomeId: BiomeId | null, progress: number): number {
    const currentColor = BIOME_PALETTES[currentBiomeId].skyColor;
    if (!nextBiomeId) return currentColor;

    const from = Phaser.Display.Color.ValueToColor(currentColor);
    const to = Phaser.Display.Color.ValueToColor(BIOME_PALETTES[nextBiomeId].skyColor);
    return Phaser.Display.Color.Interpolate.ColorWithColor(from, to, 100, progress * 100).color;
  }
}
