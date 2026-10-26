/** @jest-environment jsdom */
import { ApolloLink, Observable } from '@apollo/client';
import type { FetchResult } from '@apollo/client';
import { MockedProvider } from '@apollo/client/testing';
import { act, renderHook, waitFor } from '@testing-library/react';
import { GraphQLError } from 'graphql';
import type { PropsWithChildren } from 'react';
import { usePermissionCheck } from 'ui-modules';

import type { IAgentsThreadsData } from '../graphql/threads';
import { useAgentsThreads } from '../hooks/useAgentsThreads';

jest.mock('ui-modules', () => ({ usePermissionCheck: jest.fn() }), {
  virtual: true,
});

const mockPermissionCheck = jest.mocked(usePermissionCheck);
const hasActionPermission = jest.fn(() => false);
const accessMessage =
  'You need Agents access. Ask an administrator to assign an Agents-enabled group.';
const threadsData: IAgentsThreadsData = {
  agentsThreads: {
    threads: [
      {
        id: 'thread-1',
        title: 'My conversation',
        pinned: false,
        createdAt: '2026-09-17T00:00:00.000Z',
        updatedAt: '2026-09-17T00:00:00.000Z',
      },
    ],
    total: 1,
    page: 1,
    perPage: 50,
    hasMore: false,
  },
};

const setPermissions = (isLoaded: boolean, allowed: boolean): void => {
  hasActionPermission.mockReturnValue(allowed);
  mockPermissionCheck.mockReturnValue({
    isLoaded,
    hasActionPermission,
    isOwner: false,
    isWildcard: false,
    permissions: [],
    hasPluginPermission: () => true,
    hasModulePermission: () => true,
    getModuleActions: () => [],
    getModuleScope: () => 'all',
    getActionScope: () => null,
  });
};

const createHarness = (
  response: FetchResult<IAgentsThreadsData> = { data: threadsData },
) => {
  const requests: string[] = [];
  const unsubscribe = jest.fn();
  let publishChange = (): void => undefined;
  const link = new ApolloLink(
    (operation) =>
      new Observable((observer) => {
        requests.push(operation.operationName);
        if (operation.operationName === 'AgentsThreadsChanged') {
          publishChange = () =>
            observer.next({
              data: { agentsThreadsChanged: { userId: 'user-1' } },
            });
          return unsubscribe;
        }

        observer.next(response);
        observer.complete();
      }),
  );
  const Wrapper = ({ children }: PropsWithChildren): React.JSX.Element => (
    <MockedProvider link={link}>{children}</MockedProvider>
  );

  return { Wrapper, requests, unsubscribe, publish: () => publishChange() };
};

beforeEach(() => {
  jest.clearAllMocks();
  setPermissions(true, false);
});

afterEach(() => jest.useRealTimers());

it('waits for permissions, explains denied access, and sends no history requests', async () => {
  setPermissions(false, false);
  const { Wrapper, requests } = createHarness();
  const { result, rerender } = renderHook(() => useAgentsThreads(), {
    wrapper: Wrapper,
  });

  expect(result.current.loading).toBe(true);
  expect(result.current.error).toBeUndefined();
  expect(requests).toEqual([]);

  setPermissions(true, false);
  rerender();
  expect(result.current.loading).toBe(false);
  expect(result.current.error).toBe(accessMessage);
  expect(result.current.threads).toEqual([]);
  await act(() => result.current.refetch());
  expect(requests).toEqual([]);
  expect(hasActionPermission).toHaveBeenCalledWith('showAgents');

  setPermissions(true, true);
  rerender();
  await waitFor(() =>
    expect(result.current.threads).toEqual(threadsData.agentsThreads?.threads),
  );
  expect(result.current.error).toBeUndefined();
  expect(requests).toContain('AgentsThreads');
  expect(requests).toContain('AgentsThreadsChanged');
});

it('refreshes allowed history on events and stops pending refreshes on revocation', async () => {
  setPermissions(true, true);
  const { Wrapper, requests, publish, unsubscribe } = createHarness();
  const { result, rerender } = renderHook(() => useAgentsThreads(), {
    wrapper: Wrapper,
  });
  await waitFor(() => expect(result.current.threads).toHaveLength(1));

  jest.useFakeTimers();
  await act(async () => {
    publish();
    jest.advanceTimersByTime(500);
  });
  expect(requests.filter((name) => name === 'AgentsThreads')).toHaveLength(2);

  act(() => publish());
  setPermissions(true, false);
  rerender();
  expect(result.current.threads).toEqual([]);
  expect(result.current.error).toBe(accessMessage);
  await act(async () => {
    jest.advanceTimersByTime(500);
    await result.current.refetch();
  });
  expect(unsubscribe).toHaveBeenCalledTimes(1);
  expect(requests.filter((name) => name === 'AgentsThreads')).toHaveLength(2);
});

it.each([
  new GraphQLError('Access denied', { extensions: { code: 'FORBIDDEN' } }),
  new GraphQLError('Permission required'),
])(
  'explains a server denial even when client permissions allow access (%s)',
  async (error) => {
    setPermissions(true, true);
    const { Wrapper, unsubscribe } = createHarness({ errors: [error] });
    const { result } = renderHook(() => useAgentsThreads(), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.error).toBe(accessMessage));
    expect(result.current.threads).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(unsubscribe).toHaveBeenCalledTimes(1);
  },
);

it('preserves unrelated server errors instead of asking for access', async () => {
  setPermissions(true, true);
  const { Wrapper } = createHarness({
    errors: [new GraphQLError('History service unavailable')],
  });
  const { result } = renderHook(() => useAgentsThreads(), { wrapper: Wrapper });

  await waitFor(() =>
    expect(result.current.error).toBe('History service unavailable'),
  );
});

it('retains more than 100 loaded sessions when live refresh rebuilds the tab catalog', async () => {
  setPermissions(true, true);
  const all = Array.from({ length: 145 }, (_, index) => ({
    id: `t-${index}`,
    title: `Session ${index}`,
    pinned: false,
    createdAt: '2026-10-20T00:00:00.000Z',
    updatedAt: '2026-10-20T00:00:00.000Z',
  }));
  const sizes: number[] = [];
  const link = new ApolloLink(
    (operation) =>
      new Observable((observer) => {
        if (operation.operationName === 'AgentsThreadsChanged')
          return () => undefined;
        const pinned = operation.operationName === 'AgentsPinnedThreads';
        const { page = 1, perPage = 20 } = operation.variables;
        if (!pinned) sizes.push(perPage);
        const start = (page - 1) * perPage;
        observer.next({
          data: {
            agentsThreads: {
              threads: pinned ? [] : all.slice(start, start + perPage),
              total: pinned ? 0 : all.length,
              page,
              perPage,
              hasMore: !pinned && start + perPage < all.length,
            },
          },
        });
        observer.complete();
      }),
  );
  const wrapper = ({ children }: PropsWithChildren) => (
    <MockedProvider link={link}>{children}</MockedProvider>
  );
  const { result } = renderHook(() => useAgentsThreads(), { wrapper });
  await waitFor(() => expect(result.current.threads).toHaveLength(20));
  for (let page = 2; page <= 7; page += 1) {
    act(() => result.current.loadMore());
    await waitFor(() => expect(result.current.threads).toHaveLength(page * 20));
  }
  await act(async () => {
    await result.current.refetch();
  });
  expect(result.current.threads).toHaveLength(140);
  expect(result.current.threads[139].id).toBe('t-139');
  expect(Math.max(...sizes)).toBe(20);
});
