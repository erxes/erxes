/* eslint-disable react-hooks/rules-of-hooks */
'use client';

import {
  CheckInputField,
  ProductAssigneeField,
  ProductCalculatedNumberField,
  ProductNumberField,
} from '../hooks/getProductColumns';
import {
  CURRENCY_CODES,
  CurrencyCode,
  RecordTable,
  RecordTableInlineCell,
  TextOverflowTooltip,
  Tooltip,
  cn,
  formatAmount,
  Badge,
  Popover,
  Input,
} from 'erxes-ui';
import {
  IconCurrencyDollar,
  IconDiamond,
  IconLabel,
  IconPentagonNumber1,
  IconUser,
  IconShoppingCart,
  IconBox,
  IconFileInvoice,
} from '@tabler/icons-react';

import { ColumnDef } from '@tanstack/table-core';
import { IProductData } from 'ui-modules';
import { productMoreColumn } from './ProductMoreColumn';
import { useUpdateProductRecord } from '../hooks/useProductRecord';
import { useState } from 'react';

const DUPLICATE_PRODUCT_CELL_CLASS = 'bg-pink-50/80 dark:bg-pink-950/30';

const getProductId = (productData: IProductData) =>
  productData.productId || productData.product?._id || '';

const hasDuplicateProductId = (
  productsData: IProductData[],
  productId: string,
) => {
  if (!productId) {
    return false;
  }

  return (
    productsData.filter(
      (productData) => getProductId(productData) === productId,
    ).length > 1
  );
};

const IconChooserForType = ({ type }: { type: string }) => {
  switch (type) {
    case 'service':
      return (
        <Tooltip.Provider>
          <Tooltip>
            <Tooltip.Trigger asChild>
              <Badge className="bg-red-400">
                <IconFileInvoice className="size-4 text-white" stroke={2} />
              </Badge>
            </Tooltip.Trigger>
            <Tooltip.Content>Service</Tooltip.Content>
          </Tooltip>
        </Tooltip.Provider>
      );
    case 'product':
      return (
        <Tooltip.Provider>
          <Tooltip>
            <Tooltip.Trigger asChild>
              <Badge className="bg-blue-400">
                <IconBox className="size-4 text-white" stroke={2} />
              </Badge>
            </Tooltip.Trigger>
            <Tooltip.Content>Product</Tooltip.Content>
          </Tooltip>
        </Tooltip.Provider>
      );
    default:
      return null;
  }
};

export const productColumns: ColumnDef<IProductData>[] = [
  productMoreColumn,
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
          <IconChooserForType type={type} />
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
      <RecordTable.InlineHead icon={IconLabel} label="Product/Service" />
    ),
    cell: ({ cell, table }) => {
      const product = cell.row.original.product;
      const productId = getProductId(cell.row.original);
      const hasDuplicateProduct = hasDuplicateProductId(
        table.options.data,
        productId,
      );
      const [open, setOpen] = useState<boolean>(false);
      const [_name, setName] = useState<string>(cell.getValue() as string);
      const { updateRecord } = useUpdateProductRecord();
      const onChange = (el: React.ChangeEvent<HTMLInputElement>) => {
        setName(el.currentTarget.value);
      };
      const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          onSave();
        }
        if (e.key === 'Escape') {
          setName(cell.getValue() as string);
          setOpen(false);
        }
      };

      const onSave = () => {
        if (_name !== cell.getValue()) {
          updateRecord(cell.row.original, {
            product: { ...cell.row.original.product, name: _name },
          });
        }
        setOpen(false);
      };
      return (
        <Popover
          open={open}
          onOpenChange={(open) => {
            setOpen(open);
            if (!open) {
              onSave();
            }
          }}
        >
          <RecordTableInlineCell.Trigger
            className={cn(hasDuplicateProduct && DUPLICATE_PRODUCT_CELL_CLASS)}
          >
            <div className="flex gap-1.5 items-center min-w-0">
              {product?.code && (
                <Badge
                  variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpen(true);
                  }}
                >
                  {product.code}
                </Badge>
              )}
              <span>{product?.name}</span>
            </div>
          </RecordTableInlineCell.Trigger>
          <RecordTableInlineCell.Content>
            <Input
              value={_name}
              onChange={onChange}
              onKeyDown={handleKeyDown}
            />
          </RecordTableInlineCell.Content>
        </Popover>
      );
    },
    size: 260,
  },
  {
    id: 'unitPrice',
    accessorKey: 'unitPrice',
    header: () => (
      <RecordTable.InlineHead icon={IconCurrencyDollar} label="Unit Price" />
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
      <RecordTable.InlineHead icon={IconPentagonNumber1} label="Quantity" />
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
    header: () => <RecordTable.InlineHead label="Discount %" />,
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
    header: () => <RecordTable.InlineHead label="Discount" />,
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
    id: 'assignUserId',
    accessorKey: 'assignUserId',
    header: () => (
      <RecordTable.InlineHead icon={IconUser} label="Assigned to" />
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
