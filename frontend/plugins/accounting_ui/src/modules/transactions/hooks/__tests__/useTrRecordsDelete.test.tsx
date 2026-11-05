import type { ReactElement, ReactNode } from 'react';
import {
  act,
  render,
  renderHook,
  screen,
  waitFor,
} from '@testing-library/react';
import { Provider } from 'jotai';
import { useTrRecordsDelete } from '@/transactions/hooks/useTrRecordsDelete';
import { ITrRecord } from '@/transactions/types/Transaction';

const mockQuery = jest.fn();
const mockConfirm = jest.fn();
const mockToast = jest.fn();
const mockRemoveTrRecords = jest.fn();

jest.mock('@apollo/client', () => ({
  useApolloClient: () => ({ query: mockQuery }),
}));
jest.mock(
  'erxes-ui',
  () => ({
    useConfirm: () => ({ confirm: mockConfirm }),
    useToast: () => ({ toast: mockToast }),
  }),
  { virtual: true },
);
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { count?: number }) =>
      options?.count === undefined ? key : `${key}:${options.count}`,
  }),
}));
jest.mock(
  '@/transactions/transaction-form/graphql/queries/accTransactionsDetail',
  () => ({ TRANSACTIONS_DETAIL_QUERY: 'TRANSACTIONS_DETAIL_QUERY' }),
);
jest.mock('@/transactions/hooks/useTrRecordsRemove', () => ({
  useTrRecordsRemove: () => ({
    removeTrRecords: mockRemoveTrRecords,
    loading: false,
  }),
}));

const bankLine: ITrRecord = {
  _id: 'line-bank',
  parentId: 'parent-1',
  number: 'BNK-0042',
  date: new Date(2026, 10, 2).toISOString(),
};
const cashLine: ITrRecord = { ...bankLine, _id: 'line-cash' };
const otherLine: ITrRecord = {
  _id: 'line-other',
  parentId: 'parent-2',
  number: 'GEN-0007',
  date: new Date(2026, 9, 30).toISOString(),
};

const bankWithVatPair = [
  {
    _id: 'tr-bank',
    parentId: 'parent-1',
    number: 'BNK-0042',
    journal: 'bank',
    date: bankLine.date,
    status: 'draft',
    details: [{ _id: 'bank-debit' }, { _id: 'bank-credit' }],
  },
  {
    _id: 'tr-vat',
    parentId: 'parent-1',
    number: 'TAX-0042',
    journal: 'tax',
    date: bankLine.date,
    status: 'draft',
    details: [{ _id: 'vat-debit' }, { _id: 'vat-credit' }],
  },
];

const lastConfirm = () => mockConfirm.mock.calls[0][0];

const PageStore = ({ children }: { children: ReactNode }) => (
  <Provider>{children}</Provider>
);

const renderDeleteHook = () =>
  renderHook(() => useTrRecordsDelete(), { wrapper: PageStore });

const renderSelectionBarAndRowMenu = () =>
  renderHook(
    () => ({
      selectionBar: useTrRecordsDelete(),
      rowMenu: useTrRecordsDelete(),
    }),
    { wrapper: PageStore },
  );

const neverSettles = () => new Promise<void>(() => undefined);

beforeEach(() => {
  jest.clearAllMocks();
  mockQuery.mockResolvedValue({
    data: { accTransactionsDetail: bankWithVatPair },
  });
  mockConfirm.mockResolvedValue(true);
  mockRemoveTrRecords.mockResolvedValue({});
});

test('two lines of a bank + VAT pair ask about both transactions with every line and remove the pair once', async () => {
  const { result } = renderDeleteHook();

  let deleted = false;
  await act(async () => {
    deleted = await result.current.deleteTrRecords([bankLine, cashLine]);
  });

  expect(mockQuery).toHaveBeenCalledTimes(1);
  expect(lastConfirm().message).toBe('delete-tr-records-transactions:2');
  expect(lastConfirm().options.description).toBe('delete-tr-records-lines:4');
  expect(lastConfirm().options.variants).toEqual({ ok: 'destructive' });
  expect(mockRemoveTrRecords).toHaveBeenCalledTimes(1);
  expect(mockRemoveTrRecords).toHaveBeenCalledWith('parent-1');
  expect(deleted).toBe(true);
});

