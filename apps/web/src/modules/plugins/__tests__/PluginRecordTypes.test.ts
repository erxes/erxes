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

describe('a plugin record in core’s side panel', () => {
  it('draws the plugin’s slots in core’s panel and expands to the plugin’s page', async () => {
    const container = await render('/sales/deals?panel=/detail/sales:deal/d1');

    await vi.waitFor(() => expect(panel(container)).toContain('d1 in the panel'));
    expect(panel(container)).toContain('Deal d1');
    // Its own plugin's relation tab doesn't show on it.
    expect(tabNames(container)).toEqual(['Detail']);

    await click(container.querySelector('[data-record-side-panel] button[aria-expanded]'));

    await vi.waitFor(() => expect(address(container)).toBe('/sales/deals/d1'));
    await vi.waitFor(() => expect(container.textContent).toContain('d1 on its page'));
    const crumbs = container.querySelectorAll('nav a[href="/sales"], nav a[href="/sales/deals"]');
    expect([...crumbs].map((a) => a.textContent).join(' › ')).toBe('Sales › Deal');
  });

  it.each([
    ['the list its page names', '/sales/pipelines/p1/deals/d1', '/sales/pipelines/p1'],
    ['the plugin’s first page without one', '/sales/deals/d1', '/sales'],
  ])('a record deleted on its own page goes back to %s', async (_case, url, list) => {
    const container = await render(url);

    await vi.waitFor(() => expect(container.textContent).toContain('d1 on its page'));
    await click(button(container, 'Delete'));

    await vi.waitFor(() => expect(address(container)).toBe(list));
  });

  it('shows another plugin’s relation tab where it names the type; a record opened there stacks, and Back returns', async () => {
    const container = await render('/tasks?panel=/detail/tasks:task/t1');

    // Properties (the type keeps custom fields) comes before relation tabs.
    await vi.waitFor(() => expect(tabNames(container)).toEqual(['Detail', 'Properties', 'Deals']));
    expect(panel(container)).toContain('Task t1');

    await click(container.querySelector('[data-panel-tab="sales_ui:deals"]'));
    await vi.waitFor(() => expect(panel(container)).toContain('Deal d1 of c1'));
    await click(button(container, 'Deal d1 of c1'));

    await vi.waitFor(() => expect(address(container)).toContain('panel=/detail/sales:deal/d1'));
    await vi.waitFor(() => expect(panel(container)).toContain('d1 in the panel'));

    await click(container.querySelector('[data-record-side-panel] button[aria-label="Back"]'));

    await vi.waitFor(() => expect(address(container)).toContain('panel=/detail/tasks:task/t1'));
    expect(panel(container)).toContain('Task t1');
  });

  it('opens a draft with its opener’s defaults; Save puts the record in its place', async () => {
    const container = await render('/sales/deals');

    await click(button(container, 'Add deal'));
    await vi.waitFor(() => expect(panel(container)).toContain('Save deal in s1'));
    expect(address(container)).toMatch(/panel=\/detail\/sales:deal\/new\//);

    await click(button(container, 'Save deal in s1'));

    await vi.waitFor(() => expect(panel(container)).toContain('d9 in the panel'));
    expect(address(container)).toContain('panel=/detail/sales:deal/d9');
  });

  it('opens a record on the tab its opener names, and expands to its page on that tab', async () => {
    const container = await render('/sales/deals');

    await click(button(container, 'Contract on terms'));

    await vi.waitFor(() => expect(selectedTab(container)).toBe('Terms'));
    expect(panel(container)).toContain('Terms of k1');
    expect(address(container)).toContain('panel=/detail/sales:contract/k1');

    await click(container.querySelector('[data-record-side-panel] button[aria-expanded]'));

    await vi.waitFor(() => expect(address(container)).toBe('/sales/contracts/k1?tab=terms'));
  });

  it('opens a tab the record lacks on its default; opened again, only the tab changes', async () => {
    const container = await render('/sales/deals');

    await click(button(container, 'Contract on notes'));
    await vi.waitFor(() => expect(selectedTab(container)).toBe('Detail'));

    await click(button(container, 'Contract on terms'));

    await vi.waitFor(() => expect(selectedTab(container)).toBe('Terms'));
    expect(address(container)).not.toContain('panelHistory');
  });

  it('keeps a crashing slot to itself: the header still closes the panel', async () => {
    const container = await render('/sales/deals?panel=/detail/sales:broken/b1');

    await vi.waitFor(() => expect(panel(container)).toContain('sales stopped working'));
    expect(panel(container)).toContain('deal exploded');
    expect(panel(container)).toContain('Deal b1');

    await click(container.querySelector('[data-record-side-panel] button[aria-label="Close"]'));

    await vi.waitFor(() => expect(container.querySelector('[data-record-side-panel]')).toBeNull());
  });

  it.each([
    ['another plugin’s type', 'shop:order'],
    ['a type whose page is outside the plugin', 'sales:quote'],
    ['a plugin the member may not use', 'hr:employee'],
    ['no plugin at all', 'crm:lead'],
  ])('shows nothing for %s', async (_case, contentType) => {
    const container = await render(`/sales/deals?panel=/detail/${contentType}/x1`);

    await vi.waitFor(() => expect(panel(container)).toContain('Nothing here'));
    expect(panel(container)).not.toContain('Deal');
  });
});
