import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useSyncExternalStore } from 'react';
import { orpc } from '@erxes/core-contract/client';
import { LiveClient } from './liveClient';

/** This tab's share of the browser's one live stream (`LiveClient`). */
const live = new LiveClient();

/** `live` when changes are pushed; otherwise queries should poll. */
export const useLiveMode = () =>
  useSyncExternalStore(live.subscribeMode, live.getMode, live.getMode);

/** For queries that live updates keep fresh: poll only while nothing is pushed. */
export const useLivePolling = (interval = 30_000): number | false =>
  useLiveMode() === 'live' ? false : interval;

/**
 * Keeps the signed-in app current: refetches the inbox and the timelines that
 * changed, and everything after a reconnect. Mounted once, in the main layout.
 */
export const useLiveUpdates = () => {
  const client = useQueryClient();

  useEffect(() => {
    live.start();

    const unsubscribe = live.subscribe((message) => {
      if (message.event === 'inbox' || message.event === 'resync') {
        void client.invalidateQueries({ queryKey: orpc.notifications.key() });
      }

      if (message.event === 'timeline') {
        for (const { targetType, targetId } of message.data.targets) {
          void client.invalidateQueries({
            queryKey: orpc.activities.list.key({ input: { targetType, targetId } }),
          });
        }
      }

      if (message.event === 'resync') {
        void client.invalidateQueries({ queryKey: orpc.activities.key() });
      }
    });

    return () => {
      unsubscribe();
      live.stop();
    };
  }, [client]);
};

/** Plugin UIs hear their plugin's signals (and reconnects) through erxes-ui's runtime. */
export const pluginLive = (
  listener: (message: { plugin: string; topics: string[] } | { resync: true }) => void,
) =>
  live.subscribe((message) => {
    if (message.event === 'plugin') listener(message.data);
    else if (message.event === 'resync') listener({ resync: true });
  });
