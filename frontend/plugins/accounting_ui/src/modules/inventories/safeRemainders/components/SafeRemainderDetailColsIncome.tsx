import { HeaderCell } from '@/check-synced/constants/HeaderCell';
import { IconMoneybag } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/react-table';
import { RecordTable, RecordTableInlineCell } from 'erxes-ui';
import { ISafeRemainderItem } from '../types/SafeRemainder';
import {
  getSafeRemainderCostDifference,
  getSafeRemainderIncomeAmount,
} from '../utils/safeRemainderTransactions';
import {
  SafeRemainderCountField,
  SafeRemainderDifferenceField,
  SafeRemainderNumberCell,
  SafeRemainderProductCell,
} from './SafeRemainderCells';
import { SafeRemainderUnitCostField } from './SafeRemainderUnitCostField';

export const safeRemDetailColumnsIncome: ColumnDef<ISafeRemainderItem>[] = [
  RecordTable.checkboxColumn as ColumnDef<ISafeRemainderItem>,
  {
    id: 'product',
    header: () => <HeaderCell icon={IconMoneybag} labelKey="inventory" />,
    accessorKey: 'product',
    cell: ({ row }) => <SafeRemainderProductCell row={row} />,
    size: 300,
  },
  {
    id: 'uom',
    header: () => <HeaderCell icon={IconMoneybag} labelKey="unit-of-measure" />,
    accessorKey: 'uom',
    cell: ({ row }) => (
      <RecordTableInlineCell>{row.original.uom ?? ''}</RecordTableInlineCell>
    ),
  },
  {
    id: 'preCount',
    header: () => <HeaderCell icon={IconMoneybag} labelKey="book-quantity" />,
    accessorKey: 'preCount',
    cell: ({ row }) => (
      <SafeRemainderNumberCell value={row.original.preCount} />
    ),
  },
  {
    id: 'activeCost',
    header: () => <HeaderCell icon={IconMoneybag} labelKey="book-value" />,
    cell: ({ row }) => (
      <SafeRemainderNumberCell value={row.original.trInfo?.activeCost ?? 0} />
    ),
  },
  {
    id: 'remainder',
    header: () => (
      <HeaderCell icon={IconMoneybag} labelKey="counted-quantity" />
    ),
    accessorKey: 'remainder',
    cell: ({ row }) => (
      <SafeRemainderCountField
        value={row.original.count ?? 0}
        field="count"
        _id={row.original._id}
        remItem={row.original}
      />
    ),
  },
  {
    id: 'unitCost',
    header: () => (
      <HeaderCell icon={IconMoneybag} labelKey="counted-inventory-value" />
    ),
    accessorKey: 'unitCost',
    cell: ({ row }) => (
      <SafeRemainderUnitCostField
        value={
          row.original.trInfo?.unitCost ?? row.original.trInfo?.activeCost ?? 0
        }
        field="trInfo.unitCost"
        _id={row.original._id}
        remItem={row.original}
      />
    ),
  },
  {
    id: 'debitCost',
    header: () => <HeaderCell icon={IconMoneybag} labelKey="debit-value" />,
    accessorKey: 'debitCost',
    cell: ({ row }) => (
      <SafeRemainderNumberCell
        value={getSafeRemainderIncomeAmount(row.original)}
      />
    ),
  },
  {
    id: 'diff',
    header: () => (
      <HeaderCell icon={IconMoneybag} labelKey="quantity-variance" />
    ),
    accessorKey: 'diff',
    cell: ({ row }) => (
      <SafeRemainderDifferenceField
        value={row.original.count - row.original.preCount}
        field="diff"
        _id={row.original._id}
        remItem={row.original}
      />
    ),
  },
  {
    id: 'costDifference',
    header: () => <HeaderCell icon={IconMoneybag} labelKey="cost-variance" />,
    cell: ({ row }) => (
      <SafeRemainderNumberCell
        value={getSafeRemainderCostDifference(row.original)}
      />
    ),
  },
];
