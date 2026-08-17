import mitt from 'mitt';
import type { CollectionOutcome } from '@/domain/Resource';
import type { ResourceSignal } from '@/domain/types';

export type AppEvents = {
  signalRaised: { signal: ResourceSignal };
  sendCharacterForResource: { characterId: string | null };
  resourceResolved: { outcome: CollectionOutcome };
  characterDied: { characterId: string };
  characterHoverChanged: { characterId: string; x: number; y: number } | { characterId: null };
  characterClicked: { characterId: string; x: number; y: number };
  resultAcknowledged: undefined;
  tributeAcknowledged: undefined;
};

export const eventBus = mitt<AppEvents>();
