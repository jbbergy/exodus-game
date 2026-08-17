import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { CollectionOutcome } from '@/domain/Resource';
import type { ResourceSignal } from '@/domain/types';
import { HOVER_CLEAR_DELAY_MS } from '@/game/constants';

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
  // Non-blocking: shown alongside whatever activeModal is, never pauses the game.
  const biomeBannerText = ref<string | null>(null);
  // Set from hovering the character's sprite (game world) or swatch (HUD).
  const hoveredCharacterId = ref<string | null>(null);
  const hoverPosition = ref<HoverPosition | null>(null);
  let hoverClearTimer: ReturnType<typeof setTimeout> | undefined;

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

  /** Trigger (chip or in-world sprite) is hovered: show the panel right away, cancelling any pending close. */
  function setHoveredCharacter(characterId: string, position: HoverPosition): void {
    clearTimeout(hoverClearTimer);
    hoveredCharacterId.value = characterId;
    hoverPosition.value = position;
  }

  /**
   * Trigger or panel is no longer hovered: close after a short grace period, so moving the
   * cursor from the trigger onto the panel itself (to click a button) doesn't close it.
   */
  function scheduleHoverClear(): void {
    clearTimeout(hoverClearTimer);
    hoverClearTimer = setTimeout(() => {
      hoveredCharacterId.value = null;
    }, HOVER_CLEAR_DELAY_MS);
  }

  /** Panel (or trigger) re-entered before the grace period elapsed: keep it open. */
  function cancelHoverClear(): void {
    clearTimeout(hoverClearTimer);
  }

  return {
    activeModal,
    pendingSignal,
    lastOutcome,
    deceasedCharacterId,
    biomeBannerText,
    hoveredCharacterId,
    hoverPosition,
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
    scheduleHoverClear,
    cancelHoverClear,
  };
});
