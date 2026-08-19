import Phaser from 'phaser';
import { BG_TILE_WIDTH, GROUND_Y_FRACTION, bgTextureKey } from '@/game/constants';
import { BIOME_PALETTES, type BiomePalette } from '@/game/systems/BiomePalettes';

/** Generates (or regenerates, on resize) the procedural background/ground/foreground textures
 * for every biome at the given height — callable multiple times with the same keys, since
 * RESIZE mode means the viewport height it needs to cover can change after boot. Width is fixed
 * (BG_TILE_WIDTH): TileSprite repeats it seamlessly along X regardless of the actual display
 * width. The sky isn't a texture at all — it's a flat color read directly off the palette by
 * ParallaxBackground, so it can crossfade between biomes with a plain color interpolation. */
export function generateBiomeBackgrounds(scene: Phaser.Scene, height: number): void {
  for (const palette of Object.values(BIOME_PALETTES)) {
    generateBackgroundLayer(scene, bgTextureKey(palette.id, 'background'), palette, height);
    generateGroundLayer(scene, bgTextureKey(palette.id, 'ground'), palette, height);
    generateForegroundLayer(scene, bgTextureKey(palette.id, 'foreground'), palette, height);
  }
}

function regenerateTexture(scene: Phaser.Scene, gfx: Phaser.GameObjects.Graphics, key: string, width: number, height: number): void {
  if (scene.textures.exists(key)) {
    scene.textures.remove(key);
  }
  gfx.generateTexture(key, width, height);
  gfx.destroy();
}

function darken(color: number, factor: number): number {
  const c = Phaser.Display.Color.ValueToColor(color);
  return Phaser.Display.Color.GetColor(c.red * factor, c.green * factor, c.blue * factor);
}

/** Transparent above the ground line so the sky shows through — only the silhouette itself
 * (mountains, forest, or ruins, depending on the biome) is opaque. */
function generateBackgroundLayer(scene: Phaser.Scene, key: string, palette: BiomePalette, height: number): void {
  const groundY = height * GROUND_Y_FRACTION;
  const gfx = scene.add.graphics();

  if (palette.backgroundStyle === 'mountains') {
    drawMountains(gfx, palette, groundY, height);
  } else if (palette.backgroundStyle === 'forest') {
    drawForest(gfx, palette, groundY, height);
  } else {
    drawRuins(gfx, palette, groundY, height);
  }

  regenerateTexture(scene, gfx, key, BG_TILE_WIDTH, height);
}

/** A single jagged polygon through a hand-authored, irregular sequence of peaks — deliberately
 * uneven (not evenly spaced or symmetric) so it reads as a real range rather than a repeating
 * bump pattern. A few darker shadow facets break up the flat fill further. */
function drawMountains(gfx: Phaser.GameObjects.Graphics, palette: BiomePalette, groundY: number, height: number): void {
  const peaks = palette.backgroundPeaks ?? [];
  const points = [
    { x: 0, y: height },
    { x: 0, y: groundY },
    ...peaks.map((p) => ({ x: BG_TILE_WIDTH * p.xFraction, y: groundY - height * p.heightFraction })),
    { x: BG_TILE_WIDTH, y: groundY },
    { x: BG_TILE_WIDTH, y: height },
  ];
  gfx.fillStyle(palette.backgroundBase, 1);
  gfx.fillPoints(points, true);

  gfx.fillStyle(palette.backgroundBump, 1);
  for (let i = 1; i < peaks.length; i += 2) {
    const prev = peaks[i - 1];
    const cur = peaks[i];
    const x1 = BG_TILE_WIDTH * prev.xFraction;
    const x2 = BG_TILE_WIDTH * cur.xFraction;
    gfx.fillTriangle(x1, groundY - height * prev.heightFraction, x2, groundY - height * cur.heightFraction, x2, groundY);
  }
}

/** Small triangle silhouettes planted along the ground line, clustered irregularly (uneven
 * spacing, gaps, alternating colors/heights) rather than laid out as an even row. */
