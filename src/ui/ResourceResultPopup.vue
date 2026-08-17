<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue';
import { eventBus } from '@/state/eventBus';
import { useConvoyStore } from '@/state/stores/convoyStore';
import { useUiStore } from '@/state/stores/uiStore';

const convoyStore = useConvoyStore();
const uiStore = useUiStore();

const outcome = computed(() => uiStore.lastOutcome);
const characterName = computed(() => convoyStore.findCharacter(outcome.value?.characterId ?? '')?.name ?? '???');
const resourceLabel = computed(() => (outcome.value?.resourceType === 'water' ? "d'eau" : 'de nourriture'));

function acknowledge(): void {
  eventBus.emit('resultAcknowledged', undefined);
}

let timer: ReturnType<typeof setTimeout> | undefined;
onMounted(() => {
  timer = setTimeout(acknowledge, 3500);
});
onUnmounted(() => {
  if (timer) clearTimeout(timer);
});
</script>

<template>
  <div v-if="outcome" class="result-popup" @click="acknowledge">
    <p>
      {{ characterName }} a rapporté <strong>{{ outcome.quantityGained }} {{ resourceLabel }}</strong>
    </p>
    <p class="cost">Coût : {{ outcome.energyCost }} énergie</p>
    <p class="hint">(cliquer pour continuer)</p>
  </div>
</template>

<style scoped>
.result-popup {
  position: absolute;
  left: 50%;
  bottom: 24px;
  transform: translateX(-50%);
  background: rgba(20, 16, 13, 0.92);
  color: #fff;
  padding: 14px 18px;
  border-radius: 12px;
  width: min(80%, 420px);
  text-align: center;
  pointer-events: auto;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}

.result-popup p {
  margin: 0 0 4px;
  font-size: 14px;
}

.cost {
  opacity: 0.8;
  font-size: 12px;
}

.hint {
  opacity: 0.55;
  font-size: 11px;
  margin-top: 8px;
}
</style>
