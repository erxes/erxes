// @vitest-environment happy-dom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { TRecordSectionProps } from 'erxes-ui';
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vite-plus/test';
import type { PluginRecordSections as Sections } from '../PluginRecordSections';

const Icon = () => null;

const Deals = ({ contentType, contentId }: TRecordSectionProps) =>
  createElement('p', null, `deals of ${contentType} ${contentId}`);

const Broken = () => {
  throw new Error('orders exploded');
};

// A customer who isn't a candidate: the section has nothing to show.
const NotACandidate = () => null;

// The `./config` each plugin remote exposes.
const CONFIGS: Record<string, unknown> = {
  'sales_ui/config': {
    name: 'Sales',
    path: 'sales',
    recordSections: [
      { contentType: 'core:customer', title: 'Deals', icon: Icon, component: Deals },
      { contentType: 'core:company', title: 'Company deals', icon: Icon, component: Deals },
      { contentType: 'core:customer', title: '', icon: Icon, component: Deals },
      { contentType: 'core:customer', title: 'Candidate', icon: Icon, component: NotACandidate },
    ],
  },
  'shop_ui/config': {
    name: 'Shop',
    path: 'shop',
    recordSections: [
      { contentType: 'core:customer', title: 'Orders', icon: Icon, component: Broken },
    ],
  },
  'hr_ui/config': {
    name: 'HR',
    path: 'hr',
    checkAccess: async () => false,
    recordSections: [
      { contentType: 'core:customer', title: 'Employees', icon: Icon, component: Deals },
    ],
  },
};

vi.mock('@module-federation/enhanced/runtime', () => ({
  registerRemotes: () => undefined,
  loadRemote: async (id: string) => ({ CONFIG: CONFIGS[id] }),
}));

let root: Root | undefined;
let PluginRecordSections: typeof Sections;

beforeAll(async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  vi.stubEnv(
    'PUBLIC_PLUGINS',
    ['sales_ui', 'shop_ui', 'hr_ui'].map((name) => `${name}@http://plugins.test/${name}.js`).join(),
  );
  // No core here: the registry fails and the local plugins still load.
  vi.stubGlobal('fetch', async () => Promise.reject(new Error('offline')));
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
  // Imported once the plugins are stubbed, which web reads when the module loads.
  ({ PluginRecordSections } = await import('../PluginRecordSections'));
});

afterEach(() => {
  act(() => root?.unmount());
  document.body.innerHTML = '';
});

const renderSections = async (contentType: 'core:customer' | 'core:company') => {
  const container = document.createElement('div');

  document.body.append(container);
  root = createRoot(container);

  await act(async () => {
    root?.render(
      createElement(
        QueryClientProvider,
        { client: new QueryClient() },
        createElement(PluginRecordSections, { contentType, contentId: 'c1' }),
      ),
    );
  });
  await vi.waitFor(() => expect(container.querySelector('section')).not.toBeNull());

  return container;
};

/** The headings a member sees: a hidden section's is left out. */
const headings = (container: HTMLElement) =>
  [...container.querySelectorAll('h3')]
    .filter((heading) => !heading.closest('[hidden]'))
    .map((heading) => heading.textContent);

describe('plugin sections on a customer', () => {
  it('shows each allowed plugin’s well-formed sections for the record, a crash kept to its own', async () => {
    const container = await renderSections('core:customer');

    expect(headings(container)).toEqual(['Deals', 'Orders']);
    expect(container.textContent).toContain('deals of core:customer c1');
    expect(container.querySelector('[role="alert"]')?.textContent).toContain(
      'Shop stopped working',
    );
    expect(container.textContent).toContain('orders exploded');
  });

  it('leaves out a section with nothing to show, heading and all', async () => {
    const container = await renderSections('core:customer');

    expect(headings(container)).not.toContain('Candidate');
  });

  it('names a section in the member’s language, from the text the plugin added', async () => {
    const { i18n, i18nReady } = await import('~/i18n');

    await i18nReady;
    // What a plugin's `./config` adds: its words, the English as the key.
    i18n.addResourceBundle('mn', 'Sales', { Deals: 'Хэлцэл' });
    await act(async () => i18n.changeLanguage('mn'));

    try {
      // A word the plugin left out stays in English.
      expect(headings(await renderSections('core:customer'))).toEqual(['Хэлцэл', 'Orders']);
    } finally {
      await act(async () => i18n.changeLanguage('en'));
    }
  });

  it('shows a company only the sections for companies', async () => {
    const container = await renderSections('core:company');

    expect(headings(container)).toEqual(['Company deals']);
    expect(container.textContent).toContain('deals of core:company c1');
  });
});
