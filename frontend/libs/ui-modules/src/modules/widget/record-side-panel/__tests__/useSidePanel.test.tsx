/** @jest-environment jsdom */
import { act, renderHook } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import { MemoryRouter } from 'react-router-dom';
import { useSidePanel } from '../useSidePanel';

jest.mock('react-router-dom', () => {
  Object.assign(globalThis, {
    TextEncoder: require('node:util').TextEncoder,
    TextDecoder: require('node:util').TextDecoder,
  });
  return jest.requireActual('react-router-dom');
});
jest.mock('erxes-ui', () =>
  jest.requireActual('erxes-ui/hooks/use-query-state'),
);
jest.mock(
  'ui-modules/modules/widget/record-side-panel/RecordSidePanel',
  () => ({
    SIDE_PANEL_WIDTH: { min: 320, max: 600, default: 400 },
  }),
);

it.each([true, false])(
  'removes every deleted record occurrence while active=%s',
  (active) => {
    const deleted = '/detail/customer/A';
    const retained = '/detail/company/B';
    const params = new URLSearchParams({
      panel: active ? deleted : retained,
      panelHistory: JSON.stringify(
        active ? [deleted, retained] : [deleted, deleted],
      ),
    });
    const store = createStore();
    const wrapper = ({ children }: React.PropsWithChildren) => (
      <Provider store={store}>
        <MemoryRouter initialEntries={[`/contacts/customers?${params}`]}>
          {children}
        </MemoryRouter>
      </Provider>
    );
    const { result } = renderHook(() => useSidePanel(), { wrapper });
    act(() => result.current.dismissPath(deleted));
    expect(result.current.path).toBe(retained);
    expect(result.current.history).toEqual([]);
    act(() => result.current.back());
    expect(result.current.path).toBe(retained);
  },
);

it('uses committed navigation when a pending deletion finishes through an older callback', () => {
  const store = createStore();
  const wrapper = ({ children }: React.PropsWithChildren) => (
    <Provider store={store}>
      <MemoryRouter
        initialEntries={['/contacts/customers?panel=/detail/customer/A']}
      >
        {children}
      </MemoryRouter>
    </Provider>
  );
  const { result } = renderHook(() => useSidePanel(), { wrapper });
  const dismiss = result.current.dismissPath;
  act(() =>
    result.current.openRecord(
      { contentType: 'core:company', contentId: 'B' },
      { stack: true },
    ),
  );
  act(() => dismiss('/detail/customer/A'));
  expect(result.current.path).toBe('/detail/company/B');
  expect(result.current.history).toEqual([]);
});
