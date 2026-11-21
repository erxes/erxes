// @vitest-environment happy-dom
import type { Integration } from '@erxes/core-contract';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NuqsAdapter } from 'nuqs/adapters/react-router/v7';
import { act, createElement, lazy } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { I18nextProvider } from 'react-i18next';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vite-plus/test';
import type { IntegrationPage as KeyPage } from '../integrations/IntegrationPage';
import type { IntegrationsSettingsPage as Catalog } from '../integrations/IntegrationsSettingsPage';
import type { SettingsLayout as Layout } from '../SettingsLayout';

const Icon = () => null;

const Page = () => null;

const MetaOverview = () => createElement('p', null, 'Conversations from Facebook pages');

const MetaApp = () => createElement('p', null, 'App id and secret');

const properties = (type: string) => ({
  type,
  values: async () => ({}),
  save: async () => undefined,
});

// The `./config` each plugin remote exposes.
const CONFIGS: Record<string, unknown> = {
  'pms_ui/config': {
    name: 'pms',
    path: 'pms',
    icon: Icon,
    settings: [
      { path: '/pms/settings', label: 'Property management', icon: Icon },
      { path: '/pms/settings/rates', label: 'Rates', icon: Icon },
    ],
    recordTypes: [
      {
        contentType: 'pms:room',
        title: 'Room',
        icon: Icon,
        detailPath: (id: string) => `/pms/rooms/${id}`,
        Title: Page,
        Detail: Page,
        properties: properties('pms.room'),
      },
    ],
  },
  'tms_ui/config': {
    name: 'tms',
    path: 'tms',
    recordTypes: [
      {
        contentType: 'tms:booking',
        title: 'Booking',
        icon: Icon,
        detailPath: (id: string) => `/tms/bookings/${id}`,
        Title: Page,
        Detail: Page,
        properties: properties('tms.booking'),
      },
    ],
  },
  'blog_ui/config': { name: 'blog', path: 'blog' },
  'chat_ui/config': {
    name: 'chat',
    path: 'chat',
    integrations: [
      {
        key: 'meta',
        icon: Icon,
        tabs: [
          { value: 'overview', label: 'Overview', component: MetaOverview },
          {
            value: 'app',
            label: 'Meta app',
            component: lazy(async () => ({ default: MetaApp })),
          },
        ],
      },
      {
        key: 'zalo',
        icon: Icon,
        tabs: [{ value: 'overview', label: 'Overview', component: Page }],
      },
      {
        key: 'vault',
        icon: Icon,
        tabs: [{ value: 'overview', label: 'Overview', component: Page }],
      },
    ],
  },
};

vi.mock('@module-federation/enhanced/runtime', () => ({
  registerRemotes: () => undefined,
  loadRemote: async (id: string) => ({ CONFIG: CONFIGS[id] }),
}));

// A member who may manage integrations, but not payments.
vi.mock('~/modules/auth/session', () => ({
  useCan: () => (action: string) => action !== 'payments.manage',
  useSession: () => ({ organization: { country: 'MN' } }),
}));

const NOT_SET_UP = { state: 'not-set-up', count: null } as const;

const listed = (
  row: Pick<Integration, 'key' | 'name' | 'summary' | 'category'> & Partial<Integration>,
): Integration => ({
  plugin: null,
  countries: [],
  permission: 'integrations.manage',
  dashboard: null,
  fields: [],
  payments: null,
  status: NOT_SET_UP,
  ...row,
});

// What core lists this member: its own, and the chat plugin's it may manage (not its vault).
const LISTED = [
  listed({
    key: 'ebarimt',
    name: 'eBarimt',
    summary: 'Mongolian tax receipts for paid invoices, sent through your PosAPI.',
    category: 'tax',
    countries: ['MN'],
  }),
  listed({
    key: 'meta',
    plugin: 'chat',
    name: 'Messenger',
    summary: 'Facebook and Instagram messages in your inbox.',
    category: 'social',
  }),
  listed({
    key: 'zalo',
    plugin: 'chat',
    name: 'Zalo',
    summary: 'Zalo messages in your inbox.',
    category: 'messaging',
    countries: ['VN'],
  }),
  listed({
    key: 'line',
    plugin: 'chat',
    name: 'LINE',
    summary: 'LINE messages in your inbox.',
    category: 'messaging',
    status: { state: 'connected', count: 2 },
  }),
];

let root: Root | undefined;
let SettingsLayout: typeof Layout;
let IntegrationsSettingsPage: typeof Catalog;
let IntegrationPage: typeof KeyPage;

