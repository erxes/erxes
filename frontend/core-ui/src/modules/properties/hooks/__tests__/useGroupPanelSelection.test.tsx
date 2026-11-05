/** @jest-environment jsdom */
import { act, renderHook, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { atom, createStore, Provider } from 'jotai';
import type { PropsWithChildren } from 'react';
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom';
import {
  CORE_PROPERTY_PANEL_GROUP,
  useGroupPanelSelection,
} from '../useGroupPanelSelection';
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
const groupMock = (code: string) => ({
  request: {
    query: CORE_PROPERTY_PANEL_GROUP,
    variables: {
      params: { contentType: 'core:customer', codes: [code], limit: 1 },
    },
  },
  result: {
    data: {
      fieldGroups: {
        list: [
          {
            _id: code,
            code,
            contentType: 'core:customer',
            name: 'Group',
            description: null,
            order: null,
            logics: null,
            configs: null,
            owner: null,
          },
        ],
      },
    },
  },
});

it('restores the URL group on Back without overwriting it with a stale selection', async () => {
  const selected = atom<IFieldGroup | null>({
    _id: 'B',
    code: 'B',
    contentType: 'core:customer',
    name: 'B',
  });
  const store = createStore();
  const wrapper = ({ children }: PropsWithChildren) => (
    <MockedProvider
      mocks={[groupMock('A'), groupMock('B')]}
      addTypename={false}
    >
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
    </MockedProvider>
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
  await waitFor(() => expect(result.current.group?._id).toBe('A'));
  act(() => result.current.navigate(1));
  expect(result.current.group?._id).toBe('B');
  act(() => result.current.close());
  expect(result.current.open).toBe(false);
});

it.each(['123', 'true', 'null'])(
  'loads a JSON-like group code %s as a string',
  async (code) => {
    const selected = atom<IFieldGroup | null>(null);
    const wrapper = ({ children }: PropsWithChildren) => (
      <MockedProvider mocks={[groupMock(code)]} addTypename={false}>
        <Provider store={createStore()}>
          <MemoryRouter
            initialEntries={[`/properties/core:customer?editGroupCode=${code}`]}
          >
            <Routes>
              <Route path="/properties/:type" element={children} />
            </Routes>
          </MemoryRouter>
        </Provider>
      </MockedProvider>
    );
    const { result } = renderHook(
      () => useGroupPanelSelection(selected, 'editGroupCode'),
      { wrapper },
    );
    await waitFor(() => expect(result.current.group?.code).toBe(code));
    expect(result.current.open).toBe(true);
  },
);
