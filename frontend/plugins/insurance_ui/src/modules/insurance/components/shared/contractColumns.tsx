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
import { useTranslation } from 'react-i18next';
import { InsuranceContract } from '~/modules/insurance/types';
import { ContractMoreColumn } from './ContractMoreColumn';
import { formatCurrency, formatDate } from './formatters';

type TablerIcon = ForwardRefExoticComponent<IconProps & RefAttributes<Icon>>;

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

export const contractNumberColumn: ColumnDef<InsuranceContract> = {
  id: 'contractNumber',
  accessorKey: 'contractNumber',
  header: () => {
    const { t } = useTranslation('insurance');
    return <RecordTable.InlineHead icon={IconFileText} label={t('contract-no')} />;
  },
  cell: ({ cell }) => (
    <RecordTableInlineCell>
      <TextOverflowTooltip value={cell.getValue() as string} />
    </RecordTableInlineCell>
  ),
};

export const customerColumn: ColumnDef<InsuranceContract> = {
  id: 'customer',
  accessorKey: 'customer',
  header: () => {
    const { t } = useTranslation('insurance');
    return <RecordTable.InlineHead icon={IconUser} label={t('customer')} />;
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
};

export const vendorColumn: ColumnDef<InsuranceContract> = {
  id: 'vendor',
  accessorKey: 'vendor',
  header: () => {
    const { t } = useTranslation('insurance');
    return <RecordTable.InlineHead icon={IconBuilding} label={t('vendor')} />;
  },
  cell: ({ cell }) => (
    <RecordTableInlineCell>
      <TextOverflowTooltip value={cell.row.original.vendor?.name || ''} />
    </RecordTableInlineCell>
  ),
};

export const createProductColumn = (
  icon: TablerIcon = IconPackage,
): ColumnDef<InsuranceContract> => ({
  id: 'product',
  accessorKey: 'insuranceProduct',
  header: () => {
    const { t } = useTranslation('insurance');
    return <RecordTable.InlineHead icon={icon} label={t('product')} />;
  },
  cell: ({ cell }) => (
    <RecordTableInlineCell>
      <TextOverflowTooltip
        value={cell.row.original.insuranceProduct?.name || ''}
      />
    </RecordTableInlineCell>
  ),
});

export const chargedAmountColumn: ColumnDef<InsuranceContract> = {
  id: 'chargedAmount',
  accessorKey: 'chargedAmount',
  header: () => {
    const { t } = useTranslation('insurance');
    return <RecordTable.InlineHead icon={IconCurrencyTugrik} label={t('amount')} />;
  },
  cell: ({ cell }) => (
    <RecordTableInlineCell>
      <TextOverflowTooltip value={formatCurrency(cell.getValue() as number)} />
    </RecordTableInlineCell>
  ),
};

export const startDateColumn: ColumnDef<InsuranceContract> = {
  id: 'startDate',
  accessorKey: 'startDate',
  header: () => {
    const { t } = useTranslation('insurance');
    return <RecordTable.InlineHead icon={IconCalendar} label={t('start-date')} />;
  },
  cell: ({ cell }) => (
    <RecordTableInlineCell>
      <TextOverflowTooltip value={formatDate(cell.getValue() as Date)} />
    </RecordTableInlineCell>
  ),
};

export const endDateColumn: ColumnDef<InsuranceContract> = {
  id: 'endDate',
  accessorKey: 'endDate',
  header: () => {
    const { t } = useTranslation('insurance');
    return <RecordTable.InlineHead icon={IconCalendar} label={t('end-date')} />;
  },
  cell: ({ cell }) => (
    <RecordTableInlineCell>
      <TextOverflowTooltip value={formatDate(cell.getValue() as Date)} />
    </RecordTableInlineCell>
  ),
};

export const paymentStatusColumn: ColumnDef<InsuranceContract> = {
  id: 'paymentStatus',
  accessorKey: 'paymentStatus',
  header: () => {
    const { t } = useTranslation('insurance');
    return <RecordTable.InlineHead icon={IconCurrencyTugrik} label={t('status')} />;
  },
  cell: ({ cell }) => {
    const { t } = useTranslation('insurance');
    const status = cell.getValue() as string;
    return (
      <RecordTableInlineCell>
        {status === 'paid' ? (
          <Badge className="bg-green-100 text-green-800">{t('paid')}</Badge>
        ) : (
          <Badge className="bg-yellow-100 text-yellow-800">{t('pending')}</Badge>
        )}
      </RecordTableInlineCell>
    );
  },
};

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
    contractNumber: contractNumberColumn,
    customer: customerColumn,
    vendor: vendorColumn,
    product: productIcon
      ? createProductColumn(productIcon)
      : createProductColumn(),
    chargedAmount: chargedAmountColumn,
    startDate: startDateColumn,
    endDate: endDateColumn,
    paymentStatus: paymentStatusColumn,
  };

  return columnOrder.map((key) => columnMap[key]);
};
