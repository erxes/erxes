import type { ReactNode } from 'react';
import { MockedProvider, type MockedResponse } from '@apollo/client/testing';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useAdjustFundRates } from '@/adjustments/rate/hooks/useAdjustFundRates';
import { ADJUST_FUND_RATE_QUERY } from '@/adjustments/rate/graphql/adjustFundRateQueries';

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
    return {
      EnumCursorDirection: { FORWARD: 'forward', BACKWARD: 'backward' },
      mergeCursorData,
      useQueryState: (key: string) => [
        new URLSearchParams(mockUrl.search).get(key),
      ],
    };
  },
  { virtual: true },
);

const fundRate = (id: string) => ({
  _id: id,
  date: '2026-10-31T00:00:00.000Z',
  mainCurrency: 'MNT',
  currency: 'EUR',
  description: `EUR cash revaluation ${id}`,
  spotRate: 3980,
  gainAccountId: 'acc-gain',
  lossAccountId: 'acc-loss',
  transactionId: null,
  status: 'draft',
  beginDate: null,
  successDate: null,
  checkedAt: null,
  error: null,
  warning: null,
  createdBy: 'user-accountant',
  modifiedBy: 'user-accountant',
  createdAt: '2026-11-01T09:00:00.000Z',
  updatedAt: '2026-11-01T09:00:00.000Z',
});

const page = (ids: string[], hasNextPage: boolean) => ({
  data: {
    adjustFundRates: {
      list: ids.map(fundRate),
      totalCount: 21,
      pageInfo: {
        hasNextPage,
        hasPreviousPage: false,
        startCursor: ids[0],
        endCursor: ids[ids.length - 1],
      },
    },
  },
});

const firstPage = Array.from({ length: 20 }, (_, i) => `fund-${i + 1}`);

const renderList = (url: string, mocks: MockedResponse[]) => {
  mockUrl.search = new URL(url, 'https://erxes.test').search;
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MockedProvider mocks={mocks} addTypename={false}>
      {children}
    </MockedProvider>
  );
  return renderHook(() => useAdjustFundRates(), { wrapper });
};

const base = { limit: 20, cursor: null, orderBy: { createdAt: -1 } };

describe('fund rate adjustment list', () => {
  it('searches EUR revaluations and keeps the search while loading the 21st record', async () => {
    const searched = { ...base, searchValue: 'EUR' };
    const { result } = renderList(
      '/accounting/adjustment/fundRate?searchValue=EUR',
      [
        {
          request: { query: ADJUST_FUND_RATE_QUERY, variables: searched },
          result: page(firstPage, true),
        },
        {
          request: {
            query: ADJUST_FUND_RATE_QUERY,
            variables: { ...searched, cursor: 'fund-20' },
          },
          result: page(['fund-21'], false),
        },
      ],
    );

    await waitFor(() =>
      expect(result.current.adjustFundRates).toHaveLength(20),
    );

    act(() => result.current.handleFetchMore());

    await waitFor(() =>
      expect(result.current.adjustFundRates).toHaveLength(21),
    );
    expect(result.current.adjustFundRates[20]._id).toBe('fund-21');
  });

  it('lists everything without a search value when the filter is cleared', async () => {
    const { result } = renderList('/accounting/adjustment/fundRate', [
      {
        request: { query: ADJUST_FUND_RATE_QUERY, variables: base },
        result: page(['fund-1'], false),
      },
    ]);

    await waitFor(() => expect(result.current.adjustFundRates).toHaveLength(1));
    expect(result.current.error).toBeUndefined();
  });
});
