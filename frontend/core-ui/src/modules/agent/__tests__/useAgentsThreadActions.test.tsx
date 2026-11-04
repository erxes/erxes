/** @jest-environment jsdom */
import { InMemoryCache, gql } from '@apollo/client';
import { MockedProvider, type MockedResponse } from '@apollo/client/testing';
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';

import {
  AGENTS_PINNED_THREADS,
  AGENTS_THREADS,
  AGENTS_THREAD_DETAIL,
  AGENTS_THREAD_REMOVE,
  AGENTS_THREAD_UPDATE,
} from '../graphql/threads';
import { useAgentsThreadActions } from '../hooks/useAgentsThreadActions';

jest.mock('erxes-ui', () => ({ toast: jest.fn() }));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (_key: string, fallback?: string) => fallback ?? _key,
  }),
}));

const timestamp = '2026-10-26T00:00:00.000Z';
const thread = (title: string) => ({
  __typename: 'AgentsThread',
  id: 't1',
  title,
  createdAt: timestamp,
  updatedAt: timestamp,
});

const cacheWithDetail = () => {
  const cache = new InMemoryCache();
  cache.writeQuery({
    query: AGENTS_THREAD_DETAIL,
    variables: { threadId: 't1' },
    data: {
      agentsThreadDetail: {
        __typename: 'AgentsThreadDetail',
        thread: thread('Old title'),
        messages: [
          {
            __typename: 'AgentsMessage',
            id: 'm1',
            role: 'assistant',
            createdAt: timestamp,
            content: { parts: [] },
          },
        ],
      },
    },
  });
  return cache;
};

const readDetail = (cache: InMemoryCache) =>
  cache.readQuery<{
    agentsThreadDetail: { thread: { title: string } };
  }>({ query: AGENTS_THREAD_DETAIL, variables: { threadId: 't1' } });

const listRefetches: MockedResponse[] = [
  {
    request: { query: AGENTS_THREADS },
    result: { data: { agentsThreads: null } },
  },
  {
    request: { query: AGENTS_PINNED_THREADS },
    result: { data: { agentsThreads: null } },
  },
];

const renderActions = (cache: InMemoryCache, mocks: MockedResponse[]) =>
  renderHook(() => useAgentsThreadActions(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <MockedProvider cache={cache} mocks={mocks}>
        {children}
      </MockedProvider>
    ),
  });

it('evicts the deleted thread from the transcript cache', async () => {
  const cache = cacheWithDetail();
  const { result } = renderActions(cache, [
    {
      request: { query: AGENTS_THREAD_REMOVE, variables: { threadId: 't1' } },
      result: { data: { agentsThreadRemove: true } },
    },
    ...listRefetches,
  ]);

  let removed = false;
  await act(async () => {
    removed = await result.current.remove('t1');
  });

  expect(removed).toBe(true);
  expect(readDetail(cache)).toBeNull();
});

it('updates the cached transcript title through normalization on rename', async () => {
  const cache = cacheWithDetail();
  const { result } = renderActions(cache, [
    {
      request: {
        query: AGENTS_THREAD_UPDATE,
        variables: { threadId: 't1', title: 'New title' },
      },
      result: {
        data: {
          agentsThreadUpdate: { ...thread('New title'), pinned: false },
        },
      },
    },
    ...listRefetches,
  ]);

  await act(async () => {
    await result.current.rename('t1', 'New title');
  });

  expect(readDetail(cache)?.agentsThreadDetail.thread.title).toBe('New title');
});

it("removes only the deleted thread's entries, keeping unrelated cache data", async () => {
  const cache = cacheWithDetail();
  // Another module's orphaned entity, kept for reads by id.
  cache.writeQuery({
    query: gql`
      query UnrelatedCustomerDetail {
        customerDetail(_id: "c1") {
          _id
          firstName
        }
      }
    `,
    data: {
      customerDetail: { __typename: 'Customer', _id: 'c1', firstName: 'Ann' },
    },
  });
  cache.evict({ fieldName: 'customerDetail' });
  const { result } = renderActions(cache, [
    {
      request: { query: AGENTS_THREAD_REMOVE, variables: { threadId: 't1' } },
      result: { data: { agentsThreadRemove: true } },
    },
    ...listRefetches,
  ]);

  await act(async () => {
    await result.current.remove('t1');
  });

  const snapshot = cache.extract();
  expect(snapshot['Customer:c1']).toEqual({
    __typename: 'Customer',
    _id: 'c1',
    firstName: 'Ann',
  });
  expect(snapshot['AgentsMessage:m1']).toBeUndefined();
});
