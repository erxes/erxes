'use client';

import {
  CheckInputField,
  ProductAssigneeField,
  ProductCalculatedNumberField,
  ProductNumberField,
} from './getProductColumns';
import {
  CURRENCY_CODES,
  CurrencyCode,
  RecordTable,
  RecordTableInlineCell,
  TextOverflowTooltip,
  formatAmount,
} from 'erxes-ui';
import {
  IconCurrencyDollar,
  IconDiamond,
  IconLabel,
  IconPentagonNumber1,
  IconUser,
  IconShoppingCart,
} from '@tabler/icons-react';
import {
  ProductNameCell,
  getProductId,
  hasDuplicateProductId,
} from './ProductNameCell';

import { ColumnDef } from '@tanstack/table-core';
import { IProductData } from 'ui-modules';
import { ProductTypeIcon } from './ProductTypeIcon';
import { productMoreColumn } from './ProductMoreColumn';
import { TFunction } from 'i18next';

export const productColumns = (t: TFunction): ColumnDef<IProductData>[] => [
  productMoreColumn(),
  RecordTable.checkboxColumn as ColumnDef<IProductData>,
  {
    id: 'type',
    accessorKey: 'product.type',
    header: () => (
      <RecordTable.InlineHead icon={IconShoppingCart} label="Type" />
    ),
    cell: ({ cell }) => {
      const type = cell.getValue() as string;
      return (
        <RecordTableInlineCell className="justify-center">
          <ProductTypeIcon type={type} />
        </RecordTableInlineCell>
      );
    },
    size: 80,
  },
  {
    id: 'name',
    accessorKey: 'name',
    accessorFn: (row) => row.product?.name,
    header: () => (
      <RecordTable.InlineHead icon={IconLabel} label={t('product-service')} />
    ),
    cell: ({ cell, table }) => {
      const productId = getProductId(cell.row.original);
      const hasDuplicateProduct = hasDuplicateProductId(
        table.options.data,
        productId,
      );

      return (
        <ProductNameCell cell={cell} hasDuplicateProduct={hasDuplicateProduct} />
      );
    },
    size: 260,
  },
  {
    id: 'unitPrice',
    accessorKey: 'unitPrice',
    header: () => (
      <RecordTable.InlineHead
        icon={IconCurrencyDollar}
        label={t('unit-price')}
      />
    ),
    cell: ({ cell }) => {
      const currencyCode = cell.row.original.currency;
      const CurrencyIcon = currencyCode
        ? CURRENCY_CODES[currencyCode as CurrencyCode]?.Icon
        : null;
      return (
        <RecordTableInlineCell>
          <ProductNumberField
            value={Number(cell.getValue()) || 0}
            field="unitPrice"
            _id={cell.row.original._id}
            product={cell.row.original}
            formatValue={(v: number) => formatAmount(v)}
            calculateProduct={true}
          >
            {CurrencyIcon && (
              <CurrencyIcon className="size-4 text-muted-foreground shrink-0" />
            )}
          </ProductNumberField>
        </RecordTableInlineCell>
      );
    },
    size: 110,
  },
  {
    id: 'quantity',
    accessorKey: 'quantity',
    header: () => (
      <RecordTable.InlineHead
        icon={IconPentagonNumber1}
        label={t('quantity')}
      />
    ),
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <ProductCalculatedNumberField
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
    header: () => <RecordTable.InlineHead label={t('discount-percent')} />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <ProductCalculatedNumberField
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
    header: () => <RecordTable.InlineHead label={t('discount')} />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <ProductCalculatedNumberField
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
    header: () => (
      <RecordTable.InlineHead icon={IconDiamond} label={t('amount')} />
    ),
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
    header: () => <RecordTable.InlineHead label={t('tick-used')} />,
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
    header: () => <RecordTable.InlineHead label={t('vat-applied')} />,
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
    id: 'assignUserId',
    accessorKey: 'assignUserId',
    header: () => (
      <RecordTable.InlineHead icon={IconUser} label={t('assigned-to')} />
    ),
    cell: ({ cell }) => {
      const assignedUserId =
        cell.row.original.assignUserId || cell.row.original.assignedUserId;

      return (
        <ProductAssigneeField
          value={assignedUserId ? [assignedUserId] : []}
          field="assignUserId"
          _id={cell.row.original._id}
          product={cell.row.original}
        />
      );
    },
  },
];
