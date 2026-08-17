import type { Convoy } from '@/domain/Convoy';
import type { CollectionOutcome } from '@/domain/Resource';
import type { ResourceSignal, ResourceType } from '@/domain/types';
import { RESOURCE_SIGNAL_MAX_INTERVAL_MS, RESOURCE_SIGNAL_MIN_INTERVAL_MS } from '@/game/constants';
import { rollHiddenEnergyCost, rollResourceQuantity } from '@/game/systems/EnergyRng';

let signalCounter = 0;

export class ResourceEventSystem {
  private readonly convoy: Convoy;
  private nextSignalAt: number;
  private pending = false;

  constructor(convoy: Convoy, nowMs: number) {
    this.convoy = convoy;
    this.nextSignalAt = nowMs + this.randomInterval();
  }

  private randomInterval(): number {
    const span = RESOURCE_SIGNAL_MAX_INTERVAL_MS - RESOURCE_SIGNAL_MIN_INTERVAL_MS;
    return RESOURCE_SIGNAL_MIN_INTERVAL_MS + Math.random() * span;
  }

  /** Call every tick; returns a new signal once the random interval has elapsed. */
  maybeRaiseSignal(nowMs: number): ResourceSignal | null {
    if (this.pending) return null;
    if (nowMs < this.nextSignalAt) return null;

    const living = this.convoy.livingCharacters();
    if (living.length === 0) return null;

    const character = living[Math.floor(Math.random() * living.length)];
    const resourceType: ResourceType = Math.random() < 0.5 ? 'water' : 'food';

    this.pending = true;
    signalCounter += 1;
    return { id: `signal-${signalCounter}`, characterId: character.id, resourceType };
  }

  /** Resolves the player's choice for a pending signal. characterId null = "send nobody". */
  resolve(characterId: string | null, resourceType: ResourceType, nowMs: number): CollectionOutcome | null {
    this.pending = false;
    this.nextSignalAt = nowMs + this.randomInterval();

    if (!characterId) return null;

    const character = this.convoy.characters.find((c) => c.id === characterId);
    if (!character) return null;

    const energyCost = rollHiddenEnergyCost();
    const died = character.energy < energyCost;

    if (died) {
      character.die();
    } else {
      character.restoreEnergy(-energyCost);
    }

    const quantityGained = rollResourceQuantity(resourceType);
    if (!died) {
      this.convoy.addResource(resourceType, quantityGained);
    }

    return { characterId, resourceType, energyCost, quantityGained, died };
  }
}
