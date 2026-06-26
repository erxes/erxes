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
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation('sales');
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
            <Tooltip.Content>{t('service')}</Tooltip.Content>
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
            <Tooltip.Content>{t('product')}</Tooltip.Content>
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
    header: () => {
      const { t } = useTranslation('sales');
      return <RecordTable.InlineHead icon={IconLabel} label={t('product-service')} />;
    },
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
    header: () => {
      const { t } = useTranslation('sales');
      return <RecordTable.InlineHead icon={IconCurrencyDollar} label={t('unit-price')} />;
    },
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
    header: () => {
      const { t } = useTranslation('sales');
      return <RecordTable.InlineHead icon={IconPentagonNumber1} label={t('quantity')} />;
    },
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
    header: () => {
      const { t } = useTranslation('sales');
      return <RecordTable.InlineHead label={t('discount-percent')} />;
    },
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
    header: () => {
      const { t } = useTranslation('sales');
      return <RecordTable.InlineHead label={t('discount')} />;
    },
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
    header: () => {
      const { t } = useTranslation('sales');
      return <RecordTable.InlineHead icon={IconDiamond} label={t('amount')} />;
    },
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
    header: () => {
      const { t } = useTranslation('sales');
      return <RecordTable.InlineHead label={t('tick-used')} />;
    },
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
    header: () => {
      const { t } = useTranslation('sales');
      return <RecordTable.InlineHead label={t('vat-applied')} />;
    },
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
    header: () => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { t } = useTranslation('sales');
      return <RecordTable.InlineHead icon={IconUser} label={t('assigned-to')} />;
    },
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
