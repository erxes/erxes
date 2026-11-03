/** @jest-environment jsdom */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useQueryState } from 'erxes-ui';
import { Provider } from 'jotai';
import { startTransition, Suspense, useState } from 'react';
import {
  BrowserRouter,
  createMemoryRouter,
  RouterProvider,
  useNavigate,
} from 'react-router-dom';
import { SidePanelRecordPathContext, useSidePanel } from '../useSidePanel';

jest.mock('react-router-dom', () => {
  const { TextEncoder } = jest.requireActual<typeof import('util')>('util');
  Object.defineProperty(globalThis, 'TextEncoder', { value: TextEncoder });
  const { Request } =
    jest.requireActual<typeof import('node-fetch')>('node-fetch');
  Object.defineProperty(globalThis, 'Request', {
    value: Request,
    configurable: true,
  });
  return jest.requireActual('react-router');
});

jest.mock('erxes-ui', () =>
  jest.requireActual('../../../../../../erxes-ui/src/hooks/use-query-state'),
);

const draftPath = '/detail/customer/new/committed-draft';
const pendingRender = new Promise<void>(() => undefined);

const SaveCustomer = ({ suspend = false }: { suspend?: boolean }) => {
  const { replaceRecord } = useSidePanel();
  if (suspend) throw pendingRender;
  return (
    <button
      onClick={() =>
        replaceRecord(
          { contentType: 'core:customer', contentId: 'new' },
          { contentType: 'core:customer', contentId: 'saved-customer' },
        )
      }
    >
      Complete save
    </button>
  );
};

const PendingDraft = () => {
  const [suspend, setSuspend] = useState(false);
  return (
    <>
      <button onClick={() => startTransition(() => setSuspend(true))}>
        Start pending render
      </button>
      <Suspense fallback="Loading draft">
        <SidePanelRecordPathContext.Provider
          value={suspend ? '/detail/customer/new/uncommitted-draft' : draftPath}
        >
          <SaveCustomer suspend={suspend} />
        </SidePanelRecordPathContext.Provider>
      </Suspense>
    </>
  );
};

it('uses the committed draft when a save completes during a suspended render', () => {
  window.history.replaceState(null, '', `?panel=${draftPath}`);
  render(
    <Provider>
      <BrowserRouter>
        <PendingDraft />
      </BrowserRouter>
    </Provider>,
  );

  fireEvent.click(screen.getByRole('button', { name: 'Start pending render' }));
  fireEvent.click(screen.getByRole('button', { name: 'Complete save' }));

  expect(new URLSearchParams(window.location.search).get('panel')).toBe(
    '/detail/customer/saved-customer',
  );
});

it('replaces a saved draft in history without leaving the active related record', () => {
  const params = new URLSearchParams({
    panel: '/detail/company/related-company',
    panelHistory: JSON.stringify([draftPath]),
  });
  window.history.replaceState(null, '', `?${params}`);
  render(
    <Provider>
      <BrowserRouter>
        <SidePanelRecordPathContext.Provider value={draftPath}>
          <SaveCustomer />
        </SidePanelRecordPathContext.Provider>
      </BrowserRouter>
    </Provider>,
  );

  fireEvent.click(screen.getByRole('button', { name: 'Complete save' }));

  const savedParams = new URLSearchParams(window.location.search);
  expect(savedParams.get('panel')).toBe('/detail/company/related-company');
  expect(JSON.parse(savedParams.get('panelHistory') || '[]')).toEqual([
    '/detail/customer/saved-customer',
  ]);
});

const PanelNavigation = () => {
  const { path, tab, setTab, openRecord, back, close, dismissPath } =
    useSidePanel();
  const [, setSearch] = useQueryState<string>('searchValue');
  const navigate = useNavigate();
  return (
    <>
      <output data-testid="active-panel">{`${path}:${tab}`}</output>
      <button onClick={() => setTab('properties')}>Properties</button>
      <button onClick={() => setTab('activity')}>Activity</button>
      <button
        onClick={() =>
          openRecord(
            { contentType: 'core:company', contentId: 'related-company' },
            { stack: true },
          )
        }
      >
        Open related company
      </button>
      <button onClick={back}>Panel back</button>
      <button onClick={close}>Close panel</button>
      <button onClick={() => path && dismissPath(path)}>Dismiss panel</button>
      <button onClick={() => navigate(-1)}>Browser back</button>
      <button onClick={() => navigate(1)}>Browser forward</button>
      <button
        onClick={() => {
          setTab('properties');
          setSearch('Alice');
        }}
      >
        Set tab and filter
      </button>
    </>
  );
};

const RetainedCustomerTab = () => {
  const { tab } = useSidePanel();
  return <output data-testid="retained-tab">{tab}</output>;
};

const renderNavigation = () => {
  window.history.replaceState(null, '', '?panel=/detail/customer/customer-a');
  render(
    <Provider>
      <BrowserRouter>
        <PanelNavigation />
        <SidePanelRecordPathContext.Provider value="/detail/customer/customer-a">
          <RetainedCustomerTab />
        </SidePanelRecordPathContext.Provider>
      </BrowserRouter>
    </Provider>,
  );
};

