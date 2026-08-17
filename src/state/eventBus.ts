import mitt from 'mitt';
import type { CollectionOutcome } from '@/domain/Resource';
import type { ResourceSignal } from '@/domain/types';

export type AppEvents = {
  signalRaised: { signal: ResourceSignal };
  sendCharacterForResource: { characterId: string | null };
  resourceResolved: { outcome: CollectionOutcome };
  characterDied: { characterId: string };
  characterHoverChanged: { characterId: string | null };
  resultAcknowledged: undefined;
  tributeAcknowledged: undefined;
};

export const eventBus = mitt<AppEvents>();