beforeAll(async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  vi.stubEnv(
    'PUBLIC_PLUGINS',
    ['pms_ui', 'tms_ui', 'blog_ui', 'chat_ui']
      .map((name) => `${name}@http://plugins.test/${name}.js`)
      .join(),
  );
  // Core lists only what this member may manage; the registry fails and the local plugins still load.
  vi.stubGlobal('fetch', async (request: Request) => {
    if (new URL(request.url).pathname !== '/core/v1/integrations') throw new Error('offline');

    return Response.json({ data: LISTED });
  });
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
  ({ SettingsLayout } = await import('../SettingsLayout'));
  ({ IntegrationsSettingsPage } = await import('../integrations/IntegrationsSettingsPage'));
  ({ IntegrationPage } = await import('../integrations/IntegrationPage'));
});

afterEach(() => {
  act(() => root?.unmount());
  document.body.innerHTML = '';
});

/** Core's settings at `path`, once `text` shows. */
const renderSettings = async (path = '/settings/general', text = 'Tms') => {
  const { i18n, i18nReady } = await import('~/i18n');

  await i18nReady;

  const container = document.createElement('div');

  document.body.append(container);
  root = createRoot(container);
  window.history.replaceState(null, '', path);

  const app = createElement(
    BrowserRouter,
    null,
    createElement(
      NuqsAdapter,
      null,
      createElement(
        Routes,
        null,
        createElement(
          Route,
          { path: '/settings', element: createElement(SettingsLayout) },
          createElement(Route, { path: 'general', element: createElement('p', null, 'General') }),
          createElement(Route, {
            path: 'integrations',
            element: createElement(IntegrationsSettingsPage),
          }),
          createElement(Route, {
            path: 'integrations/:key',
            element: createElement(IntegrationPage),
          }),
        ),
      ),
    ),
  );

  await act(async () => {
    root?.render(
      createElement(
        QueryClientProvider,
        { client: new QueryClient() },
        createElement(I18nextProvider, { i18n }, app),
      ),
    );
  });
  await vi.waitFor(() => expect(container.textContent).toContain(text));

  return container;
};

const links = (container: Element) =>
  [...container.querySelectorAll('a')].map((link) => [link.textContent, link.getAttribute('href')]);

describe('plugins in core’s settings', () => {
  it('links each plugin with settings once, to its first page, else to its properties', async () => {
    const container = await renderSettings();

    const group = [...container.querySelectorAll('[data-sidebar="group"]')].find((element) =>
      element.textContent?.startsWith('Plugin settings'),
    );

    expect(group && links(group)).toEqual([
      ['Pms', '/pms/settings'],
      ['Tms', '/settings/properties/tms.booking'],
    ]);
    expect(container.textContent).not.toContain('Property management');
    expect(container.textContent).not.toContain('Rates');
    expect(container.textContent).not.toContain('Properties');
  });

  it('lists a plugin’s integrations beside core’s, by state and region, with filters for their categories', async () => {
    const container = await renderSettings('/settings/integrations', 'Messenger');

    const section = (title: string) =>
      [...container.querySelectorAll('section')].find(
        (element) => element.querySelector('h2')?.textContent === title,
      );

    expect(section('Connected') && links(section('Connected') ?? container)).toEqual([
      [expect.stringContaining('LINE'), '/settings/integrations/chat.line'],
    ]);
    expect(section('Connected')?.textContent).toContain('Connected');
    expect(section('Available') && links(section('Available') ?? container)).toEqual([
      [expect.stringContaining('eBarimt'), '/settings/integrations/ebarimt'],
      [expect.stringContaining('Messenger'), '/settings/integrations/chat.meta'],
    ]);
    expect(section('Available')?.textContent).toContain(
      'Facebook and Instagram messages in your inbox.',
    );
    expect(section('Other regions')?.textContent).toContain('Zalo');
    expect(section('Other regions')?.textContent).toContain('Made for Vietnam');
    expect(
      [...container.querySelectorAll('[aria-label="Categories"] button')].map(
        (item) => item.textContent,
      ),
    ).toEqual(['All', 'Messaging', 'Social media', 'Tax receipts']);
    expect(container.textContent).not.toContain('Vault');
  });

  it('opens a plugin’s integration under core’s header, a tab at a time', async () => {
    const container = await renderSettings('/settings/integrations/chat.meta', 'Conversations');
    const tabs = [...container.querySelectorAll('[role="tab"]')];

    expect(container.querySelector('h1')?.textContent).toBe('Messenger');
    expect(container.textContent).toContain('Works in any country');
    expect(tabs.map((tab) => tab.textContent)).toEqual(['Overview', 'Meta app']);
    expect(container.textContent).not.toContain('App id and secret');

    await act(async () => {
      tabs[1]?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    await vi.waitFor(() => expect(container.textContent).toContain('App id and secret'));
    // The address names the tab, so a reload opens it again.
    await vi.waitFor(() => expect(window.location.search).toBe('?tab=app'));
    expect(container.textContent).not.toContain('Conversations from Facebook pages');
  });

  it('sends a member to the catalog from an integration core does not list them', async () => {
    const container = await renderSettings('/settings/integrations/chat.vault', 'Messenger');

    expect(window.location.pathname).toBe('/settings/integrations');
    expect(container.textContent).not.toContain('Vault');
  });
});
