import type { ReactNode } from 'react';
import { MockedProvider, type MockedResponse } from '@apollo/client/testing';
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

const renderList = (url: string, mocks: MockedResponse[]) => {
  mockUrl.search = new URL(url, 'https://erxes.test').search;
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MockedProvider mocks={mocks} addTypename={false}>
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
});
