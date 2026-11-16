import type { TFunction } from 'i18next';
import type { ColumnDef, Row } from '@tanstack/react-table';
import { render, screen } from '@testing-library/react';
import { transactionColumns } from '@/transactions/components/TransactionsTableColumns';
import { TrJournalEnum } from '@/transactions/types/constants';
import { ITransaction } from '@/transactions/types/Transaction';

jest.mock(
  'erxes-ui',
  () => {
    const Passthrough = ({ children }: { children?: React.ReactNode }) => (
      <div>{children}</div>
    );
    const InlineCell = Object.assign(Passthrough, {
      Anchor: ({ children }: { children?: React.ReactNode }) => (
        <button type="button">{children}</button>
      ),
    });

    return {
      Badge: Passthrough,
      Combobox: { Content: Passthrough },
      Command: Object.assign(Passthrough, {
        List: Passthrough,
        Item: Passthrough,
      }),
      CurrencyCode: { MNT: 'MNT' },
      CurrencyFormatedDisplay: () => null,
      Popover: Object.assign(Passthrough, { Trigger: Passthrough }),
      RecordTable: {
        ColumnSelector: () => null,
        InlineHead: Passthrough,
        MoreButton: () => null,
        checkboxColumn: { id: 'check' },
      },
      RecordTableInlineCell: InlineCell,
      useConfirm: () => ({ confirm: jest.fn() }),
    };
  },
  { virtual: true },
);
jest.mock('react-router-dom', () => ({
  useLocation: () => ({ pathname: '/accounting/main', search: '' }),
  useNavigate: () => jest.fn(),
}));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock(
  '@/transactions/transaction-form/hooks/useTransactionsRemove',
  () => ({
    useTransactionsRemove: () => ({ removeTransactions: jest.fn() }),
  }),
);

const translate = ((key: string) => key) as unknown as TFunction<'accounting'>;
const columns = transactionColumns(translate);

const renderCell = (columnId: string, transaction: Partial<ITransaction>) => {
  const column = columns.find(
    (col) => col.id === columnId,
  ) as ColumnDef<ITransaction> & {
    cell: (props: { row: Row<ITransaction> }) => JSX.Element;
  };
  const row = { original: transaction } as Row<ITransaction>;

  return render(column.cell({ row }));
};

const bankReceipt: Partial<ITransaction> = {
  _id: 'tr-bank-1',
  parentId: 'parent-1',
  journal: TrJournalEnum.BANK,
  date: new Date(2026, 10, 14, 12),
  branch: { _id: 'branch-1', code: 'BR01', title: 'Central branch' },
  details: [
    {
      _id: 'd-1',
      account: { _id: 'acc-1102', code: '1102', name: 'Khan Bank' },
    },
    {
      _id: 'd-2',
      account: { _id: 'acc-1102', code: '1102', name: 'Khan Bank' },
    },
    {
      _id: 'd-3',
      account: { _id: 'acc-3401', code: '3401', name: 'VAT payable' },
    },
  ],
};

describe('Receipts list columns', () => {
  it('summarizes a bank receipt by account code with repeat counts', () => {
    renderCell('account', bankReceipt);

    expect(screen.getByRole('button').textContent).toBe(
      '1102 - Khan Bank(2), 3401',
    );
  });

  it('names the first line account even when a lower code follows it', () => {
    renderCell('account', {
      ...bankReceipt,
      details: [
        {
          _id: 'd-1',
          account: { _id: 'acc-3401', code: '3401', name: 'VAT payable' },
        },
        {
          _id: 'd-2',
          account: { _id: 'acc-1102', code: '1102', name: 'Khan Bank' },
        },
      ],
    });

    expect(screen.getByRole('button').textContent).toBe(
      '3401 - VAT payable, 1102',
    );
  });

  it('renders an empty account cell for a voucher saved without lines', () => {
    renderCell('account', { ...bankReceipt, details: [] });

    expect(screen.getByRole('button').textContent).toBe('');
  });

  it('shows the voucher date as a plain day', () => {
    renderCell('date', bankReceipt);

    expect(screen.getByText('2026-11-14')).toBeTruthy();
  });

  it('shows the branch code and title together', () => {
    renderCell('branch', bankReceipt);

    expect(screen.getByText('BR01 - Central branch')).toBeTruthy();
  });

  it('leaves the department cell blank when the voucher has none', () => {
    const { container } = renderCell('department', bankReceipt);

    expect(container.textContent).toBe('');
  });
});
