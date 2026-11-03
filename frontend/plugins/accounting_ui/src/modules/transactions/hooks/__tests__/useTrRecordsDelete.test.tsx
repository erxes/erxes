import type { ReactElement } from 'react';
import { act, render, renderHook, screen } from '@testing-library/react';
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
  date: '2026-11-02T00:00:00.000Z',
};
const cashLine: ITrRecord = { ...bankLine, _id: 'line-cash' };
const otherLine: ITrRecord = {
  _id: 'line-other',
  parentId: 'parent-2',
  number: 'GEN-0007',
  date: '2026-10-30T00:00:00.000Z',
};

const twoLineTransaction = [
  { status: 'draft', details: [{ _id: 'debit' }, { _id: 'credit' }] },
];

const lastConfirm = () => mockConfirm.mock.calls[0][0];

beforeEach(() => {
  jest.clearAllMocks();
  mockQuery.mockResolvedValue({
    data: { accTransactionsDetail: twoLineTransaction },
  });
  mockConfirm.mockResolvedValue(undefined);
  mockRemoveTrRecords.mockResolvedValue({});
});

test('two lines of one transaction ask about one transaction with every line and remove it once', async () => {
  const { result } = renderHook(() => useTrRecordsDelete());

  let deleted = false;
  await act(async () => {
    deleted = await result.current.deleteTrRecords([bankLine, cashLine]);
  });

  expect(mockQuery).toHaveBeenCalledTimes(1);
  expect(lastConfirm().message).toBe('delete-tr-records-transactions:1');
  expect(lastConfirm().options.description).toBe('delete-tr-records-lines:2');
  expect(lastConfirm().options.variants).toEqual({ ok: 'destructive' });
  expect(mockRemoveTrRecords).toHaveBeenCalledTimes(1);
  expect(mockRemoveTrRecords).toHaveBeenCalledWith('parent-1');
  expect(deleted).toBe(true);
});

test('a single selected line still reports the whole transaction with its number and date', async () => {
  const { result } = renderHook(() => useTrRecordsDelete());

  await act(async () => {
    await result.current.deleteTrRecords([bankLine]);
  });

  expect(lastConfirm().options.description).toBe('delete-tr-records-lines:2');
  render(lastConfirm().options.content as ReactElement);
  expect(screen.getByText('BNK-0042')).toBeTruthy();
  expect(screen.getByText(/2026-11-02/)).toBeTruthy();
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
                  { status: 'complete', details: [{ _id: 'a' }, { _id: 'b' }] },
                  { status: 'complete', details: [{ _id: 'c' }] },
                ]
              : twoLineTransaction,
        },
      }),
  );
  const { result } = renderHook(() => useTrRecordsDelete());

  await act(async () => {
    await result.current.deleteTrRecords([bankLine, otherLine]);
  });

  expect(lastConfirm().message).toBe('delete-tr-records-transactions:2');
  expect(lastConfirm().options.description).toBe('delete-tr-records-lines:5');
  render(lastConfirm().options.content as ReactElement);
  expect(screen.getByText(/tr-records-line-count:3/)).toBeTruthy();
  expect(screen.getByText('delete-tr-records-published')).toBeTruthy();
  expect(mockRemoveTrRecords.mock.calls).toEqual([['parent-1'], ['parent-2']]);
});

test('a transaction the server refuses to remove keeps the selection', async () => {
  mockRemoveTrRecords.mockResolvedValue({
    errors: new Error(
      "can't remove this transaction. Remove the dependent transaction first",
    ),
  });
  const { result } = renderHook(() => useTrRecordsDelete());

  let deleted = true;
  await act(async () => {
    deleted = await result.current.deleteTrRecords([bankLine]);
  });

  expect(mockRemoveTrRecords).toHaveBeenCalledWith('parent-1');
  expect(deleted).toBe(false);
});

test('cancelling the dialog deletes nothing', async () => {
  mockConfirm.mockRejectedValue(undefined);
  const { result } = renderHook(() => useTrRecordsDelete());

  let deleted = true;
  await act(async () => {
    deleted = await result.current.deleteTrRecords([bankLine]);
  });

  expect(mockRemoveTrRecords).not.toHaveBeenCalled();
  expect(deleted).toBe(false);
});

test('a transaction that cannot be loaded shows the error and never asks to delete', async () => {
  mockQuery.mockRejectedValue(new Error('Permission required'));
  const { result } = renderHook(() => useTrRecordsDelete());

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
  const { result } = renderHook(() => useTrRecordsDelete());

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
