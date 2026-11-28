// @vitest-environment happy-dom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vite-plus/test';
import type { usePlugins as UsePlugins } from '../usePlugins';

// Each remote's config is named after it: `sales_ui` is `sales`.
vi.mock('@module-federation/enhanced/runtime', () => ({
  registerRemotes: () => undefined,
  loadRemote: async (id: string) => {
    const name = id.replace(/_ui\/config$/, '');

    return { CONFIG: { name, path: name } };
  },
}));

/** An installed plugin with a UI, as core lists it, and what its manifest extends. */
const installed = (name: string, extended?: string) => ({
  name,
  manifest: {
    title: name,
    version: '1',
    extends: extended,
    ui: { remote: `${name}_ui`, entry: `https://plugins.test/${name}.js` },
  },
  installation: { status: 'active' },
});

let registry: ReturnType<typeof installed>[] = [];
let usePlugins: typeof UsePlugins;
let root: Root | undefined;

beforeAll(async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  vi.stubGlobal('fetch', async () => Response.json({ data: registry }));

  ({ usePlugins } = await import('../usePlugins'));
});

afterEach(() => {
  act(() => root?.unmount());
  document.body.innerHTML = '';
});

/** The loaded plugins in their order, each with what it extends. */
const Probe = () => {
  const { plugins, loading } = usePlugins();

  return createElement(
    'p',
    null,
    loading
      ? 'loading'
      : plugins
          .map(({ config, extends: extended }) => `${config.name}:${extended ?? '-'}`)
          .join(','),
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

describe('where a plugin that extends another sits', () => {
  it('puts a plugin’s extension right after that plugin, and marks core’s as core’s', async () => {
    registry = [
      installed('ee_core', 'core'),
      installed('ee_sales', 'sales'),
      installed('hr'),
      installed('sales'),
    ];

    const container = await render();

    await vi.waitFor(() =>
      expect(container.textContent).toBe('ee_core:core,hr:-,sales:-,ee_sales:sales_ui'),
    );
  });

  it('keeps an extension of a plugin that is not installed where it is, on its own', async () => {
    registry = [installed('pos_ee', 'pos'), installed('hr')];

    const container = await render();

    await vi.waitFor(() => expect(container.textContent).toBe('pos_ee:-,hr:-'));
  });
});
