import Phaser from 'phaser';
import type { BiomeId, CharacterState } from '@/domain/types';
import { Cart, CART_SCREEN_X } from '@/game/entities/Cart';
import { CharacterSprite } from '@/game/entities/CharacterSprite';
import { ParallaxBackground } from '@/game/entities/ParallaxBackground';
import { AudioManager } from '@/game/systems/AudioManager';
import { ConvoySystem } from '@/game/systems/ConvoySystem';
import { ResourceEventSystem } from '@/game/systems/ResourceEventSystem';
import { eventBus } from '@/state/eventBus';
import { pinia } from '@/state/pinia';
import { useConvoyStore } from '@/state/stores/convoyStore';
import { useUiStore } from '@/state/stores/uiStore';

export class MainGameScene extends Phaser.Scene {
  private readonly convoyStore = useConvoyStore(pinia);
  private readonly uiStore = useUiStore(pinia);

  private background!: ParallaxBackground;
  private characterSprites: CharacterSprite[] = [];
  private convoySystem!: ConvoySystem;
  private resourceEventSystem!: ResourceEventSystem;
  private audio!: AudioManager;
  private currentBiomeId!: BiomeId;

  constructor() {
    super('MainGameScene');
  }

  create(): void {
    this.currentBiomeId = this.convoyStore.convoy.currentBiome().id;
    this.background = new ParallaxBackground(this, this.currentBiomeId);
    new Cart(this);
    this.characterSprites = this.convoyStore.convoy.characters.map(
      (character) => new CharacterSprite(this, character),
    );

    this.convoySystem = new ConvoySystem(this.convoyStore.convoy);
    this.resourceEventSystem = new ResourceEventSystem(this.convoyStore.convoy, this.time.now);
    this.audio = new AudioManager(this);

    eventBus.on('sendCharacterForResource', this.handleSendCharacter);
    eventBus.on('resultAcknowledged', this.handleResultAcknowledged);
    eventBus.on('tributeAcknowledged', this.handleTributeAcknowledged);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      eventBus.off('sendCharacterForResource', this.handleSendCharacter);
      eventBus.off('resultAcknowledged', this.handleResultAcknowledged);
      eventBus.off('tributeAcknowledged', this.handleTributeAcknowledged);
    });
  }

  update(_time: number, delta: number): void {
    if (this.convoySystem.paused) {
      this.syncCharacterSprites();
      return;
    }

    const deltaSeconds = delta / 1000;
    const { distanceDelta, newlyDead } = this.convoySystem.tick(deltaSeconds);

    this.background.scroll(distanceDelta);
    this.syncCharacterSprites();
    this.syncBiome();

    if (newlyDead.length > 0) {
      this.handleDeath(newlyDead[0]);
      return;
    }

    if (this.uiStore.activeModal === 'signal') {
      // The convoy keeps moving while the player decides; running out of time
      // resolves exactly like clicking "Personne".
      if (this.resourceEventSystem.isSignalExpired(this.time.now)) {
        this.handleSendCharacter({ characterId: null });
      }
      return;
    }

    const signal = this.resourceEventSystem.maybeRaiseSignal(this.time.now);
    if (signal) {
      this.uiStore.raiseSignal(signal);
      eventBus.emit('signalRaised', { signal });
    }
  }

  private syncCharacterSprites(): void {
    const slots: Record<CharacterState, number> = { pulling: 0, resting: 0, walking: 0 };
    for (const characterSprite of this.characterSprites) {
      const { state, alive } = characterSprite.character;
      const slot = alive ? slots[state]++ : 0;
      characterSprite.updatePosition(CART_SCREEN_X, slot);
    }
  }

  private syncBiome(): void {
    const biome = this.convoyStore.convoy.currentBiome();
    if (biome.id === this.currentBiomeId) return;

    this.currentBiomeId = biome.id;
    this.background.setBiome(biome.id);
    this.uiStore.showBiomeBanner(biome.name);
  }

  private handleDeath(characterId: string): void {
    this.convoySystem.paused = true;
    this.uiStore.showTribute(characterId);
    eventBus.emit('characterDied', { characterId });
  }

  private handleResultAcknowledged = (): void => {
    this.uiStore.dismissResult();
    this.convoySystem.paused = false;
  };

  private handleTributeAcknowledged = (): void => {
    this.uiStore.dismissTribute();

    if (this.convoyStore.livingCharacters.length === 0) {
      this.uiStore.showGameOver();
      this.convoySystem.paused = true;
      return;
    }

    this.convoySystem.paused = false;
  };

  private handleSendCharacter = (payload: { characterId: string | null }): void => {
    const signal = this.uiStore.pendingSignal;
    if (!signal) return;

    const outcome = this.resourceEventSystem.resolve(payload.characterId, signal.resourceType, this.time.now);

    if (!outcome) {
      this.uiStore.clearSignal();
      this.convoySystem.paused = false;
      return;
    }

    eventBus.emit('resourceResolved', { outcome });

    if (outcome.died) {
      this.uiStore.clearSignal();
      this.handleDeath(outcome.characterId);
      return;
    }

    this.uiStore.showResult(outcome);
    this.audio.playSfx('resource-collected');
  };
}
