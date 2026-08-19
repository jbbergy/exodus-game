import { Character } from '@/domain/Character';
import { type BiomeDefinition, type BiomeSegment, buildBiomeSegments, createBiomeSequence, resolveBiomeAt } from '@/domain/Biome';
import type { InventoryState, ResourceType } from '@/domain/types';

export class Convoy {
  characters: Character[];
  inventory: InventoryState;
  cartPositionX: number;
  biomeSegments: BiomeSegment[];

  constructor(characters: Character[], startingInventory: InventoryState, biomeSequence = createBiomeSequence()) {
    this.characters = characters;
    this.inventory = { ...startingInventory };
    this.cartPositionX = 0;
    this.biomeSegments = buildBiomeSegments(biomeSequence);
  }

  livingCharacters(): Character[] {
    return this.characters.filter((c) => c.alive);
  }

  pullingCharacters(): Character[] {
    return this.livingCharacters().filter((c) => c.state === 'pulling');
  }

  /** At most one character is ever sick convoy-wide (see SicknessSystem). */
  sickCharacter(): Character | undefined {
    return this.characters.find((c) => c.sick);
  }

  currentBiome(): BiomeDefinition {
    return resolveBiomeAt(this.biomeSegments, this.cartPositionX);
  }

  /** Signed energy change per second for `character`, including shared pulling load and the current biome's passive fatigue. */
  effectiveEnergyRate(character: Character): number {
    if (!character.alive) return 0;
    const baseRate = character.energyRate(this.pullingCharacters().length);
    return baseRate - this.currentBiome().passiveFatiguePerSecond;
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

  addRemedy(amount: number): void {
    this.inventory.remedy += amount;
  }

  /** The only way to cure a sick character. Returns false if there's no remedy in stock, or the
   * character isn't actually sick (nothing to do). */
  useRemedy(characterId: string): boolean {
    if (this.inventory.remedy <= 0) return false;

    const character = this.characters.find((c) => c.id === characterId);
    if (!character || !character.alive || !character.sick) return false;

    this.inventory.remedy -= 1;
    character.cure();
    return true;
  }
}
