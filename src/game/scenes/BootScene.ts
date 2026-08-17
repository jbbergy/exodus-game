import Phaser from 'phaser';
import themeMusicUrl from '@/assets/audio/music/theme.mp3';
import type { BiomeId } from '@/domain/types';
import { AUDIO_KEYS, bgTextureKey, MUSIC_VOLUME, SCREEN_HEIGHT, STARTING_CHARACTERS, TEXTURE_KEYS } from '@/game/constants';
import { AudioManager } from '@/game/systems/AudioManager';

const TILE_WIDTH = 400;
const CHARACTER_WIDTH = 40;
const CHARACTER_HEIGHT = 64;

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

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload(): void {
    this.load.audio(AUDIO_KEYS.THEME, themeMusicUrl);
  }

  create(): void {
    this.generateCharacterTextures();
    this.generateCartTexture();
    this.generateBiomeBackgrounds();

    // Started once here (not in MainGameScene) so it keeps playing uninterrupted
    // across future scene transitions (e.g. biome changes).
    new AudioManager(this).playMusic(AUDIO_KEYS.THEME, { volume: MUSIC_VOLUME });

    this.scene.start('MainGameScene');
  }

  private generateCharacterTextures(): void {
    for (const config of STARTING_CHARACTERS) {
      const key = TEXTURE_KEYS.CHARACTER_PREFIX + config.id;
      const gfx = this.add.graphics();
      gfx.fillStyle(config.color, 1);
      gfx.fillRoundedRect(0, 0, CHARACTER_WIDTH, CHARACTER_HEIGHT, 8);
      gfx.fillStyle(0x000000, 0.15);
      gfx.fillRoundedRect(0, CHARACTER_HEIGHT - 12, CHARACTER_WIDTH, 12, 4);
      gfx.generateTexture(key, CHARACTER_WIDTH, CHARACTER_HEIGHT);
      gfx.destroy();
    }
  }

  private generateCartTexture(): void {
    const width = 96;
    const height = 70;
    const gfx = this.add.graphics();
    gfx.fillStyle(0x6b4226, 1);
    gfx.fillRoundedRect(0, 8, width, height - 24, 4);
    gfx.fillStyle(0x8a5a34, 1);
    gfx.fillRect(0, 8, width, 6);
    gfx.fillStyle(0x2b2b2b, 1);
    gfx.fillCircle(20, height - 12, 12);
    gfx.fillCircle(width - 20, height - 12, 12);
    gfx.fillStyle(0x4a4a4a, 1);
    gfx.fillCircle(20, height - 12, 4);
    gfx.fillCircle(width - 20, height - 12, 4);
    gfx.generateTexture(TEXTURE_KEYS.CART, width, height);
    gfx.destroy();
  }

  private generateBiomeBackgrounds(): void {
    for (const palette of BIOME_PALETTES) {
      this.generateSkyLayer(palette);
      this.generateGroundLayer(bgTextureKey(palette.id, 'mid'), palette.midBase, palette.midBump, 60, palette.shape);
      this.generateGroundLayer(bgTextureKey(palette.id, 'near'), palette.nearBase, palette.nearBump, 30, palette.shape);
    }
  }

  private generateSkyLayer(palette: BiomePalette): void {
    const gfx = this.add.graphics();
    gfx.fillGradientStyle(palette.skyTop, palette.skyTop, palette.skyBottom, palette.skyBottom, 1);
    gfx.fillRect(0, 0, TILE_WIDTH, SCREEN_HEIGHT);
    gfx.fillStyle(palette.sun, palette.sunAlpha);
    gfx.fillCircle(TILE_WIDTH * 0.75, SCREEN_HEIGHT * 0.25, 36);
    gfx.generateTexture(bgTextureKey(palette.id, 'far'), TILE_WIDTH, SCREEN_HEIGHT);
    gfx.destroy();
  }

  private generateGroundLayer(key: string, base: number, bump: number, bumpHeight: number, shape: GroundShape): void {
    const gfx = this.add.graphics();
    gfx.fillStyle(base, 1);
    gfx.fillRect(0, 0, TILE_WIDTH, SCREEN_HEIGHT);
    gfx.fillStyle(bump, 1);

    if (shape === 'dune') {
      gfx.fillEllipse(TILE_WIDTH * 0.2, SCREEN_HEIGHT - bumpHeight * 0.4, TILE_WIDTH * 0.5, bumpHeight);
      gfx.fillEllipse(TILE_WIDTH * 0.7, SCREEN_HEIGHT - bumpHeight * 0.3, TILE_WIDTH * 0.6, bumpHeight * 1.2);
    } else if (shape === 'flat') {
      gfx.fillEllipse(TILE_WIDTH * 0.3, SCREEN_HEIGHT - bumpHeight * 0.15, TILE_WIDTH * 0.7, bumpHeight * 0.4);
      gfx.fillEllipse(TILE_WIDTH * 0.8, SCREEN_HEIGHT - bumpHeight * 0.1, TILE_WIDTH * 0.5, bumpHeight * 0.3);
    } else {
      gfx.fillRect(TILE_WIDTH * 0.15, SCREEN_HEIGHT - bumpHeight * 1.4, TILE_WIDTH * 0.08, bumpHeight * 1.4);
      gfx.fillRect(TILE_WIDTH * 0.28, SCREEN_HEIGHT - bumpHeight * 0.9, TILE_WIDTH * 0.1, bumpHeight * 0.9);
      gfx.fillRect(TILE_WIDTH * 0.6, SCREEN_HEIGHT - bumpHeight * 1.7, TILE_WIDTH * 0.09, bumpHeight * 1.7);
      gfx.fillRect(TILE_WIDTH * 0.78, SCREEN_HEIGHT - bumpHeight * 1.1, TILE_WIDTH * 0.07, bumpHeight * 1.1);
    }

    gfx.generateTexture(key, TILE_WIDTH, SCREEN_HEIGHT);
    gfx.destroy();
  }
}
