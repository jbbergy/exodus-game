<script setup lang="ts">
import { computed } from 'vue';
import { eventBus } from '@/state/eventBus';
import { useConvoyStore } from '@/state/stores/convoyStore';
import { useUiStore } from '@/state/stores/uiStore';

const convoyStore = useConvoyStore();
const uiStore = useUiStore();

const signal = computed(() => uiStore.pendingSignal);
const signalerName = computed(() => convoyStore.findCharacter(signal.value?.characterId ?? '')?.name ?? '???');

function send(characterId: string | null): void {
  eventBus.emit('sendCharacterForResource', { characterId });
}
</script>

<template>
  <div v-if="signal" class="dialogue-bubble">
    <p class="bubble-text">
      <strong>{{ signalerName }}</strong> :
      <span v-if="signal.resourceType === 'water'">« J'ai vu de l'eau près d'un rocher ! »</span>
      <span v-else>« Il y a des fruits dans ce bosquet... »</span>
    </p>
    <div class="choices">
      <button v-for="character in convoyStore.livingCharacters" :key="character.id" @click="send(character.id)">
        Envoyer {{ character.name }}
      </button>
      <button class="skip" @click="send(null)">Personne</button>
    </div>
  </div>
</template>

<style scoped>
.dialogue-bubble {
  position: absolute;
  left: 50%;
  bottom: 24px;
  transform: translateX(-50%);
  background: rgba(20, 16, 13, 0.92);
  color: #fff;
  padding: 14px 18px;
  border-radius: 12px;
  width: min(80%, 460px);
  pointer-events: auto;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}

.bubble-text {
  margin: 0 0 10px;
  font-size: 14px;
}

.choices {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.choices button {
  border: none;
  border-radius: 6px;
  padding: 6px 10px;
  background: #d88a3f;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
}

.choices button.skip {
  background: rgba(255, 255, 255, 0.15);
  font-weight: 400;
}
</style>
