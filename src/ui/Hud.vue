<script setup lang="ts">
import { useConvoyStore } from '@/state/stores/convoyStore';

const convoyStore = useConvoyStore();
</script>

<template>
  <div class="hud">
    <div class="convoy-status">
      <span class="biome-name">📍 {{ convoyStore.currentBiome.name }}</span>
      <span>💧 {{ convoyStore.inventory.water }}</span>
      <span>🍞 {{ convoyStore.inventory.food }}</span>
      <span v-if="convoyStore.speed === 0" class="stalled">Convoi à l'arrêt !</span>
      <span v-else>Vitesse : {{ convoyStore.speed.toFixed(0) }}</span>
    </div>
  </div>
</template>

<style scoped>
.hud {
  position: absolute;
  top: 12px;
  left: 12px;
  right: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.convoy-status {
  display: flex;
  gap: 16px;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  padding: 6px 12px;
  border-radius: 8px;
  width: fit-content;
  font-size: 13px;
}

.stalled {
  color: #ff8f7a;
  font-weight: 600;
}

.biome-name {
  opacity: 0.9;
}
</style>
