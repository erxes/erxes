import {
  Icon,
  IconBuilding,
  IconCalendar,
  IconCurrencyTugrik,
  IconFileText,
  IconPackage,
  IconProps,
  IconUser,
} from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import {
  Badge,
  RecordTable,
  RecordTableInlineCell,
  TextOverflowTooltip,
} from 'erxes-ui';
import { ForwardRefExoticComponent, RefAttributes } from 'react';
import { InsuranceContract } from '~/modules/insurance/types';
import { ContractMoreColumn } from './ContractMoreColumn';
import { formatCurrency, formatDate } from './formatters';

type TablerIcon = ForwardRefExoticComponent<IconProps & RefAttributes<Icon>>;
type TFunc = (key: string, defaultValue?: string) => string;

// Shared column definitions for contract tables
export const createMoreColumn = (
  size: number = 33,
): ColumnDef<InsuranceContract> => ({
  id: 'more',
  accessorKey: 'more',
  header: '',
  cell: ({ cell }) => <ContractMoreColumn cell={cell} />,
  size,
});

export const contractNumberColumn = (
  t: TFunc,
): ColumnDef<InsuranceContract> => ({
  id: 'contractNumber',
  accessorKey: 'contractNumber',
  header: () => {
    return (
      <RecordTable.InlineHead
        icon={IconFileText}
        label={t('contract-no', 'Contract No.')}
      />
    );
  },
  cell: ({ cell }) => (
    <RecordTableInlineCell>
      <TextOverflowTooltip value={cell.getValue() as string} />
    </RecordTableInlineCell>
  ),
});

export const customerColumn = (t: TFunc): ColumnDef<InsuranceContract> => ({
  id: 'customer',
  accessorKey: 'customer',
  header: () => {
    return (
      <RecordTable.InlineHead
        icon={IconUser}
        label={t('customer', 'Customer')}
      />
    );
  },
  cell: ({ cell }) => {
    const customer = cell.row.original.customer;
    return (
      <RecordTableInlineCell>
        <TextOverflowTooltip
          value={`${customer?.firstName || ''} ${customer?.lastName || ''}`}
        />
      </RecordTableInlineCell>
    );
  },
});

export const vendorColumn = (t: TFunc): ColumnDef<InsuranceContract> => ({
  id: 'vendor',
  accessorKey: 'vendor',
  header: () => {
    return (
      <RecordTable.InlineHead
        icon={IconBuilding}
        label={t('vendor', 'Vendor')}
      />
    );
  },
  cell: ({ cell }) => (
    <RecordTableInlineCell>
      <TextOverflowTooltip value={cell.row.original.vendor?.name || ''} />
    </RecordTableInlineCell>
  ),
});

export const createProductColumn = (
  t: TFunc,
  icon: TablerIcon = IconPackage,
): ColumnDef<InsuranceContract> => ({
  id: 'product',
  accessorKey: 'insuranceProduct',
  header: () => {
    return (
      <RecordTable.InlineHead icon={icon} label={t('product', 'Product')} />
    );
  },
  cell: ({ cell }) => (
    <RecordTableInlineCell>
      <TextOverflowTooltip
        value={cell.row.original.insuranceProduct?.name || ''}
      />
    </RecordTableInlineCell>
  ),
});

export const chargedAmountColumn = (
  t: TFunc,
): ColumnDef<InsuranceContract> => ({
  id: 'chargedAmount',
  accessorKey: 'chargedAmount',
  header: () => {
    return (
      <RecordTable.InlineHead
        icon={IconCurrencyTugrik}
        label={t('amount', 'Amount')}
      />
    );
  },
  cell: ({ cell }) => (
    <RecordTableInlineCell>
      <TextOverflowTooltip value={formatCurrency(cell.getValue() as number)} />
    </RecordTableInlineCell>
  ),
});

export const startDateColumn = (t: TFunc): ColumnDef<InsuranceContract> => ({
  id: 'startDate',
  accessorKey: 'startDate',
  header: () => {
    return (
      <RecordTable.InlineHead
        icon={IconCalendar}
        label={t('start-date', 'Start date')}
      />
    );
  },
  cell: ({ cell }) => (
    <RecordTableInlineCell>
      <TextOverflowTooltip value={formatDate(cell.getValue() as Date)} />
    </RecordTableInlineCell>
  ),
});

export const endDateColumn = (t: TFunc): ColumnDef<InsuranceContract> => ({
  id: 'endDate',
  accessorKey: 'endDate',
  header: () => {
    return (
      <RecordTable.InlineHead
        icon={IconCalendar}
        label={t('end-date', 'End date')}
      />
    );
  },
  cell: ({ cell }) => (
    <RecordTableInlineCell>
      <TextOverflowTooltip value={formatDate(cell.getValue() as Date)} />
    </RecordTableInlineCell>
  ),
});

export const paymentStatusColumn = (
  t: TFunc,
): ColumnDef<InsuranceContract> => ({
  id: 'paymentStatus',
  accessorKey: 'paymentStatus',
  header: () => {
    return (
      <RecordTable.InlineHead
        icon={IconCurrencyTugrik}
        label={t('status', 'Status')}
      />
    );
  },
  cell: ({ cell }) => {
    const status = cell.getValue() as string;
    return (
      <RecordTableInlineCell>
        {status === 'paid' ? (
          <Badge className="bg-green-100 text-green-800">
            {t('paid', 'Paid')}
          </Badge>
        ) : (
          <Badge className="bg-yellow-100 text-yellow-800">
            {t('pending', 'Pending')}
          </Badge>
        )}
      </RecordTableInlineCell>
    );
  },
});

// Factory function to create contract columns with custom configuration
export interface ContractColumnsConfig {
  moreColumnSize?: number;
  productIcon?: TablerIcon;
  columnOrder?: (
    | 'more'
    | 'checkbox'
    | 'contractNumber'
    | 'customer'
    | 'vendor'
    | 'product'
    | 'chargedAmount'
    | 'startDate'
    | 'endDate'
    | 'paymentStatus'
  )[];
}

const defaultColumnOrder: ContractColumnsConfig['columnOrder'] = [
  'more',
  'checkbox',
  'contractNumber',
  'customer',
  'vendor',
  'product',
  'chargedAmount',
  'startDate',
  'endDate',
  'paymentStatus',
];

export const createContractColumns = (
  t: TFunc,
  config: ContractColumnsConfig = {},
): ColumnDef<InsuranceContract>[] => {
  const {
    moreColumnSize = 33,
    productIcon,
    columnOrder = defaultColumnOrder,
  } = config;

  const columnMap: Record<string, ColumnDef<InsuranceContract>> = {
    more: createMoreColumn(moreColumnSize),
    checkbox: RecordTable.checkboxColumn as ColumnDef<InsuranceContract>,
    contractNumber: contractNumberColumn(t),
    customer: customerColumn(t),
    vendor: vendorColumn(t),
    product: productIcon
      ? createProductColumn(t, productIcon)
      : createProductColumn(t),
    chargedAmount: chargedAmountColumn(t),
    startDate: startDateColumn(t),
    endDate: endDateColumn(t),
    paymentStatus: paymentStatusColumn(t),
  };

  return columnOrder.map((key) => columnMap[key]);
};
