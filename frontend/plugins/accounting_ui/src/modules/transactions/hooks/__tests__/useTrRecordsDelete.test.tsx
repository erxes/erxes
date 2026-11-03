import type { ReactElement } from 'react';
import {
  act,
  render,
  renderHook,
  screen,
  waitFor,
} from '@testing-library/react';
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

const twoLineTransaction = [
  { status: 'draft', details: [{ _id: 'debit' }, { _id: 'credit' }] },
];

const lastConfirm = () => mockConfirm.mock.calls[0][0];

beforeEach(() => {
  jest.clearAllMocks();
  mockQuery.mockResolvedValue({
    data: { accTransactionsDetail: twoLineTransaction },
  });
  mockConfirm.mockResolvedValue(true);
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

test('the next transaction is removed only after the previous one finishes', async () => {
  let finishFirst: (value: object) => void = () => null;
  mockRemoveTrRecords.mockImplementationOnce(
    () => new Promise((resolve) => (finishFirst = resolve)),
  );
  const { result } = renderHook(() => useTrRecordsDelete());

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

test('clicking Delete again while the first delete is still open is ignored, and works again after cancelling', async () => {
  let cancelFirst: (reason: Error) => void = () => null;
  mockConfirm.mockImplementationOnce(
    () => new Promise((_resolve, reject) => (cancelFirst = reject)),
  );
  const { result } = renderHook(() => useTrRecordsDelete());

  let firstDelete: Promise<boolean> = Promise.resolve(true);
  act(() => {
    firstDelete = result.current.deleteTrRecords([bankLine]);
  });
  await waitFor(() => expect(mockConfirm).toHaveBeenCalledTimes(1));

  let secondDeleted = true;
  await act(async () => {
    secondDeleted = await result.current.deleteTrRecords([bankLine]);
  });

  expect(secondDeleted).toBe(false);
  expect(mockQuery).toHaveBeenCalledTimes(1);
  expect(mockConfirm).toHaveBeenCalledTimes(1);

  let firstDeleted = true;
  await act(async () => {
    cancelFirst(new Error('cancelled'));
    firstDeleted = await firstDelete;
  });

  expect(firstDeleted).toBe(false);
  expect(mockRemoveTrRecords).not.toHaveBeenCalled();

  let retried = false;
  await act(async () => {
    retried = await result.current.deleteTrRecords([bankLine]);
  });

  expect(retried).toBe(true);
  expect(mockRemoveTrRecords.mock.calls).toEqual([['parent-1']]);
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
  mockConfirm.mockRejectedValue(new Error('cancelled'));
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
