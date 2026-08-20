import Phaser from 'phaser';
import type { BiomeSegment } from '@/domain/Biome';
import { BG_TILE_WIDTH } from '@/game/constants';
import { backgroundElementsInRange, darken, foregroundElementsInRange, groundBumpsInRange } from '@/game/systems/decor/DecorPlacement';
import type {
  BackgroundDescriptor,
  DecorLayerName,
  ForegroundElementDescriptor,
  GroundBumpDescriptor,
} from '@/game/systems/decor/DecorTypes';

// How far past each edge of the viewport decor is built/kept before spawning/despawning —
// generous enough that a slow frame never produces visible pop-in at the edge.
const LOOKAHEAD_MARGIN_PX = 400;
const DESPAWN_MARGIN_PX = 200;

interface LayerConfig {
  name: DecorLayerName;
  factor: number;
  depth: number;
  blocksInput: boolean;
}

// Ground must sit under characters/cart (depth 4-10ish) and above the background silhouette;
// foreground sits above them so a tall element (a hut, a rock spire) can visually cover the
// convoy while it scrolls past, and is the only layer that blocks clicks — a character genuinely
// hidden behind a foreground shape shouldn't be clickable through it, the way it visually reads.
const LAYER_CONFIGS: LayerConfig[] = [
  { name: 'background', factor: 0.25, depth: -20, blocksInput: false },
  { name: 'ground', factor: 1, depth: -9, blocksInput: false },
  { name: 'foreground', factor: 1.6, depth: 15, blocksInput: true },
];

function screenXAtWorld(worldX: number, cartPositionX: number, cartScreenX: number, factor: number): number {
  return cartScreenX + (worldX - cartPositionX) * factor;
}

function worldXAtScreen(screenX: number, cartPositionX: number, cartScreenX: number, factor: number): number {
  return cartPositionX + (screenX - cartScreenX) / factor;
}

interface DecorInstance {
  /** World x used to decide when this instance has fully scrolled off-screen to the left (and,
   * during generation, which requested range it fell into) — the trailing/rightmost edge of the
   * shape, since that's the last point of it to leave the viewport. */
  despawnAnchorWorldX: number;
  objects: Phaser.GameObjects.GameObject[];
  reproject(cartPositionX: number, cartScreenX: number): void;
  destroy(): void;
}

class LayerState {
  readonly instances: DecorInstance[] = [];
  frontierWorldX = 0;
}

/** Owns every individually streamed decor shape across all three layers (background silhouette,
 * ground band bumps, foreground elements): builds new ones ahead of the right edge, destroys
 * ones that have scrolled past the left edge, and repositions everything else each frame. Biome
 * changes need no special handling here — a shape's biome (and hence which pool/colors it draws
 * from) is resolved once, at the moment it's generated, from whichever biome segment its world
 * position falls into (see DecorPlacement) — that's the entire "transition": new shapes simply
 * start coming from the next biome's pool once construction crosses the boundary. */
export class DecorStreamManager {
  private readonly scene: Phaser.Scene;
  private readonly layers = new Map<DecorLayerName, LayerState>();
  private groundY: number;
  private height: number;

  constructor(
    scene: Phaser.Scene,
    segments: BiomeSegment[],
    cartPositionX: number,
    cartScreenX: number,
    groundY: number,
    width: number,
    height: number,
  ) {
    this.scene = scene;
    this.groundY = groundY;
    this.height = height;
    for (const config of LAYER_CONFIGS) this.layers.set(config.name, new LayerState());
    this.rebuildAll(segments, cartPositionX, cartScreenX, width);
  }

  update(cartPositionX: number, segments: BiomeSegment[], cartScreenX: number, width: number): void {
    for (const config of LAYER_CONFIGS) {
      const state = this.layers.get(config.name)!;
      this.spawnAhead(config, state, segments, cartPositionX, cartScreenX, width);
      this.despawnBehind(config, state, cartPositionX, cartScreenX);
      for (const instance of state.instances) instance.reproject(cartPositionX, cartScreenX);
    }
  }

  resize(width: number, height: number, cartPositionX: number, cartScreenX: number, groundY: number, segments: BiomeSegment[]): void {
    this.groundY = groundY;
    this.height = height;
    this.rebuildAll(segments, cartPositionX, cartScreenX, width);
  }

  destroy(): void {
    for (const state of this.layers.values()) {
      for (const instance of state.instances) instance.destroy();
      state.instances.length = 0;
    }
  }

  private rebuildAll(segments: BiomeSegment[], cartPositionX: number, cartScreenX: number, width: number): void {
    for (const config of LAYER_CONFIGS) {
      const state = this.layers.get(config.name)!;
      for (const instance of state.instances) instance.destroy();
      state.instances.length = 0;

      const backfillStart = worldXAtScreen(-DESPAWN_MARGIN_PX, cartPositionX, cartScreenX, config.factor);
      const aheadEnd = worldXAtScreen(width + LOOKAHEAD_MARGIN_PX, cartPositionX, cartScreenX, config.factor);
      state.frontierWorldX = backfillStart;
      this.spawnRange(config, state, segments, backfillStart, aheadEnd);
      for (const instance of state.instances) instance.reproject(cartPositionX, cartScreenX);
    }
  }

