export type CharacterState = 'pulling' | 'resting' | 'walking';

export type ResourceType = 'water' | 'food';

export type BiomeId = 'origin' | 'desert-sand' | 'desert-ice' | 'ravaged-plain' | 'abandoned-village';

export interface CharacterConfig {
  id: string;
  name: string;
  color: number;
  maxEnergy: number;
  fatigueRate: number;
  restRecoveryRate: number;
  walkSpeed: number;
  pullSpeedFactor: number;
}

export interface ResourceSignal {
  id: string;
  characterId: string;
  resourceType: ResourceType;
}

export interface InventoryState {
  water: number;
  food: number;
  /** Cures a sick character — found opportunistically when gathering water/food, see EnergyRng.rollRemedyFound. */
  remedy: number;
}
