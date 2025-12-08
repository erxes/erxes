import {
  CurrencyCode,
  CurrencyFormatedDisplay,
  INumberFieldContainerProps,
  NumberField,
  RecordTable,
  RecordTableInlineCell,
  TextOverflowTooltip,
} from 'erxes-ui';
import {
  IconCurrencyDollar,
  IconDiamond,
  IconLabel,
  IconPentagonNumber1,
  IconPercentage,
  IconRosetteDiscount,
  IconUser,
} from '@tabler/icons-react';

import { ColumnDef } from '@tanstack/table-core';
import { IProduct } from 'ui-modules';
import { productMoreColumn } from './ProductMoreColumn';

const ProductTextField = ({
  value,
  field,
  _id,
  product,
}: INumberFieldContainerProps & { product: IProduct }) => {
  // const { editProduct } = useProductEdit();
  return (
    <NumberField
      value={value}
      scope={`product-${_id}-${field}`}
      onSave={(value) => {
        // editProduct(
        //   {
        //     variables: { ...product, [field]: value },
        //   },
        //   [field],
        // );
      }}
    />
  );
};

export const productColumns: ColumnDef<IProduct>[] = [
  productMoreColumn,
  RecordTable.checkboxColumn as ColumnDef<IProduct>,
  {
    id: 'name',
    accessorKey: 'name',
    header: () => (
      <RecordTable.InlineHead icon={IconLabel} label="Product/Service" />
    ),
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'unitPrice',
    accessorKey: 'unitPrice',
    header: () => (
      <RecordTable.InlineHead icon={IconCurrencyDollar} label="Unit Price" />
    ),
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <CurrencyFormatedDisplay
            currencyValue={{
              amountMicros: cell.getValue() as number,
              currencyCode: CurrencyCode.MNT,
            }}
          />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'quantity',
    accessorKey: 'quantity',
    header: () => (
      <RecordTable.InlineHead icon={IconPentagonNumber1} label="Quantity" />
    ),
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <ProductTextField
            value={cell.getValue() as number}
            field="quantity"
            _id={cell.row.original._id}
            product={cell.row.original}
          />
        </RecordTableInlineCell>
      );
    },
    size: 100,
  },
  {
    id: 'discountPercent',
    accessorKey: 'discountPercent',
    header: () => (
      <RecordTable.InlineHead icon={IconRosetteDiscount} label="Discount %" />
    ),
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <ProductTextField
            value={cell.getValue() as number}
            field="discountPercent"
            _id={cell.row.original._id}
            product={cell.row.original}
          />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'discount',
    accessorKey: 'discount',
    header: () => (
      <RecordTable.InlineHead icon={IconPercentage} label="Discount" />
    ),
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <ProductTextField
            value={(cell.getValue() as number) || 0}
            field="discount"
            _id={cell.row.original._id}
            product={cell.row.original}
          />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'amount',
    accessorKey: 'amount',
    header: () => <RecordTable.InlineHead icon={IconDiamond} label="Amount" />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={`${(cell.getValue() as number) || 0}%`} />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'tick',
    accessorKey: 'tick',
    header: () => <RecordTable.InlineHead label="Tick used" />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          {cell.getValue() ? 'tick' : '-'}
        </RecordTableInlineCell>
      );
    },
    size: 100,
  },
  {
    id: 'vat',
    accessorKey: 'vat',
    header: () => <RecordTable.InlineHead label="Vat applied" />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={`${(cell.getValue() as number) || 0}%`} />
        </RecordTableInlineCell>
      );
    },
    size: 100,
  },
  {
    id: 'assigned',
    accessorKey: 'assigned',
    header: () => (
      <RecordTable.InlineHead icon={IconUser} label="Assigned to" />
    ),
    cell: ({ cell }) => {
      const createdUser = cell.getValue() as any;
      const name = createdUser?.details?.fullName || createdUser?.email || '—';
      return (
        <div className="mx-2 my-1 p-1 inline-flex items-center rounded-sm px-2 whitespace-nowrap font-medium w-fit h-6 text-xs border gap-1 bg-accent">
          <span className="text-sm text-gray-700">{name}</span>
        </div>
      );
    },
  },
];
