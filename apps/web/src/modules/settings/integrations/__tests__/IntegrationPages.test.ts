// @vitest-environment happy-dom
import { act } from 'react';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vite-plus/test';
import {
  links,
  listing,
  QPAY_SHOP,
  renderSettings,
  renderSettingsRoutes,
  resetSettings,
  setUpSettings,
  unmount,
} from '../../__tests__/settingsHarness';

vi.mock('@module-federation/enhanced/runtime', () => ({
  registerRemotes: () => undefined,
  loadRemote: async (id: string) => ({
    CONFIG: (await import('../../__tests__/settingsHarness')).CONFIGS[id],
  }),
}));

vi.mock('~/modules/auth/session', async () => {
  const harness = await import('../../__tests__/settingsHarness');

  return {
    useCan: () => (action: string) => harness.member.can(action),
    useSession: () => ({ organization: { country: 'MN' } }),
  };
});

beforeAll(setUpSettings);

beforeEach(resetSettings);

afterEach(unmount);

describe('one integration’s page', () => {
  it('waits for core’s list before it opens an integration from its address', async () => {
    const answers: ((value: void) => void)[] = [];

    listing.ready = new Promise<void>((resolve) => {
      answers.push(resolve);
    });

    const container = await renderSettings('/settings/integrations/chat.meta', 'Tms');

    expect(window.location.pathname).toBe('/settings/integrations/chat.meta');

    for (const answer of answers) answer();

    await vi.waitFor(() =>
      expect(container.textContent).toContain('Conversations from Facebook pages'),
    );
    expect(window.location.pathname).toBe('/settings/integrations/chat.meta');
  });

  it('opens a plugin’s integration with its own tabs, not another of the plugin’s', async () => {
    const container = await renderSettings(
      '/settings/integrations/chat.zalo',
      'Zalo official accounts',
    );

    expect(container.querySelector('h1')?.textContent).toBe('Zalo');
    expect(container.querySelectorAll('[role="tab"]')).toHaveLength(0);
    expect(container.textContent).not.toContain('Conversations from Facebook pages');
  });

  it('opens an integration its plugin draws nothing for with core’s header alone', async () => {
    const container = await renderSettings('/settings/integrations/chat.line', 'Connected');

    expect(container.querySelector('h1')?.textContent).toBe('LINE');
    expect(container.querySelectorAll('[role="tab"]')).toHaveLength(0);
    expect(container.querySelector('[role="alert"]')).toBeNull();
  });
});

describe('a plugin’s integration that connects through core’s', () => {
  it('has no tile: core’s tile shows its state, and Browse leads to core’s page', async () => {
    listing.joined = true;

    const container = await renderSettings('/settings/integrations?tab=browse', 'Facebook Pages');

    expect(container.textContent).not.toContain('Messenger');
    expect(pageLinks(container)).toEqual(
      expect.arrayContaining([
        [expect.stringContaining('Needs attention'), '/settings/integrations/facebook'],
      ]),
    );
    expect(pageLinks(container).map(([, href]) => href)).not.toContain(
      '/settings/integrations/chat.meta',
    );
  });

  it('shows its tabs and its state on core’s page, and its old address opens its tab there', async () => {
    listing.joined = true;

    const container = await renderSettings(
      '/settings/integrations/chat.meta?tab=app',
      'Facebook Pages',
    );

    expect(window.location.pathname).toBe('/settings/integrations/facebook');
    expect(window.location.search).toBe('?tab=chat.meta.app');
    await vi.waitFor(() => expect(container.textContent).toContain('App id and secret'));
    expect(container.querySelector('h1')?.textContent).toBe('Facebook Pages');
    expect(tab(container, 'Chat · Overview')).toBeDefined();
    expect(tab(container, 'Chat · Meta app')?.getAttribute('aria-selected')).toBe('true');

    await click(tab(container, 'Overview'));
    await vi.waitFor(() => expect(container.textContent).toContain('Used by'));
    expect(links(container)).toEqual(
      expect.arrayContaining([
        [
          expect.stringContaining('Needs attention'),
          '/settings/integrations/facebook?tab=chat.meta.overview',
        ],
      ]),
    );
  });
});

const tab = (container: Element, name: string) =>
  [...container.querySelectorAll('[role="tab"]')].find((item) =>
    item.textContent?.startsWith(name),
  );

