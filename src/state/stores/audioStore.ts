import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAudioStore = defineStore('audio', () => {
  const enabled = ref(false);

  function toggle(): void {
    enabled.value = !enabled.value;
  }

  return { enabled, toggle };
});
