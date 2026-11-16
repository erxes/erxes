// @vitest-environment happy-dom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { I18nextProvider } from 'react-i18next';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vite-plus/test';
import type { SettingsLayout as Layout } from '../SettingsLayout';

const Icon = () => null;

const Page = () => null;

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
};

vi.mock('@module-federation/enhanced/runtime', () => ({
  registerRemotes: () => undefined,
  loadRemote: async (id: string) => ({ CONFIG: CONFIGS[id] }),
}));

vi.mock('~/modules/auth/session', () => ({ useCan: () => () => true }));

let root: Root | undefined;
let SettingsLayout: typeof Layout;

beforeAll(async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  vi.stubEnv(
    'PUBLIC_PLUGINS',
    ['pms_ui', 'tms_ui', 'blog_ui'].map((name) => `${name}@http://plugins.test/${name}.js`).join(),
  );
  // No core here: the registry fails and the local plugins still load.
  vi.stubGlobal('fetch', async () => Promise.reject(new Error('offline')));
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
  ({ SettingsLayout } = await import('../SettingsLayout'));
});

afterEach(() => {
  act(() => root?.unmount());
  document.body.innerHTML = '';
});

const renderSettings = async () => {
  const { i18n, i18nReady } = await import('~/i18n');

  await i18nReady;

  const container = document.createElement('div');

  document.body.append(container);
  root = createRoot(container);
  window.history.replaceState(null, '', '/settings/general');

  const app = createElement(
    BrowserRouter,
    null,
    createElement(
      Routes,
      null,
      createElement(
        Route,
        { path: '/settings', element: createElement(SettingsLayout) },
        createElement(Route, { path: 'general', element: createElement('p', null, 'General') }),
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
  await vi.waitFor(() => expect(container.textContent).toContain('Tms'));

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
});
