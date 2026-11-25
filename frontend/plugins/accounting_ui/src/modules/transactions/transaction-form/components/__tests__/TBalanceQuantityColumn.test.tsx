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
jest.mock('ui-modules', () => {
  const { useState } = jest.requireActual<typeof import('react')>('react');
  return {
    CustomerType: { CUSTOMER: 'customer', COMPANY: 'company', USER: 'user' },
    CustomersInline: ({ customerIds }: { customerIds: string[] }) => (
      <span>Customer {customerIds[0]}</span>
    ),
    CompaniesInline: ({ companyIds }: { companyIds: string[] }) => {
      const [loadedId] = useState(companyIds[0]);
      return <span>Company {loadedId}</span>;
    },
  };
});
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

it('resolves the current contact when the same balance row changes selection', () => {
  const contactColumn = tbalanceColumns(translate).find(
    (col) => col.id === 'customerId',
  ) as ColumnDef<ITBalanceTransaction> & {
    cell: (props: { row: Row<ITBalanceTransaction> }) => JSX.Element;
  };
  const contactCell = (customerType?: string, customerId?: string) =>
    contactColumn.cell({
      row: {
        original: { customerType, customerId },
      } as Row<ITBalanceTransaction>,
    });

  const { rerender } = render(contactCell(undefined, 'person-1'));
  expect(screen.getByText('Customer person-1')).toBeTruthy();

  rerender(contactCell('company', 'company-1'));
  expect(screen.getByText('Company company-1')).toBeTruthy();

  rerender(contactCell('company', 'company-2'));
  expect(screen.getByText('Company company-2')).toBeTruthy();
  expect(screen.queryByText('Company company-1')).toBeNull();

  rerender(contactCell('company'));
  expect(screen.getByText('-')).toBeTruthy();
});
