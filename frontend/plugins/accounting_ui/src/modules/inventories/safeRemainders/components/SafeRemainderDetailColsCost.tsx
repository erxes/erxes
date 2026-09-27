import { IconMoneybag } from '@tabler/icons-react';
import { ColumnDef, Row } from '@tanstack/react-table';
import {
  CurrencyCode,
  CurrencyFormatedDisplay,
  RecordTable,
  RecordTableInlineCell,
} from 'erxes-ui';
import { ISafeRemainderItem } from '../types/SafeRemainder';
import {
  getSafeRemainderCostAdjustmentAmount,
  getSafeRemainderCostAdjustmentUnitDifference,
} from '../utils/safeRemainderTransactions';
import { SafeRemainderUnitCostField } from './SafeRemainderUnitCostField';

const ProductCell = ({ row }: { row: Row<ISafeRemainderItem> }) => (
  <RecordTableInlineCell>
    {`${row.original.product?.code} - ${row.original.product?.name}`}
  </RecordTableInlineCell>
);

const NumberCell = ({ value }: { value: number }) => (
  <RecordTableInlineCell>
    <CurrencyFormatedDisplay
      currencyValue={{ currencyCode: CurrencyCode.MNT, amountMicros: value }}
    />
  </RecordTableInlineCell>
);

export const safeRemDetailColumnsCost: ColumnDef<ISafeRemainderItem>[] = [
  RecordTable.checkboxColumn as ColumnDef<ISafeRemainderItem>,
  {
    id: 'product',
    header: () => <RecordTable.InlineHead icon={IconMoneybag} label="Бараа" />,
    cell: ({ row }) => <ProductCell row={row} />,
    size: 300,
  },
  {
    id: 'count',
    header: () => (
      <RecordTable.InlineHead icon={IconMoneybag} label="Тоолсон үлдэгдэл" />
    ),
    cell: ({ row }) => <NumberCell value={row.original.count} />,
  },
  {
    id: 'activeCost',
    header: () => (
      <RecordTable.InlineHead icon={IconMoneybag} label="Одоогийн өртөг" />
    ),
    cell: ({ row }) => (
      <NumberCell value={row.original.trInfo?.activeCost ?? 0} />
    ),
  },
  {
    id: 'unitCost',
    header: () => (
      <RecordTable.InlineHead icon={IconMoneybag} label="Тоолсон өртөг" />
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
    id: 'costDifference',
    header: () => (
      <RecordTable.InlineHead icon={IconMoneybag} label="Нэгжийн зөрүү" />
    ),
    cell: ({ row }) => (
      <NumberCell
        value={getSafeRemainderCostAdjustmentUnitDifference(row.original)}
      />
    ),
  },
  {
    id: 'amount',
    header: () => (
      <RecordTable.InlineHead icon={IconMoneybag} label="Залруулах дүн" />
    ),
    cell: ({ row }) => (
      <NumberCell value={getSafeRemainderCostAdjustmentAmount(row.original)} />
    ),
  },
];
