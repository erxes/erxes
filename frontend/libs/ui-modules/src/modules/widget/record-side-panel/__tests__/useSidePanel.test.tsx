/** @jest-environment jsdom */
import { fireEvent, render, screen } from '@testing-library/react';
import { Provider, createStore } from 'jotai';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { SidePanelRecordPathContext, useSidePanel } from '../useSidePanel';

jest.mock('react-router-dom', () => {
  const { TextEncoder, TextDecoder } =
    jest.requireActual<typeof import('util')>('util');
  Object.assign(global, { TextEncoder, TextDecoder });
  return jest.requireActual<typeof import('react-router-dom')>(
    'react-router-dom',
  );
});
jest.mock('../RecordSidePanel', () => ({ SIDE_PANEL_WIDTH: { default: 400 } }));
jest.mock('erxes-ui', () => ({
  useMultiQueryState: (keys: string[]) => {
    const { useSearchParams } =
      jest.requireActual<typeof import('react-router-dom')>('react-router-dom');
    const [params, setParams] = useSearchParams();
    const values = Object.fromEntries(
      keys.map((key) => {
        const value = params.get(key);
        try {
          return [key, value ? JSON.parse(value) : null];
        } catch {
          return [key, value];
        }
      }),
    );
    return [
      values,
      (next: Record<string, unknown>, options?: { replace?: boolean }) => {
        setParams((previous) => {
          const updated = new URLSearchParams(previous);
          Object.entries(next).forEach(([key, value]) => {
            if (value === null) updated.delete(key);
            else
              updated.set(
                key,
                typeof value === 'string' ? value : JSON.stringify(value),
              );
          });
          return updated;
        }, options);
      },
    ];
  },
}));

const Controls = () => {
  const panel = useSidePanel();
  const location = useLocation();
  return (
    <>
      <output aria-label="Path">{panel.path || 'closed'}</output>
      <output aria-label="History">{JSON.stringify(panel.history)}</output>
      <output aria-label="Search">{location.search}</output>
      <button
        onClick={() =>
          panel.openRecord(
            { contentType: 'core:company', contentId: 'co1' },
            { stack: true },
          )
        }
      >
        Related company
      </button>
      <button onClick={() => panel.openPath('/module/editor', { stack: true })}>
        Nested editor
      </button>
      <button
        onClick={() =>
          panel.openRecord(
            { contentType: 'core:customer', contentId: 'created' },
            { replace: true },
          )
        }
      >
        Save draft
      </button>
      <button
        onClick={() =>
          panel.openNewRecord('core:customer', {}, { stack: true })
        }
      >
        New customer
      </button>
      <button
        onClick={() =>
          panel.replaceRecord(
            { contentType: 'core:customer', contentId: 'new' },
            { contentType: 'core:customer', contentId: 'created' },
          )
        }
      >
        Complete scoped draft
      </button>
      <button onClick={panel.back}>Back</button>
      <button onClick={panel.close}>Close</button>
    </>
  );
};
const mount = (entry: string, sourcePath: string | null = null) =>
  render(
    <Provider store={createStore()}>
      <MemoryRouter initialEntries={[entry]}>
        <SidePanelRecordPathContext.Provider value={sourcePath}>
          <Controls />
        </SidePanelRecordPathContext.Provider>
      </MemoryRouter>
    </Provider>,
  );

it('writes the parent record and nested editor history into a reloadable URL without dropping page filters', () => {
  mount('/?searchValue=keep&panel=/detail/customer/c1');
  fireEvent.click(screen.getByRole('button', { name: 'Related company' }));
  fireEvent.click(screen.getByRole('button', { name: 'Nested editor' }));
  expect(screen.getByLabelText('Path').textContent).toBe('/module/editor');
  expect(
    JSON.parse(screen.getByLabelText('History').textContent || '[]'),
  ).toEqual(['/detail/customer/c1', '/detail/company/co1']);
  const params = new URLSearchParams(
    screen.getByLabelText('Search').textContent || '',
  );
  expect(params.get('searchValue')).toBe('keep');
  expect(JSON.parse(params.get('panelHistory') || '[]')).toEqual([
    '/detail/customer/c1',
    '/detail/company/co1',
  ]);
});

