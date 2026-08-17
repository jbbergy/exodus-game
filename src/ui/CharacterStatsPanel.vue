<script setup lang="ts">
import { computed } from 'vue';
import { useConvoyStore } from '@/state/stores/convoyStore';
import { useUiStore } from '@/state/stores/uiStore';

const convoyStore = useConvoyStore();
const uiStore = useUiStore();

const character = computed(() => convoyStore.findCharacter(uiStore.hoveredCharacterId ?? ''));

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

const panelStyle = computed(() => {
  const position = uiStore.hoverPosition;
  if (!position) return { display: 'none' };
  return { left: `${position.x + 16}px`, top: `${position.y + 16}px` };
});
</script>

<template>
  <Teleport to="body">
    <div v-if="character" class="panel" :style="panelStyle">
      <div class="header">
        <span class="swatch" :style="{ backgroundColor: colorHex }"></span>
        <span class="name">{{ character.name }}</span>
      </div>

      <div class="bar-track">
        <div class="bar-fill" :class="energyClass" :style="{ width: energyPercent + '%' }"></div>
      </div>
      <div class="energy-row">
        <span class="energy-value">{{ Math.round(character.energy) }} / {{ character.maxEnergy }}</span>
        <span v-if="character.alive" class="energy-rate" :class="energyRateClass">{{ energyRateLabel }}</span>
        <span v-else class="deceased-label">décédé(e)</span>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.panel {
  position: fixed;
  width: 150px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: rgba(0, 0, 0, 0.88);
  color: #fff;
  padding: 8px 10px;
  border-radius: 10px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
  font-size: 12px;
  pointer-events: none;
  z-index: 50;
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
</style>
