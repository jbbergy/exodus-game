import type { ResourceType } from '@/domain/types';

export interface CollectionOutcome {
  characterId: string;
  resourceType: ResourceType;
  energyCost: number;
  quantityGained: number;
  died: boolean;
  remedyFound: boolean;
}
