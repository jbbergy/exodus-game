import type { ResourceType } from '@/domain/types';
import {
  HIDDEN_COST_MAX,
  HIDDEN_COST_SKEW,
  REMEDY_FIND_CHANCE,
  RESOURCE_QUANTITY_MAX,
  RESOURCE_QUANTITY_MIN,
} from '@/game/constants';

/** Skewed-low value in [0, max]. Higher `skew` pushes more mass toward 0. */
export function skewedRandom(max: number, skew: number): number {
  const u = Math.random();
  return Math.pow(u, skew) * max;
}

export function rollHiddenEnergyCost(): number {
  return Math.round(skewedRandom(HIDDEN_COST_MAX, HIDDEN_COST_SKEW));
}

export function rollResourceQuantity(_resourceType: ResourceType): number {
  const span = RESOURCE_QUANTITY_MAX - RESOURCE_QUANTITY_MIN + 1;
  return RESOURCE_QUANTITY_MIN + Math.floor(Math.random() * span);
}

export function rollRemedyFound(): boolean {
  return Math.random() < REMEDY_FIND_CHANCE;
}