const click = async (element: Element | null | undefined) => {
  await act(async () => {
    element?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
};

const pageLinks = (container: Element) =>
  links(container).filter(([, href]) => href?.startsWith('/settings/integrations/'));

describe('the integrations page', () => {
  it('opens on Connected when something is set up, and Browse lists the whole catalog', async () => {
    const container = await renderSettings('/settings/integrations', 'LINE');

    expect(tab(container, 'Connected')?.getAttribute('aria-selected')).toBe('true');
    expect(tab(container, 'Connected')?.textContent).toBe('Connected1');
    expect(tab(container, 'Browse')?.textContent).toBe('Browse4');
    expect(pageLinks(container)).toEqual([
      [expect.stringContaining('LINE'), '/settings/integrations/chat.line'],
    ]);
    expect(container.textContent).not.toContain('Messenger');

    await click(tab(container, 'Browse'));
    await vi.waitFor(() => expect(container.textContent).toContain('Messenger'));
    await vi.waitFor(() => expect(window.location.search).toBe('?tab=browse'));
    expect(pageLinks(container)).toHaveLength(4);
  });

  it('opens a new organisation on Browse, and its empty Connected tab leads back there', async () => {
    listing.nothingSetUp = true;

    const container = await renderSettings('/settings/integrations', 'Messenger');

    expect(tab(container, 'Browse')?.getAttribute('aria-selected')).toBe('true');
    expect(tab(container, 'Connected')?.textContent).toBe('Connected0');

    await click(tab(container, 'Connected'));
    await vi.waitFor(() => expect(container.textContent).toContain('Nothing is connected yet.'));
    expect(pageLinks(container)).toEqual([]);

    await click(
      [...container.querySelectorAll('button')].find(
        (button) => button.textContent === 'Browse integrations',
      ),
    );
    await vi.waitFor(() => expect(container.textContent).toContain('Messenger'));
    await vi.waitFor(() => expect(window.location.search).toBe('?tab=browse'));
  });
});

const SHOP_PAGE = `/settings/integrations/connections/${QPAY_SHOP.id}`;

const sidePanel = (container: Element) =>
  container.querySelector('[data-record-side-panel]:not([data-expanded])');

const labelled = (container: Element | null, label: string) =>
  [...(container?.querySelectorAll('button') ?? [])].find(
    (button) => button.getAttribute('aria-label') === label,
  );

describe('a connection’s own page', () => {
  it('opens at its address under Integrations, and leads back to the Integrations page', async () => {
    listing.qpay = true;

    const container = await renderSettingsRoutes(SHOP_PAGE, 'Stored encrypted. Never shown.');

    expect(links(container)).toEqual(
      expect.arrayContaining([
        ['Integrations', '/settings/integrations'],
        ['Main shop', SHOP_PAGE],
      ]),
    );
    expect(sidePanel(container)).toBeNull();

    await click(labelled(container, 'Open in side panel'));
    await vi.waitFor(() => expect(window.location.pathname).toBe('/settings/integrations'));
    await vi.waitFor(() =>
      expect(tab(container, 'Connected')?.getAttribute('aria-selected')).toBe('true'),
    );
    await vi.waitFor(() =>
      expect(sidePanel(container)?.textContent).toContain('Stored encrypted. Never shown.'),
    );
    expect(sidePanel(container)?.textContent).toContain('Main shop');
  });

  it('opens from the Connected tab beside the list, and its full view is its own address', async () => {
    listing.qpay = true;

    const container = await renderSettingsRoutes('/settings/integrations', 'Main shop');

    await click(
      [...container.querySelectorAll('button')].find((button) =>
        button.textContent?.startsWith('Main shop'),
      ),
    );
    await vi.waitFor(() =>
      expect(sidePanel(container)?.textContent).toContain('Stored encrypted. Never shown.'),
    );

    await click(labelled(sidePanel(container), 'Open full view'));
    await vi.waitFor(() => expect(window.location.pathname).toBe(SHOP_PAGE));
    await vi.waitFor(() =>
      expect(links(container)).toEqual(
        expect.arrayContaining([['Integrations', '/settings/integrations']]),
      ),
    );
    expect(sidePanel(container)).toBeNull();
    expect(container.textContent).toContain('Stored encrypted. Never shown.');
  });
});