test('selecting only the bank line still lists its paired VAT transaction that will be deleted with it', async () => {
  const { result } = renderDeleteHook();

  await act(async () => {
    await result.current.deleteTrRecords([bankLine]);
  });

  expect(lastConfirm().message).toBe('delete-tr-records-transactions:2');
  expect(lastConfirm().options.description).toBe('delete-tr-records-lines:4');
  render(lastConfirm().options.content as ReactElement);
  expect(screen.getByText('BNK-0042 · bank')).toBeTruthy();
  expect(screen.getByText('TAX-0042 · tax')).toBeTruthy();
  expect(screen.getAllByText(/2026-11-02/)).toHaveLength(2);
  expect(screen.queryByText('delete-tr-records-published')).toBeNull();
});

test('lines from different transactions are counted per transaction and warn about published ones', async () => {
  mockQuery.mockImplementation(
    ({ variables }: { variables: { _id: string } }) =>
      Promise.resolve({
        data: {
          accTransactionsDetail:
            variables._id === 'parent-2'
              ? [
                  {
                    _id: 'tr-general',
                    parentId: 'parent-2',
                    number: 'GEN-0007',
                    journal: 'main',
                    date: otherLine.date,
                    status: 'complete',
                    details: [{ _id: 'a' }, { _id: 'b' }, { _id: 'c' }],
                  },
                ]
              : bankWithVatPair,
        },
      }),
  );
  const { result } = renderDeleteHook();

  await act(async () => {
    await result.current.deleteTrRecords([bankLine, otherLine]);
  });

  expect(lastConfirm().message).toBe('delete-tr-records-transactions:3');
  expect(lastConfirm().options.description).toBe('delete-tr-records-lines:7');
  render(lastConfirm().options.content as ReactElement);
  expect(screen.getByText('GEN-0007 · general')).toBeTruthy();
  expect(screen.getByText(/tr-records-line-count:3/)).toBeTruthy();
  expect(screen.getByText('delete-tr-records-published')).toBeTruthy();
  expect(mockRemoveTrRecords.mock.calls).toEqual([['parent-1'], ['parent-2']]);
});

test('a related transaction from another parent is not listed, because removing this parent keeps it', async () => {
  mockQuery.mockResolvedValue({
    data: {
      accTransactionsDetail: [
        ...bankWithVatPair,
        {
          _id: 'tr-linked',
          parentId: 'parent-9',
          number: 'BNK-0099',
          journal: 'bank',
          date: bankLine.date,
          status: 'complete',
          details: [{ _id: 'linked-debit' }],
        },
      ],
    },
  });
  const { result } = renderDeleteHook();

  await act(async () => {
    await result.current.deleteTrRecords([bankLine]);
  });

  expect(lastConfirm().message).toBe('delete-tr-records-transactions:2');
  expect(lastConfirm().options.description).toBe('delete-tr-records-lines:4');
  render(lastConfirm().options.content as ReactElement);
  expect(screen.queryByText(/BNK-0099/)).toBeNull();
  expect(screen.queryByText('delete-tr-records-published')).toBeNull();
  expect(mockRemoveTrRecords.mock.calls).toEqual([['parent-1']]);
});

test('the next transaction is removed only after the previous one finishes', async () => {
  let finishFirst: (value: object) => void = () => null;
  mockRemoveTrRecords.mockImplementationOnce(
    () => new Promise((resolve) => (finishFirst = resolve)),
  );
  const { result } = renderDeleteHook();

  let deleting: Promise<boolean> = Promise.resolve(false);
  act(() => {
    deleting = result.current.deleteTrRecords([bankLine, otherLine]);
  });

  await waitFor(() => expect(mockRemoveTrRecords).toHaveBeenCalledTimes(1));
  expect(mockRemoveTrRecords.mock.calls).toEqual([['parent-1']]);

  await act(async () => {
    finishFirst({});
    await deleting;
  });

  expect(mockRemoveTrRecords.mock.calls).toEqual([['parent-1'], ['parent-2']]);
});

