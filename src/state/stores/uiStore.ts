import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { CollectionOutcome } from '@/domain/Resource';
import type { DeathCause, ResourceSignal } from '@/domain/types';

export type ActiveModal = 'none' | 'signal' | 'result' | 'tribute' | 'gameover';

export interface HoverPosition {
  x: number;
  y: number;
}

export const useUiStore = defineStore('ui', () => {
  const activeModal = ref<ActiveModal>('none');
  const pendingSignal = ref<ResourceSignal | null>(null);
  const lastOutcome = ref<CollectionOutcome | null>(null);
  const deceasedCharacterId = ref<string | null>(null);
  const deceasedCause = ref<DeathCause | null>(null);
  // Non-blocking: shown alongside whatever activeModal is, never pauses the game.
  const biomeBannerText = ref<string | null>(null);
  // Opened by tapping/clicking the cart sprite; drives the resources panel.
  const cartSelected = ref(false);
  const cartSelectedPosition = ref<HoverPosition | null>(null);
  // Opened by tapping/clicking a character's sprite; drives the combined stats + actions panel.
  const selectedCharacterId = ref<string | null>(null);
  const selectedCharacterPosition = ref<HoverPosition | null>(null);
  // True while a mobile/touch device is held in portrait — blocks play until rotated.
  const orientationBlocked = ref(false);

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

  function showTribute(characterId: string, cause: DeathCause): void {
    deceasedCharacterId.value = characterId;
    deceasedCause.value = cause;
    activeModal.value = 'tribute';
  }

  function dismissTribute(): void {
    activeModal.value = 'none';
    deceasedCharacterId.value = null;
    deceasedCause.value = null;
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

  /** No-op while any panel is already open: a stray tap (e.g. one of the action buttons
   * overlapping the cart, or vice versa) must never swap the selection out from under the
   * player — they have to explicitly close the current one first. Cart and character panels
   * are mutually exclusive, so only one ever shows at a time. */
  function selectCart(position: HoverPosition): void {
    if (selectedCharacterId.value || cartSelected.value) return;
    cartSelected.value = true;
    cartSelectedPosition.value = position;
  }

  function closeCartPanel(): void {
    cartSelected.value = false;
    cartSelectedPosition.value = null;
  }

  function selectCharacter(characterId: string, position: HoverPosition): void {
    if (selectedCharacterId.value || cartSelected.value) return;
    selectedCharacterId.value = characterId;
    selectedCharacterPosition.value = position;
  }

  function closeCharacterPanel(): void {
    selectedCharacterId.value = null;
    selectedCharacterPosition.value = null;
  }

  function setOrientationBlocked(blocked: boolean): void {
    orientationBlocked.value = blocked;
  }

  return {
    activeModal,
    pendingSignal,
    lastOutcome,
    deceasedCharacterId,
    deceasedCause,
    biomeBannerText,
    cartSelected,
    cartSelectedPosition,
    selectedCharacterId,
    selectedCharacterPosition,
    orientationBlocked,
    raiseSignal,
    clearSignal,
    showResult,
    dismissResult,
    showTribute,
    dismissTribute,
    showGameOver,
    showBiomeBanner,
    dismissBiomeBanner,
    selectCart,
    closeCartPanel,
    selectCharacter,
    closeCharacterPanel,
    setOrientationBlocked,
  };
});
