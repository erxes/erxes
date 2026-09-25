import { useApolloClient, useSubscription } from '@apollo/client';
import { BROADCAST_CHANGED } from '../graphql/subscriptions';
import {
  BROADCAST_RUNS,
  BROADCAST_STATISTIC,
  BROADCAST_TRACES,
} from '../graphql/queries';

export type TBroadcastChangedEvent = {
  engageMessageId: string;
  status?: string;
  progress?: Record<string, unknown>;
};

/** Hears what the broadcast worker does to one campaign, or to all of them. */
export const useBroadcastChanged = (
  engageMessageId: string | undefined,
  onChange: (event: TBroadcastChangedEvent) => void,
  skip = false,
) => {
  useSubscription<{ broadcastChanged: TBroadcastChangedEvent }>(
    BROADCAST_CHANGED,
    {
      variables: { engageMessageId },
      skip,
      onData: ({ data: result }) => {
        const event = result.data?.broadcastChanged;

        if (event) {
          onChange(event);
        }
      },
    },
  );
};

/**
 * Keeps every open view of a campaign in step with the worker, which moves it
 * without any mutation the page could refetch after. Status and progress are
 * written straight into the cache; the lists a status change adds to are
 * asked again.
 */
export const useBroadcastLiveSync = () => {
  const client = useApolloClient();

  useBroadcastChanged(undefined, (event) => {
    client.cache.modify({
      id: client.cache.identify({
        __typename: 'EngageMessage',
        _id: event.engageMessageId,
      }),
      fields: {
        status: (previous) => event.status ?? previous,
        progress: (previous) =>
          event.progress
            ? { ...(previous || {}), ...event.progress }
            : previous,
      },
    });

    if (event.status) {
      client.refetchQueries({
        include: [BROADCAST_RUNS, BROADCAST_TRACES, BROADCAST_STATISTIC],
      });
    }
  });
};
