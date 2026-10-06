import type { TFunction } from 'i18next';
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

export const safeRemDetailColumnsIncome = (
  t: TFunction<'accounting'>,
): ColumnDef<ISafeRemainderItem>[] => [
  RecordTable.checkboxColumn as ColumnDef<ISafeRemainderItem>,
  {
    id: 'product',
    header: () => (
      <RecordTable.InlineHead icon={IconMoneybag} label={t('inventory')} />
    ),
    accessorKey: 'product',
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
    accessorKey: 'uom',
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
    accessorKey: 'preCount',
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
    id: 'remainder',
    header: () => (
      <RecordTable.InlineHead
        icon={IconMoneybag}
        label={t('counted-balance')}
      />
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
      <RecordTable.InlineHead
        icon={IconMoneybag}
        label={t('counted-total-cost')}
      />
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
    header: () => (
      <RecordTable.InlineHead icon={IconMoneybag} label={t('debit-cost')} />
    ),
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
      <RecordTable.InlineHead
        icon={IconMoneybag}
        label={t('quantity-difference')}
      />
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
    header: () => (
      <RecordTable.InlineHead
        icon={IconMoneybag}
        label={t('cost-difference')}
      />
    ),
    cell: ({ row }) => (
      <SafeRemainderNumberCell
        value={getSafeRemainderCostDifference(row.original)}
      />
    ),
  },
];
