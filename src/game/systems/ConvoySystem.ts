import type { Convoy } from '@/domain/Convoy';

export interface ConvoyTickResult {
  distanceDelta: number;
  newlyDead: string[];
}

export class ConvoySystem {
  private readonly convoy: Convoy;
  paused = false;

  constructor(convoy: Convoy) {
    this.convoy = convoy;
  }

  tick(deltaSeconds: number): ConvoyTickResult {
    if (this.paused) {
      return { distanceDelta: 0, newlyDead: [] };
    }

    const newlyDead: string[] = [];
    for (const character of this.convoy.characters) {
      if (!character.alive) continue;
      character.tickEnergy(deltaSeconds, this.convoy.effectiveEnergyRate(character));
      if (!character.alive) newlyDead.push(character.id);
    }

    const before = this.convoy.cartPositionX;
    this.convoy.advance(deltaSeconds);
    const distanceDelta = this.convoy.cartPositionX - before;

    return { distanceDelta, newlyDead };
  }
}
