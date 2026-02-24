import { Checkbox } from 'erxes-ui/components/checkbox';
import { IconMoneybag } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/react-table';
import {
  CurrencyCode,
  CurrencyFormatedDisplay,
  INumberFieldContainerProps,
  ITextFieldContainerProps,
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
          ['count']
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
            variables: { ...remItem, remainder: remItem.preCount - value, status: 'checked' },
          },
          ['count']
        );
      }}
      className={'shadow-none rounded-none px-2'}
    />
  );
};

const StatusField = ({
  value,
  _id,
  remItem,
}: ITextFieldContainerProps & { remItem: ISafeRemainderItem }) => {
  const { editRemItem } = useSafeRemainderItemEdit();
  return (
    <div className="flex items-center justify-center">
      <Checkbox
        checked={value === 'checked'}
        onCheckedChange={(value) => editRemItem(
          {
            variables: { ...remItem, status: value ? 'checked' : 'new' },
          },
          ['status']
        )}
      />
    </div>
  )
};

export const safeRemDetailTableColumns: ColumnDef<ISafeRemainderItem>[] = [
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
    header: () => (
      <RecordTable.InlineHead icon={IconMoneybag} label="UOM" />
    ),
    accessorKey: 'uom',
    cell: ({ row }) => <RecordTableInlineCell>{row.original.uom ?? ''}</RecordTableInlineCell>,
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: () => <RecordTable.InlineHead icon={IconMoneybag} label="Checked" />,
    size: 33,
    cell: ({ row }) => <StatusField
      value={row.original.status}
      field="status"
      _id={row.original._id}
      remItem={row.original}
    />,
  },
  {
    id: 'remainder',
    header: () => <RecordTable.InlineHead icon={IconMoneybag} label="Remainder" />,
    accessorKey: 'remainder',
    cell: ({ row }) => <RemainderField
      value={row.original.count}
      field="count"
      _id={row.original._id}
      remItem={row.original}
    />,
  },
  {
    id: 'diff',
    header: () => <RecordTable.InlineHead icon={IconMoneybag} label="Diff" />,
    accessorKey: 'diff',
    cell: ({ row }) => <DiffField
      value={row.original.preCount - row.original.count}
      field="diff"
      _id={row.original._id}
      remItem={row.original}
    />,
  },

];
