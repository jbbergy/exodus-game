import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { Character } from '@/domain/Character';
import { Convoy } from '@/domain/Convoy';
import type { CharacterState, ResourceType } from '@/domain/types';
import { STARTING_CHARACTERS, STARTING_INVENTORY } from '@/game/constants';

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

  function findCharacter(characterId: string): Character | undefined {
    return convoy.value.characters.find((c) => c.id === characterId);
  }

  function setCharacterState(characterId: string, state: CharacterState): void {
    findCharacter(characterId)?.setState(state);
  }

  function consumeResourceFor(characterId: string, type: ResourceType, restoreAmount: number): boolean {
    const character = findCharacter(characterId);
    if (!character) return false;
    const ok = convoy.value.consumeResource(type, 1);
    if (!ok) return false;
    character.restoreEnergy(restoreAmount);
    return true;
  }

  return {
    convoy,
    characters,
    livingCharacters,
    inventory,
    speed,
    findCharacter,
    setCharacterState,
    consumeResourceFor,
  };
});
