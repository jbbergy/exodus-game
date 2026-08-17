<script setup lang="ts">
import { computed } from 'vue';
import type { Character } from '@/domain/Character';
import { useUiStore } from '@/state/stores/uiStore';

const props = defineProps<{ character: Character }>();
const uiStore = useUiStore();

const colorHex = computed(() => '#' + props.character.color.toString(16).padStart(6, '0'));

function onMouseMove(event: MouseEvent): void {
  uiStore.setHoveredCharacter(props.character.id, { x: event.clientX, y: event.clientY });
}
</script>

<template>
  <span
    class="swatch"
    :class="{ dead: !character.alive }"
    :style="{ backgroundColor: colorHex }"
    @mousemove="onMouseMove"
    @mouseleave="uiStore.scheduleHoverClear"
  ></span>
</template>

<style scoped>
.swatch {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: inline-block;
  border: 2px solid rgba(255, 255, 255, 0.5);
  cursor: pointer;
}

.swatch.dead {
  opacity: 0.3;
  filter: grayscale(1);
}
</style>
