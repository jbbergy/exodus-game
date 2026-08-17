import { Character } from '@/domain/Character';
import type { InventoryState, ResourceType } from '@/domain/types';

export class Convoy {
  characters: Character[];
  inventory: InventoryState;
  cartPositionX: number;

  constructor(characters: Character[], startingInventory: InventoryState) {
    this.characters = characters;
    this.inventory = { ...startingInventory };
    this.cartPositionX = 0;
  }

  livingCharacters(): Character[] {
    return this.characters.filter((c) => c.alive);
  }

  pullingCharacters(): Character[] {
    return this.livingCharacters().filter((c) => c.state === 'pulling');
  }

  /** Signed energy change per second for `character` given the current group composition. */
  effectiveEnergyRate(character: Character): number {
    return character.energyRate(this.pullingCharacters().length);
  }

  computeSpeed(): number {
    const pullers = this.pullingCharacters();
    if (pullers.length === 0) return 0;
    return Math.min(...pullers.map((c) => c.currentSpeed()));
  }

  advance(deltaSeconds: number): void {
    this.cartPositionX += this.computeSpeed() * deltaSeconds;
  }

  addResource(type: ResourceType, amount: number): void {
    this.inventory[type] += amount;
  }

  consumeResource(type: ResourceType, amount: number): boolean {
    if (this.inventory[type] < amount) return false;
    this.inventory[type] -= amount;
    return true;
  }
}
