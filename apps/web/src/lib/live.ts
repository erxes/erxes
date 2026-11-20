import type { StreamTopic } from '@erxes/core-contract';
import { type Query, type QueryClient, useQueryClient } from '@tanstack/react-query';
import { useEffect, useSyncExternalStore } from 'react';
import { LiveClient } from './liveClient';

declare module '@tanstack/react-query' {
  interface Register {
    queryMeta: { live?: readonly StreamTopic[] };
  }
}

/** This tab's share of the browser's one live stream (`LiveClient`). */
const live = new LiveClient();

/** `live` when changes are pushed; otherwise queries should poll. */
export const useLiveMode = () =>
  useSyncExternalStore(live.subscribeMode, live.getMode, live.getMode);

export const liveOptions = (topics: readonly StreamTopic[], interval: number | false = 30_000) => ({
  meta: { live: topics },
  refetchInterval: () => (live.getMode() === 'live' ? false : interval),
});

const isLive = (query: Query) => query.meta?.live !== undefined;

const refetch = (client: QueryClient, predicate: (query: Query) => boolean) =>
  void client.invalidateQueries({ predicate });

/**
 * Keeps the signed-in app current: refetches the queries whose topics changed, every live query
 * after a reconnect, and starts their polling when the stream drops. Mounted once, in the main layout.
 */
export const useLiveUpdates = () => {
  const client = useQueryClient();

  useEffect(() => {
    live.start();

    const unsubscribe = live.subscribe((message) => {
      if (message.event === 'resync') {
        refetch(client, isLive);

        return;
      }

      const changed = new Set(message.data.topics);

      refetch(client, (query) => query.meta?.live?.some((topic) => changed.has(topic)) ?? false);
    });

    const unsubscribeMode = live.subscribeMode(() => {
      if (live.getMode() === 'polling') refetch(client, isLive);
    });

    return () => {
      unsubscribe();
      unsubscribeMode();
      live.stop();
    };
  }, [client]);
};

const PLUGIN = 'plugin:';

/** Plugin UIs hear their plugin's topics (and reconnects) through erxes-ui's runtime. */
export const pluginLive = (
  listener: (message: { plugin: string; topics: string[] } | { resync: true }) => void,
) =>
  live.subscribe((message) => {
    if (message.event === 'resync') {
      listener({ resync: true });

      return;
    }

    const byPlugin = new Map<string, string[]>();

    for (const topic of message.data.topics) {
      if (!topic.startsWith(PLUGIN)) continue;

      const rest = topic.slice(PLUGIN.length);
      const at = rest.indexOf(':');
      const plugin = rest.slice(0, at);

      byPlugin.set(plugin, [...(byPlugin.get(plugin) ?? []), rest.slice(at + 1)]);
    }

    for (const [plugin, topics] of byPlugin) listener({ plugin, topics });
  });
