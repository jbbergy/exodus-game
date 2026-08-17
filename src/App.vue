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
  width: 960px;
  height: 540px;
  margin: 24px auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
  border-radius: 8px;
  overflow: hidden;
}

.game-canvas-container {
  position: absolute;
  inset: 0;
  line-height: 0;
}
</style>
