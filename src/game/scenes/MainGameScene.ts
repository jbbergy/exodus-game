import Phaser from 'phaser';
import { watch, type WatchStopHandle } from 'vue';
import type { BiomeId, CharacterState, DeathCause } from '@/domain/types';
import { Backdrop } from '@/game/entities/Backdrop';
import { Cart } from '@/game/entities/Cart';
import { CharacterSprite } from '@/game/entities/CharacterSprite';
import { DecorStreamManager, GROUND_LAYER_FACTOR, screenXAtWorld } from '@/game/entities/DecorStreamManager';
import { Grave } from '@/game/entities/Grave';
import { AudioManager } from '@/game/systems/AudioManager';
import { ConvoySystem } from '@/game/systems/ConvoySystem';
import { ResourceEventSystem } from '@/game/systems/ResourceEventSystem';
import { SicknessSystem } from '@/game/systems/SicknessSystem';
import { applyAudioSettings } from '@/game/utils/audioSettings';
import { computeCartScreenX, computeCartY, computeGraveY, computeGroundY } from '@/game/utils/layout';
import { eventBus } from '@/state/eventBus';
import { pinia } from '@/state/pinia';
import { useAudioStore } from '@/state/stores/audioStore';
import { useConvoyStore } from '@/state/stores/convoyStore';
import { useUiStore } from '@/state/stores/uiStore';

// Debounced so a window drag-resize (which can fire many 'resize' events per second) doesn't
// rebuild every streamed decor shape on every intermediate frame.
const RESIZE_DEBOUNCE_MS = 150;

export class MainGameScene extends Phaser.Scene {
  private readonly convoyStore = useConvoyStore(pinia);
  private readonly uiStore = useUiStore(pinia);
  private readonly audioStore = useAudioStore(pinia);

  private background!: Backdrop;
  private decor!: DecorStreamManager;
  private cart!: Cart;
  private characterSprites: CharacterSprite[] = [];
  private graves: Grave[] = [];
  private convoySystem!: ConvoySystem;
  private resourceEventSystem!: ResourceEventSystem;
  private sicknessSystem!: SicknessSystem;
  private audio!: AudioManager;
  private currentBiomeId!: BiomeId;
  private anyPanelWasOpen = false;
  private groundY = 0;
  private cartY = 0;
  private graveY = 0;
  private cartScreenX = 0;
  private resizeDebounceTimer?: ReturnType<typeof setTimeout>;
  private stopAudioWatch?: WatchStopHandle;

  constructor() {
    super('MainGameScene');
  }

