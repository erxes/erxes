// @vitest-environment happy-dom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  RecordPage,
  type TRecordDraftProps,
  type TRecordSlotProps,
  type TRelationTabProps,
  useOpenRecord,
  usePanelExpanded,
  useRecordPanel,
} from 'erxes-ui';
import { NuqsAdapter } from 'nuqs/adapters/react-router/v7';
import { act, createElement, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { BrowserRouter, Route, Routes, useLocation, useParams } from 'react-router-dom';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vite-plus/test';

const Icon = () => null;

const Name = ({ contentType, contentId }: TRecordSlotProps) =>
  createElement('span', null, `${contentType === 'tasks:task' ? 'Task' : 'Deal'} ${contentId}`);

const Detail = ({ contentId }: TRecordSlotProps) =>
  createElement('p', null, `${contentId} ${usePanelExpanded() ? 'on its page' : 'in the panel'}`);

const DealNew = ({ defaults, onCreated }: TRecordDraftProps) =>
  createElement(
    'button',
    { type: 'button', onClick: () => onCreated('d9') },
    `Save deal in ${String(defaults.stageId)}`,
  );

/** The header's actions: deleting takes the record out of where it shows. */
const DealActions = () => {
  const panel = useRecordPanel();

  return createElement('button', { type: 'button', onClick: () => panel?.dismiss() }, 'Delete');
};

const Terms = ({ contentId }: TRecordSlotProps) =>
  createElement('p', null, `Terms of ${contentId}`);

const Broken = () => {
  throw new Error('deal exploded');
};

/** The sales plugin's Deals tab: the host's customers' deals, each opening in the panel. */
const DealsTab = ({ customerIds }: TRelationTabProps) => {
  const { open } = useOpenRecord();

  return createElement(
    'button',
    { type: 'button', onClick: () => open({ contentType: 'sales:deal', contentId: 'd1' }) },
    `Deal d1 of ${customerIds.join()}`,
  );
};

const deal = {
  title: 'Deal',
  icon: Icon,
  Title: Name,
  Actions: DealActions,
  Detail,
  New: DealNew,
  detailPath: (id: string) => `/sales/deals/${id}`,
};

// The `./config` each plugin remote exposes.
const CONFIGS: Record<string, unknown> = {
  'tasks_ui/config': {
    name: 'tasks',
    path: 'tasks',
    recordTypes: [
      {
        contentType: 'tasks:task',
        title: 'Task',
        icon: Icon,
        Title: Name,
        Detail,
        detailPath: (id: string) => `/tasks/${id}`,
        // Every task here belongs to customer c1.
        contacts: (id: string) => ({
          queryKey: ['task-contacts', id],
          queryFn: async () => ({ customerIds: ['c1'], companyIds: [] }),
        }),
        // Custom fields core defines, values the plugin keeps.
        properties: {
          type: 'tasks.task',
          values: (id: string) => ({
            queryKey: ['task-properties', id],
            queryFn: async () => ({}),
          }),
          save: async () => undefined,
        },
      },
    ],
  },
  'sales_ui/config': {
    name: 'sales',
    path: 'sales',
    recordTypes: [
      { ...deal, contentType: 'sales:deal' },
      { ...deal, contentType: 'sales:broken', Detail: Broken },
      {
        ...deal,
        contentType: 'sales:contract',
        detailPath: (id: string) => `/sales/contracts/${id}`,
        tabs: [{ value: 'terms', label: 'Terms', icon: Icon, component: Terms }],
      },
      // Not the plugin's own type, and a page outside the plugin's: both left out.
      { ...deal, contentType: 'shop:order' },
      { ...deal, contentType: 'sales:quote', detailPath: (id: string) => `/contacts/${id}` },
    ],
    relationTabs: [
      { name: 'deals', title: 'Deals', icon: Icon, hosts: ['tasks:task'], component: DealsTab },
      // Names no hosts: customers and companies only.
      { name: 'quotes', title: 'Quotes', icon: Icon, component: DealsTab },
    ],
  },
  'hr_ui/config': {
    name: 'hr',
    path: 'hr',
    checkAccess: async () => false,
    recordTypes: [{ ...deal, contentType: 'hr:employee', detailPath: (id: string) => `/hr/${id}` }],
    relationTabs: [{ name: 'employees', title: 'Employees', icon: Icon, component: DealsTab }],
  },
};

vi.mock('@module-federation/enhanced/runtime', () => ({
  registerRemotes: () => undefined,
  loadRemote: async (id: string) => ({ CONFIG: CONFIGS[id] }),
}));

let root: Root | undefined;

beforeAll(async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  vi.stubEnv(
    'PUBLIC_PLUGINS',
    ['tasks_ui', 'sales_ui', 'hr_ui']
      .map((name) => `${name}@http://plugins.test/${name}.js`)
      .join(),
  );
  // No core here: the registry fails and the local plugins still load.
  vi.stubGlobal('fetch', async () => Promise.reject(new Error('offline')));
  vi.spyOn(console, 'error').mockImplementation(() => undefined);

  const { setRecordPage } = await import('erxes-ui');
  const { RecordPageView } = await import('~/modules/side-panel/RecordPage');

  setRecordPage(RecordPageView);
});

