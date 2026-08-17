<script setup lang="ts">
import { computed } from 'vue';
import { eventBus } from '@/state/eventBus';
import { useConvoyStore } from '@/state/stores/convoyStore';
import { useUiStore } from '@/state/stores/uiStore';

const convoyStore = useConvoyStore();
const uiStore = useUiStore();

const character = computed(() => convoyStore.findCharacter(uiStore.deceasedCharacterId ?? ''));
const colorHex = computed(() => '#' + (character.value?.color ?? 0).toString(16).padStart(6, '0'));

function acknowledge(): void {
  eventBus.emit('tributeAcknowledged', undefined);
}
</script>

<template>
  <div v-if="character" class="tribute-screen">
    <div class="tribute-card">
      <span class="swatch" :style="{ backgroundColor: colorHex }"></span>
      <h2>{{ character.name }}</h2>
      <p>s'est éteint(e), épuisé(e) par le voyage.</p>
      <p class="hommage">Le convoi s'arrête un instant pour lui rendre hommage.</p>
      <button @click="acknowledge">Continuer</button>
    </div>
  </div>
</template>

<style scoped>
.tribute-screen {
  position: absolute;
  inset: 0;
  background: rgba(10, 8, 6, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
}

.tribute-card {
  background: rgba(20, 16, 13, 0.95);
  color: #fff;
  padding: 28px 36px;
  border-radius: 14px;
  text-align: center;
  max-width: 360px;
}

.swatch {
  display: inline-block;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  margin-bottom: 10px;
}

.tribute-card h2 {
  margin: 0 0 6px;
}

.tribute-card p {
  margin: 4px 0;
  font-size: 14px;
  opacity: 0.85;
}

.hommage {
  font-style: italic;
  opacity: 0.7;
}

.tribute-card button {
  margin-top: 18px;
  border: none;
  border-radius: 6px;
  padding: 8px 20px;
  background: #d88a3f;
  color: #fff;
  font-weight: 600;
}
</style>
