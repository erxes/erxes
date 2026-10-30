/** @jest-environment jsdom */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useQueryState } from 'erxes-ui';
import { Provider } from 'jotai';
import { startTransition, Suspense, useState } from 'react';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import { SidePanelRecordPathContext, useSidePanel } from '../useSidePanel';

jest.mock('react-router-dom', () => {
  const { TextEncoder } = jest.requireActual<typeof import('util')>('util');
  Object.defineProperty(globalThis, 'TextEncoder', { value: TextEncoder });
  return jest.requireActual('react-router-dom');
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
  const { path, tab, setTab, openRecord, back } = useSidePanel();
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
