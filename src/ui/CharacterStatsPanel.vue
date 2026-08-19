<script setup lang="ts">
import { computed } from 'vue';
import type { CharacterState } from '@/domain/types';
import { useConvoyStore } from '@/state/stores/convoyStore';
import { useUiStore } from '@/state/stores/uiStore';

const convoyStore = useConvoyStore();
const uiStore = useUiStore();

const character = computed(() => convoyStore.findCharacter(uiStore.selectedCharacterId ?? ''));
const waterUsable = computed(() => convoyStore.currentBiome.waterUsable);

const colorHex = computed(() => (character.value ? '#' + character.value.color.toString(16).padStart(6, '0') : '#000'));
const energyPercent = computed(() => (character.value ? (character.value.energy / character.value.maxEnergy) * 100 : 0));
const energyClass = computed(() => {
  if (energyPercent.value > 50) return 'high';
  if (energyPercent.value > 20) return 'medium';
  return 'low';
});

const energyRate = computed(() => (character.value ? convoyStore.convoy.effectiveEnergyRate(character.value) : 0));
const energyRateLabel = computed(() => {
  const rate = energyRate.value;
  const sign = rate > 0 ? '+' : '';
  return `${sign}${rate.toFixed(1)} / s`;
});
const energyRateClass = computed(() => {
  if (energyRate.value < 0) return 'draining';
  if (energyRate.value > 0) return 'recovering';
  return 'steady';
});

interface CharacterAction {
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

const stateActions = computed<CharacterAction[]>(() => {
  const c = character.value;
  if (!c) return [];
  return (Object.keys(STATE_LABELS) as CharacterState[]).map((state) => ({
    key: state,
    label: STATE_LABELS[state],
    active: c.state === state,
    run: () => convoyStore.setCharacterState(c.id, state),
  }));
});

const resourceActions = computed<CharacterAction[]>(() => {
  const c = character.value;
  if (!c) return [];
  return [
    {
      key: 'water',
      label: '💧 Eau',
      disabled: convoyStore.inventory.water <= 0 || !waterUsable.value,
      run: () => convoyStore.consumeResourceFor(c.id, 'water'),
    },
    {
      key: 'food',
      label: '🍞 Nourriture',
      disabled: convoyStore.inventory.food <= 0,
      run: () => convoyStore.consumeResourceFor(c.id, 'food'),
    },
  ];
});

const PANEL_WIDTH = 220;
const PANEL_MAX_HEIGHT = 340;
const VIEWPORT_MARGIN = 8;

// Clamped to the viewport (not just offset from the tap point) so the panel never runs off-screen
// on small mobile-landscape viewports, where a tap near an edge would otherwise push it out of view.
const panelStyle = computed(() => {
  const position = uiStore.selectedCharacterPosition;
  if (!position) return { display: 'none' };

  const maxLeft = Math.max(VIEWPORT_MARGIN, window.innerWidth - PANEL_WIDTH - VIEWPORT_MARGIN);
  const maxTop = Math.max(VIEWPORT_MARGIN, window.innerHeight - PANEL_MAX_HEIGHT - VIEWPORT_MARGIN);
  const left = Math.min(Math.max(position.x - PANEL_WIDTH / 2, VIEWPORT_MARGIN), maxLeft);
  const top = Math.min(Math.max(position.y + 16, VIEWPORT_MARGIN), maxTop);
  return { left: `${left}px`, top: `${top}px` };
});

// State actions (Tirer/Reposer/Marcher) send the character to a different on-screen slot, so the
// panel — anchored to where it was tapped — would otherwise sit disconnected from the character
// as it moves. Resource actions don't move the character, so the panel stays open for both taps.
function runStateAction(action: CharacterAction): void {
  if (action.disabled) return;
  action.run();
  uiStore.closeCharacterPanel();
}

function runResourceAction(action: CharacterAction): void {
  if (action.disabled) return;
  action.run();
}
</script>

<template>
  <Teleport to="body">
    <div v-if="character" class="panel-overlay" @click.self="uiStore.closeCharacterPanel">
      <div class="panel" :style="panelStyle">
        <div class="header">
          <span class="swatch" :style="{ backgroundColor: colorHex }"></span>
          <span class="name">{{ character.name }}</span>
          <button class="close-btn" @click="uiStore.closeCharacterPanel">✕</button>
        </div>

        <div class="bar-track">
          <div class="bar-fill" :class="energyClass" :style="{ width: energyPercent + '%' }"></div>
        </div>
        <div class="energy-row">
          <span class="energy-value">{{ Math.round(character.energy) }} / {{ character.maxEnergy }}</span>
          <span v-if="character.alive" class="energy-rate" :class="energyRateClass">{{ energyRateLabel }}</span>
          <span v-else class="deceased-label">décédé(e)</span>
        </div>

        <div v-if="character.alive" class="actions">
          <div class="action-group">
            <button
              v-for="action in stateActions"
              :key="action.key"
              class="action-btn"
              :class="{ active: action.active }"
              @click="runStateAction(action)"
            >
              {{ action.label }}
            </button>
          </div>
          <div class="action-group">
            <button
              v-for="action in resourceActions"
              :key="action.key"
              class="action-btn"
              :disabled="action.disabled"
              @click="runResourceAction(action)"
            >
              {{ action.label }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.panel-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  pointer-events: auto;
}

.panel {
  position: fixed;
  width: 220px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: rgba(0, 0, 0, 0.92);
  color: #fff;
  padding: 10px 12px;
  border-radius: 10px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
  font-size: 12px;
}

.header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  font-size: 13px;
}

.swatch {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}

.name {
  flex: 1;
}

.close-btn {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  line-height: 1;
  padding: 4px;
}

.close-btn:hover {
  color: #fff;
}

.bar-track {
  height: 8px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.15);
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  transition: width 0.2s ease;
}

.bar-fill.high {
  background: #5fca6b;
}

.bar-fill.medium {
  background: #e0b23a;
}

.bar-fill.low {
  background: #e05a4a;
}

.energy-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-size: 11px;
}

.energy-value {
  opacity: 0.8;
}

.energy-rate {
  font-variant-numeric: tabular-nums;
  font-weight: 600;
}

.energy-rate.draining {
  color: #f2897a;
}

.energy-rate.recovering {
  color: #7fd88f;
}

.energy-rate.steady {
  color: rgba(255, 255, 255, 0.55);
}

.deceased-label {
  font-style: italic;
  opacity: 0.8;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 6px;
  border-top: 1px solid rgba(255, 255, 255, 0.15);
  padding-top: 8px;
}

.action-group {
  display: flex;
  gap: 6px;
}

.action-btn {
  flex: 1;
  border: none;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  padding: 8px 4px;
}

.action-btn.active {
  background: #d88a3f;
}

.action-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
</style>
