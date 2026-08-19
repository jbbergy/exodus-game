<script setup lang="ts">
import { useAudioStore } from '@/state/stores/audioStore';

const audioStore = useAudioStore();
</script>

<template>
  <button
    class="audio-toggle"
    :class="{ enabled: audioStore.enabled }"
    :aria-label="audioStore.enabled ? 'Couper le son' : 'Activer le son'"
    @click="audioStore.toggle"
  >
    {{ audioStore.enabled ? '🔊' : '🔇' }}
  </button>
</template>

<style scoped>
.audio-toggle {
  position: fixed;
  top: 12px;
  right: 12px;
  z-index: 60;
  pointer-events: auto;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  font-size: 18px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.audio-toggle.enabled {
  background: rgba(216, 138, 63, 0.85);
}
</style>
