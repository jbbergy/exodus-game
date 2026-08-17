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
  // Set from hovering the character's sprite in the game world.
  const hoveredCharacterId = ref<string | null>(null);
  const hoverPosition = ref<HoverPosition | null>(null);
  let hoverClearTimer: ReturnType<typeof setTimeout> | undefined;
  // Opened by clicking a character's sprite; suppresses the hover panel while active.
  const radialMenuCharacterId = ref<string | null>(null);
  const radialMenuPosition = ref<HoverPosition | null>(null);

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

  /** In-world sprite is hovered: show the panel right away, cancelling any pending close. */
  function setHoveredCharacter(characterId: string, position: HoverPosition): void {
    if (radialMenuCharacterId.value) return;
    clearTimeout(hoverClearTimer);
    hoveredCharacterId.value = characterId;
    hoverPosition.value = position;
  }

  /** Sprite is no longer hovered: close after a short grace period to avoid flicker. */
  function scheduleHoverClear(): void {
    clearTimeout(hoverClearTimer);
    hoverClearTimer = setTimeout(() => {
      hoveredCharacterId.value = null;
    }, HOVER_CLEAR_DELAY_MS);
  }

  /** Re-hovered before the grace period elapsed: keep it open. */
  function cancelHoverClear(): void {
    clearTimeout(hoverClearTimer);
  }

  /** No-op while a menu is already open: a stray click (e.g. one of the radial buttons
   * overlapping another character's sprite) must never swap it to a different character —
   * the player has to explicitly close the current one first. */
  function openRadialMenu(characterId: string, position: HoverPosition): void {
    if (radialMenuCharacterId.value) return;
    radialMenuCharacterId.value = characterId;
    radialMenuPosition.value = position;
    clearTimeout(hoverClearTimer);
    hoveredCharacterId.value = null;
  }

  function closeRadialMenu(): void {
    radialMenuCharacterId.value = null;
    radialMenuPosition.value = null;
  }

  return {
    activeModal,
    pendingSignal,
    lastOutcome,
    deceasedCharacterId,
    biomeBannerText,
    hoveredCharacterId,
    hoverPosition,
    radialMenuCharacterId,
    radialMenuPosition,
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
    openRadialMenu,
    closeRadialMenu,
  };
});
