import type { TFunction } from 'i18next';
import type { ColumnDef, Row } from '@tanstack/react-table';
import { render, screen } from '@testing-library/react';
import { tbalanceColumns } from '@/transactions/transaction-form/components/TBalanceTableColumns';
import { ITBalanceTransaction } from '@/transactions/transaction-form/types/TBalance';

jest.mock(
  'erxes-ui',
  () => {
    const Passthrough = ({ children }: { children?: React.ReactNode }) => (
      <div>{children}</div>
    );

    return {
      CurrencyCode: { MNT: 'MNT' },
      CurrencyFormatedDisplay: () => null,
      RecordTable: { InlineHead: Passthrough },
      RecordTableInlineCell: Passthrough,
      fixNum: (value?: number) => Number(value || 0),
      formatAmount: (value: number) => `qty:${value}`,
      Skeleton: () => null,
    };
  },
  { virtual: true },
);
jest.mock('ui-modules', () => ({}), { virtual: true });
jest.mock('@/settings/fixed-assets/hooks/useFixedAssetDetail', () => ({}));
jest.mock('@/settings/account/components/AccountsInline', () => ({}));
jest.mock('@/transactions/transaction-form/states/trStates', () => ({}));

const translate = ((key: string) => key) as unknown as TFunction<'accounting'>;
const quantityColumn = tbalanceColumns(translate).find(
  (col) => col.id === 'count-details',
) as ColumnDef<ITBalanceTransaction> & {
  cell: (props: { row: Row<ITBalanceTransaction> }) => JSX.Element | null;
};

const renderQuantity = (detail: ITBalanceTransaction['detail']) => {
  const original: ITBalanceTransaction = {
    date: new Date('2025-07-01'),
    journalIndex: '0',
    side: 'dt',
    detail,
  };
  return render(
    <>
      {quantityColumn.cell({ row: { original } as Row<ITBalanceTransaction> })}
    </>,
  );
};

describe('trial balance quantity column', () => {
  it('shows the count of a product line', () => {
    renderQuantity({ amount: 50000, productId: 'pen', count: 12.5 });
    expect(screen.getByText('qty:12.5')).toBeTruthy();
  });

  it('shows the count of a fixed asset line', () => {
    renderQuantity({ amount: 900000, fixedAssetId: 'laptop', count: 3 });
    expect(screen.getByText('qty:3')).toBeTruthy();
  });

  it('stays empty for a plain account line without an item', () => {
    const { container } = renderQuantity({ amount: 70000, count: 4 });
    expect(container.textContent).toBe('');
  });
});