  create(): void {
    this.currentBiomeId = this.convoyStore.convoy.currentBiome().id;
    this.groundY = computeGroundY(this.scale.height);
    this.cartY = computeCartY(this.groundY, this.scale.height);
    this.graveY = computeGraveY(this.groundY, this.scale.height);
    this.cartScreenX = computeCartScreenX(this.scale.width);

    const biomeSegments = this.convoyStore.convoy.biomeSegments;
    const cartPositionX = this.convoyStore.convoy.cartPositionX;
    this.background = new Backdrop(this, this.currentBiomeId, this.scale.width, this.scale.height, this.groundY);
    this.decor = new DecorStreamManager(
      this,
      biomeSegments,
      cartPositionX,
      this.cartScreenX,
      this.groundY,
      this.scale.width,
      this.scale.height,
    );
    this.cart = new Cart(this, this.cartScreenX, this.cartY);
    this.characterSprites = this.convoyStore.convoy.characters.map(
      (character) => new CharacterSprite(this, character, this.cartY),
    );

    this.convoySystem = new ConvoySystem(this.convoyStore.convoy);
    this.resourceEventSystem = new ResourceEventSystem(this.convoyStore.convoy, this.time.now);
    this.sicknessSystem = new SicknessSystem(this.convoyStore.convoy, this.time.now);
    this.audio = new AudioManager(this);

    // Reacts live to the audio toggle button — this.sound is the game-wide sound manager, so
    // this also covers the music track that's already looping from BootScene.
    this.stopAudioWatch = watch(
      () => this.audioStore.enabled,
      (enabled) => applyAudioSettings(this.sound, enabled),
    );

    eventBus.on('sendCharacterForResource', this.handleSendCharacter);
    eventBus.on('resultAcknowledged', this.handleResultAcknowledged);
    eventBus.on('tributeAcknowledged', this.handleTributeAcknowledged);
    eventBus.on('characterClicked', this.handleCharacterClicked);
    eventBus.on('cartClicked', this.handleCartClicked);
    this.scale.on('resize', this.handleResize);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      eventBus.off('sendCharacterForResource', this.handleSendCharacter);
      eventBus.off('resultAcknowledged', this.handleResultAcknowledged);
      eventBus.off('tributeAcknowledged', this.handleTributeAcknowledged);
      eventBus.off('characterClicked', this.handleCharacterClicked);
      eventBus.off('cartClicked', this.handleCartClicked);
      this.scale.off('resize', this.handleResize);
      clearTimeout(this.resizeDebounceTimer);
      this.stopAudioWatch?.();
    });
  }

  update(_time: number, delta: number): void {
    this.syncPanelInteractivity();

    if (this.convoySystem.paused || this.uiStore.orientationBlocked) {
      this.syncCharacterSprites();
      return;
    }

    const deltaSeconds = delta / 1000;
    const { newlyDead } = this.convoySystem.tick(deltaSeconds);

    const cartPositionX = this.convoyStore.convoy.cartPositionX;
    const biomeSegments = this.convoyStore.convoy.biomeSegments;
    this.background.update(cartPositionX, biomeSegments);
    this.decor.update(cartPositionX, biomeSegments, this.cartScreenX, this.scale.width);
    this.syncCharacterSprites();
    this.repositionGraves(cartPositionX);
    this.syncBiome();
    this.sicknessSystem.maybeSicken(this.time.now);

    if (newlyDead.length > 0) {
      this.handleDeath(newlyDead[0], 'convoy');
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
      characterSprite.updatePosition(this.cartScreenX, slot, this.cartY);
    }
  }

  /** Reprojects every grave's fixed world-x to the current screen-x — same formula the ground
   * decor layer uses (GROUND_LAYER_FACTOR), so graves scroll at the same rate as the ground
   * they're sitting on. */
  private repositionGraves(cartPositionX: number): void {
    for (const grave of this.graves) {
      const screenX = screenXAtWorld(grave.worldX, cartPositionX, this.cartScreenX, GROUND_LAYER_FACTOR);
      grave.reposition(screenX, this.graveY);
    }
  }

  /** Scale.RESIZE means the logical game size tracks the viewport — reposition the ground-line
   * layout immediately, but debounce regenerating the (cheap but numerous) background textures. */
  private handleResize = (gameSize: Phaser.Structs.Size): void => {
    const { width, height } = gameSize;
    this.groundY = computeGroundY(height);
    this.cartY = computeCartY(this.groundY, height);
    this.graveY = computeGraveY(this.groundY, height);
    this.cartScreenX = computeCartScreenX(width);
    this.cart.reposition(this.cartScreenX, this.cartY);
    this.repositionGraves(this.convoyStore.convoy.cartPositionX);

    clearTimeout(this.resizeDebounceTimer);
    this.resizeDebounceTimer = setTimeout(() => {
      const cartPositionX = this.convoyStore.convoy.cartPositionX;
      const biomeSegments = this.convoyStore.convoy.biomeSegments;
      this.background.resize(width, height, this.groundY, cartPositionX, biomeSegments);
      this.decor.resize(width, height, cartPositionX, this.cartScreenX, this.groundY, biomeSegments);
    }, RESIZE_DEBOUNCE_MS);
  };

  /** Cart and character panels are mutually exclusive (see uiStore), so a single flag covers
   * both: whichever is open, every other clickable sprite in the scene must stop reacting to
   * pointer input until the player explicitly closes it. */
  private syncPanelInteractivity(): void {
    const isOpen = this.uiStore.selectedCharacterId !== null || this.uiStore.cartSelected;
    if (isOpen === this.anyPanelWasOpen) return;

    this.anyPanelWasOpen = isOpen;
    for (const characterSprite of this.characterSprites) {
      // A dead character's sprite is hidden (see CharacterSprite.updatePosition) and must never
      // become clickable again once a panel closes.
      characterSprite.setInputEnabled(!isOpen && characterSprite.character.alive);
    }
    this.cart.setInputEnabled(!isOpen);
  }

  private syncBiome(): void {
    const biome = this.convoyStore.convoy.currentBiome();
    if (biome.id === this.currentBiomeId) return;

    this.currentBiomeId = biome.id;
    this.uiStore.showBiomeBanner(biome.name);
  }

  private handleCharacterClicked = (payload: { characterId: string; x: number; y: number }): void => {
    this.uiStore.selectCharacter(payload.characterId, { x: payload.x, y: payload.y });
  };

  private handleCartClicked = (payload: { x: number; y: number }): void => {
    this.uiStore.selectCart({ x: payload.x, y: payload.y });
  };

  private handleDeath(characterId: string, cause: DeathCause): void {
    this.convoySystem.paused = true;
    this.spawnGrave(characterId);
    this.uiStore.showTribute(characterId, cause);
    eventBus.emit('characterDied', { characterId });
  }

  /** Left behind at the character's last screen position, translated to a fixed world-x so it
   * scrolls away with the ground layer afterward instead of staying glued to the cart. */
  private spawnGrave(characterId: string): void {
    const characterSprite = this.characterSprites.find((cs) => cs.character.id === characterId);
    if (!characterSprite) return;

    const cartPositionX = this.convoyStore.convoy.cartPositionX;
    const worldX = cartPositionX + (characterSprite.sprite.x - this.cartScreenX) / GROUND_LAYER_FACTOR;
    this.graves.push(new Grave(this, worldX, characterSprite.sprite.x, this.graveY));
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
      this.handleDeath(outcome.characterId, 'exploration');
      return;
    }

    this.uiStore.showResult(outcome);
    this.audio.playSfx('resource-collected');
  };
}
