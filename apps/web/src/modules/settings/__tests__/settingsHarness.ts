import type { Integration, VaultConnection } from '@erxes/core-contract';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NuqsAdapter } from 'nuqs/adapters/react-router/v7';
import { act, createElement, lazy, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { I18nextProvider } from 'react-i18next';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { expect, vi } from 'vite-plus/test';
import type { IntegrationPage as KeyPage } from '../integrations/IntegrationPage';
import type { IntegrationsSettingsPage as Catalog } from '../integrations/IntegrationsSettingsPage';
import type { PaymentsSettingsPage as Payments } from '../payments/PaymentsSettingsPage';
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

/**
 * Core answers the integrations list once `ready` settles; `nothingSetUp` is a new organisation,
 * `qpay` one that connected its QPay shop, `joined` one where the chat plugin's Messenger connects
 * through core's Facebook.
 */
export const listing = {
  ready: Promise.resolve(),
  nothingSetUp: false,
  qpay: false,
  joined: false,
};

export const QPAY_SHOP: VaultConnection = {
  id: 'qpayMainShop00001',
  key: 'qpay',
  name: 'Main shop',
  status: 'active',
  ownerId: null,
  createdAt: '2026-11-01T00:00:00.000Z',
  settings: {},
  usedBy: [],
};

const NOT_SET_UP = { state: 'not-set-up', count: null } as const;

const listed = (
  row: Pick<Integration, 'key' | 'name' | 'summary' | 'category'> & Partial<Integration>,
): Integration => ({
  plugin: null,
  connection: null,
  countries: [],
  permission: 'integrations.manage',
  scopes: ['org'],
  dashboard: null,
  keyed: false,
  fields: [],
  sms: false,
  payments: null,
  oauth: null,
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

// Core's Facebook, not connected yet, and the chat plugin's Messenger on it with a broken page.
const JOINED = [
  listed({
    key: 'facebook',
    name: 'Facebook Pages',
    summary: 'Start automations from your Facebook pages.',
    category: 'social',
  }),
  ...LISTED.map((row) =>
    row.key === 'meta'
      ? { ...row, connection: 'facebook', status: { state: 'attention' as const, count: 3 } }
      : row,
  ),
];

const QPAY = listed({
  key: 'qpay',
  name: 'QPay',
  summary: 'QR payments from every Mongolian bank app.',
  category: 'payments',
  keyed: true,
  status: { state: 'connected', count: 1 },
});

let root: Root | undefined;
let SettingsLayout: typeof Layout;
let IntegrationsSettingsPage: typeof Catalog;
let IntegrationPage: typeof KeyPage;
let PaymentsSettingsPage: typeof Payments;

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
    const { pathname } = new URL(request.url);

    if (pathname === '/core/v1/integrations/connections') {
      return Response.json({ data: listing.qpay ? [QPAY_SHOP] : [] });
    }

    if (pathname === '/core/v1/secrets/holdings') return Response.json({ data: [] });

    if (pathname !== '/core/v1/integrations') throw new Error('offline');

    await listing.ready;

    const rows = [...(listing.joined ? JOINED : LISTED), ...(listing.qpay ? [QPAY] : [])];

    return Response.json({
      data: listing.nothingSetUp ? rows.map((row) => ({ ...row, status: NOT_SET_UP })) : rows,
    });
  });
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
  ({ SettingsLayout } = await import('../SettingsLayout'));
  ({ IntegrationsSettingsPage } = await import('../integrations/IntegrationsSettingsPage'));
  ({ IntegrationPage } = await import('../integrations/IntegrationPage'));
  ({ PaymentsSettingsPage } = await import('../payments/PaymentsSettingsPage'));
};

/** Back to a member who manages integrations but not payments, and a list core answers at once. */
export const resetSettings = () => {
  member.can = ALL_BUT_PAYMENTS;
  listing.ready = Promise.resolve();
  listing.nothingSetUp = false;
  listing.qpay = false;
  listing.joined = false;
};

export const unmount = () => {
  act(() => root?.unmount());
  document.body.innerHTML = '';
};

const mount = async (path: string, text: string, routes: ReactNode) => {
  const { i18n, i18nReady } = await import('~/i18n');

  await i18nReady;
  // The settings routes load their words before they render (AppRoutes); so does this test.
  await i18n.loadNamespaces('settings');

  const container = document.createElement('div');

  document.body.append(container);
  root = createRoot(container);
  window.history.replaceState(null, '', path);

  const app = createElement(BrowserRouter, null, createElement(NuqsAdapter, null, routes));

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

/** Core's settings at `path`, once `text` shows. */
export const renderSettings = async (path = '/settings/general', text = 'Tms') =>
  mount(
    path,
    text,
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
        createElement(Route, { path: 'payments', element: createElement(PaymentsSettingsPage) }),
      ),
    ),
  );

/** Web's own settings routes at `path`, core's side panel beside them, once `text` shows. */
export const renderSettingsRoutes = async (path: string, text: string) => {
  const { SettingsRoutes } = await import('../SettingsRoutes');
  const { PanelRecordOpener } = await import('~/modules/side-panel/PanelRecordOpener');
  const { SidePanelLayout } = await import('~/modules/side-panel/SidePanelLayout');

  return mount(path, text, [
    createElement(
      Routes,
      { key: 'page' },
      createElement(Route, {
        path: '/settings/*',
        element: createElement(PanelRecordOpener, null, createElement(SettingsRoutes)),
      }),
    ),
    createElement(SidePanelLayout, { key: 'panel' }),
  ]);
};

export const links = (container: Element) =>
  [...container.querySelectorAll('a')].map((link) => [link.textContent, link.getAttribute('href')]);
