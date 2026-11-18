import type { ReactNode } from 'react';
import { MockedProvider, type MockedResponse } from '@apollo/client/testing';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useAdjustClosing } from '@/adjustments/closing/hooks/useAdjustClosing';
import { ADJUST_CLOSING_QUERY } from '@/adjustments/closing/graphql/adjustClosingQueries';
import { ACC_TRS__PER_PAGE } from '@/transactions/types/constants';
import { EnumCursorDirection } from 'erxes-ui';

const mockUrl = { search: '' };

jest.mock(
  'erxes-ui',
  () => {
    return {
      EnumCursorDirection: { FORWARD: 'forward', BACKWARD: 'backward' },
      useQueryState: (key: string) => [
        new URLSearchParams(mockUrl.search).get(key),
      ],
    };
  },
  { virtual: true },
);

const closing = (id: string, status: string) => ({
  _id: id,
  description: `Year-end closing ${id}`,
  status,
  date: '2026-12-31T00:00:00.000Z',
  beginDate: '2026-01-01T00:00:00.000Z',
  integrateAccountId: 'acc-integrate',
  periodGLAccountId: 'acc-period',
  earningAccountId: 'acc-earning',
  taxPayableAccountId: 'acc-tax',
  createdAt: '2026-11-01T09:00:00.000Z',
  updatedAt: '2026-11-01T09:00:00.000Z',
});

const renderList = (url: string, mocks: MockedResponse[]) => {
  mockUrl.search = new URL(url, 'https://erxes.test').search;
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MockedProvider mocks={mocks} addTypename={false}>
      {children}
    </MockedProvider>
  );
  return renderHook(() => useAdjustClosing(), { wrapper });
};

const published = Array.from({ length: ACC_TRS__PER_PAGE }, (_, i) =>
  closing(`closing-${i + 1}`, 'publish'),
);

describe('closing entry list', () => {
  it('shows only published closings and counts them with the same status', async () => {
    const { result } = renderList(
      '/accounting/adjustment/closing?status=publish',
      [
        {
          request: {
            query: ADJUST_CLOSING_QUERY,
            variables: {
              status: 'publish',
              page: 1,
              perPage: ACC_TRS__PER_PAGE,
            },
          },
          result: {
            data: { adjustClosings: published, adjustClosingsCount: 31 },
          },
        },
        {
          request: {
            query: ADJUST_CLOSING_QUERY,
            variables: {
              status: 'publish',
              page: 2,
              perPage: ACC_TRS__PER_PAGE,
            },
          },
          result: {
            data: {
              adjustClosings: [closing('closing-31', 'publish')],
              adjustClosingsCount: 31,
            },
          },
        },
      ],
    );

    await waitFor(() =>
      expect(result.current.adjustClosing).toHaveLength(ACC_TRS__PER_PAGE),
    );
    expect(result.current.totalCount).toBe(31);
    expect(result.current.pageInfo.hasNextPage).toBe(true);

    act(() =>
      result.current.handleFetchMore({
        direction: EnumCursorDirection.FORWARD,
      }),
    );

    await waitFor(() => expect(result.current.adjustClosing).toHaveLength(31));
    expect(
      result.current.adjustClosing.every(({ status }) => status === 'publish'),
    ).toBe(true);
    expect(result.current.pageInfo.hasNextPage).toBe(false);
  });

  it('shows the error when the server rejects the status filter', async () => {
    const { result } = renderList(
      '/accounting/adjustment/closing?status=publish',
      [
        {
          request: {
            query: ADJUST_CLOSING_QUERY,
            variables: {
              status: 'publish',
              page: 1,
              perPage: ACC_TRS__PER_PAGE,
            },
          },
          error: new Error('Unknown closing status'),
        },
      ],
    );

    await waitFor(() =>
      expect(result.current.error?.message).toBe('Unknown closing status'),
    );
    expect(result.current.adjustClosing).toEqual([]);
    expect(result.current.totalCount).toBe(0);
  });
});
