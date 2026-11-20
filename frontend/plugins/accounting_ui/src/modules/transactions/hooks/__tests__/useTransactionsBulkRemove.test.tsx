import { InMemoryCache } from '@apollo/client';
import { MockedProvider } from '@apollo/client/testing';
import { act, renderHook } from '@testing-library/react';
import { GraphQLError } from 'graphql';
import { ACC_TRANSACTIONS_REMOVE } from '@/transactions/graphql/accTransactionsRemove';
import { useTransactionsBulkRemove } from '@/transactions/hooks/useTransactionsBulkRemove';

const mockToast = jest.fn();

jest.mock('erxes-ui', () => ({ useToast: () => ({ toast: mockToast }) }), {
  virtual: true,
});
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const transaction = (_id: string, parentId: string) => ({
  __typename: 'AccCommonTransaction',
  _id,
  parentId,
});

const cachedReceipts = () => {
  const cache = new InMemoryCache();
  cache.restore({
    'AccCommonTransaction:tr-1107-dt': transaction(
      'tr-1107-dt',
      'voucher-1107',
    ),
    'AccCommonTransaction:tr-1107-ct': transaction(
      'tr-1107-ct',
      'voucher-1107',
    ),
    'AccCommonTransaction:tr-2001-dt': transaction(
      'tr-2001-dt',
      'voucher-2001',
    ),
    'AccCommonTransaction:tr-3005-dt': transaction(
      'tr-3005-dt',
      'voucher-3005',
    ),
    ROOT_QUERY: {
      __typename: 'Query',
      'accTransactionsMain({"limit":20})': {
        totalCount: 4,
        list: [
          { __ref: 'AccCommonTransaction:tr-1107-dt' },
          { __ref: 'AccCommonTransaction:tr-1107-ct' },
          { __ref: 'AccCommonTransaction:tr-2001-dt' },
          { __ref: 'AccCommonTransaction:tr-3005-dt' },
        ],
      },
    },
  });
  return cache;
};

const visibleReceipts = (cache: InMemoryCache) => {
  const list = cache.extract(true).ROOT_QUERY?.[
    'accTransactionsMain({"limit":20})'
  ] as { list: { __ref: string }[]; totalCount: number };

  return {
    ids: list.list.map((item) =>
      item.__ref.replace('AccCommonTransaction:', ''),
    ),
    totalCount: list.totalCount,
  };
};

const removeMock = (parentId: string, result: Record<string, unknown>) => ({
  request: { query: ACC_TRANSACTIONS_REMOVE, variables: { parentId } },
  result,
  delay: 20,
});

const renderBulkRemove = (
  cache: InMemoryCache,
  mocks: ReturnType<typeof removeMock>[],
) =>
  renderHook(() => useTransactionsBulkRemove(), {
    wrapper: ({ children }) => (
      <MockedProvider cache={cache} mocks={mocks}>
        {children}
      </MockedProvider>
    ),
  });

const selectedRows = [
  { parentId: 'voucher-1107' },
  { parentId: 'voucher-1107' },
  { parentId: 'voucher-2001' },
];

describe('deleting selected receipts', () => {
  beforeEach(() => mockToast.mockClear());

  it('hides the vouchers at once and keeps them gone after the server agrees', async () => {
    const cache = cachedReceipts();
    const { result } = renderBulkRemove(cache, [
      removeMock('voucher-1107', { data: { accTransactionsRemove: { n: 2 } } }),
      removeMock('voucher-2001', { data: { accTransactionsRemove: { n: 1 } } }),
    ]);

    let removing: Promise<boolean> = Promise.resolve(false);
    act(() => {
      removing = result.current.removeTransactions(selectedRows);
    });

    expect(visibleReceipts(cache)).toEqual({
      ids: ['tr-3005-dt'],
      totalCount: 1,
    });

    let removed = false;
    await act(async () => {
      removed = await removing;
    });

    expect(removed).toBe(true);
    expect(visibleReceipts(cache)).toEqual({
      ids: ['tr-3005-dt'],
      totalCount: 1,
    });
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        variant: 'success',
        description: 'transactions-deleted-successfully',
      }),
    );
  });

  it('brings back a voucher the server refused to delete and reports the failure', async () => {
    const cache = cachedReceipts();
    const { result } = renderBulkRemove(cache, [
      removeMock('voucher-1107', { data: { accTransactionsRemove: { n: 2 } } }),
      removeMock('voucher-2001', {
        errors: [new GraphQLError('Period 2026-10 is closed')],
      }),
    ]);

    let removed = true;
    await act(async () => {
      removed = await result.current.removeTransactions(selectedRows);
    });

    expect(removed).toBe(false);
    expect(visibleReceipts(cache)).toEqual({
      ids: ['tr-2001-dt', 'tr-3005-dt'],
      totalCount: 2,
    });
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        variant: 'destructive',
        description: 'Failed to delete 1 transactions',
      }),
    );
  });
});
