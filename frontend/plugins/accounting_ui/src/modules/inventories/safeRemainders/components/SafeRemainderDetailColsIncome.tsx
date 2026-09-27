import { IconMoneybag } from '@tabler/icons-react';
import { ColumnDef, Row } from '@tanstack/react-table';
import {
  CurrencyCode,
  CurrencyFormatedDisplay,
  INumberFieldContainerProps,
  NumberField,
  RecordTable,
  RecordTableInlineCell,
} from 'erxes-ui';
import { useSafeRemainderItemEdit } from '../hooks/useSafeRemainderItemEdit';
import { ISafeRemainderItem } from '../types/SafeRemainder';
import { getSafeRemainderIncomeAmount } from '../utils/safeRemainderTransactions';
import { SafeRemainderUnitCostField } from './SafeRemainderUnitCostField';

const ProductCell = ({ row }: { row: Row<ISafeRemainderItem> }) => {
  return (
    <RecordTableInlineCell>
      {`${row.original.product?.code} - ${row.original.product?.name}`}
    </RecordTableInlineCell>
  );
};

const NumberCell = ({ value }: { value: number }) => {
  return (
    <RecordTableInlineCell>
      <CurrencyFormatedDisplay
        currencyValue={{
          currencyCode: CurrencyCode.MNT,
          amountMicros: value,
        }}
      />
    </RecordTableInlineCell>
  );
};

const RemainderField = ({
  value,
  _id,
  remItem,
}: INumberFieldContainerProps & { remItem: ISafeRemainderItem }) => {
  const { editRemItem } = useSafeRemainderItemEdit();

  return (
    <NumberField
      value={value}
      scope={`remItem-${_id}-count`}
      onSave={(value) => {
        editRemItem(
          {
            variables: { ...remItem, remainder: value, status: 'checked' },
          },
          ['count'],
        );
      }}
      className={'shadow-none rounded-none px-2'}
    />
  );
};

const DiffField = ({
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
              remainder: remItem.preCount + value,
              status: 'checked',
            },
          },
          ['count'],
        );
      }}
      className={'shadow-none rounded-none px-2'}
    />
  );
};

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
                  (remItem.preCount * (remItem.trInfo?.activeCost ?? 0) +
                    Math.max(0, value)) /
                  (remItem.count || 1),
              },
            },
          },
          ['trInfo'],
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
    cell: ({ row }) => <ProductCell row={row} />,
    size: 300,
  },
  {
    id: 'preCount',
    header: () => (
      <RecordTable.InlineHead icon={IconMoneybag} label="Бодит үлдэгдэл" />
    ),
    accessorKey: 'preCount',
    cell: ({ row }) => <NumberCell value={row.original.preCount} />,
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
    id: 'remainder',
    header: () => (
      <RecordTable.InlineHead icon={IconMoneybag} label="Үлдэгдэл" />
    ),
    accessorKey: 'remainder',
    cell: ({ row }) => (
      <RemainderField
        value={row.original.count ?? 0}
        field="count"
        _id={row.original._id}
        remItem={row.original}
      />
    ),
  },
  {
    id: 'diff',
    header: () => <RecordTable.InlineHead icon={IconMoneybag} label="Зөрүү" />,
    accessorKey: 'diff',
    cell: ({ row }) => (
      <DiffField
        value={row.original.count - row.original.preCount}
        field="diff"
        _id={row.original._id}
        remItem={row.original}
      />
    ),
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
      <RecordTable.InlineHead icon={IconMoneybag} label="Тооллогын өртөг" />
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
        value={
          getSafeRemainderIncomeAmount(row.original)
        }
        field="debitCost"
        _id={row.original._id}
        remItem={row.original}
      />
    ),
  },
];
