import type { ReactNode } from 'react';
import { ApolloLink, Observable } from '@apollo/client';
import {
  MockedProvider,
  MockLink,
  type MockedResponse,
} from '@apollo/client/testing';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useAdjustDebtRates } from '@/adjustments/debt/hooks/useAdjustDebtRates';
import { ADJUST_DEBT_RATE_QUERY } from '@/adjustments/debt/graphql/adjustDebtRateQueries';

const mockUrl = { search: '' };

type MockCursorPage = { list: unknown[]; pageInfo: unknown };

jest.mock(
  'erxes-ui',
  () => {
    const mergeCursorData = ({
      fetchMoreResult,
      prevResult,
    }: {
      fetchMoreResult: MockCursorPage;
      prevResult: MockCursorPage;
    }) => ({
      ...fetchMoreResult,
      list: [...prevResult.list, ...fetchMoreResult.list],
    });
    const read = (key: string) => new URLSearchParams(mockUrl.search).get(key);
    return {
      EnumCursorDirection: { FORWARD: 'forward', BACKWARD: 'backward' },
      mergeCursorData,
      useMultiQueryState: (keys: string[]) => [
        Object.fromEntries(keys.map((key) => [key, read(key)])),
      ],
    };
  },
  { virtual: true },
);

const debtRate = (id: string, description: string) => ({
  _id: id,
  date: '2026-10-31T00:00:00.000Z',
  mainCurrency: 'MNT',
  currency: 'USD',
  customerType: 'customer',
  customerId: 'cust-bat',
  description,
  spotRate: 3450,
  gainAccountId: 'acc-gain',
  lossAccountId: 'acc-loss',
  transactionId: null,
  status: 'draft',
  beginDate: null,
  successDate: null,
  checkedAt: null,
  error: null,
  warning: null,
  branchId: 'branch-ub',
  departmentId: 'dep-finance',
  createdBy: 'user-accountant',
  modifiedBy: 'user-accountant',
  createdAt: '2026-11-01T09:00:00.000Z',
  updatedAt: '2026-11-01T09:00:00.000Z',
});

const page = (
  ids: string[],
  pageInfo: { hasNextPage: boolean; endCursor: string | null },
) => ({
  data: {
    adjustDebtRates: {
      list: ids.map((id) => debtRate(id, `USD revaluation ${id}`)),
      totalCount: 25,
      pageInfo: { hasPreviousPage: false, startCursor: ids[0], ...pageInfo },
    },
  },
});

const filtered = {
  limit: 20,
  cursor: null,
  orderBy: { createdAt: -1 },
  searchValue: 'USD',
  branchId: 'branch-ub',
};

const twentyRates = Array.from({ length: 20 }, (_, i) => `debt-${i + 1}`);

const holdPage = (cursor: string) => {
  let release: () => void = () => undefined;
  let markSettled: () => void = () => undefined;
  const released = new Promise<void>((resolve) => {
    release = () => resolve();
  });
  const settled = new Promise<void>((resolve) => {
    markSettled = () => resolve();
  });
  const link = new ApolloLink((operation, forward) =>
    operation.variables.cursor === cursor
      ? new Observable((observer) => {
          released.then(() =>
            forward(operation).subscribe({
              next: (value) => observer.next(value),
              error: (error) => {
                observer.error(error);
                markSettled();
              },
              complete: () => {
                observer.complete();
                markSettled();
              },
            }),
          );
        })
      : forward(operation),
  );
  return { link, release, settled };
};

const renderList = (
  url: string,
  mocks: MockedResponse[],
  gate?: ApolloLink,
) => {
  mockUrl.search = new URL(url, 'https://erxes.test').search;
  const link = gate && ApolloLink.from([gate, new MockLink(mocks, false)]);
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MockedProvider mocks={mocks} link={link} addTypename={false}>
      {children}
    </MockedProvider>
  );
  return renderHook(() => useAdjustDebtRates(), { wrapper });
};