afterEach(() => {
  act(() => root?.unmount());
  document.body.innerHTML = '';
});

/** Where the app is: the page and the side panel's route. */
const Address = () => {
  const { pathname, search } = useLocation();

  return createElement('output', null, `${pathname}${decodeURIComponent(search)}`);
};

/** URL query state through the router, as web's `App` sets it up. */
const QueryState = ({ children }: { children?: ReactNode }) => {
  // The adapter's type takes its children as a prop.
  const props: Parameters<typeof NuqsAdapter>[0] = {
    defaultOptions: { shallow: false, history: 'push' },
    children,
  };

  return createElement(NuqsAdapter, props);
};

/** A plugin's list: it opens a draft deal in a stage, and a contract on a tab. */
const DealsList = () => {
  const { open, openNew } = useOpenRecord();

  return [
    createElement(
      'button',
      { key: 'new', type: 'button', onClick: () => openNew('sales:deal', { stageId: 's1' }) },
      'Add deal',
    ),
    ...['terms', 'notes'].map((tab) =>
      createElement(
        'button',
        {
          key: tab,
          type: 'button',
          onClick: () => open({ contentType: 'sales:contract', contentId: 'k1', tab }),
        },
        `Contract on ${tab}`,
      ),
    ),
  ];
};

/** The plugin's route for a deal's own page. */
const DealPage = () =>
  createElement(RecordPage, { contentType: 'sales:deal', contentId: useParams().id ?? '' });

/** A deal's page in its pipeline: closing it goes back to that pipeline's deals. */
const PipelineDealPage = () => {
  const { pipelineId = '', id = '' } = useParams();

  return createElement(RecordPage, {
    contentType: 'sales:deal',
    contentId: id,
    listPath: `/sales/pipelines/${pipelineId}`,
  });
};

const render = async (url: string) => {
  const { SidePanelLayout } = await import('~/modules/side-panel/SidePanelLayout');
  const { PanelRecordOpener } = await import('~/modules/side-panel/PanelRecordOpener');
  const container = document.createElement('div');

  document.body.append(container);
  root = createRoot(container);

  // nuqs reads the browser's address, as web runs it.
  window.history.replaceState(null, '', url);

  const app = createElement(
    BrowserRouter,
    null,
    createElement(
      QueryState,
      null,
      createElement(Address),
      createElement(
        PanelRecordOpener,
        null,
        createElement(
          Routes,
          null,
          createElement(Route, { path: '/sales/deals/:id', element: createElement(DealPage) }),
          createElement(Route, {
            path: '/sales/pipelines/:pipelineId/deals/:id',
            element: createElement(PipelineDealPage),
          }),
          createElement(Route, { path: '*', element: createElement(DealsList) }),
        ),
      ),
      createElement(SidePanelLayout),
    ),
  );

  await act(async () => {
    root?.render(createElement(QueryClientProvider, { client: new QueryClient() }, app));
  });

  return container;
};

const click = (element: Element | null | undefined) =>
  act(async () => {
    if (element instanceof HTMLElement) element.click();
  });

const button = (container: HTMLElement, text: string) =>
  [...container.querySelectorAll('button')].find((candidate) => candidate.textContent === text);

const address = (container: HTMLElement) => container.querySelector('output')?.textContent;

const panel = (container: HTMLElement) =>
  container.querySelector('[data-record-side-panel]')?.textContent ?? '';

const tabNames = (container: HTMLElement) =>
  [...container.querySelectorAll('[data-panel-tab]')].map((tab) => tab.textContent);

const selectedTab = (container: HTMLElement) =>
  container.querySelector('[data-panel-tab][aria-selected="true"]')?.textContent;

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
