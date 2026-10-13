import { act, renderHook } from '@testing-library/react';
import { useQuery } from '@apollo/client';
import { useTransactions } from '../useTransactions';

jest.mock('@apollo/client', () => ({ useQuery: jest.fn() }));
jest.mock('jotai', () => ({ useAtomValue: () => ({ _id: 'user-1' }) }));
jest.mock('ui-modules', () => ({ currentUserState: {} }), { virtual: true });
jest.mock(
  'erxes-ui',
  () => ({
    EnumCursorDirection: { FORWARD: 'forward' },
    validateFetchMore: jest.fn(),
  }),
  { virtual: true },
);
jest.mock('@/utils/graphqlCursor', () => ({
  toCursorPageInfo: jest.fn(),
  mergeGraphqlCursorData: jest.fn(),
}));
jest.mock('../useTransactionVars', () => ({
  useTransactionsVariables: () => ({ limit: 20, journal: 'bank' }),
}));

test('ordinary renders preserve the subscription and its pending refresh', () => {
  jest.useFakeTimers();
  const unsubscribe = jest.fn();
  const refetch = jest.fn();
  const subscribeToMore = jest.fn(
    (options: {
      updateQuery: (
        previous: unknown,
        event: { subscriptionData: { data: unknown } },
      ) => unknown;
    }) => unsubscribe,
  );
  jest.mocked(useQuery).mockReturnValue({
    data: undefined,
    loading: false,
    refetch,
    subscribeToMore,
  } as unknown as ReturnType<typeof useQuery>);

  const { rerender, unmount } = renderHook(() => useTransactions());
  expect(subscribeToMore).toHaveBeenCalledTimes(1);
  act(() => {
    subscribeToMore.mock.calls[0][0].updateQuery(
      {},
      {
        subscriptionData: {
          data: { accountingTransactionChanged: { action: 'updated' } },
        },
      },
    );
  });
  rerender();
  expect(subscribeToMore).toHaveBeenCalledTimes(1);
  expect(unsubscribe).not.toHaveBeenCalled();
  act(() => jest.advanceTimersByTime(500));
  expect(refetch).toHaveBeenCalledTimes(1);
  unmount();
  expect(unsubscribe).toHaveBeenCalledTimes(1);
  jest.useRealTimers();
});
