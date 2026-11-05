/** @jest-environment jsdom */
import { act, renderHook } from '@testing-library/react';
import { atom, createStore, Provider } from 'jotai';
import type { PropsWithChildren } from 'react';
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom';
import { useGroupPanelSelection } from '../useGroupPanelSelection';
import type { IFieldGroup } from '../../types/Properties';

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
jest.mock('@apollo/client', () => ({
  gql: jest.fn(),
  useQuery: (
    _document: unknown,
    { variables }: { variables: { params: { codes: string[] } } },
  ) => ({
    data: {
      fieldGroups: {
        list: [
          {
            _id: variables.params.codes[0],
            code: variables.params.codes[0],
            contentType: 'core:customer',
            name: 'Group',
          },
        ],
      },
    },
    loading: false,
  }),
}));

it('restores the URL group on Back without overwriting it with a stale selection', () => {
  const selected = atom<IFieldGroup | null>({
    _id: 'B',
    code: 'B',
    contentType: 'core:customer',
    name: 'B',
  });
  const store = createStore();
  const wrapper = ({ children }: PropsWithChildren) => (
    <Provider store={store}>
      <MemoryRouter
        initialEntries={[
          '/properties/core:customer?editGroupCode=A',
          '/properties/core:customer?editGroupCode=B',
        ]}
        initialIndex={1}
      >
        <Routes>
          <Route path="/properties/:type" element={children} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
  const { result } = renderHook(
    () => ({
      ...useGroupPanelSelection(selected, 'editGroupCode'),
      navigate: useNavigate(),
    }),
    { wrapper },
  );
  expect(result.current.group?._id).toBe('B');
  act(() => result.current.navigate(-1));
  expect(result.current.group?._id).toBe('A');
  act(() => result.current.navigate(1));
  expect(result.current.group?._id).toBe('B');
  act(() => result.current.close());
  expect(result.current.open).toBe(false);
});