function drawForest(gfx: Phaser.GameObjects.Graphics, palette: BiomePalette, groundY: number, height: number): void {
  for (const tree of palette.backgroundTrees ?? []) {
    const w = BG_TILE_WIDTH * tree.widthFraction;
    const h = height * tree.heightFraction;
    const x = BG_TILE_WIDTH * tree.xFraction;
    gfx.fillStyle(tree.color, 1);
    gfx.fillTriangle(x, groundY, x + w, groundY, x + w / 2, groundY - h);
  }
}

/** Broken, irregular-height wall/tower fragments — already inherently uneven since each piece's
 * width/height is hand-authored independently. */
function drawRuins(gfx: Phaser.GameObjects.Graphics, palette: BiomePalette, groundY: number, height: number): void {
  gfx.fillStyle(palette.backgroundBump, 1);
  for (const piece of palette.backgroundRuins ?? []) {
    const w = BG_TILE_WIDTH * piece.widthFraction;
    const h = height * piece.heightFraction;
    const x = BG_TILE_WIDTH * piece.xFraction;
    gfx.fillRect(x, groundY - h, w, h);
  }
}

/** Transparent above the ground line (`groundY` — the same line characters/cart stand on), so
 * the background layer's horizon shows through above it. A couple of low bumps break up the
 * flat band without implying any real elevation, keeping it visually "under" the background. */
function generateGroundLayer(scene: Phaser.Scene, key: string, palette: BiomePalette, height: number): void {
  const groundY = height * GROUND_Y_FRACTION;
  const bandHeight = height - groundY;

  const gfx = scene.add.graphics();
  gfx.fillStyle(palette.groundBase, 1);
  gfx.fillRect(0, groundY, BG_TILE_WIDTH, bandHeight);
  gfx.fillStyle(palette.groundBump, 1);
  gfx.fillEllipse(BG_TILE_WIDTH * 0.25, groundY + bandHeight * 0.4, BG_TILE_WIDTH * 0.3, bandHeight * 0.25);
  gfx.fillEllipse(BG_TILE_WIDTH * 0.7, groundY + bandHeight * 0.55, BG_TILE_WIDTH * 0.35, bandHeight * 0.3);

  regenerateTexture(scene, gfx, key, BG_TILE_WIDTH, height);
}

/** Fully transparent except for the elements themselves, each planted with its base exactly on
 * `groundY` — same line the characters/cart stand on — so a tall one (a hut, a rock spire)
 * visually stands right where the convoy is and can briefly cover it as it scrolls past. Kept
 * sparse (2-3 per tile) and mostly narrow so it never blocks clicking the convoy for long. */
function generateForegroundLayer(scene: Phaser.Scene, key: string, palette: BiomePalette, height: number): void {
  const groundY = height * GROUND_Y_FRACTION;
  const gfx = scene.add.graphics();

  for (const element of palette.foregroundElements) {
    const w = BG_TILE_WIDTH * element.widthFraction;
    const h = height * element.heightFraction;
    const x = BG_TILE_WIDTH * element.xFraction;
    const topY = groundY - h;

    gfx.fillStyle(element.color, 1);
    if (element.shape === 'block') {
      gfx.fillRect(x, topY, w, h);
    } else if (element.shape === 'roof') {
      // Wall in the element's own color, roof darkened a bit so the two read as separate
      // pieces (a hut silhouette) rather than one uniform spike.
      const wallHeight = h * 0.45;
      gfx.fillStyle(element.color, 1);
      gfx.fillRect(x, groundY - wallHeight, w, wallHeight);
      gfx.fillStyle(darken(element.color, 0.7), 1);
      gfx.fillTriangle(x - w * 0.18, groundY - wallHeight, x + w * 1.18, groundY - wallHeight, x + w / 2, topY);
    } else if (element.shape === 'spike') {
      gfx.fillTriangle(x, groundY, x + w, groundY, x + w / 2, topY);
    } else {
      gfx.fillEllipse(x + w / 2, groundY - h / 2, w, h);
    }
  }

  regenerateTexture(scene, gfx, key, BG_TILE_WIDTH, height);
}
