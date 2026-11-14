import type { Row } from '@tanstack/table-core';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { TransactionDelete } from '@/transactions/components/TransactionCommandBar/TransactionDelete';
import { ITransaction } from '@/transactions/types/Transaction';

const mockRemove = jest.fn();
const mockConfirm = jest.fn();
const mockToast = jest.fn();

jest.mock('@apollo/client', () => ({
  useMutation: () => [mockRemove, { loading: false }],
}));
jest.mock(
  'erxes-ui',
  () => ({
    Button: ({
      children,
      onClick,
    }: {
      children?: React.ReactNode;
      onClick?: () => void;
    }) => (
      <button type="button" onClick={onClick}>
        {children}
      </button>
    ),
    useConfirm: () => ({ confirm: mockConfirm }),
    useToast: () => ({ toast: mockToast }),
  }),
  { virtual: true },
);
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock('@/transactions/graphql/accTransactionsRemove', () => ({
  ACC_TRANSACTIONS_REMOVE: 'ACC_TRANSACTIONS_REMOVE',
}));
jest.mock('@/transactions/graphql/transactionQueries', () => ({
  TRANSACTIONS_QUERY: 'TRANSACTIONS_QUERY',
}));
jest.mock('@/transactions/hooks/useTransactionVars', () => ({
  useTransactionsVariables: () => ({ page: 1 }),
}));

const selectedReceipts = [
  { _id: 'tr-bank', parentId: 'parent-1' },
  { _id: 'tr-vat', parentId: 'parent-1' },
  { _id: 'tr-cash', parentId: 'parent-2' },
] as ITransaction[];

const selectedRows = () =>
  selectedReceipts.map(() => ({
    toggleSelected: jest.fn(),
  })) as unknown as Row<unknown>[];

const deleteSelected = (rows: Row<unknown>[]) => {
  render(<TransactionDelete transactions={selectedReceipts} rows={rows} />);
  fireEvent.click(screen.getByRole('button', { name: 'delete' }));
};

describe('Deleting selected receipts', () => {
  beforeEach(() => {
    mockRemove.mockReset();
    mockToast.mockReset();
    mockConfirm.mockReset().mockResolvedValue(undefined);
  });

  it('removes each voucher once, shows one success toast and clears the selection', async () => {
    mockRemove.mockResolvedValue({ data: {} });
    const rows = selectedRows();

    deleteSelected(rows);

    await waitFor(() => expect(rows[2].toggleSelected).toHaveBeenCalled());
    expect(mockRemove).toHaveBeenCalledTimes(2);
    expect(
      mockRemove.mock.calls.map(([options]) => options.variables.parentId),
    ).toEqual(['parent-1', 'parent-2']);
    expect(mockToast).toHaveBeenCalledTimes(1);
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({ variant: 'success' }),
    );
    rows.forEach((row) =>
      expect(row.toggleSelected).toHaveBeenCalledWith(false),
    );
  });

  it('shows one error toast and keeps the selection when a voucher is locked', async () => {
    mockRemove
      .mockResolvedValueOnce({ data: {} })
      .mockRejectedValueOnce(new Error('Closed period'));
    const rows = selectedRows();

    deleteSelected(rows);

    await waitFor(() => expect(mockToast).toHaveBeenCalled());
    expect(mockToast).toHaveBeenCalledTimes(1);
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({ variant: 'destructive' }),
    );
    rows.forEach((row) => expect(row.toggleSelected).not.toHaveBeenCalled());
  });

  it('does nothing when the user cancels the confirm dialog', async () => {
    mockConfirm.mockReturnValue(new Promise(() => undefined));
    const rows = selectedRows();

    deleteSelected(rows);

    await waitFor(() => expect(mockConfirm).toHaveBeenCalled());
    expect(mockRemove).not.toHaveBeenCalled();
    expect(mockToast).not.toHaveBeenCalled();
    rows.forEach((row) => expect(row.toggleSelected).not.toHaveBeenCalled());
  });
});
