import { InMemoryCache } from '@apollo/client';
import { MockedProvider } from '@apollo/client/testing';
import { act, renderHook } from '@testing-library/react';
import { GraphQLError } from 'graphql';
import { ACC_TRANSACTIONS_CREATE } from '@/transactions/transaction-form/graphql/mutations/accTransactionsCreate';
import { useTransactionsCreate } from '@/transactions/transaction-form/hooks/useTransactionsCreate';
import { TRANSACTIONS_QUERY } from '@/transactions/graphql/transactionQueries';

const mockToast = jest.fn();
const mockNavigate = jest.fn();
const listVariables = { limit: 20, orderBy: { date: 1 }, cursor: '' };

jest.mock('erxes-ui', () => ({ toast: (args: unknown) => mockToast(args) }), {
  virtual: true,
});
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));
jest.mock('@/transactions/hooks/useTransactionVars', () => ({
  useTransactionsVariables: () => listVariables,
}));

const generalJournalDocs = [
  {
    journal: 'main',
    side: 'dt',
    date: '2026-11-03',
    description: 'Office supplies',
    details: [{ accountId: 'acc-1401', amount: 300000 }],
  },
  {
    journal: 'main',
    side: 'ct',
    date: '2026-11-03',
    description: 'Office supplies',
    details: [{ accountId: 'acc-1101', amount: 300000 }],
  },
];

const createMock = (result: Record<string, unknown>) => ({
  request: {
    query: ACC_TRANSACTIONS_CREATE,
    variables: { trDocs: generalJournalDocs },
  },
  result,
});

const receiptsRefetchMock = {
  request: { query: TRANSACTIONS_QUERY, variables: listVariables },
  result: { data: { accTransactionsMain: null } },
};

const cacheWithJournalEntries = () => {
  const cache = new InMemoryCache({ addTypename: false });
  cache.restore({
    ROOT_QUERY: {
      __typename: 'Query',
      'accTrRecordsMain({"limit":20})': { totalCount: 10 },
      'accTrRecordsMain({"journal":"main","limit":20})': { totalCount: 7 },
    },
  });
  return cache;
};

const cachedJournalEntryKeys = (cache: InMemoryCache) =>
  Object.keys(cache.extract().ROOT_QUERY ?? {}).filter((key) =>
    key.startsWith('accTrRecordsMain'),
  );

const renderCreate = (
  cache: InMemoryCache,
  mocks: ReturnType<typeof createMock>[],
) =>
  renderHook(() => useTransactionsCreate(), {
    wrapper: ({ children }) => (
      <MockedProvider
        cache={cache}
        mocks={[...mocks, receiptsRefetchMock]}
        addTypename={false}
      >
        {children}
      </MockedProvider>
    ),
  });

describe('adding a General journal transaction', () => {
  beforeEach(() => {
    mockToast.mockClear();
    mockNavigate.mockClear();
  });

  it('drops every cached Journal Entries list so the page loads the new lines without a refresh', async () => {
    const cache = cacheWithJournalEntries();
    expect(cachedJournalEntryKeys(cache)).toHaveLength(2);

    const { result } = renderCreate(cache, [
      createMock({
        data: {
          accTransactionsCreate: [{ _id: 'tr-new-dt', parentId: 'parent-new' }],
        },
      }),
    ]);

    await act(async () => {
      await result.current.createTransaction({
        variables: { trDocs: generalJournalDocs },
      });
    });

    expect(cachedJournalEntryKeys(cache)).toHaveLength(0);
    expect(mockNavigate).toHaveBeenCalledWith(
      '/accounting/transaction/edit?parentId=parent-new',
    );
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        description: 'transactions-created-successfully',
      }),
    );
  });

  it('keeps the Journal Entries list and shows the error when saving is rejected', async () => {
    const cache = cacheWithJournalEntries();
    const { result } = renderCreate(cache, [
      createMock({
        errors: [new GraphQLError('Debit and credit totals do not balance')],
      }),
    ]);

    await act(async () => {
      await result.current
        .createTransaction({ variables: { trDocs: generalJournalDocs } })
        .catch(() => undefined);
    });

    expect(cachedJournalEntryKeys(cache)).toHaveLength(2);
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        description: 'Debit and credit totals do not balance',
        variant: 'destructive',
      }),
    );
  });
});
