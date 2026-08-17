<script setup lang="ts">
import UiOverlay from '@/ui/UiOverlay.vue';
</script>

<template>
  <div class="app-root">
    <div id="game-canvas-container" class="game-canvas-container"></div>
    <UiOverlay />
  </div>
</template>

<style scoped>
.app-root {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.game-canvas-container {
  position: absolute;
  inset: 0;
  line-height: 0;
}
</style>
