import { Checkbox } from 'erxes-ui/components/checkbox';
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

const IsSaleField = ({
  value,
  _id,
  remItem,
}: INumberFieldContainerProps & { remItem: ISafeRemainderItem }) => {
  const { editRemItem } = useSafeRemainderItemEdit();
  return (
    <div className="flex items-center justify-center">
      <Checkbox
        checked={value > 0}
        onCheckedChange={(value) =>
          editRemItem(
            {
              variables: {
                ...remItem,
                trInfo: { ...remItem.trInfo, isSale: Number(value) > 0 },
              },
            },
            ['trInfo'],
          )
        }
      />
    </div>
  );
};

const UnitPriceField = ({
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
              trInfo: { ...remItem.trInfo, unitPrice: value },
            },
          },
          ['count'],
        );
      }}
      className={'shadow-none rounded-none px-2'}
    />
  );
};

const SalePriceField = ({
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
                unitPrice: value / (remItem.preCount - remItem.count || 1),
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

export const safeRemDetailColumnsSale: ColumnDef<ISafeRemainderItem>[] = [
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
    cell: ({ row }) => <NumberCell value={row.original.preCount ?? 0} />,
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
    id: 'isSale',
    accessorKey: 'isSale',
    header: () => (
      <RecordTable.InlineHead icon={IconMoneybag} label="Борлуулах эсэх" />
    ),
    size: 33,
    cell: ({ row }) => (
      <IsSaleField
        value={(row.original.trInfo?.isSale && 1) || 0}
        field="trInfo.status"
        _id={row.original._id}
        remItem={row.original}
      />
    ),
  },
  {
    id: 'unitPrice',
    header: () => (
      <RecordTable.InlineHead icon={IconMoneybag} label="Нэгж үнэ" />
    ),
    accessorKey: 'unitPrice',
    cell: ({ row }) => (
      <UnitPriceField
        value={row.original.trInfo?.unitPrice ?? 0}
        field="trInfo.unitPrice"
        _id={row.original._id}
        remItem={row.original}
      />
    ),
  },
  {
    id: 'salePrice',
    header: () => (
      <RecordTable.InlineHead icon={IconMoneybag} label="Борлуулах үнэ" />
    ),
    accessorKey: 'salePrice',
    cell: ({ row }) => (
      <SalePriceField
        value={
          (row.original.trInfo?.unitPrice ?? 0) *
          (row.original.preCount - row.original.count)
        }
        field="salePrice"
        _id={row.original._id}
        remItem={row.original}
      />
    ),
  },
];
