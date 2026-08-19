import type { BiomeId, ResourceType } from '@/domain/types';

export interface BiomeDefinition {
  id: BiomeId;
  name: string;
  /** Distance (same unit as Convoy.cartPositionX) the convoy travels through before the next biome. */
  distance: number;
  /** Extra energy drain per second applied to every living character, regardless of state. */
  passiveFatiguePerSecond: number;
  /** Cold biomes: water is frozen — can't be signaled or consumed. */
  waterUsable: boolean;
  /** Multiplies WATER_RESTORE_AMOUNT when consumed in this biome. */
  waterEnergyMultiplier: number;
  /** Multiplies FOOD_RESTORE_AMOUNT when consumed in this biome — hot biomes make food less effective than water. */
  foodEnergyMultiplier: number;
  /** Relative weights for which resource type a signal offers in this biome. */
  resourceBias: Record<ResourceType, number>;
}

const NEUTRAL_BIAS: Record<ResourceType, number> = { water: 1, food: 1 };

export const BIOME_DEFINITIONS: Record<BiomeId, BiomeDefinition> = {
  origin: {
    id: 'origin',
    name: 'Les Terres Ancestrales',
    distance: 2000,
    passiveFatiguePerSecond: 0,
    waterUsable: true,
    waterEnergyMultiplier: 1,
    foodEnergyMultiplier: 1,
    resourceBias: NEUTRAL_BIAS,
  },
  'desert-sand': {
    id: 'desert-sand',
    name: 'Le Désert des Sables Maudits',
    distance: 2200,
    passiveFatiguePerSecond: 0.5,
    waterUsable: true,
    waterEnergyMultiplier: 1,
    foodEnergyMultiplier: 0.6,
    resourceBias: { water: 0.5, food: 0.5 },
  },
  'desert-ice': {
    id: 'desert-ice',
    name: 'Les Glaces du Roi Déchu',
    distance: 2200,
    passiveFatiguePerSecond: 0.5,
    waterUsable: false,
    waterEnergyMultiplier: 0,
    foodEnergyMultiplier: 1,
    resourceBias: { water: 0, food: 1 },
  },
  'ravaged-plain': {
    id: 'ravaged-plain',
    name: 'La Plaine des Cendres',
    distance: 2000,
    passiveFatiguePerSecond: 0,
    waterUsable: true,
    waterEnergyMultiplier: 1,
    foodEnergyMultiplier: 1,
    resourceBias: NEUTRAL_BIAS,
  },
  'abandoned-village': {
    id: 'abandoned-village',
    name: 'Le Hameau des Âmes Perdues',
    distance: 2000,
    passiveFatiguePerSecond: 0,
    waterUsable: true,
    waterEnergyMultiplier: 1,
    foodEnergyMultiplier: 1,
    resourceBias: { water: 1, food: 2 },
  },
};

const INTERMEDIATE_BIOME_IDS: BiomeId[] = ['desert-sand', 'desert-ice', 'ravaged-plain', 'abandoned-village'];

/** Origin first, then the intermediate biomes in a random order (per playthrough). */
export function createBiomeSequence(random: () => number = Math.random): BiomeId[] {
  const shuffled = [...INTERMEDIATE_BIOME_IDS];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return ['origin', ...shuffled];
}

export interface BiomeSegment {
  biome: BiomeDefinition;
  startDistance: number;
  endDistance: number;
}

export function buildBiomeSegments(sequence: BiomeId[]): BiomeSegment[] {
  let cursor = 0;
  return sequence.map((id) => {
    const biome = BIOME_DEFINITIONS[id];
    const segment: BiomeSegment = { biome, startDistance: cursor, endDistance: cursor + biome.distance };
    cursor += biome.distance;
    return segment;
  });
}

/** The convoy stays in the last biome of the sequence indefinitely once it's reached. */
export function resolveBiomeAt(segments: BiomeSegment[], distance: number): BiomeDefinition {
  for (const segment of segments) {
    if (distance < segment.endDistance) return segment.biome;
  }
  return segments[segments.length - 1].biome;
}
