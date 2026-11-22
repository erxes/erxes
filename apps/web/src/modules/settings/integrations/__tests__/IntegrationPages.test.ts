// @vitest-environment happy-dom
import { act } from 'react';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vite-plus/test';
import {
  links,
  listing,
  renderSettings,
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