describe('debt rate adjustment list', () => {
  it('sends the branch and search the accountant picked and loads the next 20 on scroll', async () => {
    const { result } = renderList(
      '/accounting/adjustment/debRate?searchValue=USD&branchId=branch-ub',
      [
        {
          request: { query: ADJUST_DEBT_RATE_QUERY, variables: filtered },
          result: page(twentyRates, {
            hasNextPage: true,
            endCursor: 'debt-20',
          }),
        },
        {
          request: {
            query: ADJUST_DEBT_RATE_QUERY,
            variables: { ...filtered, cursor: 'debt-20' },
          },
          result: page(['debt-21', 'debt-22'], {
            hasNextPage: false,
            endCursor: 'debt-22',
          }),
        },
      ],
    );

    await waitFor(() =>
      expect(result.current.adjustDebtRates).toHaveLength(20),
    );

    act(() => result.current.handleFetchMore());

    await waitFor(() =>
      expect(result.current.adjustDebtRates).toHaveLength(22),
    );
    expect(result.current.adjustDebtRates[21]._id).toBe('debt-22');
    expect(result.current.pageInfo?.hasNextPage).toBe(false);
  });

  it('does not ask the server again once the last page is shown', async () => {
    const { result } = renderList(
      '/accounting/adjustment/debRate?searchValue=USD&branchId=branch-ub',
      [
        {
          request: { query: ADJUST_DEBT_RATE_QUERY, variables: filtered },
          result: page(['debt-1', 'debt-2'], {
            hasNextPage: false,
            endCursor: 'debt-2',
          }),
        },
        {
          request: {
            query: ADJUST_DEBT_RATE_QUERY,
            variables: { ...filtered, cursor: 'debt-2' },
          },
          result: page(['debt-3'], { hasNextPage: false, endCursor: 'debt-3' }),
        },
      ],
    );

    await waitFor(() => expect(result.current.adjustDebtRates).toHaveLength(2));

    await act(async () => {
      result.current.handleFetchMore();
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    expect(result.current.adjustDebtRates.map(({ _id }) => _id)).toEqual([
      'debt-1',
      'debt-2',
    ]);
    expect(result.current.error).toBeUndefined();
  });

  it('shows the server error and an empty list when the filtered request fails', async () => {
    const { result } = renderList(
      '/accounting/adjustment/debRate?searchValue=USD&branchId=branch-ub',
      [
        {
          request: { query: ADJUST_DEBT_RATE_QUERY, variables: filtered },
          error: new Error('Permission denied'),
        },
      ],
    );

    await waitFor(() =>
      expect(result.current.error?.message).toBe('Permission denied'),
    );
    expect(result.current.adjustDebtRates).toEqual([]);
  });
  it('keeps the loaded rows, stops auto-loading and retries only when asked after the next page fails', async () => {
    const nextPage = {
      query: ADJUST_DEBT_RATE_QUERY,
      variables: { ...filtered, cursor: 'debt-20' },
    };
    const { result } = renderList(
      '/accounting/adjustment/debRate?searchValue=USD&branchId=branch-ub',
      [
        {
          request: { query: ADJUST_DEBT_RATE_QUERY, variables: filtered },
          result: page(twentyRates, {
            hasNextPage: true,
            endCursor: 'debt-20',
          }),
        },
        { request: nextPage, error: new Error('Network request failed') },
        {
          request: nextPage,
          result: page(['debt-21', 'debt-22'], {
            hasNextPage: false,
            endCursor: 'debt-22',
          }),
        },
      ],
    );

    await waitFor(() =>
      expect(result.current.adjustDebtRates).toHaveLength(20),
    );

    act(() => result.current.handleFetchMore());

    await waitFor(() =>
      expect(result.current.fetchMoreError?.message).toBe(
        'Network request failed',
      ),
    );
    expect(result.current.adjustDebtRates).toHaveLength(20);

    await act(async () => {
      result.current.handleFetchMore();
      await new Promise((resolve) => setTimeout(resolve, 50));
    });
    expect(result.current.adjustDebtRates).toHaveLength(20);

    act(() => result.current.retryFetchMore());

    await waitFor(() =>
      expect(result.current.adjustDebtRates).toHaveLength(22),
    );
    expect(result.current.fetchMoreError).toBeUndefined();
  });

  it('does not mix the old branch rows into the list when the branch changes while the next page loads', async () => {
    const otherBranch = { ...filtered, branchId: 'branch-darkhan' };
    const { result, rerender } = renderList(
      '/accounting/adjustment/debRate?searchValue=USD&branchId=branch-ub',
      [
        {
          request: { query: ADJUST_DEBT_RATE_QUERY, variables: filtered },
          result: page(twentyRates, {
            hasNextPage: true,
            endCursor: 'debt-20',
          }),
        },
        {
          request: {
            query: ADJUST_DEBT_RATE_QUERY,
            variables: { ...filtered, cursor: 'debt-20' },
          },
          delay: 150,
          result: page(['debt-21'], {
            hasNextPage: false,
            endCursor: 'debt-21',
          }),
        },
        {
          request: { query: ADJUST_DEBT_RATE_QUERY, variables: otherBranch },
          result: page(['darkhan-1', 'darkhan-2'], {
            hasNextPage: false,
            endCursor: 'darkhan-2',
          }),
        },
      ],
    );

    await waitFor(() =>
      expect(result.current.adjustDebtRates).toHaveLength(20),
    );

    act(() => result.current.handleFetchMore());
    mockUrl.search = '?searchValue=USD&branchId=branch-darkhan';
    rerender();

    await waitFor(() =>
      expect(result.current.adjustDebtRates[0]?._id).toBe('darkhan-1'),
    );
    await act(() => new Promise((resolve) => setTimeout(resolve, 250)));

    expect(result.current.adjustDebtRates.map(({ _id }) => _id)).toEqual([
      'darkhan-1',
      'darkhan-2',
    ]);
  });
  it('keeps the Retry for the current branch when an older branch page fails late', async () => {
    const otherBranch = { ...filtered, branchId: 'branch-darkhan' };
    const darkhanRates = Array.from(
      { length: 20 },
      (_, i) => `darkhan-${i + 1}`,
    );
    const oldBranchPage = holdPage('debt-20');
    const { result, rerender } = renderList(
      '/accounting/adjustment/debRate?searchValue=USD&branchId=branch-ub',
      [
        {
          request: { query: ADJUST_DEBT_RATE_QUERY, variables: filtered },
          result: page(twentyRates, {
            hasNextPage: true,
            endCursor: 'debt-20',
          }),
        },
        {
          request: {
            query: ADJUST_DEBT_RATE_QUERY,
            variables: { ...filtered, cursor: 'debt-20' },
          },
          error: new Error('Gateway timeout'),
        },
        {
          request: { query: ADJUST_DEBT_RATE_QUERY, variables: otherBranch },
          result: page(darkhanRates, {
            hasNextPage: true,
            endCursor: 'darkhan-20',
          }),
        },
        {
          request: {
            query: ADJUST_DEBT_RATE_QUERY,
            variables: { ...otherBranch, cursor: 'darkhan-20' },
          },
          error: new Error('Network request failed'),
        },
      ],
      oldBranchPage.link,
    );

    await waitFor(() =>
      expect(result.current.adjustDebtRates).toHaveLength(20),
    );

    act(() => result.current.handleFetchMore());
    mockUrl.search = '?searchValue=USD&branchId=branch-darkhan';
    rerender();

    await waitFor(() =>
      expect(result.current.adjustDebtRates[0]?._id).toBe('darkhan-1'),
    );
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.handleFetchMore());

    await waitFor(() =>
      expect(result.current.fetchMoreError?.message).toBe(
        'Network request failed',
      ),
    );
    await act(async () => {
      oldBranchPage.release();
      await oldBranchPage.settled;
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.fetchMoreError?.message).toBe(
      'Network request failed',
    );
    expect(result.current.adjustDebtRates).toHaveLength(20);
  });
});
