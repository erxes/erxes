import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test';
import { LiveClient, type LiveMessage } from '../live';

/** EventSource stand-in: the test drives `emit`, `fail` and `close`. */
class FakeEventSource {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSED = 2;
  static all: FakeEventSource[] = [];
  readyState = FakeEventSource.OPEN;
  onerror: (() => void) | null = null;
  private handlers = new Map<string, ((event: { data: string }) => void)[]>();

  constructor(readonly url: string) {
    FakeEventSource.all.push(this);
  }

  addEventListener(name: string, handler: (event: { data: string }) => void) {
    this.handlers.set(name, [...(this.handlers.get(name) ?? []), handler]);
  }

  emit(name: string, data: unknown = {}) {
    this.handlers.get(name)?.forEach((handler) => handler({ data: JSON.stringify(data) }));
  }

  /** A dropped connection the browser gave up on (HTTP error). */
  fail() {
    this.readyState = FakeEventSource.CLOSED;
    this.onerror?.();
  }

  close() {
    this.readyState = FakeEventSource.CLOSED;
  }

  static open() {
    return FakeEventSource.all.filter((source) => source.readyState !== FakeEventSource.CLOSED);
  }
}

/** Web Locks stand-in: one holder per name, waiting requests in order, abortable. */
const fakeLocks = () => {
  const queues = new Map<string, { grant: () => void; signal?: AbortSignal }[]>();
  const held = new Set<string>();

  const next = (name: string) => {
    const queue = queues.get(name) ?? [];

    while (queue.length && !held.has(name)) {
      const waiter = queue.shift()!;

      if (waiter.signal?.aborted) continue;

      waiter.grant();
    }
  };

  return {
    request(name: string, options: { signal?: AbortSignal }, callback: () => Promise<void>) {
      return new Promise<void>((resolve, reject) => {
        const grant = () => {
          held.add(name);
          void callback().finally(() => {
            held.delete(name);
            resolve();
            next(name);
          });
        };

        options.signal?.addEventListener('abort', () => reject(new Error('aborted')));
        queues.set(name, [...(queues.get(name) ?? []), { grant, signal: options.signal }]);
        next(name);
      });
    },
  };
};

const tick = () => new Promise((resolve) => setTimeout(resolve, 20));

describe('LiveClient (one stream per browser)', () => {
  beforeEach(() => {
    FakeEventSource.all = [];
    vi.stubGlobal('EventSource', FakeEventSource);
    vi.stubGlobal('navigator', { locks: fakeLocks() });
    vi.stubGlobal('window', new EventTarget());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('opens one stream for all tabs and relays its messages to the others', async () => {
    const leader = new LiveClient();
    const follower = new LiveClient();
    const seen: LiveMessage[] = [];

    leader.start();
    follower.start();
    follower.subscribe((message) => seen.push(message));
    await tick();

    expect(FakeEventSource.open()).toHaveLength(1);

    const source = FakeEventSource.open()[0];

    source.emit('hello', { mode: 'live' });
    source.emit('timeline', { targets: [{ targetType: 'customer', targetId: 'c1' }] });
    await tick();

    expect(leader.getMode()).toBe('live');
    expect(follower.getMode()).toBe('live');
    expect(seen).toEqual([
      { event: 'resync' },
      { event: 'timeline', data: { targets: [{ targetType: 'customer', targetId: 'c1' }] } },
    ]);

    leader.stop();
    follower.stop();
  });

  it('hands the stream to another tab when the leader closes', async () => {
    const first = new LiveClient();
    const second = new LiveClient();

    first.start();
    second.start();
    await tick();
    expect(FakeEventSource.open()).toHaveLength(1);

    first.stop();
    await tick();

    expect(FakeEventSource.open()).toHaveLength(1);
    expect(FakeEventSource.all).toHaveLength(2);

    second.stop();
    await tick();
    expect(FakeEventSource.open()).toHaveLength(0);
  });

  it('falls back to polling and reopens a stream the browser gave up on, with backoff', async () => {
    const client = new LiveClient();

    client.start();
    await tick();
    vi.useFakeTimers();

    const first = FakeEventSource.open()[0];

    first.emit('hello', { mode: 'live' });
    first.fail();

    expect(client.getMode()).toBe('polling');
    expect(FakeEventSource.open()).toHaveLength(0);

    // 1 s ± jitter.
    vi.advanceTimersByTime(1600);
    expect(FakeEventSource.open()).toHaveLength(1);

    FakeEventSource.open()[0].emit('hello', { mode: 'live' });
    expect(client.getMode()).toBe('live');

    client.stop();
  });

  it('stops for good when the server says the session ended', async () => {
    const client = new LiveClient();

    client.start();
    await tick();
    vi.useFakeTimers();

    FakeEventSource.open()[0].emit('bye', { reason: 'session-expired' });
    vi.advanceTimersByTime(60_000);

    expect(FakeEventSource.open()).toHaveLength(0);
    expect(client.getMode()).toBe('polling');

    client.stop();
  });
});
