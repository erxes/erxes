import {
  IconFileText,
  IconUser,
  IconCalendar,
  IconCurrencyTugrik,
  IconBuilding,
  IconPackage,
} from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import {
  RecordTable,
  TextOverflowTooltip,
  RecordTableInlineCell,
  Badge,
} from 'erxes-ui';
import { InsuranceContract } from '~/modules/insurance/types';
import { ContractMoreColumn, formatDate, formatCurrency } from '../shared';

export const contractsColumns: ColumnDef<InsuranceContract>[] = [
  {
    id: 'more',
    accessorKey: 'more',
    header: '',
    cell: ({ cell }) => <ContractMoreColumn cell={cell} />,
    size: 26,
  },
  RecordTable.checkboxColumn as ColumnDef<InsuranceContract>,
  {
    id: 'contractNumber',
    accessorKey: 'contractNumber',
    header: () => (
      <RecordTable.InlineHead icon={IconFileText} label="Contract No." />
    ),
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'product',
    accessorKey: 'insuranceProduct',
    header: () => <RecordTable.InlineHead icon={IconPackage} label="Product" />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip
            value={cell.row.original.insuranceProduct?.name || ''}
          />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'customer',
    accessorKey: 'customer',
    header: () => <RecordTable.InlineHead icon={IconUser} label="Customer" />,
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
  },
  {
    id: 'vendor',
    accessorKey: 'vendor',
    header: () => <RecordTable.InlineHead icon={IconBuilding} label="Vendor" />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.row.original.vendor?.name || ''} />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'chargedAmount',
    accessorKey: 'chargedAmount',
    header: () => (
      <RecordTable.InlineHead icon={IconCurrencyTugrik} label="Amount" />
    ),
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip
            value={formatCurrency(cell.getValue() as number)}
          />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'startDate',
    accessorKey: 'startDate',
    header: () => (
      <RecordTable.InlineHead icon={IconCalendar} label="Start Date" />
    ),
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={formatDate(cell.getValue() as Date)} />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'endDate',
    accessorKey: 'endDate',
    header: () => (
      <RecordTable.InlineHead icon={IconCalendar} label="End Date" />
    ),
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={formatDate(cell.getValue() as Date)} />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'paymentStatus',
    accessorKey: 'paymentStatus',
    header: () => (
      <RecordTable.InlineHead icon={IconCurrencyTugrik} label="Status" />
    ),
    cell: ({ cell }) => {
      const status = cell.getValue() as string;
      return (
        <RecordTableInlineCell>
          {status === 'paid' ? (
            <Badge className="bg-green-100 text-green-800">Paid</Badge>
          ) : (
            <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
          )}
        </RecordTableInlineCell>
      );
    },
  },
];
