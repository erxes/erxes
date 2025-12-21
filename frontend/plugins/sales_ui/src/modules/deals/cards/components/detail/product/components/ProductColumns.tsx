'use client';

import {
  CheckInputField,
  ProductAssigneeField,
  ProductNumberField,
} from '../hooks/getProductColumns';
import {
  CurrencyCode,
  CurrencyFormatedDisplay,
  RecordTable,
  RecordTableInlineCell,
  TextOverflowTooltip,
} from 'erxes-ui';
import {
  IconCurrencyDollar,
  IconDiamond,
  IconLabel,
  IconPentagonNumber1,
  IconUser,
} from '@tabler/icons-react';

import { ColumnDef } from '@tanstack/table-core';
import { IProductData } from 'ui-modules';
import { productMoreColumn } from './ProductMoreColumn';

export const productColumns: ColumnDef<IProductData>[] = [
  productMoreColumn,
  RecordTable.checkboxColumn as ColumnDef<IProductData>,
  {
    id: 'name',
    accessorKey: 'name',
    accessorFn: (row) => row.product?.name,
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
    accessorFn: (row) => row.product?.unitPrice,
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
          <ProductNumberField
            value={Number(cell.getValue()) || 0}
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
    header: () => <RecordTable.InlineHead label="Discount %" />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <ProductNumberField
            value={Number(cell.getValue()) || 0}
            field="discountPercent"
            _id={cell.row.original._id}
            product={cell.row.original}
          />
        </RecordTableInlineCell>
      );
    },
    size: 100,
  },
  {
    id: 'discount',
    accessorKey: 'discount',
    header: () => <RecordTable.InlineHead label="Discount" />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <ProductNumberField
            value={Number(cell.getValue()) || 0}
            field="discount"
            _id={cell.row.original._id}
            product={cell.row.original}
          />
        </RecordTableInlineCell>
      );
    },
    size: 100,
  },
  {
    id: 'amount',
    accessorKey: 'amount',
    accessorFn: (row) => {
      const quantity = row.quantity || 0;
      const unitPrice = row.unitPrice || row.product?.unitPrice || 0;
      const discount = row.discount || 0;

      return quantity * unitPrice - discount;
    },
    header: () => <RecordTable.InlineHead icon={IconDiamond} label="Amount" />,
    cell: ({ cell }) => {
      const value = cell.getValue() as number;

      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={`${value.toLocaleString()}₮`} />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'tickUsed',
    accessorKey: 'tickUsed',
    header: () => <RecordTable.InlineHead label="Tick used" />,
    cell: ({ cell }) => {
      const value = !!cell.getValue() as boolean;
      return (
        <CheckInputField
          value={value}
          field="tickUsed"
          product={cell.row.original}
        />
      );
    },
    size: 100,
  },
  {
    id: 'isVatApplied',
    accessorKey: 'isVatApplied',
    header: () => <RecordTable.InlineHead label="Vat applied" />,
    cell: ({ cell }) => {
      const value = !!cell.getValue() as boolean;
      return (
        <CheckInputField
          value={value}
          field="isVatApplied"
          product={cell.row.original}
        />
      );
    },
    size: 120,
  },
  {
    id: 'assignedUserId',
    accessorKey: 'assignedUserId',
    header: () => (
      <RecordTable.InlineHead icon={IconUser} label="Assigned to" />
    ),
    cell: ({ cell }) => {
      return (
        <ProductAssigneeField
          value={
            cell.row.original.assignedUserId
              ? [cell.row.original.assignedUserId]
              : []
          }
          field="assignedUserId"
          _id={cell.row.original._id}
          product={cell.row.original}
        />
      );
    },
  },
];
