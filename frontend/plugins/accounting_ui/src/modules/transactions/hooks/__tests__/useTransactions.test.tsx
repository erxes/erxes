import { act, renderHook } from '@testing-library/react';
import { useQuery } from '@apollo/client';
import { EnumCursorDirection, validateFetchMore } from 'erxes-ui';
import { useTransactions } from '@/transactions/hooks/useTransactions';
import { useTrRecords } from '@/transactions/hooks/useTrRecords';
import {
  ACCOUNTING_TRANSACTIONS_LIST_CHANGED,
  ACCOUNTING_TR_RECORDS_LIST_CHANGED,
} from '@/transactions/graphql/transactionSubscriptions';

jest.mock('@apollo/client', () => ({ useQuery: jest.fn() }));
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

let mockListVariables: Record<string, unknown> = {};

jest.mock('../useTransactionVars', () => ({
  useTransactionsVariables: () => mockListVariables,
}));

type TUpdateQuery = (
  previous: unknown,
  event: { subscriptionData: { data: unknown } },
) => unknown;

const LISTS = [
  {
    name: 'receipts list',
    useList: useTransactions,
    document: ACCOUNTING_TRANSACTIONS_LIST_CHANGED,
    queryField: 'accTransactionsMain',
    changeField: 'accountingTransactionsListChanged',
  },
  {
    name: 'journal entries list',
    useList: useTrRecords,
    document: ACCOUNTING_TR_RECORDS_LIST_CHANGED,
    queryField: 'accTrRecordsMain',
    changeField: 'accountingTrRecordsListChanged',
  },
];

const cachedPage = (queryField: string) => ({
  [queryField]: {
    list: [
      { _id: 'tr-0007', ptrId: 'ptr-7', ptrNumber: '20261113/0007' },
      { _id: 'tr-0004', ptrId: 'ptr-4', ptrNumber: '20261113/0004' },
    ],
    totalCount: 2,
    pageInfo: { hasNextPage: false, hasPreviousPage: false },
  },
});

type TRefetch = { resolve: () => void; reject: (error: Error) => void };

const mockList = (data?: unknown, loading = false) => {
  const unsubscribe = jest.fn();
  const refetches: TRefetch[] = [];
  const refetch = jest.fn(
    () =>
      new Promise((resolve, reject) => {
        refetches.push({ resolve: () => resolve({}), reject });
      }),
  );
  const subscribeToMore = jest.fn(() => unsubscribe);
  const fetchMore = jest.fn(
    () =>
      new Promise((resolve, reject) => {
        refetches.push({ resolve: () => resolve({}), reject });
      }),
  );

  jest.mocked(useQuery).mockReturnValue({
    data,
    loading,
    refetch,
    fetchMore,
    subscribeToMore,
  } as unknown as ReturnType<typeof useQuery>);

  return { unsubscribe, refetch, fetchMore, refetches, subscribeToMore };
};

const pushedUpdate = (subscribeToMore: jest.Mock): TUpdateQuery =>
  subscribeToMore.mock.calls[0][0].updateQuery;

