import Phaser from 'phaser';
import type { BiomeId } from '@/domain/types';
import { BG_TILE_WIDTH, bgTextureKey } from '@/game/constants';

type GroundShape = 'dune' | 'flat' | 'ruin';

interface BiomePalette {
  id: BiomeId;
  skyTop: number;
  skyBottom: number;
  sun: number;
  sunAlpha: number;
  midBase: number;
  midBump: number;
  nearBase: number;
  nearBump: number;
  shape: GroundShape;
}

const BIOME_PALETTES: BiomePalette[] = [
  {
    id: 'origin',
    skyTop: 0xcbb28f,
    skyBottom: 0xe0cba8,
    sun: 0xf0dcb0,
    sunAlpha: 0.75,
    midBase: 0xc9a97a,
    midBump: 0xbb9868,
    nearBase: 0xd8bd90,
    nearBump: 0xc7aa7a,
    shape: 'dune',
  },
  {
    id: 'desert-sand',
    skyTop: 0xf2c299,
    skyBottom: 0xf7dcb8,
    sun: 0xffe9b0,
    sunAlpha: 0.9,
    midBase: 0xd8a86b,
    midBump: 0xcf9a5c,
    nearBase: 0xe8c294,
    nearBump: 0xdba872,
    shape: 'dune',
  },
  {
    id: 'desert-ice',
    skyTop: 0xbfe0ef,
    skyBottom: 0xe8f4fa,
    sun: 0xffffff,
    sunAlpha: 0.8,
    midBase: 0xd8e8ef,
    midBump: 0xc3d9e3,
    nearBase: 0xeaf4f8,
    nearBump: 0xd3e6ee,
    shape: 'dune',
  },
  {
    id: 'ravaged-plain',
    skyTop: 0xb9b6a8,
    skyBottom: 0xd4d0c0,
    sun: 0xe4dfc9,
    sunAlpha: 0.6,
    midBase: 0x9c9a7e,
    midBump: 0x8b8a6d,
    nearBase: 0xaba98c,
    nearBump: 0x94926f,
    shape: 'flat',
  },
  {
    id: 'abandoned-village',
    skyTop: 0xa89e94,
    skyBottom: 0xc7bdae,
    sun: 0xd8cdb8,
    sunAlpha: 0.6,
    midBase: 0x8a7d6e,
    midBump: 0x6e6255,
    nearBase: 0x9c8f7d,
    nearBump: 0x7c6f5e,
    shape: 'ruin',
  },
];

/** Generates (or regenerates, on resize) the procedural sky/mid/near textures for every biome
 * at the given height — callable multiple times with the same keys, since RESIZE mode means the
 * viewport height it needs to cover can change after boot. Width is fixed (BG_TILE_WIDTH):
 * TileSprite repeats it seamlessly along X regardless of the actual display width. */
export function generateBiomeBackgrounds(scene: Phaser.Scene, height: number): void {
  for (const palette of BIOME_PALETTES) {
    generateSkyLayer(scene, palette, height);
    generateGroundLayer(scene, bgTextureKey(palette.id, 'mid'), palette.midBase, palette.midBump, 60, palette.shape, height);
    generateGroundLayer(scene, bgTextureKey(palette.id, 'near'), palette.nearBase, palette.nearBump, 30, palette.shape, height);
  }
}

function regenerateTexture(scene: Phaser.Scene, gfx: Phaser.GameObjects.Graphics, key: string, width: number, height: number): void {
  if (scene.textures.exists(key)) {
    scene.textures.remove(key);
  }
  gfx.generateTexture(key, width, height);
  gfx.destroy();
}

function generateSkyLayer(scene: Phaser.Scene, palette: BiomePalette, height: number): void {
  const gfx = scene.add.graphics();
  gfx.fillGradientStyle(palette.skyTop, palette.skyTop, palette.skyBottom, palette.skyBottom, 1);
  gfx.fillRect(0, 0, BG_TILE_WIDTH, height);
  gfx.fillStyle(palette.sun, palette.sunAlpha);
  gfx.fillCircle(BG_TILE_WIDTH * 0.75, height * 0.25, 36);
  regenerateTexture(scene, gfx, bgTextureKey(palette.id, 'far'), BG_TILE_WIDTH, height);
}

function generateGroundLayer(
  scene: Phaser.Scene,
  key: string,
  base: number,
  bump: number,
  bumpHeight: number,
  shape: GroundShape,
  height: number,
): void {
  const gfx = scene.add.graphics();
  gfx.fillStyle(base, 1);
  gfx.fillRect(0, 0, BG_TILE_WIDTH, height);
  gfx.fillStyle(bump, 1);

  if (shape === 'dune') {
    gfx.fillEllipse(BG_TILE_WIDTH * 0.2, height - bumpHeight * 0.4, BG_TILE_WIDTH * 0.5, bumpHeight);
    gfx.fillEllipse(BG_TILE_WIDTH * 0.7, height - bumpHeight * 0.3, BG_TILE_WIDTH * 0.6, bumpHeight * 1.2);
  } else if (shape === 'flat') {
    gfx.fillEllipse(BG_TILE_WIDTH * 0.3, height - bumpHeight * 0.15, BG_TILE_WIDTH * 0.7, bumpHeight * 0.4);
    gfx.fillEllipse(BG_TILE_WIDTH * 0.8, height - bumpHeight * 0.1, BG_TILE_WIDTH * 0.5, bumpHeight * 0.3);
  } else {
    gfx.fillRect(BG_TILE_WIDTH * 0.15, height - bumpHeight * 1.4, BG_TILE_WIDTH * 0.08, bumpHeight * 1.4);
    gfx.fillRect(BG_TILE_WIDTH * 0.28, height - bumpHeight * 0.9, BG_TILE_WIDTH * 0.1, bumpHeight * 0.9);
    gfx.fillRect(BG_TILE_WIDTH * 0.6, height - bumpHeight * 1.7, BG_TILE_WIDTH * 0.09, bumpHeight * 1.7);
    gfx.fillRect(BG_TILE_WIDTH * 0.78, height - bumpHeight * 1.1, BG_TILE_WIDTH * 0.07, bumpHeight * 1.1);
  }

  regenerateTexture(scene, gfx, key, BG_TILE_WIDTH, height);
}
