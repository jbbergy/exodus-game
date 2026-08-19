<script setup lang="ts">
import AudioToggle from '@/ui/AudioToggle.vue';
import BiomeBanner from '@/ui/BiomeBanner.vue';
import CartStatsPanel from '@/ui/CartStatsPanel.vue';
import CharacterStatsPanel from '@/ui/CharacterStatsPanel.vue';
import DialogueBubble from '@/ui/DialogueBubble.vue';
import GameOverScreen from '@/ui/GameOverScreen.vue';
import Hud from '@/ui/Hud.vue';
import OrientationGate from '@/ui/OrientationGate.vue';
import ResourceResultPopup from '@/ui/ResourceResultPopup.vue';
import TributeScreen from '@/ui/TributeScreen.vue';
import { useUiStore } from '@/state/stores/uiStore';

const uiStore = useUiStore();
</script>

<template>
  <div class="ui-overlay">
    <Hud />
    <AudioToggle />
    <BiomeBanner />
    <CartStatsPanel />
    <CharacterStatsPanel />
    <OrientationGate />
    <DialogueBubble v-if="uiStore.activeModal === 'signal'" />
    <ResourceResultPopup v-else-if="uiStore.activeModal === 'result'" />
    <TributeScreen v-else-if="uiStore.activeModal === 'tribute'" />
    <GameOverScreen v-else-if="uiStore.activeModal === 'gameover'" />
  </div>
</template>

<style scoped>
.ui-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  font-family: system-ui, 'Segoe UI', Roboto, sans-serif;
  color: #2b2320;
}
</style>
