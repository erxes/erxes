// @vitest-environment happy-dom
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vite-plus/test';
import { liveOptions, pluginLive, useLiveUpdates } from '../live';

class Stream {
  static last: Stream | null = null;
  static CLOSED = 2;
  readyState = 1;
  private listeners: Record<string, ((event: { type: string; data: string }) => void)[]> = {};

  constructor() {
    Stream.last = this;
  }

  addEventListener(type: string, listener: (event: { type: string; data: string }) => void) {
    this.listeners[type] = [...(this.listeners[type] ?? []), listener];
  }

  send(type: string, data: unknown = {}) {
    for (const listener of this.listeners[type] ?? [])
      listener({ type, data: JSON.stringify(data) });
  }

  close() {
    this.readyState = Stream.CLOSED;
  }
}

const stream = () => {
  if (!Stream.last) throw new Error('no stream opened');

  return Stream.last;
};

const settle = () => act(() => new Promise((resolve) => setTimeout(resolve, 20)));

let root: Root | null = null;

const fetches = { a: 0, b: 0 };

const Page = () => {
  useLiveUpdates();
  useQuery({
    queryKey: ['runs', 'a'],
    queryFn: () => ++fetches.a,
    ...liveOptions(['automations.runs:a']),
  });
  useQuery({
    queryKey: ['runs', 'b'],
    queryFn: () => ++fetches.b,
    ...liveOptions(['automations.runs:b']),
  });

  return null;
};

describe('queries kept fresh by the live stream', () => {
  beforeAll(() => {
    Reflect.set(globalThis, 'IS_REACT_ACT_ENVIRONMENT', true);
  });

  beforeEach(async () => {
    fetches.a = 0;
    fetches.b = 0;
    vi.stubGlobal('EventSource', Stream);
    vi.stubGlobal('BroadcastChannel', undefined);

    const container = document.createElement('div');

    document.body.append(container);
    root = createRoot(container);
    act(() =>
      root?.render(
        createElement(QueryClientProvider, { client: new QueryClient() }, createElement(Page)),
      ),
    );
    await settle();
    stream().send('hello', { mode: 'live' });
    await settle();
  });

  afterEach(() => {
    act(() => root?.unmount());
    root = null;
    vi.unstubAllGlobals();
  });

  it('refetches only the queries that show a changed topic', async () => {
    const before = { ...fetches };

    stream().send('changed', { topics: ['automations.runs:a'] });
    await settle();

    expect(fetches).toEqual({ a: before.a + 1, b: before.b });
  });

  it('refetches every live query after a resync', async () => {
    const before = { ...fetches };

    stream().send('resync');
    await settle();

    expect(fetches).toEqual({ a: before.a + 1, b: before.b + 1 });
  });

  it('hands a plugin its own topics, grouped by plugin, and nothing of core’s', async () => {
    const heard: unknown[] = [];
    const stop = pluginLive((message) => heard.push(message));

    stream().send('changed', {
      topics: [
        'inbox',
        'timeline:customer:c1',
        'plugin:hr:leave.requests',
        'plugin:hr:leave:1',
        'plugin:sales:deals',
      ],
    });
    await settle();
    stop();

    expect(heard).toEqual([
      { plugin: 'hr', topics: ['leave.requests', 'leave:1'] },
      { plugin: 'sales', topics: ['deals'] },
    ]);
  });
});
