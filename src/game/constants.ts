import type { BiomeId, CharacterConfig, InventoryState } from '@/domain/types';

export const STARTING_CHARACTERS: CharacterConfig[] = [
  {
    id: 'aline',
    name: 'Aline',
    color: 0xff6b4a,
    maxEnergy: 100,
    fatigueRate: 3,
    restRecoveryRate: 2,
    walkSpeed: 60,
    pullSpeedFactor: 0.7,
  },
  {
    id: 'marc',
    name: 'Marc',
    color: 0x4a90c2,
    maxEnergy: 100,
    fatigueRate: 2,
    restRecoveryRate: 2,
    walkSpeed: 50,
    pullSpeedFactor: 0.75,
  },
  {
    id: 'theo',
    name: 'Théo',
    color: 0x7bc47f,
    maxEnergy: 100,
    fatigueRate: 4,
    restRecoveryRate: 2,
    walkSpeed: 75,
    pullSpeedFactor: 0.65,
  },
  {
    id: 'nora',
    name: 'Nora',
    color: 0xc77dd6,
    maxEnergy: 100,
    fatigueRate: 2.5,
    restRecoveryRate: 2,
    walkSpeed: 55,
    pullSpeedFactor: 0.72,
  },
  {
    id: 'samir',
    name: 'Samir',
    color: 0xe8c94a,
    maxEnergy: 100,
    fatigueRate: 3.5,
    restRecoveryRate: 2,
    walkSpeed: 65,
    pullSpeedFactor: 0.68,
  },
];

export const STARTING_INVENTORY: InventoryState = {
  water: 10,
  food: 10,
};

export const TEXTURE_KEYS = {
  CHARACTER_PREFIX: 'tex-character-',
  CART: 'tex-cart',
} as const;

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

export const SCREEN_WIDTH = 960;
export const SCREEN_HEIGHT = 540;

export const GROUND_Y = 420;

export const RESOURCE_SIGNAL_MIN_INTERVAL_MS = 15000;
export const RESOURCE_SIGNAL_MAX_INTERVAL_MS = 30000;

export const HIDDEN_COST_MAX = 50;
export const HIDDEN_COST_SKEW = 2.2;

export const RESOURCE_QUANTITY_MIN = 1;
export const RESOURCE_QUANTITY_MAX = 5;

export const WATER_RESTORE_AMOUNT = 15;
export const FOOD_RESTORE_AMOUNT = 25;
export const RESOURCE_UNIT_CONSUMED = 1;

export const TRIBUTE_SCREEN_MIN_DURATION_MS = 1500;
