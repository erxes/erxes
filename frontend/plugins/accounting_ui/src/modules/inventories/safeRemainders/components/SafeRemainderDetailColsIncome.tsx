import { IconMoneybag } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/react-table';
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

const ProductCell = ({ row }: any) => {
  return (
    <RecordTableInlineCell>
      {`${row.original.product?.code} - ${row.original.product?.name}`}
    </RecordTableInlineCell>
  );
};

const NumberCell = ({ getValue }: any) => {
  const value = getValue() as number;

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

const UnitCostField = ({
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
              trInfo: { ...remItem.trInfo, unitCost: value },
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
                unitCost: value / (remItem.count - remItem.preCount || 1),
              },
            },
          },
          ['count'],
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
    header: () => (
      <RecordTable.InlineHead icon={IconMoneybag} label="Product" />
    ),
    accessorKey: 'product',
    cell: ({ row }) => <ProductCell row={row} />,
    size: 300,
  },
  {
    id: 'preCount',
    header: () => (
      <RecordTable.InlineHead icon={IconMoneybag} label="Live Remainder" />
    ),
    accessorKey: 'preCount',
    cell: ({ getValue }) => <NumberCell getValue={getValue} />,
  },
  {
    id: 'uom',
    header: () => <RecordTable.InlineHead icon={IconMoneybag} label="UOM" />,
    accessorKey: 'uom',
    cell: ({ row }) => (
      <RecordTableInlineCell>{row.original.uom ?? ''}</RecordTableInlineCell>
    ),
  },
  {
    id: 'remainder',
    header: () => (
      <RecordTable.InlineHead icon={IconMoneybag} label="Remainder" />
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
    header: () => <RecordTable.InlineHead icon={IconMoneybag} label="Diff" />,
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
    id: 'unitCost',
    header: () => (
      <RecordTable.InlineHead icon={IconMoneybag} label="Unit Cost" />
    ),
    accessorKey: 'unitCost',
    cell: ({ row }) => (
      <UnitCostField
        value={row.original.trInfo?.unitCost ?? 0}
        field="trInfo.unitCost"
        _id={row.original._id}
        remItem={row.original}
      />
    ),
  },
  {
    id: 'debitCost',
    header: () => (
      <RecordTable.InlineHead icon={IconMoneybag} label="Debit Cost" />
    ),
    accessorKey: 'debitCost',
    cell: ({ row }) => (
      <DebitCostField
        value={
          (row.original.trInfo?.unitCost ?? 0) *
          (row.original.count - row.original.preCount)
        }
        field="debitCost"
        _id={row.original._id}
        remItem={row.original}
      />
    ),
  },
];
