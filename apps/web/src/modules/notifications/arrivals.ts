import type { Notification } from '@erxes/core-contract';
import { type QueryClient, QueryObserver } from '@tanstack/react-query';
import { orpc } from '@erxes/core-contract/client';
import { liveOptions } from '~/lib/live';

/**
 * Calls `onNew` with each unread notification that arrives after it starts:
 * what was there already isn't news. The list refetches on the live inbox
 * signal (or the poll), and every watcher shares its one query. Returns the
 * unsubscribe.
 */
export const watchArrivals = (client: QueryClient, onNew: (item: Notification) => void) => {
  // A failed check stays quiet: the next live signal or poll tries again.
  const latest = new QueryObserver(
    client,
    orpc.notifications.list.queryOptions({
      input: { limit: 5, unread: 'true', direction: 'forward', cursorMode: 'exclusive' },
      ...liveOptions(['inbox']),
    }),
  );

  let seen: Set<string> | undefined;

  return latest.subscribe(({ data }) => {
    if (!data) return;

    if (!seen) {
      seen = new Set(data.data.map((item) => item.id));

      return;
    }

    for (const item of data.data) {
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      onNew(item);
    }
  });
};
