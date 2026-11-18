// @vitest-environment happy-dom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vite-plus/test';
import type { usePlugins as UsePlugins } from '../usePlugins';

// The slow plugin's config arrives when the test says so.
let finishSlow: (config: unknown) => void = () => undefined;

vi.mock('@module-federation/enhanced/runtime', () => ({
  registerRemotes: () => undefined,
  loadRemote: async (id: string) => {
    if (id === 'fast_ui/config') return { CONFIG: { name: 'fast', path: 'fast' } };

    if (id === 'broken_ui/config') throw new Error('remoteEntry.js did not load');

    return new Promise((resolve) => {
      finishSlow = (config) => resolve({ CONFIG: config });
    });
  },
}));

let usePlugins: typeof UsePlugins;
let root: Root | undefined;

beforeAll(async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  vi.stubEnv(
    'PUBLIC_PLUGINS',
    'fast_ui@http://plugins.test/fast.js,slow_ui@http://plugins.test/slow.js,broken_ui@http://plugins.test/broken.js',
  );
  // No plugins installed in core: only the local ones load.
  vi.stubGlobal('fetch', async () => Response.json({ data: [] }));
  vi.spyOn(console, 'error').mockImplementation(() => undefined);

  // After the env stub: the module reads PUBLIC_PLUGINS when it loads.
  ({ usePlugins } = await import('../usePlugins'));
});

afterEach(() => {
  act(() => root?.unmount());
  document.body.innerHTML = '';
});

/** What a page sees: the loaded plugins' names, then whether any is still loading. */
const Probe = () => {
  const { plugins, loading } = usePlugins();

  return createElement(
    'p',
    null,
    `${plugins.map(({ config }) => config.name).join(',')}|${loading ? 'loading' : 'done'}`,
  );
};

const render = async () => {
  const container = document.createElement('div');

  document.body.append(container);
  root = createRoot(container);

  await act(async () => {
    root?.render(
      createElement(QueryClientProvider, { client: new QueryClient() }, createElement(Probe)),
    );
  });

  return container;
};

describe('loading plugin UIs', () => {
  it('gives each plugin as soon as its config loads, without waiting for slower ones', async () => {
    const container = await render();

    await vi.waitFor(() => expect(container.textContent).toBe('fast|loading'));

    finishSlow({ name: 'slow', path: 'slow' });

    // Remote order, with the broken one left out.
    await vi.waitFor(() => expect(container.textContent).toBe('fast,slow|done'));
  });
});
