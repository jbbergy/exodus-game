import Phaser from 'phaser';
import { createApp } from 'vue';
import App from '@/App.vue';
import { createGameConfig } from '@/game/config';
import { pinia } from '@/state/pinia';
import '@/style.css';

const app = createApp(App);
app.use(pinia);
app.mount('#app');

new Phaser.Game(createGameConfig('game-canvas-container'));