it('preserves each record tab through panel and browser history navigation', async () => {
  renderNavigation();
  fireEvent.click(screen.getByRole('button', { name: 'Properties' }));
  fireEvent.click(screen.getByRole('button', { name: 'Open related company' }));
  fireEvent.click(screen.getByRole('button', { name: 'Activity' }));
  expect(screen.getByTestId('retained-tab').textContent).toBe('properties');
  fireEvent.click(screen.getByRole('button', { name: 'Panel back' }));
  expect(screen.getByTestId('active-panel').textContent).toBe(
    '/detail/customer/customer-a:properties',
  );

  fireEvent.click(screen.getByRole('button', { name: 'Browser back' }));
  await waitFor(() =>
    expect(screen.getByTestId('active-panel').textContent).toBe(
      '/detail/company/related-company:activity',
    ),
  );
  fireEvent.click(screen.getByRole('button', { name: 'Browser forward' }));
  await waitFor(() =>
    expect(screen.getByTestId('active-panel').textContent).toBe(
      '/detail/customer/customer-a:properties',
    ),
  );
});

it('keeps tab state when a page filter is updated in the same event', () => {
  renderNavigation();
  fireEvent.click(screen.getByRole('button', { name: 'Set tab and filter' }));

  expect(screen.getByTestId('active-panel').textContent).toBe(
    '/detail/customer/customer-a:properties',
  );
  const params = new URLSearchParams(window.location.search);
  expect(params.get('searchValue')).toBe('Alice');
  expect(params.get('panel')).toBe('/detail/customer/customer-a');
});

const CompletePluginSave = () => {
  const { openRecord } = useSidePanel();
  return (
    <button
      onClick={() =>
        openRecord(
          { contentType: 'operation:task', contentId: 'saved-task' },
          { replace: true },
        )
      }
    >
      Complete task save
    </button>
  );
};

it('keeps the active contact when a hidden plugin draft saves through openRecord', async () => {
  const taskDraft = '/detail/operation:task/new/task-draft';
  const params = new URLSearchParams({
    panel: '/detail/company/related-company',
    panelHistory: JSON.stringify([taskDraft]),
    searchValue: 'preserved-filter',
  });
  window.history.replaceState(null, '', `?${params}`);
  render(
    <Provider>
      <BrowserRouter>
        <SidePanelRecordPathContext.Provider value={taskDraft}>
          <CompletePluginSave />
        </SidePanelRecordPathContext.Provider>
        <PanelNavigation />
      </BrowserRouter>
    </Provider>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Complete task save' }));
  await waitFor(() =>
    expect(new URLSearchParams(window.location.search).get('panel')).toBe(
      '/detail/company/related-company',
    ),
  );
  expect(
    JSON.parse(
      new URLSearchParams(window.location.search).get('panelHistory') || '[]',
    ),
  ).toEqual(['/detail/operation:task/saved-task']);
  expect(new URLSearchParams(window.location.search).get('searchValue')).toBe(
    'preserved-filter',
  );
  fireEvent.click(screen.getByRole('button', { name: 'Panel back' }));
  await waitFor(() =>
    expect(new URLSearchParams(window.location.search).get('panel')).toBe(
      '/detail/operation:task/saved-task',
    ),
  );
});

it('replaces a hidden plugin draft through the app data router and returns to its saved record', async () => {
  const taskDraft = '/detail/operation:task/new/data-router-draft';
  const params = new URLSearchParams({
    panel: '/detail/company/related-company',
    panelHistory: JSON.stringify([taskDraft]),
  });
  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: (
          <>
            <SidePanelRecordPathContext.Provider value={taskDraft}>
              <CompletePluginSave />
            </SidePanelRecordPathContext.Provider>
            <PanelNavigation />
          </>
        ),
      },
    ],
    { initialEntries: [`/?${params}`] },
  );
  render(
    <Provider>
      <RouterProvider router={router} />
    </Provider>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Complete task save' }));
  await waitFor(() =>
    expect(
      new URLSearchParams(router.state.location.search).get('panelHistory'),
    ).toBe('["/detail/operation:task/saved-task"]'),
  );
  expect(new URLSearchParams(router.state.location.search).get('panel')).toBe(
    '/detail/company/related-company',
  );
  fireEvent.click(screen.getByRole('button', { name: 'Panel back' }));
  await waitFor(() =>
    expect(new URLSearchParams(router.state.location.search).get('panel')).toBe(
      '/detail/operation:task/saved-task',
    ),
  );
  router.dispose();
});

it.each(['Close panel', 'Dismiss panel'])(
  'clears full-page state atomically through %s and opens the next record compact',
  (action) => {
    const params = new URLSearchParams({
      panel: '/detail/customer/customer-a',
      panelExpanded: 'true',
      searchValue: 'keep-filter',
    });
    window.history.replaceState(null, '', `?${params}`);
    render(
      <Provider>
        <BrowserRouter>
          <PanelNavigation />
        </BrowserRouter>
      </Provider>,
    );
    fireEvent.click(screen.getByRole('button', { name: action }));
    const closed = new URLSearchParams(window.location.search);
    expect(closed.has('panel')).toBe(false);
    expect(closed.has('panelExpanded')).toBe(false);
    expect(closed.get('searchValue')).toBe('keep-filter');
    fireEvent.click(
      screen.getByRole('button', { name: 'Open related company' }),
    );
    expect(
      new URLSearchParams(window.location.search).has('panelExpanded'),
    ).toBe(false);
  },
);

it('preserves full-page mode while navigating between related records', () => {
  window.history.replaceState(
    null,
    '',
    '?panel=/detail/customer/customer-a&panelExpanded=true',
  );
  render(
    <Provider>
      <BrowserRouter>
        <PanelNavigation />
      </BrowserRouter>
    </Provider>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Open related company' }));
  expect(new URLSearchParams(window.location.search).get('panelExpanded')).toBe(
    'true',
  );
  fireEvent.click(screen.getByRole('button', { name: 'Panel back' }));
  expect(new URLSearchParams(window.location.search).get('panelExpanded')).toBe(
    'true',
  );
});
