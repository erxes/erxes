import type { TFunction } from 'i18next';
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

export const safeRemDetailColumnsCost = (
  t: TFunction<'accounting'>,
): ColumnDef<ISafeRemainderItem>[] => [
  RecordTable.checkboxColumn as ColumnDef<ISafeRemainderItem>,
  {
    id: 'product',
    header: () => (
      <RecordTable.InlineHead icon={IconMoneybag} label={t('inventory')} />
    ),
    cell: ({ row }) => <SafeRemainderProductCell row={row} />,
    size: 300,
  },
  {
    id: 'uom',
    header: () => (
      <RecordTable.InlineHead
        icon={IconMoneybag}
        label={t('unit-of-measure-label-2')}
      />
    ),
    cell: ({ row }) => (
      <RecordTableInlineCell>{row.original.uom ?? ''}</RecordTableInlineCell>
    ),
  },
  {
    id: 'preCount',
    header: () => (
      <RecordTable.InlineHead
        icon={IconMoneybag}
        label={t('recorded-balance')}
      />
    ),
    cell: ({ row }) => (
      <SafeRemainderNumberCell value={row.original.preCount} />
    ),
  },
  {
    id: 'activeCost',
    header: () => (
      <RecordTable.InlineHead
        icon={IconMoneybag}
        label={t('recorded-total-cost')}
      />
    ),
    cell: ({ row }) => (
      <SafeRemainderNumberCell value={row.original.trInfo?.activeCost ?? 0} />
    ),
  },
  {
    id: 'count',
    header: () => (
      <RecordTable.InlineHead
        icon={IconMoneybag}
        label={t('counted-balance')}
      />
    ),
    cell: ({ row }) => <SafeRemainderNumberCell value={row.original.count} />,
  },
  {
    id: 'unitCost',
    header: () => (
      <RecordTable.InlineHead
        icon={IconMoneybag}
        label={t('counted-total-cost')}
      />
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
      <RecordTable.InlineHead
        icon={IconMoneybag}
        label={t('adjustment-amount')}
      />
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
      <RecordTable.InlineHead
        icon={IconMoneybag}
        label={t('quantity-difference')}
      />
    ),
    cell: ({ row }) => (
      <SafeRemainderNumberCell
        value={row.original.count - row.original.preCount}
      />
    ),
  },
  {
    id: 'costDifference',
    header: () => (
      <RecordTable.InlineHead
        icon={IconMoneybag}
        label={t('cost-difference')}
      />
    ),
    cell: ({ row }) => (
      <SafeRemainderNumberCell
        value={getSafeRemainderCostAdjustmentDifference(row.original)}
      />
    ),
  },
];