  private spawnAhead(
    config: LayerConfig,
    state: LayerState,
    segments: BiomeSegment[],
    cartPositionX: number,
    cartScreenX: number,
    width: number,
  ): void {
    const aheadEnd = worldXAtScreen(width + LOOKAHEAD_MARGIN_PX, cartPositionX, cartScreenX, config.factor);
    if (aheadEnd <= state.frontierWorldX) return;
    this.spawnRange(config, state, segments, state.frontierWorldX, aheadEnd);
  }

  private despawnBehind(config: LayerConfig, state: LayerState, cartPositionX: number, cartScreenX: number): void {
    while (state.instances.length > 0) {
      const front = state.instances[0];
      const screenX = screenXAtWorld(front.despawnAnchorWorldX, cartPositionX, cartScreenX, config.factor);
      if (screenX > -DESPAWN_MARGIN_PX) break;
      front.destroy();
      state.instances.shift();
    }
  }

  private spawnRange(config: LayerConfig, state: LayerState, segments: BiomeSegment[], start: number, end: number): void {
    if (config.name === 'background') {
      for (const descriptor of backgroundElementsInRange(segments, config.factor, start, end)) {
        state.instances.push(this.createBackgroundInstance(descriptor, config.factor, config.depth));
      }
    } else if (config.name === 'ground') {
      for (const descriptor of groundBumpsInRange(segments, config.factor, start, end)) {
        state.instances.push(this.createGroundBumpInstance(descriptor, config.factor, config.depth));
      }
    } else {
      for (const descriptor of foregroundElementsInRange(segments, config.factor, start, end)) {
        state.instances.push(this.createForegroundInstance(descriptor, config.factor, config.depth));
      }
    }
    state.frontierWorldX = end;
  }

  // -- Instance factories -----------------------------------------------------------------
  // Every shape's pixel geometry is computed once, here, using the groundY/height current at
  // spawn time — only its horizontal screen position is recomputed per frame (reproject), never
  // its size, matching the old TileSprite behavior where a texture's pixels never resized
  // mid-scroll. `widthFraction` is a fraction of BG_TILE_WIDTH (the same fixed 900px reference
  // the hand-authored BiomePalettes data always used), `heightFraction` a fraction of viewport
  // height — see BiomePalettes.ts.

  private createBackgroundInstance(descriptor: BackgroundDescriptor, factor: number, depth: number): DecorInstance {
    if (descriptor.kind === 'tree') {
      const w = BG_TILE_WIDTH * descriptor.widthFraction;
      const h = this.height * descriptor.heightFraction;
      const triangle = this.scene.add.triangle(0, 0, 0, this.groundY, w, this.groundY, w / 2, this.groundY - h, descriptor.color);
      triangle.setOrigin(0, 0);
      triangle.setDepth(depth);
      return this.singleAnchorInstance(descriptor.worldX, factor, [triangle]);
    }

    if (descriptor.kind === 'ruin') {
      const w = BG_TILE_WIDTH * descriptor.widthFraction;
      const h = this.height * descriptor.heightFraction;
      const rect = this.scene.add.rectangle(0, this.groundY - h, w, h, descriptor.color);
      rect.setOrigin(0, 0);
      rect.setDepth(depth);
      return this.singleAnchorInstance(descriptor.worldX, factor, [rect]);
    }

    return this.createMountainPanelInstance(descriptor, factor, depth);
  }

  private createMountainPanelInstance(
    descriptor: Extract<BackgroundDescriptor, { kind: 'mountainPanel' }>,
    factor: number,
    depth: number,
  ): DecorInstance {
    // Both endpoints scroll at the same layer factor, so their screen-space separation never
    // changes frame to frame — only the whole panel's position does. Bake it once instead of
    // recomputing every point every frame.
    const spanPx = (descriptor.rightWorldX - descriptor.leftWorldX) * factor;
    const leftY = this.groundY - this.height * descriptor.leftHeightFraction;
    const rightY = this.groundY - this.height * descriptor.rightHeightFraction;

    const objects: Phaser.GameObjects.GameObject[] = [];
    const polygon = this.scene.add.polygon(
      0,
      0,
      [0, leftY, spanPx, rightY, spanPx, this.groundY, 0, this.groundY],
      descriptor.color,
    );
    polygon.setOrigin(0, 0);
    polygon.setDepth(depth);
    objects.push(polygon);

    if (descriptor.shaded) {
      const shadow = this.scene.add.triangle(0, 0, 0, leftY, spanPx, rightY, spanPx, this.groundY, descriptor.shadowColor);
      shadow.setOrigin(0, 0);
      shadow.setDepth(depth + 0.1);
      objects.push(shadow);
    }

    return this.singleAnchorInstance(descriptor.leftWorldX, factor, objects, descriptor.rightWorldX);
  }

