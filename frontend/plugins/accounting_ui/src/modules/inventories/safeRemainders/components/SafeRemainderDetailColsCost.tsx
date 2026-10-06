import { HeaderCell } from '@/check-synced/constants/HeaderCell';
import { IconMoneybag } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/react-table';
import { RecordTable, RecordTableInlineCell } from 'erxes-ui';
import { ISafeRemainderItem } from '../types/SafeRemainder';
import { getSafeRemainderCostAdjustmentDifference } from '../utils/safeRemainderTransactions';
import {
  SafeRemainderNumberCell,
  SafeRemainderProductCell,
} from './SafeRemainderCells';
import { SafeRemainderUnitCostField } from './SafeRemainderUnitCostField';

export const safeRemDetailColumnsCost: ColumnDef<ISafeRemainderItem>[] = [
  RecordTable.checkboxColumn as ColumnDef<ISafeRemainderItem>,
  {
    id: 'product',
    header: () => <HeaderCell icon={IconMoneybag} labelKey="inventory" />,
    cell: ({ row }) => <SafeRemainderProductCell row={row} />,
    size: 300,
  },
  {
    id: 'uom',
    header: () => <HeaderCell icon={IconMoneybag} labelKey="unit-of-measure" />,
    cell: ({ row }) => (
      <RecordTableInlineCell>{row.original.uom ?? ''}</RecordTableInlineCell>
    ),
  },
  {
    id: 'preCount',
    header: () => <HeaderCell icon={IconMoneybag} labelKey="book-quantity" />,
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
    id: 'count',
    header: () => (
      <HeaderCell icon={IconMoneybag} labelKey="counted-quantity" />
    ),
    cell: ({ row }) => <SafeRemainderNumberCell value={row.original.count} />,
  },
  {
    id: 'unitCost',
    header: () => (
      <HeaderCell icon={IconMoneybag} labelKey="counted-inventory-value" />
    ),
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
    id: 'amount',
    header: () => (
      <HeaderCell icon={IconMoneybag} labelKey="adjustment-amount" />
    ),
    cell: ({ row }) => (
      <SafeRemainderNumberCell
        value={Math.abs(getSafeRemainderCostAdjustmentDifference(row.original))}
      />
    ),
  },
  {
    id: 'countDifference',
    header: () => (
      <HeaderCell icon={IconMoneybag} labelKey="quantity-variance" />
    ),
    cell: ({ row }) => (
      <SafeRemainderNumberCell
        value={row.original.count - row.original.preCount}
      />
    ),
  },
  {
    id: 'costDifference',
    header: () => <HeaderCell icon={IconMoneybag} labelKey="cost-variance" />,
    cell: ({ row }) => (
      <SafeRemainderNumberCell
        value={getSafeRemainderCostAdjustmentDifference(row.original)}
      />
    ),
  },
];
