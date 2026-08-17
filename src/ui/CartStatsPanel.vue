<script setup lang="ts">
import { computed } from 'vue';
import { useConvoyStore } from '@/state/stores/convoyStore';
import { useUiStore } from '@/state/stores/uiStore';

const convoyStore = useConvoyStore();
const uiStore = useUiStore();

const panelStyle = computed(() => {
  const position = uiStore.cartHoverPosition;
  if (!position) return { display: 'none' };
  return { left: `${position.x + 16}px`, top: `${position.y + 16}px` };
});
</script>

<template>
  <Teleport to="body">
    <div v-if="uiStore.cartHovered" class="panel" :style="panelStyle">
      <div class="header">Ressources</div>
      <div class="resource-row">
        <span>💧 Eau</span>
        <span>{{ convoyStore.inventory.water }}</span>
      </div>
      <div class="resource-row">
        <span>🍞 Nourriture</span>
        <span>{{ convoyStore.inventory.food }}</span>
      </div>
      <div class="resource-row">
        <span>Vitesse</span>
        <span v-if="convoyStore.speed === 0" class="stalled">À l'arrêt !</span>
        <span v-else>{{ convoyStore.speed.toFixed(0) }}</span>
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
  font-weight: 600;
  font-size: 13px;
}

.resource-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  opacity: 0.9;
}

.stalled {
  color: #ff8f7a;
  font-weight: 600;
  opacity: 1;
}
</style>
