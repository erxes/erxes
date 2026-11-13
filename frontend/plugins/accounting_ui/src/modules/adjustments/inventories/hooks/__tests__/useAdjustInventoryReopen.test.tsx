import type { ReactNode } from 'react';
import { InMemoryCache } from '@apollo/client';
import { MockedProvider } from '@apollo/client/testing';
import { renderHook, waitFor } from '@testing-library/react';
import { useAdjustInventoryDetail } from '@/adjustments/inventories/hooks/useAdjustInventoryDetail';
import { ADJUST_INVENTORY_DETAIL_QUERY } from '@/adjustments/inventories/graphql/adjustInventoryQueries';
import { ACCOUNTING_ADJUST_INVENTORY_CHANGED } from '@/adjustments/inventories/graphql/adjustInventorySubscription';

const october = (status: string, checkedAt: string, error = '') => ({
  _id: 'adj-oct',
  createdAt: '2026-11-01T09:00:00.000Z',
  createdBy: 'user-accountant',
  updatedAt: checkedAt,
  modifiedBy: 'user-accountant',
  date: '2026-10-31T00:00:00.000Z',
  description: 'October inventory costing',
  status,
  error,
  warning: '',
  beginDate: '2026-10-01T00:00:00.000Z',
  successDate: '2026-10-15T00:00:00.000Z',
  checkedAt,
});

const detailRequest = {
  query: ADJUST_INVENTORY_DETAIL_QUERY,
  variables: { _id: 'adj-oct' },
};

const quietSubscription = {
  request: {
    query: ACCOUNTING_ADJUST_INVENTORY_CHANGED,
    variables: { adjustId: 'adj-oct' },
  },
  result: { data: { accountingAdjustInventoryChanged: null } },
  delay: 600000,
};

const reopenWhileCached = (
  cachedStatus: ReturnType<typeof october>,
  serverResult: Record<string, unknown>,
) => {
  const cache = new InMemoryCache({ addTypename: false });
  cache.writeQuery({
    ...detailRequest,
    data: { adjustInventoryDetail: cachedStatus },
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <MockedProvider
      cache={cache}
      addTypename={false}
      mocks={[
        { request: detailRequest, result: serverResult },
        quietSubscription,
      ]}
    >
      {children}
    </MockedProvider>
  );

  return renderHook(
    () => useAdjustInventoryDetail({ variables: { _id: 'adj-oct' } }),
    { wrapper },
  );
};

describe('reopening an inventory adjustment', () => {
  it('shows the finished run instead of the running status left in cache', async () => {
    const { result } = reopenWhileCached(
      october('running', '2026-11-04T08:00:00.000Z'),
      {
        data: {
          adjustInventoryDetail: october(
            'complete',
            '2026-11-04T08:05:00.000Z',
          ),
        },
      },
    );

    expect(result.current.adjustInventory?.status).toBe('running');

    await waitFor(() =>
      expect(result.current.adjustInventory?.status).toBe('complete'),
    );
  });

  it('shows the error the run stopped with while the page was closed', async () => {
    const { result } = reopenWhileCached(
      october('running', '2026-11-04T08:00:00.000Z'),
      {
        data: {
          adjustInventoryDetail: october(
            'process',
            '2026-11-04T08:03:00.000Z',
            'Not enough stock',
          ),
        },
      },
    );

    await waitFor(() =>
      expect(result.current.adjustInventory?.error).toBe('Not enough stock'),
    );
  });

  it('keeps the cached adjustment visible when the server cannot be reached', async () => {
    const { result } = reopenWhileCached(
      october('complete', '2026-11-04T08:05:00.000Z'),
      { errors: [{ message: 'Service unavailable' }] },
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error?.message).toBe('Service unavailable');
    expect(result.current.adjustInventory?.status).toBe('complete');
  });
});
