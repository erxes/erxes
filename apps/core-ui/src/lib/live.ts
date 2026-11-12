import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useSyncExternalStore } from 'react';

/**
 * Live updates from core's stream (`GET /core/v1/stream`, Server-Sent Events).
 *
 * One stream per browser, not per tab: tabs elect a leader with Web Locks;
 * the leader holds the EventSource and relays every message to the other tabs
 * over a BroadcastChannel. When the leader tab closes, its lock is released and
 * another tab takes over. (Browsers allow ~6 connections per site over HTTP/1.1;
 * a stream per tab would use them up.)
 *
 * Messages are signals, not data: `inbox`, `timeline { targets }`,
 * `plugin { plugin, topics }` (for plugin UIs, see erxes-ui's plugin runtime),
 * `resync`.
 * Queries refetch through the normal API. While the stream can't push
 * (`mode: polling`, offline, reconnecting) queries fall back to polling.
 */

export type LiveMode = 'connecting' | 'live' | 'polling';

export type LiveMessage =
  | { event: 'inbox' }
  | { event: 'timeline'; data: { targets: { targetType: string; targetId: string }[] } }
  | { event: 'plugin'; data: { plugin: string; topics: string[] } }
  | { event: 'resync' };

type Wire = LiveMessage | { event: 'mode'; data: LiveMode } | { event: 'mode?' };

const CHANNEL = 'erxes-live';
const LOCK = 'erxes-live-leader';

export class LiveClient {
  private mode: LiveMode = 'connecting';
  private readonly modeListeners = new Set<() => void>();
  private readonly listeners = new Set<(message: LiveMessage) => void>();
  private channel: BroadcastChannel | null = null;
  private source: EventSource | null = null;
  private releaseLock: (() => void) | null = null;
  private lockRequest: AbortController | null = null;
  private users = 0;
  private leading = false;
  private retries = 0;
  private retryTimer: ReturnType<typeof setTimeout> | null = null;

  getMode = () => this.mode;

  /** Back online (laptop woke, Wi-Fi back): reconnect now, not after the backoff. */
  private onOnline = () => {
    if (!this.leading || this.source) return;

    if (this.retryTimer) clearTimeout(this.retryTimer);
    this.retryTimer = null;
    this.retries = 0;
    this.open();
  };

  subscribeMode = (listener: () => void) => {
    this.modeListeners.add(listener);

    return () => this.modeListeners.delete(listener);
  };

  subscribe(listener: (message: LiveMessage) => void) {
    this.listeners.add(listener);

    return () => this.listeners.delete(listener);
  }

  private setMode(mode: LiveMode, broadcast: boolean) {
    if (broadcast) this.channel?.postMessage({ event: 'mode', data: mode } satisfies Wire);

    if (this.mode === mode) return;

    this.mode = mode;
    this.modeListeners.forEach((listener) => listener());
  }

  private deliver(message: LiveMessage, broadcast: boolean) {
    if (broadcast) this.channel?.postMessage(message satisfies Wire);
    this.listeners.forEach((listener) => listener(message));
  }

  /** Starts once per tab; callers balance it with `stop`. */
  start() {
    this.users += 1;

    if (this.users > 1) return;

    window.addEventListener('online', this.onOnline);

    if (typeof BroadcastChannel !== 'undefined') {
      this.channel = new BroadcastChannel(CHANNEL);
      this.channel.onmessage = ({ data }: MessageEvent<Wire>) => {
        if (data.event === 'mode') this.setMode(data.data, false);
        else if (data.event === 'mode?') {
          if (this.source)
            this.channel?.postMessage({ event: 'mode', data: this.mode } satisfies Wire);
        } else this.deliver(data, false);
      };

      // A follower asks the leader how things stand.
      this.channel.postMessage({ event: 'mode?' } satisfies Wire);
    }

    if (typeof navigator !== 'undefined' && 'locks' in navigator && this.channel) {
      const request = new AbortController();

      this.lockRequest = request;
      navigator.locks
        .request(
          LOCK,
          { signal: request.signal },
          () =>
            new Promise<void>((release) => {
              // Granted after this tab stopped: give it straight back.
              if (this.users === 0 || request.signal.aborted) {
                release();

                return;
              }

              this.releaseLock = release;
              this.lead();
            }),
        )
        .catch(() => undefined);
    } else {
      // No Web Locks: every tab holds its own stream.
      this.lead();
    }
  }

  private lead() {
    if (this.users === 0) return;

    this.leading = true;
    this.open();
  }

  /**
   * Opens the stream. EventSource retries dropped connections itself, but gives
   * up for good after an HTTP error (a 502 while the API restarts, a 401), so a
   * closed stream is reopened here: 1 s, 2 s, 4 s … up to 30 s, with jitter.
   */
  private open() {
    if (this.source || !this.leading || this.users === 0) return;

    const source = new EventSource('/core/v1/stream', { withCredentials: true });

    this.source = source;
    source.addEventListener('hello', (event) => {
      const { mode } = JSON.parse((event as MessageEvent<string>).data) as {
        mode: 'live' | 'polling';
      };

      this.retries = 0;
      this.setMode(mode, true);
      // Connected (again): whatever happened meanwhile is fetched now.
      this.deliver({ event: 'resync' }, true);
    });
    source.addEventListener('inbox', () => this.deliver({ event: 'inbox' }, true));
    source.addEventListener('timeline', (event) =>
      this.deliver(
        { event: 'timeline', data: JSON.parse((event as MessageEvent<string>).data) },
        true,
      ),
    );
    source.addEventListener('plugin', (event) =>
      this.deliver(
        { event: 'plugin', data: JSON.parse((event as MessageEvent<string>).data) },
        true,
      ),
    );
    source.addEventListener('resync', () => this.deliver({ event: 'resync' }, true));
    source.addEventListener('bye', () => {
      // The session ended; the app's own 401 handling takes it from here.
      this.leading = false;
      source.close();
      this.source = null;
      this.setMode('polling', true);
    });
    source.onerror = () => {
      // Poll until the stream is back.
      this.setMode('polling', true);

      if (source.readyState === EventSource.CLOSED) {
        this.source = null;
        this.scheduleReopen();
      }
    };
  }

  private scheduleReopen() {
    if (this.retryTimer || !this.leading) return;

    const delay = Math.min(30_000, 1000 * 2 ** this.retries) * (0.75 + Math.random() / 2);

    this.retries += 1;
    this.retryTimer = setTimeout(() => {
      this.retryTimer = null;
      this.open();
    }, delay);
  }

  stop() {
    this.users = Math.max(0, this.users - 1);

    if (this.users > 0) return;

    window.removeEventListener('online', this.onOnline);
    this.leading = false;

    if (this.retryTimer) clearTimeout(this.retryTimer);
    this.retryTimer = null;
    this.source?.close();
    this.source = null;
    this.lockRequest?.abort();
    this.lockRequest = null;
    this.releaseLock?.();
    this.releaseLock = null;
    this.channel?.close();
    this.channel = null;
    this.setMode('connecting', false);
  }
}

export const live = new LiveClient();

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
        void client.invalidateQueries({ queryKey: ['notifications'] });
      }

      if (message.event === 'timeline') {
        for (const target of message.data.targets) {
          void client.invalidateQueries({
            queryKey: ['activities', target.targetType, target.targetId],
          });
        }
      }

      if (message.event === 'resync') {
        void client.invalidateQueries({ queryKey: ['activities'] });
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
