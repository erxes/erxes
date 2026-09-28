import { graphqlPubsub } from 'erxes-api-shared/utils';

export type TBroadcastChangedEvent = {
  engageMessageId: string;
  status?: string;
  progress?: {
    processedBatches?: number;
    totalBatches?: number;
    successCount?: number;
    failureCount?: number;
    lastUpdated?: Date;
  };
};

const PROGRESS_INTERVAL_MS = 1000;

const lastProgressAt = new Map<string, number>();

/**
 * Tells whoever has the campaign open that the worker moved it. A status
 * change always goes out; progress is held to one a second, since a drain
 * reports after every block.
 */
export const publishBroadcastChanged = (
  subdomain: string,
  event: TBroadcastChangedEvent,
): void => {
  if (!event.status) {
    const now = Date.now();

    if (
      now - (lastProgressAt.get(event.engageMessageId) || 0) <
      PROGRESS_INTERVAL_MS
    ) {
      return;
    }

    lastProgressAt.set(event.engageMessageId, now);
  } else {
    lastProgressAt.delete(event.engageMessageId);
  }

  graphqlPubsub.publish(`broadcastChanged:${subdomain}`, {
    broadcastChanged: event,
  });
};
