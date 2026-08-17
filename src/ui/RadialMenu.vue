<script setup lang="ts">
import { computed } from 'vue';
import type { CharacterState } from '@/domain/types';
import { useConvoyStore } from '@/state/stores/convoyStore';
import { useUiStore } from '@/state/stores/uiStore';

const convoyStore = useConvoyStore();
const uiStore = useUiStore();

const character = computed(() => convoyStore.findCharacter(uiStore.radialMenuCharacterId ?? ''));
const waterUsable = computed(() => convoyStore.currentBiome.waterUsable);

interface RadialAction {
  key: string;
  label: string;
  active?: boolean;
  disabled?: boolean;
  run: () => void;
}

const STATE_LABELS: Record<CharacterState, string> = {
  pulling: 'Tirer',
  resting: 'Reposer',
  walking: 'Marcher',
};

const actions = computed<RadialAction[]>(() => {
  const c = character.value;
  if (!c) return [];

  const stateActions: RadialAction[] = (Object.keys(STATE_LABELS) as CharacterState[]).map((state) => ({
    key: state,
    label: STATE_LABELS[state],
    active: c.state === state,
    run: () => convoyStore.setCharacterState(c.id, state),
  }));

  const resourceActions: RadialAction[] = [
    {
      key: 'water',
      label: '💧',
      disabled: convoyStore.inventory.water <= 0 || !waterUsable.value,
      run: () => convoyStore.consumeResourceFor(c.id, 'water'),
    },
    {
      key: 'food',
      label: '🍞',
      disabled: convoyStore.inventory.food <= 0,
      run: () => convoyStore.consumeResourceFor(c.id, 'food'),
    },
  ];

  return [...stateActions, ...resourceActions];
});

const RADIUS = 68;

function offsetFor(index: number): { x: number; y: number } {
  const angle = (index / actions.value.length) * Math.PI * 2 - Math.PI / 2;
  return { x: Math.cos(angle) * RADIUS, y: Math.sin(angle) * RADIUS };
}

function runAction(action: RadialAction): void {
  if (action.disabled) return;
  action.run();
  uiStore.closeRadialMenu();
}
</script>

<template>
  <Teleport to="body">
    <div v-if="character" class="radial-overlay" @click.self="uiStore.closeRadialMenu">
      <div class="radial-menu" :style="{ left: `${uiStore.radialMenuPosition!.x}px`, top: `${uiStore.radialMenuPosition!.y}px` }">
        <button
          v-for="(action, index) in actions"
          :key="action.key"
          class="radial-item"
          :class="{ active: action.active }"
          :disabled="action.disabled"
          :style="{ transform: `translate(calc(-50% + ${offsetFor(index).x}px), calc(-50% + ${offsetFor(index).y}px))` }"
          @click="runAction(action)"
        >
          {{ action.label }}
        </button>
        <button class="radial-center" @click="uiStore.closeRadialMenu">✕</button>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.radial-overlay {
  position: fixed;
  inset: 0;
  z-index: 60;
}

.radial-menu {
  position: absolute;
  width: 0;
  height: 0;
}

.radial-item,
.radial-center {
  position: absolute;
  left: 0;
  top: 0;
  transform: translate(-50%, -50%);
  width: 46px;
  height: 46px;
  border-radius: 50%;
  border: none;
  background: rgba(20, 16, 13, 0.92);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
  cursor: pointer;
}

.radial-item.active {
  background: #d88a3f;
}

.radial-item:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.radial-center {
  background: rgba(180, 60, 50, 0.85);
  font-size: 16px;
}
</style>
