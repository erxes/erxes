// @vitest-environment happy-dom
import { afterEach, beforeAll, describe, expect, it, vi } from 'vite-plus/test';
import {
  address,
  button,
  click,
  panel,
  render,
  selectedTab,
  setUpPlugins,
  tabNames,
  unmount,
} from './pluginRecordHarness';

vi.mock('@module-federation/enhanced/runtime', () => ({
  registerRemotes: () => undefined,
  loadRemote: async (id: string) => ({
    CONFIG: (await import('./pluginRecordHarness')).CONFIGS[id],
  }),
}));

beforeAll(setUpPlugins);

afterEach(unmount);

const toPanel = (container: HTMLElement) =>
  container.querySelector('button[aria-label="Open in side panel"]');

describe('a record’s own page back to the side panel', () => {
  it('puts a record expanded from the panel back in it, over the page it left, its stack kept', async () => {
    const container = await render('/tasks?view=board&panel=/detail/tasks:task/t1');

    await vi.waitFor(() => expect(tabNames(container)).toContain('Deals'));
    await click(container.querySelector('[data-panel-tab="sales_ui:deals"]'));
    await vi.waitFor(() => expect(panel(container)).toContain('Deal d1 of c1'));
    await click(button(container, 'Deal d1 of c1'));
    await vi.waitFor(() => expect(panel(container)).toContain('d1 in the panel'));

    await click(container.querySelector('[data-record-side-panel] button[aria-expanded]'));
    await vi.waitFor(() => expect(container.textContent).toContain('d1 on its page'));
    expect(address(container)).toBe('/sales/deals/d1');

    await click(toPanel(container));

    await vi.waitFor(() =>
      expect(address(container)).toBe(
        '/tasks?view=board&panel=/detail/sales:deal/d1&panelHistory=["/detail/tasks:task/t1"]',
      ),
    );
    await vi.waitFor(() => expect(panel(container)).toContain('d1 in the panel'));

    // Back reaches the task on the tab it was left on.
    await click(container.querySelector('[data-record-side-panel] button[aria-label="Back"]'));
    await vi.waitFor(() => expect(selectedTab(container)).toBe('Deals'));
  });

  it('puts a record opened from a link in the side panel over its list', async () => {
    const container = await render('/sales/pipelines/p1/deals/d1');

    await vi.waitFor(() => expect(container.textContent).toContain('d1 on its page'));
    await click(toPanel(container));

    await vi.waitFor(() =>
      expect(address(container)).toBe('/sales/pipelines/p1?panel=/detail/sales:deal/d1'),
    );
    await vi.waitFor(() => expect(panel(container)).toContain('d1 in the panel'));
  });
});
