<script setup lang="ts">
import { computed } from 'vue';
import { useConvoyStore } from '@/state/stores/convoyStore';
import { useUiStore } from '@/state/stores/uiStore';

const convoyStore = useConvoyStore();
const uiStore = useUiStore();

const PANEL_WIDTH = 180;
const PANEL_MAX_HEIGHT = 160;
const VIEWPORT_MARGIN = 8;

// Clamped to the viewport so a tap near an edge on a small mobile-landscape screen never
// pushes the panel out of view (mirrors CharacterStatsPanel's positioning).
const panelStyle = computed(() => {
  const position = uiStore.cartSelectedPosition;
  if (!position) return { display: 'none' };

  const maxLeft = Math.max(VIEWPORT_MARGIN, window.innerWidth - PANEL_WIDTH - VIEWPORT_MARGIN);
  const maxTop = Math.max(VIEWPORT_MARGIN, window.innerHeight - PANEL_MAX_HEIGHT - VIEWPORT_MARGIN);
  const left = Math.min(Math.max(position.x - PANEL_WIDTH / 2, VIEWPORT_MARGIN), maxLeft);
  const top = Math.min(Math.max(position.y + 16, VIEWPORT_MARGIN), maxTop);
  return { left: `${left}px`, top: `${top}px` };
});
</script>

<template>
  <Teleport to="body">
    <div v-if="uiStore.cartSelected" class="panel-overlay" @click.self="uiStore.closeCartPanel">
      <div class="panel" :style="panelStyle">
        <div class="header">
          <span class="title">Ressources</span>
          <button class="close-btn" @click="uiStore.closeCartPanel">✕</button>
        </div>
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
  width: 180px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: rgba(0, 0, 0, 0.92);
  color: #fff;
  padding: 8px 10px;
  border-radius: 10px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
  font-size: 12px;
}

.header {
  display: flex;
  align-items: center;
  gap: 6px;
}

.title {
  flex: 1;
  font-weight: 600;
  font-size: 13px;
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
