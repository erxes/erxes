import { IconMoneybag } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/react-table';
import {
  INumberFieldContainerProps,
  NumberField,
  RecordTable,
  RecordTableInlineCell,
} from 'erxes-ui';
import { useSafeRemainderItemEdit } from '../hooks/useSafeRemainderItemEdit';
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

const DebitCostField = ({
  value,
  _id,
  remItem,
}: INumberFieldContainerProps & { remItem: ISafeRemainderItem }) => {
  const { editRemItem } = useSafeRemainderItemEdit();

  return (
    <NumberField
      value={value}
      scope={`remItem-${_id}-diff`}
      onSave={(value) => {
        editRemItem(
          {
            variables: {
              ...remItem,
              trInfo: {
                ...remItem.trInfo,
                unitCost:
                  (remItem.trInfo?.activeCost ?? 0) + Math.max(0, value),
                isCostExplicit: true,
              },
            },
          },
        );
      }}
      className={'shadow-none rounded-none px-2'}
    />
  );
};

export const safeRemDetailColumnsIncome: ColumnDef<ISafeRemainderItem>[] = [
  RecordTable.checkboxColumn as ColumnDef<ISafeRemainderItem>,
  {
    id: 'product',
    header: () => <RecordTable.InlineHead icon={IconMoneybag} label="Бараа" />,
    accessorKey: 'product',
    cell: ({ row }) => <SafeRemainderProductCell row={row} />,
    size: 300,
  },
  {
    id: 'uom',
    header: () => (
      <RecordTable.InlineHead icon={IconMoneybag} label="Хэмжих нэгж" />
    ),
    accessorKey: 'uom',
    cell: ({ row }) => (
      <RecordTableInlineCell>{row.original.uom ?? ''}</RecordTableInlineCell>
    ),
  },
  {
    id: 'preCount',
    header: () => (
      <RecordTable.InlineHead icon={IconMoneybag} label="Бүртгэлийн үлдэгдэл" />
    ),
    accessorKey: 'preCount',
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
    id: 'remainder',
    header: () => (
      <RecordTable.InlineHead icon={IconMoneybag} label="Тооллогын үлдэгдэл" />
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
      <RecordTable.InlineHead icon={IconMoneybag} label="Тооллогын нийт өртөг" />
    ),
    accessorKey: 'unitCost',
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
    id: 'debitCost',
    header: () => (
      <RecordTable.InlineHead icon={IconMoneybag} label="Дебет өртөг" />
    ),
    accessorKey: 'debitCost',
    cell: ({ row }) => (
      <DebitCostField
        value={getSafeRemainderIncomeAmount(row.original)}
        field="debitCost"
        _id={row.original._id}
        remItem={row.original}
      />
    ),
  },
  {
    id: 'diff',
    header: () => (
      <RecordTable.InlineHead icon={IconMoneybag} label="Тооны зөрүү" />
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
      <RecordTable.InlineHead icon={IconMoneybag} label="Өртгийн зөрүү" />
    ),
    cell: ({ row }) => (
      <SafeRemainderNumberCell
        value={getSafeRemainderCostDifference(row.original)}
      />
    ),
  },
];
