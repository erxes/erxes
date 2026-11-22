// @vitest-environment happy-dom
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vite-plus/test';
import {
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
