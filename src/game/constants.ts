import type { BiomeId, CharacterConfig, InventoryState } from '@/domain/types';

export const STARTING_CHARACTERS: CharacterConfig[] = [
  {
    id: 'character-01',
    name: 'Elowen',
    color: 0xff6b4a,
    maxEnergy: 100,
    fatigueRate: 3,
    restRecoveryRate: 2,
    walkSpeed: 60,
    pullSpeedFactor: 0.7,
  },
  {
    id: 'character-02',
    name: 'Torvald',
    color: 0x4a90c2,
    maxEnergy: 100,
    fatigueRate: 2,
    restRecoveryRate: 2,
    walkSpeed: 50,
    pullSpeedFactor: 0.75,
  },
  {
    id: 'character-03',
    name: 'Aldric',
    color: 0x7bc47f,
    maxEnergy: 100,
    fatigueRate: 4,
    restRecoveryRate: 2,
    walkSpeed: 75,
    pullSpeedFactor: 0.65,
  },
  {
    id: 'character-04',
    name: 'Isolde',
    color: 0xc77dd6,
    maxEnergy: 100,
    fatigueRate: 2.5,
    restRecoveryRate: 2,
    walkSpeed: 55,
    pullSpeedFactor: 0.72,
  },
  {
    id: 'character-05',
    name: 'Kaelen',
    color: 0xe8c94a,
    maxEnergy: 100,
    fatigueRate: 3.5,
    restRecoveryRate: 2,
    walkSpeed: 65,
    pullSpeedFactor: 0.68,
  },
];

export const STARTING_INVENTORY: InventoryState = {
  water: 5,
  food: 5,
};

export const TEXTURE_KEYS = {
  CHARACTER_PREFIX: 'tex-character-',
  CART: 'tex-cart',
} as const;

export const CHARACTER_SCALE = 2.5;
export const CART_SCALE = 3;

// Base (unscaled) placeholder texture sizes, generated in BootScene — shared here so sprite
// alignment math (CharacterSprite) can stay in sync with what BootScene actually draws.
export const CHARACTER_TEXTURE_WIDTH = 40;
export const CHARACTER_TEXTURE_HEIGHT = 64;
export const CART_TEXTURE_WIDTH = 96;

export const BG_LAYERS = ['far', 'mid', 'near'] as const;
export type BgLayer = (typeof BG_LAYERS)[number];

export function bgTextureKey(biomeId: BiomeId, layer: BgLayer): string {
  return `tex-bg-${biomeId}-${layer}`;
}

export const AUDIO_KEYS = {
  THEME: 'audio-theme',
} as const;

export const MUSIC_VOLUME = 0.25;

export const BIOME_BANNER_DURATION_MS = 4000;

export const HOVER_CLEAR_DELAY_MS = 150;

// With Scale.RESIZE the game's logical width/height track the viewport, so layout is expressed
// as fractions of the current scene size rather than fixed pixel constants (see game/utils/layout.ts).
export const CART_X_FRACTION = 0.45;
export const GROUND_Y_FRACTION = 420 / 540;

// Horizontal tiling unit for the procedurally generated parallax backgrounds — independent of
// viewport size, since TileSprite repeats it seamlessly along X regardless of display width.
export const BG_TILE_WIDTH = 400;

export const RESOURCE_SIGNAL_MIN_INTERVAL_MS = 45000;
export const RESOURCE_SIGNAL_MAX_INTERVAL_MS = 90000;
export const RESOURCE_SIGNAL_RESPONSE_TIMEOUT_MS = 5000;

export const HIDDEN_COST_MAX = 50;
export const HIDDEN_COST_SKEW = 2.2;

export const RESOURCE_QUANTITY_MIN = 1;
export const RESOURCE_QUANTITY_MAX = 3;

export const WATER_RESTORE_AMOUNT = 15;
export const FOOD_RESTORE_AMOUNT = 25;
export const RESOURCE_UNIT_CONSUMED = 1;

export const TRIBUTE_SCREEN_MIN_DURATION_MS = 1500;
