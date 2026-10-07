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
    header: () => <RecordTable.InlineHead icon={IconMoneybag} label="Бараа" />,
    cell: ({ row }) => <SafeRemainderProductCell row={row} />,
    size: 300,
  },
  {
    id: 'uom',
    header: () => (
      <RecordTable.InlineHead icon={IconMoneybag} label="Хэмжих нэгж" />
    ),
    cell: ({ row }) => (
      <RecordTableInlineCell>{row.original.uom ?? ''}</RecordTableInlineCell>
    ),
  },
  {
    id: 'preCount',
    header: () => (
      <RecordTable.InlineHead icon={IconMoneybag} label="Бүртгэлийн үлдэгдэл" />
    ),
    cell: ({ row }) => <SafeRemainderNumberCell value={row.original.preCount} />,
  },
  {
    id: 'activeCost',
    header: () => (
      <RecordTable.InlineHead icon={IconMoneybag} label="Бүртгэлийн нийт өртөг" />
    ),
    cell: ({ row }) => (
      <SafeRemainderNumberCell value={row.original.trInfo?.activeCost ?? 0} />
    ),
  },
  {
    id: 'count',
    header: () => (
      <RecordTable.InlineHead icon={IconMoneybag} label="Тооллогын үлдэгдэл" />
    ),
    cell: ({ row }) => <SafeRemainderNumberCell value={row.original.count} />,
  },
  {
    id: 'unitCost',
    header: () => (
      <RecordTable.InlineHead icon={IconMoneybag} label="Тооллогын нийт өртөг" />
    ),
    cell: ({ row }) => (
      <SafeRemainderUnitCostField
        value={
          row.original.trInfo?.unitCost ??
          row.original.trInfo?.activeCost ??
          0
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
      <RecordTable.InlineHead icon={IconMoneybag} label="Залруулах дүн" />
    ),
    cell: ({ row }) => (
      <SafeRemainderNumberCell
        value={Math.abs(
          getSafeRemainderCostAdjustmentDifference(row.original),
        )}
      />
    ),
  },
  {
    id: 'countDifference',
    header: () => (
      <RecordTable.InlineHead icon={IconMoneybag} label="Тооны зөрүү" />
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
      <RecordTable.InlineHead icon={IconMoneybag} label="Өртгийн зөрүү" />
    ),
    cell: ({ row }) => (
      <SafeRemainderNumberCell
        value={getSafeRemainderCostAdjustmentDifference(row.original)}
      />
    ),
  },
];
