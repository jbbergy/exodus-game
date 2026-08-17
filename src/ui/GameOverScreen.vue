<script setup lang="ts"></script>

<template>
  <div class="game-over-screen">
    <div class="game-over-card">
      <h1>Fin de l'exode</h1>
      <p>Le convoi n'a pas survécu au voyage.</p>
      <p class="hint">(à développer)</p>
    </div>
  </div>
</template>

<style scoped>
.game-over-screen {
  position: absolute;
  inset: 0;
  background: rgba(5, 4, 3, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
}

.game-over-card {
  text-align: center;
  color: #fff;
}

.game-over-card h1 {
  margin: 0 0 8px;
  font-size: 28px;
}

.hint {
  opacity: 0.5;
  font-size: 12px;
  margin-top: 12px;
}
</style>
