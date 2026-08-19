import type { Convoy } from '@/domain/Convoy';
import { SICKNESS_MAX_INTERVAL_MS, SICKNESS_MIN_INTERVAL_MS } from '@/game/constants';

/** Periodically (and independently of resource signals) picks a random living character to fall
 * sick — mirrors ResourceEventSystem's random-interval pattern. Never picks a new one while
 * another is already sick (see Convoy.sickCharacter): only a remedy, given via the character's
 * stats panel, clears the way for the next one. */
export class SicknessSystem {
  private readonly convoy: Convoy;
  private nextCheckAt: number;

  constructor(convoy: Convoy, nowMs: number) {
    this.convoy = convoy;
    this.nextCheckAt = nowMs + this.randomInterval();
  }

  private randomInterval(): number {
    const span = SICKNESS_MAX_INTERVAL_MS - SICKNESS_MIN_INTERVAL_MS;
    return SICKNESS_MIN_INTERVAL_MS + Math.random() * span;
  }

  /** Call every tick; returns the newly-sick character's id, if any. */
  maybeSicken(nowMs: number): string | null {
    if (nowMs < this.nextCheckAt) return null;

    this.nextCheckAt = nowMs + this.randomInterval();

    if (this.convoy.sickCharacter()) return null;

    const candidates = this.convoy.livingCharacters();
    if (candidates.length === 0) return null;

    const character = candidates[Math.floor(Math.random() * candidates.length)];
    character.makeSick();
    return character.id;
  }
}