test('a row-menu Delete while the selection bar is still loading details is ignored', async () => {
  let finishLoading: (value: object) => void = () => null;
  mockQuery.mockImplementationOnce(
    () => new Promise((resolve) => (finishLoading = resolve)),
  );
  const { result } = renderSelectionBarAndRowMenu();

  let barDelete: Promise<boolean> = Promise.resolve(false);
  act(() => {
    barDelete = result.current.selectionBar.deleteTrRecords([bankLine]);
  });
  await waitFor(() => expect(result.current.rowMenu.loading).toBe(true));

  let rowDeleted = true;
  await act(async () => {
    rowDeleted = await result.current.rowMenu.deleteTrRecords([cashLine]);
  });

  expect(rowDeleted).toBe(false);
  expect(mockQuery).toHaveBeenCalledTimes(1);

  let barDeleted = false;
  await act(async () => {
    finishLoading({ data: { accTransactionsDetail: bankWithVatPair } });
    barDeleted = await barDelete;
  });

  expect(barDeleted).toBe(true);
  expect(mockConfirm).toHaveBeenCalledTimes(1);
  expect(mockRemoveTrRecords.mock.calls).toEqual([['parent-1']]);
  expect(result.current.rowMenu.loading).toBe(false);
});

test('a Delete from another row while a transaction is being removed is ignored', async () => {
  let finishRemoving: (value: object) => void = () => null;
  mockRemoveTrRecords.mockImplementationOnce(
    () => new Promise((resolve) => (finishRemoving = resolve)),
  );
  const { result } = renderSelectionBarAndRowMenu();

  let barDelete: Promise<boolean> = Promise.resolve(false);
  act(() => {
    barDelete = result.current.selectionBar.deleteTrRecords([bankLine]);
  });
  await waitFor(() => expect(mockRemoveTrRecords).toHaveBeenCalledTimes(1));

  let rowDeleted = true;
  await act(async () => {
    rowDeleted = await result.current.rowMenu.deleteTrRecords([otherLine]);
  });

  expect(rowDeleted).toBe(false);
  expect(mockQuery).toHaveBeenCalledTimes(1);

  await act(async () => {
    finishRemoving({});
    await barDelete;
  });

  expect(mockRemoveTrRecords.mock.calls).toEqual([['parent-1']]);
});

test('a transaction the server refuses to remove keeps the selection', async () => {
  mockRemoveTrRecords.mockResolvedValue({
    errors: new Error(
      "can't remove this transaction. Remove the dependent transaction first",
    ),
  });
  const { result } = renderDeleteHook();

  let deleted = true;
  await act(async () => {
    deleted = await result.current.deleteTrRecords([bankLine]);
  });

  expect(mockRemoveTrRecords).toHaveBeenCalledWith('parent-1');
  expect(deleted).toBe(false);
});

test('cancelling the dialog deletes nothing and Delete works again afterwards', async () => {
  mockConfirm.mockImplementationOnce(neverSettles);
  const { result } = renderDeleteHook();

  let cancelledDelete: Promise<boolean | string> = Promise.resolve(true);
  act(() => {
    cancelledDelete = result.current.deleteTrRecords([bankLine]);
  });
  await waitFor(() => expect(mockConfirm).toHaveBeenCalledTimes(1));

  expect(await Promise.race([cancelledDelete, Promise.resolve('open')])).toBe(
    'open',
  );
  expect(mockRemoveTrRecords).not.toHaveBeenCalled();
  expect(result.current.loading).toBe(false);

  let deletedAfterCancel = false;
  await act(async () => {
    deletedAfterCancel = await result.current.deleteTrRecords([bankLine]);
  });

  expect(mockQuery).toHaveBeenCalledTimes(2);
  expect(mockConfirm).toHaveBeenCalledTimes(2);
  expect(mockRemoveTrRecords.mock.calls).toEqual([['parent-1']]);
  expect(deletedAfterCancel).toBe(true);
});

test('a transaction that cannot be loaded shows the error and never asks to delete', async () => {
  mockQuery.mockRejectedValue(new Error('Permission required'));
  const { result } = renderDeleteHook();

  let deleted = true;
  await act(async () => {
    deleted = await result.current.deleteTrRecords([bankLine]);
  });

  expect(mockToast).toHaveBeenCalledWith(
    expect.objectContaining({
      description: 'Permission required',
      variant: 'destructive',
    }),
  );
  expect(mockConfirm).not.toHaveBeenCalled();
  expect(mockRemoveTrRecords).not.toHaveBeenCalled();
  expect(deleted).toBe(false);
});

test('rows without a parent transaction do nothing', async () => {
  const { result } = renderDeleteHook();

  let deleted = true;
  await act(async () => {
    deleted = await result.current.deleteTrRecords([
      { ...bankLine, parentId: undefined },
    ]);
  });

  expect(mockQuery).not.toHaveBeenCalled();
  expect(mockConfirm).not.toHaveBeenCalled();
  expect(deleted).toBe(false);
});
