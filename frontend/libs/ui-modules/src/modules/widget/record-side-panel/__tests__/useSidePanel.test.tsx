/** @jest-environment jsdom */
import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'jotai';
import { startTransition, Suspense, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
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
