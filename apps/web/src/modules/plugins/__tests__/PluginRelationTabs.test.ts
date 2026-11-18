// @vitest-environment happy-dom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { TRelationTabProps } from 'erxes-ui';
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vite-plus/test';
import type { usePluginRelationTabs as UseTabs } from '../PluginRelationTabs';

const Icon = () => null;

const List = ({ contentId }: TRelationTabProps) => createElement('p', null, `of ${contentId}`);

// The `./config` each plugin remote exposes.
const CONFIGS: Record<string, unknown> = {
  'content_ui/config': {
    name: 'content',
    path: 'content',
    relationTabs: [
      // A customer writes posts; a company doesn't.
      { name: 'posts', title: 'Posts', icon: Icon, hosts: ['core:customer'], component: List },
      { name: 'feeds', title: 'Feeds', icon: Icon, hosts: ['core:company'], component: List },
      { name: 'tasks', title: 'Task posts', icon: Icon, hosts: ['tasks:task'], component: List },
      // Names no record types: customers and companies.
      { name: 'mentions', title: 'Mentions', icon: Icon, component: List },
    ],
  },
  'fields_ui/config': {
    name: 'fields',
    path: 'fields',
    // Data Extensions' fields: every record type.
    relationTabs: [{ name: 'fields', title: 'Fields', icon: Icon, hosts: ['*'], component: List }],
  },
};

vi.mock('@module-federation/enhanced/runtime', () => ({
  registerRemotes: () => undefined,
  loadRemote: async (id: string) => ({ CONFIG: CONFIGS[id] }),
}));

let root: Root | undefined;
let usePluginRelationTabs: typeof UseTabs;

beforeAll(async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  vi.stubEnv(
    'PUBLIC_PLUGINS',
    'content_ui@http://plugins.test/content_ui.js,fields_ui@http://plugins.test/fields_ui.js',
  );
  // No core here: the registry fails and the local plugin still loads.
  vi.stubGlobal('fetch', async () => Promise.reject(new Error('offline')));
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
  const { i18nReady } = await import('~/i18n');

  await i18nReady;
  ({ usePluginRelationTabs } = await import('../PluginRelationTabs'));
});

afterEach(() => {
  act(() => root?.unmount());
  document.body.innerHTML = '';
});

const Tabs = ({ contentType }: { contentType: string }) =>
  createElement(
    'output',
    null,
    usePluginRelationTabs({
      contentType,
      contentId: 'r1',
      contacts: { customerIds: ['c1'], companyIds: [] },
    })
      .map((tab) => tab.label)
      .join(', ') || 'none',
  );

const tabsOn = async (contentType: string) => {
  const container = document.createElement('div');

  document.body.append(container);
  root = createRoot(container);
  await act(async () => {
    root?.render(
      createElement(
        QueryClientProvider,
        { client: new QueryClient() },
        createElement(Tabs, { contentType }),
      ),
    );
  });
  await vi.waitFor(() => expect(container.textContent).not.toBe('none'));

  return container.textContent;
};

describe('a plugin’s relation tabs', () => {
  it.each([
    ['core:customer', 'Posts, Mentions, Fields'],
    ['core:company', 'Feeds, Mentions, Fields'],
    ['tasks:task', 'Task posts, Fields'],
    ['sales:deal', 'Fields'],
  ])(
    'show on %s only where they name it (or every type with *), or on contacts when they name nothing',
    async (type, tabs) => {
      expect(await tabsOn(type)).toBe(tabs);
    },
  );
});
