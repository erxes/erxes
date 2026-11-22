import type { Integration } from '@erxes/core-contract';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NuqsAdapter } from 'nuqs/adapters/react-router/v7';
import { act, createElement, lazy } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { I18nextProvider } from 'react-i18next';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { expect, vi } from 'vite-plus/test';
import type { IntegrationPage as KeyPage } from '../integrations/IntegrationPage';
import type { IntegrationsSettingsPage as Catalog } from '../integrations/IntegrationsSettingsPage';
import type { SettingsLayout as Layout } from '../SettingsLayout';

const Icon = () => null;

const Page = () => null;

const MetaOverview = () => createElement('p', null, 'Conversations from Facebook pages');

const MetaApp = () => createElement('p', null, 'App id and secret');

const ZaloOverview = () => createElement('p', null, 'Zalo official accounts');

const properties = (type: string) => ({
  type,
  values: async () => ({}),
  save: async () => undefined,
});

// The `./config` each plugin remote exposes.
export const CONFIGS: Record<string, unknown> = {
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
        tabs: [{ value: 'overview', label: 'Overview', component: ZaloOverview }],
      },
      {
        key: 'archive',
        icon: Icon,
        tabs: [{ value: 'overview', label: 'Overview', component: Page }],
      },
    ],
  },
};

// A member who may manage integrations, but not payments.
const ALL_BUT_PAYMENTS = (action: string) => action !== 'payments.manage';

/** What the signed-in member may do (`useCan`); a test may change it. */
export const member: { can: (action: string) => boolean } = { can: ALL_BUT_PAYMENTS };

/** Core answers the integrations list once `ready` settles. */
export const listing = { ready: Promise.resolve() };

const NOT_SET_UP = { state: 'not-set-up', count: null } as const;

const listed = (
  row: Pick<Integration, 'key' | 'name' | 'summary' | 'category'> & Partial<Integration>,
): Integration => ({
  plugin: null,
  countries: [],
  permission: 'integrations.manage',
  dashboard: null,
  keyed: false,
  fields: [],
  payments: null,
  status: NOT_SET_UP,
  actions: [],
  ...row,
});

// What core lists this member: its own, and the chat plugin's it may manage (not its archive).
const LISTED = [
  listed({
    key: 'ebarimt',
    name: 'eBarimt',
    summary: 'Mongolian tax receipts for paid invoices, sent through your PosAPI.',
    category: 'government',
    countries: ['MN'],
  }),
  listed({
    key: 'meta',
    plugin: 'chat',
    name: 'Messenger',
    summary: 'Facebook and Instagram messages in your inbox.',
    category: 'social',
    actions: [
      {
        type: 'chat.reply',
        label: 'Reply on Messenger',
        description: 'Send a message to the conversation',
      },
    ],
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

export const setUpSettings = async () => {
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

    await listing.ready;

    return Response.json({ data: LISTED });
  });
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
  ({ SettingsLayout } = await import('../SettingsLayout'));
  ({ IntegrationsSettingsPage } = await import('../integrations/IntegrationsSettingsPage'));
  ({ IntegrationPage } = await import('../integrations/IntegrationPage'));
};

/** Back to a member who manages integrations but not payments, and a list core answers at once. */
export const resetSettings = () => {
  member.can = ALL_BUT_PAYMENTS;
  listing.ready = Promise.resolve();
};

export const unmount = () => {
  act(() => root?.unmount());
  document.body.innerHTML = '';
};

/** Core's settings at `path`, once `text` shows. */
export const renderSettings = async (path = '/settings/general', text = 'Tms') => {
  const { i18n, i18nReady } = await import('~/i18n');

  await i18nReady;
  // The settings routes load their words before they render (AppRoutes); so does this test.
  await i18n.loadNamespaces('settings');

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

export const links = (container: Element) =>
  [...container.querySelectorAll('a')].map((link) => [link.textContent, link.getAttribute('href')]);
