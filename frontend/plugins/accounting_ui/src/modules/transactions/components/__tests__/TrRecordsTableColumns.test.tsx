import type { TFunction } from 'i18next';
import type { ColumnDef, Row } from '@tanstack/react-table';
import { render, screen } from '@testing-library/react';
import { trRecordColumns } from '@/transactions/components/TrRecordsTableColumns';
import { ITrRecord } from '@/transactions/types/Transaction';

jest.mock(
  'erxes-ui',
  () => {
    const Passthrough = ({ children }: { children?: React.ReactNode }) => (
      <div>{children}</div>
    );

    return {
      Combobox: { Content: Passthrough },
      Command: Object.assign(Passthrough, { List: Passthrough }),
      CurrencyCode: { MNT: 'MNT' },
      CurrencyFormatedDisplay: ({
        currencyValue,
      }: {
        currencyValue: { amountMicros: number };
      }) => <span>{currencyValue.amountMicros}</span>,
      fixNum: (value?: number) => Number(value || 0),
      Popover: Passthrough,
      RecordTable: { InlineHead: Passthrough, checkboxColumn: { id: 'check' } },
      RecordTableInlineCell: Passthrough,
      useConfirm: () => ({ confirm: jest.fn() }),
    };
  },
  { virtual: true },
);
jest.mock('ui-modules', () => ({ ProductsInline: () => null }), {
  virtual: true,
});
jest.mock('react-router', () => ({
  useLocation: () => ({ pathname: '/accounting/records', search: '' }),
  useNavigate: () => jest.fn(),
}));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock('@/settings/fixed-assets/components/SelectFixedAsset', () => ({
  SelectFixedAsset: () => null,
}));
jest.mock('@/transactions/hooks/useTrRecordsRemove', () => ({
  useTrRecordsRemove: () => ({ removeTrRecords: jest.fn() }),
}));

const translate = ((key: string) => key) as unknown as TFunction<'accounting'>;
const columns = trRecordColumns(translate);

const renderCell = (columnId: string, record: Partial<ITrRecord>) => {
  const column = columns.find(
    (col) => col.id === columnId,
  ) as ColumnDef<ITrRecord> & {
    cell: (props: { row: Row<ITrRecord> }) => JSX.Element;
  };
  const row = { original: record } as Row<ITrRecord>;

  return render(column.cell({ row }));
};

const journalLine = (side?: string): Partial<ITrRecord> => ({
  _id: 'tr-1-detail-1',
  journal: 'main',
  side,
  details: { _id: 'detail-1', accountId: 'acc-1101', amount: 1250000 },
});

describe('Journal Entries debit and credit columns', () => {
  it('shows a debit line amount under Debit and zero under Credit', () => {
    renderCell('Debit', journalLine('dt'));
    expect(screen.getByText('1250000')).toBeTruthy();

    renderCell('Credit', journalLine('dt'));
    expect(screen.getByText('0')).toBeTruthy();
  });

  it('shows a credit line amount under Credit and zero under Debit', () => {
    renderCell('Credit', journalLine('ct'));
    expect(screen.getByText('1250000')).toBeTruthy();

    renderCell('Debit', journalLine('ct'));
    expect(screen.getByText('0')).toBeTruthy();
  });

  it.each([undefined, '', 'new'])(
    'shows a visible placeholder instead of a silent zero when side is %p',
    (side) => {
      renderCell('Debit', journalLine(side));
      renderCell('Credit', journalLine(side));

      expect(screen.getAllByText('-')).toHaveLength(2);
      expect(screen.queryByText('0')).toBeNull();
      expect(screen.queryByText('1250000')).toBeNull();
    },
  );
});
