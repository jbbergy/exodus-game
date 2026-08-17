<script setup lang="ts">
import { computed } from 'vue';
import type { Character } from '@/domain/Character';
import type { CharacterState, ResourceType } from '@/domain/types';
import { useConvoyStore } from '@/state/stores/convoyStore';

const props = defineProps<{ character: Character }>();
const convoyStore = useConvoyStore();

const colorHex = computed(() => '#' + props.character.color.toString(16).padStart(6, '0'));
const energyPercent = computed(() => (props.character.energy / props.character.maxEnergy) * 100);
const energyClass = computed(() => {
  if (energyPercent.value > 50) return 'high';
  if (energyPercent.value > 20) return 'medium';
  return 'low';
});

const energyRate = computed(() => convoyStore.convoy.effectiveEnergyRate(props.character));
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

const stateLabels: Record<CharacterState, string> = {
  pulling: 'Tirer',
  resting: 'Reposer',
  walking: 'Marcher',
};

function setState(state: CharacterState): void {
  convoyStore.setCharacterState(props.character.id, state);
}

const waterUsable = computed(() => convoyStore.currentBiome.waterUsable);

function consume(type: ResourceType): void {
  convoyStore.consumeResourceFor(props.character.id, type);
}
</script>

<template>
  <div class="card" :class="{ dead: !character.alive }">
    <div class="header">
      <span class="swatch" :style="{ backgroundColor: colorHex }"></span>
      <span class="name">{{ character.name }}</span>
    </div>

    <div class="details">
      <div class="bar-track">
        <div class="bar-fill" :class="energyClass" :style="{ width: energyPercent + '%' }"></div>
      </div>
      <div class="energy-row">
        <span class="energy-value">{{ Math.round(character.energy) }} / {{ character.maxEnergy }}</span>
        <span v-if="character.alive" class="energy-rate" :class="energyRateClass">{{ energyRateLabel }}</span>
      </div>

      <template v-if="character.alive">
        <div class="button-row">
          <button
            v-for="(label, state) in stateLabels"
            :key="state"
            :class="{ active: character.state === state }"
            @click="setState(state as CharacterState)"
          >
            {{ label }}
          </button>
        </div>
        <div class="button-row">
          <button :disabled="convoyStore.inventory.water <= 0 || !waterUsable" @click="consume('water')">+💧</button>
          <button :disabled="convoyStore.inventory.food <= 0" @click="consume('food')">+🍞</button>
        </div>
      </template>
      <div v-else class="deceased-label">décédé(e)</div>
    </div>
  </div>
</template>

<style scoped>
.card {
  position: relative;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  padding: 6px 10px;
  border-radius: 10px;
  font-size: 12px;
}

.card.dead {
  opacity: 0.55;
}

.header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  font-size: 13px;
  cursor: default;
}

.swatch {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}

.details {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 6px;
  width: 160px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: rgba(0, 0, 0, 0.85);
  padding: 8px 10px;
  border-radius: 10px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.35);
  opacity: 0;
  transform: translateY(-4px);
  pointer-events: none;
  transition:
    opacity 0.12s ease,
    transform 0.12s ease;
  z-index: 30;
}

.card:hover .details,
.card:focus-within .details {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
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

.button-row {
  display: flex;
  gap: 4px;
}

.button-row button {
  flex: 1;
  border: none;
  border-radius: 5px;
  padding: 3px 4px;
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  font-size: 11px;
}

.button-row button.active {
  background: #d88a3f;
  font-weight: 600;
}

.button-row button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.deceased-label {
  font-style: italic;
  font-size: 11px;
  opacity: 0.8;
}
</style>