  private createGroundBumpInstance(descriptor: GroundBumpDescriptor, factor: number, depth: number): DecorInstance {
    const w = BG_TILE_WIDTH * descriptor.widthFraction;
    const bandHeight = this.height - this.groundY;
    const h = bandHeight * descriptor.heightFraction;
    const centerY = this.groundY + bandHeight * descriptor.centerYFraction;

    const ellipse = this.scene.add.ellipse(0, centerY, w, h, descriptor.color);
    ellipse.setDepth(depth);
    return this.singleAnchorInstance(descriptor.worldX, factor, [ellipse]);
  }

  /** Foreground is the only layer that blocks clicks (see LAYER_CONFIGS), so each shape gets a
   * hit area matching its own drawn geometry exactly — not just its bounding box — the same way
   * the old pixel-alpha hack ensured a click between two silhouettes fell through to the convoy
   * underneath instead of being swallowed by empty space. Rectangle's default `setInteractive()`
   * hit area already matches its bounds exactly; Triangle/Ellipse need an explicit local geom. */
  private createForegroundInstance(descriptor: ForegroundElementDescriptor, factor: number, depth: number): DecorInstance {
    const w = BG_TILE_WIDTH * descriptor.widthFraction;
    const h = this.height * descriptor.heightFraction;
    const topY = this.groundY - h;
    const objects: Phaser.GameObjects.GameObject[] = [];

    if (descriptor.shape === 'block') {
      const rect = this.scene.add.rectangle(0, topY, w, h, descriptor.color);
      rect.setOrigin(0, 0);
      rect.setInteractive();
      objects.push(rect);
    } else if (descriptor.shape === 'spike') {
      const triangle = this.scene.add.triangle(0, 0, 0, this.groundY, w, this.groundY, w / 2, topY, descriptor.color);
      triangle.setOrigin(0, 0);
      triangle.setInteractive(new Phaser.Geom.Triangle(0, this.groundY, w, this.groundY, w / 2, topY), Phaser.Geom.Triangle.Contains);
      objects.push(triangle);
    } else if (descriptor.shape === 'round') {
      const ellipse = this.scene.add.ellipse(w / 2, this.groundY - h / 2, w, h, descriptor.color);
      ellipse.setInteractive(new Phaser.Geom.Ellipse(w / 2, h / 2, w, h), Phaser.Geom.Ellipse.Contains);
      objects.push(ellipse);
    } else {
      const wallHeight = h * 0.45;
      const wall = this.scene.add.rectangle(0, this.groundY - wallHeight, w, wallHeight, descriptor.color);
      wall.setOrigin(0, 0);
      wall.setInteractive();
      objects.push(wall);

      const roofX1 = -w * 0.18;
      const roofX2 = w * 1.18;
      const roof = this.scene.add.triangle(0, 0, roofX1, this.groundY - wallHeight, roofX2, this.groundY - wallHeight, w / 2, topY, darken(descriptor.color, 0.7));
      roof.setOrigin(0, 0);
      roof.setInteractive(
        new Phaser.Geom.Triangle(roofX1, this.groundY - wallHeight, roofX2, this.groundY - wallHeight, w / 2, topY),
        Phaser.Geom.Triangle.Contains,
      );
      objects.push(roof);
    }

    for (const obj of objects) (obj as Phaser.GameObjects.Rectangle).setDepth(depth);

    return this.singleAnchorInstance(descriptor.worldX, factor, objects);
  }

  /** Wraps a set of GameObjects that all translate together by the same screen-x delta each
   * frame, anchored to `anchorWorldX` for reprojection and `despawnAnchorWorldX` (defaults to the
   * same value) for the off-screen-left check. Each object's x/y *at the moment this is called*
   * (i.e. exactly as the factory constructed it) is captured as a fixed local offset from the
   * anchor — reproject only ever adds the anchor's current screen x on top of that, it never
   * assumes the offset is zero (needed for shapes like the foreground "round" ellipse, whose
   * center sits at `worldX + width/2`, not at `worldX` itself). */
  private singleAnchorInstance(
    anchorWorldX: number,
    factor: number,
    objects: Phaser.GameObjects.GameObject[],
    despawnAnchorWorldX = anchorWorldX,
  ): DecorInstance {
    const offsets = objects.map((obj) => {
      const shape = obj as Phaser.GameObjects.Rectangle;
      return { dx: shape.x, dy: shape.y };
    });

    return {
      despawnAnchorWorldX,
      objects,
      reproject: (cartPositionX, cartScreenX) => {
        const screenX = screenXAtWorld(anchorWorldX, cartPositionX, cartScreenX, factor);
        objects.forEach((obj, i) => {
          (obj as Phaser.GameObjects.Rectangle).setPosition(screenX + offsets[i].dx, offsets[i].dy);
        });
      },
      destroy: () => {
        for (const obj of objects) obj.destroy();
      },
    };
  }
}
