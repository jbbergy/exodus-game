import type { CharacterConfig, InventoryState } from '@/domain/types';

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
  remedy: 0,
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

// World-distance (same unit as Convoy.cartPositionX) over which the sky/ground-band colors
// crossfade from one biome to the next (see Backdrop) — must stay well under the smallest
// BiomeDefinition.distance (2000) so a transition never spans more than one biome boundary at a
// time. Streamed decor shapes (DecorStreamManager) don't use this — they switch biome outright
// the instant construction crosses the segment boundary, no crossfade.
export const BIOME_TRANSITION_DISTANCE = 450;

export const AUDIO_KEYS = {
  THEME: 'audio-theme',
} as const;

// Master volume applied whenever the player has audio turned on via the toggle button.
export const AUDIO_VOLUME_WHEN_ENABLED = 0.2;

export const BIOME_BANNER_DURATION_MS = 4000;

// With Scale.RESIZE the game's logical width/height track the viewport, so layout is expressed
// as fractions of the current scene size rather than fixed pixel constants (see game/utils/layout.ts).
export const CART_X_FRACTION = 0.45;
export const GROUND_Y_FRACTION = 420 / 540;

// Reference screen-pixel width the hand-authored per-biome decor arrays in BiomePalettes.ts are
// laid out against (their xFraction/widthFraction values are fractions of this) — independent of
// actual viewport width. DecorPlacement derives each streamed layer's real-world repeat period
// from it (BG_TILE_WIDTH / parallax factor), so the same density/spacing this used to produce as
// a literal repeating texture tile is reproduced once decor is individually streamed instead.
export const BG_TILE_WIDTH = 900;

// Slightly shorter than before so resource-gathering opportunities come up a bit more often.
export const RESOURCE_SIGNAL_MIN_INTERVAL_MS = 26000;
export const RESOURCE_SIGNAL_MAX_INTERVAL_MS = 50000;
export const RESOURCE_SIGNAL_RESPONSE_TIMEOUT_MS = 10000;

export const HIDDEN_COST_MAX = 50;
export const HIDDEN_COST_SKEW = 2.2;

export const RESOURCE_QUANTITY_MIN = 1;
export const RESOURCE_QUANTITY_MAX = 3;

export const WATER_RESTORE_AMOUNT = 15;
export const FOOD_RESTORE_AMOUNT = 25;
export const RESOURCE_UNIT_CONSUMED = 1;

// Chance that a successful water/food gathering trip also turns up a remedy — the only cure for
// sickness (see SicknessSystem / Character.sick).
export const REMEDY_FIND_CHANCE = 0.25;

// How often, at random, a random living character falls sick — only one can be sick at a time
// (see Convoy.sickCharacter).
export const SICKNESS_MIN_INTERVAL_MS = 60000;
export const SICKNESS_MAX_INTERVAL_MS = 120000;

// A sick character loses energy this much faster while pulling, and can't recover it at all
// (see Character.energyRate/restoreEnergy) until cured with a remedy.
export const SICK_FATIGUE_MULTIPLIER = 1.5;

export const TRIBUTE_SCREEN_MIN_DURATION_MS = 1500;
