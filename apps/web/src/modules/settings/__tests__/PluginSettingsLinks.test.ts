// @vitest-environment happy-dom
import { act } from 'react';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vite-plus/test';
import {
  links,
  member,
  renderSettings,
  resetSettings,
  setUpSettings,
  unmount,
} from './settingsHarness';

vi.mock('@module-federation/enhanced/runtime', () => ({
  registerRemotes: () => undefined,
  loadRemote: async (id: string) => ({
    CONFIG: (await import('./settingsHarness')).CONFIGS[id],
  }),
}));

vi.mock('~/modules/auth/session', async () => {
  const harness = await import('./settingsHarness');

  return {
    useCan: () => (action: string) => harness.member.can(action),
    useSession: () => ({ organization: { country: 'MN' } }),
  };
});

beforeAll(setUpSettings);

beforeEach(resetSettings);

afterEach(unmount);

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

  it('lists a plugin’s integrations beside core’s, a section per category with the connected first', async () => {
    const container = await renderSettings('/settings/integrations', 'Messenger');

    const sections = [...container.querySelectorAll('section')];

    const section = (title: string) =>
      sections.find((element) => element.querySelector('h2')?.textContent === title);

    expect(sections.map((element) => element.querySelector('h2')?.textContent)).toEqual([
      'Social media',
      'Messaging',
      'Government',
    ]);
    expect(links(section('Social media') ?? container)).toEqual([
      [expect.stringContaining('Messenger'), '/settings/integrations/chat.meta'],
    ]);
    expect(section('Social media')?.textContent).toContain(
      'Facebook and Instagram messages in your inbox.',
    );
    expect(links(section('Messaging') ?? container)).toEqual([
      [expect.stringContaining('LINE'), '/settings/integrations/chat.line'],
      [expect.stringContaining('Zalo'), '/settings/integrations/chat.zalo'],
    ]);
    expect(section('Messaging')?.textContent).toContain('Connected');
    expect(section('Messaging')?.textContent).toContain('Made for Vietnam');
    expect(links(section('Government') ?? container)).toEqual([
      [expect.stringContaining('eBarimt'), '/settings/integrations/ebarimt'],
    ]);
    // Made for the organisation's country, or for any: nothing to say where it works.
    expect(section('Government')?.textContent).not.toContain('Made for');
    expect(section('Social media')?.textContent).not.toContain('Made for');
    expect(
      [...container.querySelectorAll('[aria-label="Categories"] button')].map(
        (item) => item.textContent,
      ),
    ).toEqual(['All', 'Social media', 'Messaging', 'Government']);
    expect(container.textContent).not.toContain('Vault');
  });

  it('opens a plugin’s integration under core’s header, a tab at a time', async () => {
    const container = await renderSettings('/settings/integrations/chat.meta', 'Conversations');
    const tabs = [...container.querySelectorAll('[role="tab"]')];

    expect(container.querySelector('h1')?.textContent).toBe('Messenger');
    expect(container.textContent).toContain('Works in any country');
    expect(tabs.map((tab) => tab.textContent)).toEqual(['Overview', 'Meta app']);
    expect(container.textContent).not.toContain('App id and secret');
    expect(container.textContent).toContain('In automations');
    expect(container.textContent).toContain('Reply on Messenger');

    await act(async () => {
      tabs[1]?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    await vi.waitFor(() => expect(container.textContent).toContain('App id and secret'));
    // The address names the tab, so a reload opens it again.
    await vi.waitFor(() => expect(window.location.search).toBe('?tab=app'));
    expect(container.textContent).not.toContain('Conversations from Facebook pages');
    expect(container.textContent).not.toContain('Reply on Messenger');
  });

  it.each([
    ['integrations', (action: string) => action === 'integrations.manage'],
    ['payments', (action: string) => action === 'payments.manage'],
  ])('lets a member who manages only %s open the catalog', async (_case, can) => {
    member.can = can;

    const container = await renderSettings('/settings/integrations', 'Messenger');

    expect(links(container)).toContainEqual(['Integrations', '/settings/integrations']);
  });

  it('links no catalog for a member who manages neither', async () => {
    member.can = () => false;

    const container = await renderSettings();

    expect(links(container).map(([, href]) => href)).not.toContain('/settings/integrations');
  });

  it('sends a member to the catalog from an integration core does not list them', async () => {
    const container = await renderSettings('/settings/integrations/chat.vault', 'Messenger');

    expect(window.location.pathname).toBe('/settings/integrations');
    expect(container.textContent).not.toContain('Vault');
  });
});
