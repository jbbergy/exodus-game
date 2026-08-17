import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { CollectionOutcome } from '@/domain/Resource';
import type { ResourceSignal } from '@/domain/types';

export type ActiveModal = 'none' | 'signal' | 'result' | 'tribute' | 'gameover';

export const useUiStore = defineStore('ui', () => {
  const activeModal = ref<ActiveModal>('none');
  const pendingSignal = ref<ResourceSignal | null>(null);
  const lastOutcome = ref<CollectionOutcome | null>(null);
  const deceasedCharacterId = ref<string | null>(null);
  // Non-blocking: shown alongside whatever activeModal is, never pauses the game.
  const biomeBannerText = ref<string | null>(null);
  // Set from hovering the character's sprite in the game world.
  const hoveredCharacterId = ref<string | null>(null);

  function raiseSignal(signal: ResourceSignal): void {
    pendingSignal.value = signal;
    activeModal.value = 'signal';
  }

  function clearSignal(): void {
    pendingSignal.value = null;
    activeModal.value = 'none';
  }

  function showResult(outcome: CollectionOutcome): void {
    lastOutcome.value = outcome;
    pendingSignal.value = null;
    activeModal.value = 'result';
  }

  function dismissResult(): void {
    activeModal.value = 'none';
  }

  function showTribute(characterId: string): void {
    deceasedCharacterId.value = characterId;
    activeModal.value = 'tribute';
  }

  function dismissTribute(): void {
    activeModal.value = 'none';
    deceasedCharacterId.value = null;
  }

  function showGameOver(): void {
    activeModal.value = 'gameover';
  }

  function showBiomeBanner(text: string): void {
    biomeBannerText.value = text;
  }

  function dismissBiomeBanner(): void {
    biomeBannerText.value = null;
  }

  function setHoveredCharacter(characterId: string | null): void {
    hoveredCharacterId.value = characterId;
  }

  return {
    activeModal,
    pendingSignal,
    lastOutcome,
    deceasedCharacterId,
    biomeBannerText,
    hoveredCharacterId,
    raiseSignal,
    clearSignal,
    showResult,
    dismissResult,
    showTribute,
    dismissTribute,
    showGameOver,
    showBiomeBanner,
    dismissBiomeBanner,
    setHoveredCharacter,
  };
});
