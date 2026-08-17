<script setup lang="ts">
import { watch } from 'vue';
import { BIOME_BANNER_DURATION_MS } from '@/game/constants';
import { useUiStore } from '@/state/stores/uiStore';

const uiStore = useUiStore();

let timer: ReturnType<typeof setTimeout> | undefined;
watch(
  () => uiStore.biomeBannerText,
  (text) => {
    if (timer) clearTimeout(timer);
    if (text) timer = setTimeout(() => uiStore.dismissBiomeBanner(), BIOME_BANNER_DURATION_MS);
  },
);
</script>

<template>
  <div v-if="uiStore.biomeBannerText" class="biome-banner">
    {{ uiStore.biomeBannerText }}
  </div>
</template>

<style scoped>
.biome-banner {
  position: absolute;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(20, 16, 13, 0.85);
  color: #fff;
  padding: 8px 18px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.02em;
  pointer-events: none;
}
</style>