describe.each(LISTS)(
  'the $name stays live',
  ({ useList, document, queryField, changeField }) => {
    beforeEach(() => {
      mockListVariables = {
        journal: 'bank',
        branchId: 'branch-ub',
        limit: 20,
        cursor: '',
        orderBy: { date: 1 },
      };
    });

    it('opens from cache first and listens with only its filter', () => {
      const { subscribeToMore } = mockList();

      renderHook(() => useList());

      expect(jest.mocked(useQuery).mock.calls[0][1]).toEqual(
        expect.objectContaining({ fetchPolicy: 'cache-and-network' }),
      );
      expect(subscribeToMore).toHaveBeenCalledWith(
        expect.objectContaining({
          document,
          variables: { filter: { journal: 'bank', branchId: 'branch-ub' } },
        }),
      );
    });

    it('applies a teammate save from the pushed rows without refetching', () => {
      const { subscribeToMore, refetch } = mockList();
      renderHook(() => useList());

      const next = pushedUpdate(subscribeToMore)(cachedPage(queryField), {
        subscriptionData: {
          data: {
            [changeField]: {
              trIds: ['tr-0008'],
              hasMore: false,
              list: [
                { _id: 'tr-0008', ptrId: 'ptr-8', ptrNumber: '20261113/0008' },
              ],
            },
          },
        },
      });

      expect(next).toEqual({
        [queryField]: expect.objectContaining({
          totalCount: 3,
          list: [
            expect.objectContaining({ _id: 'tr-0008' }),
            expect.objectContaining({ _id: 'tr-0007' }),
            expect.objectContaining({ _id: 'tr-0004' }),
          ],
        }),
      });
      expect(refetch).not.toHaveBeenCalled();
    });

    it('reloads only when the push could not carry every changed row', () => {
      const { subscribeToMore, refetch } = mockList();
      renderHook(() => useList());
      const previous = cachedPage(queryField);

      const next = pushedUpdate(subscribeToMore)(previous, {
        subscriptionData: {
          data: {
            [changeField]: { trIds: ['tr-0004'], hasMore: true, list: [] },
          },
        },
      });

      expect(next).toBe(previous);
      expect(refetch).toHaveBeenCalledTimes(1);
    });

    it('reloads instead of patching while its own query is still in flight', () => {
      const { subscribeToMore, refetch } = mockList(undefined, true);
      renderHook(() => useList());
      const previous = cachedPage(queryField);

      const next = pushedUpdate(subscribeToMore)(previous, {
        subscriptionData: {
          data: {
            [changeField]: {
              trIds: ['tr-0008'],
              hasMore: false,
              totalCount: 3,
              list: [
                { _id: 'tr-0008', ptrId: 'ptr-8', ptrNumber: '20261113/0008' },
              ],
            },
          },
        },
      });

      expect(next).toBe(previous);
      expect(refetch).toHaveBeenCalledTimes(1);
      expect(jest.mocked(useQuery).mock.calls[0][1]).toEqual(
        expect.objectContaining({
          context: expect.objectContaining({ queryDeduplication: false }),
        }),
      );
    });

    const teammateCreated = {
      subscriptionData: {
        data: {
          [changeField]: {
            trIds: ['tr-0008'],
            hasMore: false,
            totalCount: 3,
            list: [
              { _id: 'tr-0008', ptrId: 'ptr-8', ptrNumber: '20261113/0008' },
            ],
          },
        },
      },
    };

    it('reloads once more after a reload that a newer save overtook', async () => {
      const { subscribeToMore, refetch, refetches } = mockList();
      renderHook(() => useList());
      const updateQuery = pushedUpdate(subscribeToMore);
      const previous = cachedPage(queryField);

      updateQuery(previous, {
        subscriptionData: {
          data: {
            [changeField]: { trIds: ['tr-0004'], hasMore: true, list: [] },
          },
        },
      });

      expect(updateQuery(previous, teammateCreated)).toBe(previous);
      expect(refetch).toHaveBeenCalledTimes(1);

      await act(async () => {
        refetches[0].resolve();
      });

      expect(refetch).toHaveBeenCalledTimes(2);
      expect(updateQuery(previous, teammateCreated)).toBe(previous);

      await act(async () => {
        refetches[1].resolve();
      });

      expect(refetch).toHaveBeenCalledTimes(3);

      await act(async () => {
        refetches[2].resolve();
      });

      expect(updateQuery(previous, teammateCreated)).toEqual({
        [queryField]: expect.objectContaining({ totalCount: 3 }),
      });
      expect(refetch).toHaveBeenCalledTimes(3);
    });

    it('keeps reloading after a failed reload until one succeeds', async () => {
      const { subscribeToMore, refetch, refetches } = mockList();
      renderHook(() => useList());
      const updateQuery = pushedUpdate(subscribeToMore);
      const previous = cachedPage(queryField);

      updateQuery(previous, {
        subscriptionData: {
          data: {
            [changeField]: { trIds: ['tr-0004'], hasMore: true, list: [] },
          },
        },
      });

      await act(async () => {
        refetches[0].reject(new Error('Network request failed'));
      });

      expect(updateQuery(previous, teammateCreated)).toBe(previous);
      expect(refetch).toHaveBeenCalledTimes(2);

      await act(async () => {
        refetches[1].resolve();
      });

      expect(updateQuery(previous, teammateCreated)).toEqual({
        [queryField]: expect.objectContaining({ totalCount: 3 }),
      });
      expect(refetch).toHaveBeenCalledTimes(2);
    });

    it('reloads after the next page lands so a voucher deleted meanwhile stays gone', async () => {
      jest.mocked(validateFetchMore).mockReturnValue(true);
      const { subscribeToMore, refetch, fetchMore, refetches } = mockList(
        cachedPage(queryField),
      );
      const { result } = renderHook(() => useList());
      const updateQuery = pushedUpdate(subscribeToMore);
      const previous = cachedPage(queryField);
      const teammateDeleted = {
        subscriptionData: {
          data: {
            [changeField]: {
              trIds: ['tr-0004'],
              hasMore: false,
              totalCount: 1,
              list: [],
            },
          },
        },
      };

      act(() => {
        result.current.handleFetchMore({
          direction: EnumCursorDirection.FORWARD,
        });
      });

      expect(fetchMore).toHaveBeenCalledTimes(1);
      expect(updateQuery(previous, teammateDeleted)).toBe(previous);
      expect(updateQuery(previous, teammateCreated)).toBe(previous);
      expect(refetch).not.toHaveBeenCalled();

      await act(async () => {
        refetches[0].resolve();
      });

      expect(refetch).toHaveBeenCalledTimes(1);

      await act(async () => {
        refetches[1].resolve();
      });

      expect(updateQuery(previous, teammateDeleted)).toEqual({
        [queryField]: expect.objectContaining({
          totalCount: 1,
          list: [expect.objectContaining({ _id: 'tr-0007' })],
        }),
      });
      expect(refetch).toHaveBeenCalledTimes(1);
    });

    it('does not reload a list the user already left when its page lands', async () => {
      jest.mocked(validateFetchMore).mockReturnValue(true);
      const { subscribeToMore, refetch, refetches } = mockList(
        cachedPage(queryField),
      );
      const { result, unmount } = renderHook(() => useList());
      const previous = cachedPage(queryField);

      act(() => {
        result.current.handleFetchMore({
          direction: EnumCursorDirection.FORWARD,
        });
      });
      pushedUpdate(subscribeToMore)(previous, teammateCreated);
      unmount();

      await act(async () => {
        refetches[0].resolve();
      });

      expect(refetch).not.toHaveBeenCalled();
    });

    it('stays quiet after the user leaves even if a reload fails before the next page lands', async () => {
      jest.mocked(validateFetchMore).mockReturnValue(true);
      const { subscribeToMore, refetch, refetches } = mockList(
        cachedPage(queryField),
      );
      const { result, unmount } = renderHook(() => useList());
      const updateQuery = pushedUpdate(subscribeToMore);
      const previous = cachedPage(queryField);

      updateQuery(previous, {
        subscriptionData: {
          data: {
            [changeField]: { trIds: ['tr-0004'], hasMore: true, list: [] },
          },
        },
      });
      act(() => {
        result.current.handleFetchMore({
          direction: EnumCursorDirection.FORWARD,
        });
      });
      unmount();

      await act(async () => {
        refetches[0].reject(new Error('Network request failed'));
      });
      await act(async () => {
        refetches[1].resolve();
      });

      expect(refetch).toHaveBeenCalledTimes(1);
    });

    it('asks again when a save arrives before the first page has loaded', () => {
      const { subscribeToMore, refetch } = mockList(undefined, true);
      renderHook(() => useList());

      expect(pushedUpdate(subscribeToMore)({}, teammateCreated)).toEqual({});
      expect(refetch).toHaveBeenCalledTimes(1);
    });

    it('ignores a push that carries no change', () => {
      const { subscribeToMore, refetch } = mockList(cachedPage(queryField));
      renderHook(() => useList());
      const previous = cachedPage(queryField);

      expect(
        pushedUpdate(subscribeToMore)(previous, {
          subscriptionData: { data: null },
        }),
      ).toBe(previous);
      expect(refetch).not.toHaveBeenCalled();
    });

    it('recovers a list whose first load failed when a teammate saves', () => {
      const { subscribeToMore, refetch } = mockList(undefined, false);
      renderHook(() => useList());

      expect(pushedUpdate(subscribeToMore)({}, teammateCreated)).toEqual({});
      expect(refetch).toHaveBeenCalledTimes(1);
    });

    it('leaves a skipped list alone when a teammate saves', () => {
      const { subscribeToMore, refetch } = mockList(undefined, false);
      renderHook(() => useList({ skip: true }));

      expect(pushedUpdate(subscribeToMore)({}, teammateCreated)).toEqual({});
      expect(refetch).not.toHaveBeenCalled();
    });

    it('keeps one subscription while the filter is the same and resubscribes when it changes', () => {
      const { subscribeToMore, unsubscribe } = mockList();
      const { rerender, unmount } = renderHook(() => useList());

      rerender();
      expect(subscribeToMore).toHaveBeenCalledTimes(1);

      mockListVariables = { ...mockListVariables, journal: 'cash' };
      rerender();
      expect(subscribeToMore).toHaveBeenCalledTimes(2);
      expect(subscribeToMore.mock.calls[1][0].variables).toEqual({
        filter: { journal: 'cash', branchId: 'branch-ub' },
      });
      expect(unsubscribe).toHaveBeenCalledTimes(1);

      unmount();
      expect(unsubscribe).toHaveBeenCalledTimes(2);
    });

    it('shows cached rows instead of a skeleton while the background check runs', () => {
      mockList(cachedPage(queryField), true);
      const { result } = renderHook(() => useList());

      expect(result.current.loading).toBe(false);
    });

    it('shows the skeleton on the very first load', () => {
      mockList(undefined, true);
      const { result } = renderHook(() => useList());

      expect(result.current.loading).toBe(true);
    });
  },
);
