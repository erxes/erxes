// @vitest-environment happy-dom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vite-plus/test';
import { z } from 'zod';
import type { AddPropertyGroup as Add } from '../components/PropertyGroupAdd';

const Icon = () => null;

// A plugin whose tickets' groups can be limited to some of its pipelines.
const CONFIGS: Record<string, unknown> = {
  'frontline_ui/config': {
    name: 'frontline',
    path: 'frontline',
    recordTypes: [
      {
        contentType: 'frontline:ticket',
        title: 'Ticket',
        icon: Icon,
        Title: () => 'Ticket',
        Detail: () => null,
        detailPath: (id: string) => `/frontline/tickets/${id}`,
        properties: {
          type: 'frontline.ticket',
          values: (id: string) => ({
            queryKey: ['ticket-properties', id],
            queryFn: async () => ({}),
          }),
          save: async () => undefined,
          limits: [
            {
              key: 'pipeline',
              label: 'Pipelines',
              options: {
                queryKey: ['pipelines'],
                queryFn: async () => [{ value: 'p1', label: 'Support' }],
              },
            },
          ],
          appliesTo: () => ({ queryKey: ['ticket-in'], queryFn: async () => ({}) }),
        },
      },
    ],
  },
};

vi.mock('@module-federation/enhanced/runtime', () => ({
  registerRemotes: () => undefined,
  loadRemote: async (id: string) => ({ CONFIG: CONFIGS[id] }),
}));

/** The groups core was asked to create. */
const created: unknown[] = [];

let root: Root | undefined;
let AddPropertyGroup: typeof Add;

beforeAll(async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  vi.stubEnv('PUBLIC_PLUGINS', 'frontline_ui@http://plugins.test/frontline_ui.js');
  vi.stubGlobal('fetch', async (request: Request) => {
    if (request.method !== 'POST' || !request.url.endsWith('/field-groups')) {
      throw new Error('offline');
    }

    const input = z.record(z.string(), z.unknown()).parse(await request.json());

    created.push(input);

    return Response.json({ ...input, id: 'g1', order: 0, archived: false });
  });
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
  // Imported once the plugin is stubbed, which web reads when the module loads.
  ({ AddPropertyGroup } = await import('../components/PropertyGroupAdd'));
});

afterEach(() => {
  act(() => root?.unmount());
  document.body.innerHTML = '';
});

const click = (element: Element | null | undefined) =>
  act(async () => element?.dispatchEvent(new MouseEvent('click', { bubbles: true })));

describe('adding a group to a plugin type with limits', () => {
  it('saves a group whose pipelines are left at All, for every record', async () => {
    const container = document.createElement('div');

    document.body.append(container);
    root = createRoot(container);
    await act(async () => {
      root?.render(
        createElement(
          QueryClientProvider,
          { client: new QueryClient() },
          createElement(AddPropertyGroup, { contentType: 'frontline.ticket' }),
        ),
      );
    });

    await click(document.querySelector('button'));
    await vi.waitFor(() => expect(document.body.textContent).toContain('Pipelines'));

    const name = document.querySelector<HTMLInputElement>('input[placeholder="Enter group name"]');

    await act(async () => {
      if (!name) return;
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set?.call(
        name,
        'Hardware',
      );
      name.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await click(document.querySelector('button[type="submit"]'));

    await vi.waitFor(() =>
      expect(created).toEqual([
        expect.objectContaining({ name: 'Hardware', appliesTo: { pipeline: [] } }),
      ]),
    );
    expect(document.body.textContent).not.toContain('expected array');
  });
});
