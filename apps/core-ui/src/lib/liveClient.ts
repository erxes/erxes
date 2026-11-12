import { z } from 'zod';

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
 * `resync`. Queries refetch through the normal API. While the stream can't push
 * (`mode: polling`, offline, reconnecting) queries fall back to polling.
 */

const liveMode = z.enum(['connecting', 'live', 'polling']);
const hello = z.object({ mode: z.enum(['live', 'polling']) });
const timeline = z.object({
  targets: z.array(z.object({ targetType: z.string(), targetId: z.string() })),
});
const plugin = z.object({ plugin: z.string(), topics: z.array(z.string()) });

const liveMessage = z.discriminatedUnion('event', [
  z.object({ event: z.literal('inbox') }),
  z.object({ event: z.literal('timeline'), data: timeline }),
  z.object({ event: z.literal('plugin'), data: plugin }),
  z.object({ event: z.literal('resync') }),
]);

/** What tabs say to each other: stream messages, the leader's mode, and a follower asking for it. */
const wire = z.union([
  liveMessage,
  z.object({ event: z.literal('mode'), data: liveMode }),
  z.object({ event: z.literal('mode?') }),
]);

export type LiveMode = z.infer<typeof liveMode>;
export type LiveMessage = z.infer<typeof liveMessage>;
type Wire = z.infer<typeof wire>;

/** An SSE event's JSON payload, or null (logged) when it isn't the expected shape. */
const readEvent = <T>(
  event: MessageEvent<unknown>,
  schema: z.ZodType<T, z.ZodTypeDef, unknown>,
) => {
  try {
    const parsed = schema.safeParse(
      typeof event.data === 'string' ? JSON.parse(event.data) : undefined,
    );

    if (parsed.success) return parsed.data;

    console.warn(`Ignored a malformed "${event.type}" live event`, parsed.error.issues);
  } catch (error) {
    console.warn(`Ignored a malformed "${event.type}" live event`, error);
  }

  return null;
};

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

  /** Another tab spoke. */
  private onChannelMessage = ({ data }: MessageEvent<unknown>) => {
    const parsed = wire.safeParse(data);

    if (!parsed.success) return;

    const message = parsed.data;

    if (message.event === 'mode') this.setMode(message.data, false);
    else if (message.event === 'mode?') {
      if (this.source) this.post({ event: 'mode', data: this.mode });
    } else this.deliver(message, false);
  };

  subscribeMode = (listener: () => void) => {
    this.modeListeners.add(listener);

    return () => this.modeListeners.delete(listener);
  };

  subscribe(listener: (message: LiveMessage) => void) {
    this.listeners.add(listener);

    return () => this.listeners.delete(listener);
  }

  private post(message: Wire) {
    this.channel?.postMessage(message);
  }

  private setMode(mode: LiveMode, broadcast: boolean) {
    if (broadcast) this.post({ event: 'mode', data: mode });

    if (this.mode === mode) return;

    this.mode = mode;
    this.modeListeners.forEach((listener) => listener());
  }

  private deliver(message: LiveMessage, broadcast: boolean) {
    if (broadcast) this.post(message);
    this.listeners.forEach((listener) => listener(message));
  }

  /** Starts once per tab; callers balance it with `stop`. */
  start() {
    this.users += 1;

    if (this.users > 1) return;

    window.addEventListener('online', this.onOnline);

    if (typeof BroadcastChannel !== 'undefined') {
      this.channel = new BroadcastChannel(CHANNEL);
      this.channel.addEventListener('message', this.onChannelMessage);
      // A follower asks the leader how things stand.
      this.post({ event: 'mode?' });
    }

    if (typeof navigator !== 'undefined' && 'locks' in navigator && this.channel) {
      this.requestLead();
    } else {
      // No Web Locks: every tab holds its own stream.
      this.lead();
    }
  }

  /** Waits for the leader lock; the tab leads while it holds it. */
  private requestLead() {
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
      // Aborted by `stop` while waiting: this tab no longer wants to lead.
      .catch(() => undefined);
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
      const data = readEvent(event, hello);

      if (!data) return;

      this.retries = 0;
      this.setMode(data.mode, true);
      // Connected (again): whatever happened meanwhile is fetched now.
      this.deliver({ event: 'resync' }, true);
    });
    source.addEventListener('inbox', () => this.deliver({ event: 'inbox' }, true));
    source.addEventListener('timeline', (event) => {
      const data = readEvent(event, timeline);

      if (data) this.deliver({ event: 'timeline', data }, true);
    });
    source.addEventListener('plugin', (event) => {
      const data = readEvent(event, plugin);

      if (data) this.deliver({ event: 'plugin', data }, true);
    });
    source.addEventListener('resync', () => this.deliver({ event: 'resync' }, true));
    source.addEventListener('bye', () => {
      // The session ended; the app's own 401 handling takes it from here.
      this.leading = false;
      source.close();
      this.source = null;
      this.setMode('polling', true);
    });
    source.addEventListener('error', () => {
      // Poll until the stream is back.
      this.setMode('polling', true);

      if (source.readyState === EventSource.CLOSED) {
        this.source = null;
        this.scheduleReopen();
      }
    });
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
