import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { Character } from '@/domain/Character';
import { Convoy } from '@/domain/Convoy';
import type { CharacterState, ResourceType } from '@/domain/types';
import { FOOD_RESTORE_AMOUNT, RESOURCE_UNIT_CONSUMED, STARTING_CHARACTERS, STARTING_INVENTORY, WATER_RESTORE_AMOUNT } from '@/game/constants';

export const useConvoyStore = defineStore('convoy', () => {
  const convoy = ref(
    new Convoy(
      STARTING_CHARACTERS.map((config) => new Character(config)),
      STARTING_INVENTORY,
    ),
  );

  const characters = computed(() => convoy.value.characters);
  const livingCharacters = computed(() => convoy.value.livingCharacters());
  const inventory = computed(() => convoy.value.inventory);
  const speed = computed(() => convoy.value.computeSpeed());
  const currentBiome = computed(() => convoy.value.currentBiome());

  function findCharacter(characterId: string): Character | undefined {
    return convoy.value.characters.find((c) => c.id === characterId);
  }

  function setCharacterState(characterId: string, state: CharacterState): void {
    findCharacter(characterId)?.setState(state);
  }

  function consumeResourceFor(characterId: string, type: ResourceType): boolean {
    const character = findCharacter(characterId);
    if (!character) return false;
    if (!character.canReceiveResource(type)) return false;

    const biome = convoy.value.currentBiome();
    if (type === 'water' && !biome.waterUsable) return false;

    const ok = convoy.value.consumeResource(type, RESOURCE_UNIT_CONSUMED);
    if (!ok) return false;

    const baseAmount = type === 'water' ? WATER_RESTORE_AMOUNT : FOOD_RESTORE_AMOUNT;
    const multiplier = type === 'water' ? biome.waterEnergyMultiplier : biome.foodEnergyMultiplier;
    character.restoreEnergy(baseAmount * multiplier);
    return true;
  }

  function cureCharacter(characterId: string): boolean {
    return convoy.value.useRemedy(characterId);
  }

  return {
    convoy,
    characters,
    livingCharacters,
    inventory,
    speed,
    currentBiome,
    findCharacter,
    setCharacterState,
    consumeResourceFor,
    cureCharacter,
  };
});
