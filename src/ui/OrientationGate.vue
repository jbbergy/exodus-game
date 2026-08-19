<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { useUiStore } from '@/state/stores/uiStore';

const uiStore = useUiStore();

// Only touch/mobile devices are forced into landscape — a desktop window resized to be taller
// than wide (e.g. a narrow browser split) must never trigger this gate.
function isTouchDevice(): boolean {
  return window.matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0;
}

function isPortrait(): boolean {
  return window.innerHeight > window.innerWidth;
}

function updateOrientation(): void {
  uiStore.setOrientationBlocked(isTouchDevice() && isPortrait());
}

onMounted(() => {
  updateOrientation();
  window.addEventListener('resize', updateOrientation);
  window.addEventListener('orientationchange', updateOrientation);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateOrientation);
  window.removeEventListener('orientationchange', updateOrientation);
});
</script>

<template>
  <Teleport to="body">
    <div v-if="uiStore.orientationBlocked" class="gate">
      <div class="icon">📱</div>
      <p>Tournez votre appareil en mode paysage pour jouer.</p>
    </div>
  </Teleport>
</template>

<style scoped>
.gate {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  background: #14100d;
  color: #f2ede4;
  text-align: center;
  padding: 0 32px;
  pointer-events: auto;
}

.icon {
  font-size: 48px;
  animation: rotate-hint 1.6s ease-in-out infinite;
}

p {
  font-size: 16px;
  max-width: 280px;
}

@keyframes rotate-hint {
  0%,
  100% {
    transform: rotate(0deg);
  }
  50% {
    transform: rotate(90deg);
  }
}
</style>