it('restores Back navigation from a copied nested panel link', () => {
  const history = encodeURIComponent(JSON.stringify(['/detail/customer/c1']));
  mount(`/?panel=/detail/company/co1&panelHistory=${history}`);
  fireEvent.click(screen.getByRole('button', { name: 'Back' }));
  expect(screen.getByLabelText('Path').textContent).toBe('/detail/customer/c1');
  expect(
    new URLSearchParams(screen.getByLabelText('Search').textContent || '').has(
      'panelHistory',
    ),
  ).toBe(false);
});

it('replaces a saved draft without putting the draft in Back history and clears the stack on Close', () => {
  const history = encodeURIComponent(JSON.stringify(['/detail/company/co1']));
  mount(`/?panel=/detail/customer/new&panelHistory=${history}`);
  fireEvent.click(screen.getByRole('button', { name: 'Save draft' }));
  expect(screen.getByLabelText('Path').textContent).toBe(
    '/detail/customer/created',
  );
  expect(screen.getByLabelText('History').textContent).toBe(
    '["/detail/company/co1"]',
  );
  fireEvent.click(screen.getByRole('button', { name: 'Close' }));
  expect(screen.getByLabelText('Path').textContent).toBe('closed');
  expect(screen.getByLabelText('History').textContent).toBe('[]');
});

it('ignores malformed history entries from a shared URL', () => {
  const history = encodeURIComponent(
    JSON.stringify([null, {}, 10, 'invalid', '/detail/customer/c1']),
  );
  mount(`/?panel=/detail/company/co1&panelHistory=${history}`);
  expect(screen.getByLabelText('History').textContent).toBe(
    '["/detail/customer/c1"]',
  );
});

it('gives stacked drafts of the same type separate URL identities', () => {
  const uuid = jest
    .fn()
    .mockReturnValueOnce('draft-one')
    .mockReturnValueOnce('draft-two');
  Object.defineProperty(global.crypto, 'randomUUID', {
    configurable: true,
    value: uuid,
  });
  mount('/');
  fireEvent.click(screen.getByRole('button', { name: 'New customer' }));
  fireEvent.click(screen.getByRole('button', { name: 'New customer' }));
  expect(screen.getByLabelText('Path').textContent).toBe(
    '/detail/customer/new/draft-two',
  );
  expect(screen.getByLabelText('History').textContent).toBe(
    '["/detail/customer/new/draft-one"]',
  );
  fireEvent.click(screen.getByRole('button', { name: 'Back' }));
  expect(screen.getByLabelText('Path').textContent).toBe(
    '/detail/customer/new/draft-one',
  );
});

it('finishes a hidden draft without replacing another draft or moving the active record', () => {
  const history = encodeURIComponent(
    JSON.stringify([
      '/detail/customer/new/draft-one',
      '/detail/customer/new/draft-two',
    ]),
  );
  mount(
    `/?panel=/detail/company/co1&panelHistory=${history}`,
    '/detail/customer/new/draft-one',
  );
  fireEvent.click(
    screen.getByRole('button', { name: 'Complete scoped draft' }),
  );
  expect(screen.getByLabelText('Path').textContent).toBe('/detail/company/co1');
  expect(screen.getByLabelText('History').textContent).toBe(
    '["/detail/customer/created","/detail/customer/new/draft-two"]',
  );
  fireEvent.click(screen.getByRole('button', { name: 'Close' }));
  fireEvent.click(
    screen.getByRole('button', { name: 'Complete scoped draft' }),
  );
  expect(screen.getByLabelText('Path').textContent).toBe('closed');
});
