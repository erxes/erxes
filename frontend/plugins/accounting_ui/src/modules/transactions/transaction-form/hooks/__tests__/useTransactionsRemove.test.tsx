import { InMemoryCache } from '@apollo/client';
import { MockedProvider } from '@apollo/client/testing';
import { act, renderHook } from '@testing-library/react';
import { GraphQLError } from 'graphql';
import { ACC_TRANSACTIONS_REMOVE } from '@/transactions/graphql/accTransactionsRemove';
import { useTransactionsRemove } from '@/transactions/transaction-form/hooks/useTransactionsRemove';

const mockToast = jest.fn();
const mockNavigate = jest.fn();
const mockReturnTo = '/accounting/records?journal=bank';

jest.mock('erxes-ui', () => ({ useToast: () => ({ toast: mockToast }) }), {
  virtual: true,
});
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/accounting/transaction/edit', search: '' }),
  useSearchParams: () => [new URLSearchParams({ returnTo: mockReturnTo })],
}));

const LIST_KEY = 'accTransactionsMain({"limit":20})';

const cachedReceipts = () => {
  const cache = new InMemoryCache();
  cache.restore({
    'AccCommonTransaction:tr-1107-dt': {
      __typename: 'AccCommonTransaction',
      _id: 'tr-1107-dt',
      parentId: 'voucher-1107',
    },
    'AccCommonTransaction:tr-2001-dt': {
      __typename: 'AccCommonTransaction',
      _id: 'tr-2001-dt',
      parentId: 'voucher-2001',
    },
    ROOT_QUERY: {
      __typename: 'Query',
      [LIST_KEY]: {
        totalCount: 2,
        list: [
          { __ref: 'AccCommonTransaction:tr-1107-dt' },
          { __ref: 'AccCommonTransaction:tr-2001-dt' },
        ],
      },
    },
  });
  return cache;
};

const visibleIds = (cache: InMemoryCache) =>
  (
    cache.extract(true).ROOT_QUERY?.[LIST_KEY] as { list: { __ref: string }[] }
  ).list.map((item) => item.__ref.replace('AccCommonTransaction:', ''));

const renderRemove = (cache: InMemoryCache, result: Record<string, unknown>) =>
  renderHook(() => useTransactionsRemove(), {
    wrapper: ({ children }) => (
      <MockedProvider
        cache={cache}
        mocks={[
          {
            request: {
              query: ACC_TRANSACTIONS_REMOVE,
              variables: { parentId: 'voucher-1107' },
            },
            result,
            delay: 20,
          },
        ]}
      >
        {children}
      </MockedProvider>
    ),
  });

describe('deleting a voucher from its form', () => {
  beforeEach(() => {
    mockToast.mockClear();
    mockNavigate.mockClear();
  });

  it('returns to the list at once with the voucher already gone', async () => {
    const cache = cachedReceipts();
    const { result } = renderRemove(cache, {
      data: { accTransactionsRemove: { n: 1 } },
    });

    let removing: ReturnType<typeof result.current.removeTransactions>;
    act(() => {
      removing = result.current.removeTransactions('voucher-1107');
    });

    expect(mockNavigate).toHaveBeenCalledWith(mockReturnTo);
    expect(visibleIds(cache)).toEqual(['tr-2001-dt']);

    await act(async () => {
      await removing;
    });

    expect(visibleIds(cache)).toEqual(['tr-2001-dt']);
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        variant: 'success',
        description: 'transactions-deleted-successfully',
      }),
    );
  });

  it('brings the voucher back and explains why when the period is closed', async () => {
    const cache = cachedReceipts();
    const { result } = renderRemove(cache, {
      errors: [new GraphQLError('Period 2026-10 is closed')],
    });

    await act(async () => {
      await result.current.removeTransactions('voucher-1107');
    });

    expect(visibleIds(cache)).toEqual(['tr-1107-dt', 'tr-2001-dt']);
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        variant: 'destructive',
        description: 'Period 2026-10 is closed',
      }),
    );
  });
});
