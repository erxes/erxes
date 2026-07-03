import {
  IconBuilding,
  IconChartBar,
  IconLabel,
  IconClock,
  IconUser,
} from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import {
  RecordTable,
  TextOverflowTooltip,
  RecordTableInlineCell,
  Badge,
} from 'erxes-ui';
import type { TFunction } from 'i18next';

import { IPosItem } from '@/pos/pos-items/types/posItem';
import { PosItemMoreColumn } from '@/pos/pos-items/components/PosItemMoreColumns';
import { ClickableBillNumber } from './ClickableBillNumber';

const fmt = (val: number | null | undefined) =>
  val != null ? val.toLocaleString() : '0';

export const PosItemColumns = (t: TFunction): ColumnDef<IPosItem>[] => [
  PosItemMoreColumn,
  {
    id: 'number',
    accessorKey: 'number',
    header: () => <RecordTable.InlineHead icon={IconLabel} label={t('number')} />,
    cell: ({ cell, row }) => (
      <ClickableBillNumber value={cell.getValue() as string} row={row} />
    ),
  },
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: () => <RecordTable.InlineHead icon={IconLabel} label={t('created-date')} />,
    cell: ({ cell }) => {
      const val = cell.getValue() as string;
      return (
        <RecordTableInlineCell className="text-xs font-medium text-muted-foreground">
          <TextOverflowTooltip
            value={val ? new Date(val).toLocaleDateString() : ''}
          />
        </RecordTableInlineCell>
      );
    },
    size: 150,
  },
  {
    id: 'createdTime',
    accessorKey: 'createdAt',
    header: () => <RecordTable.InlineHead icon={IconLabel} label={t('created-time')} />,
    cell: ({ cell }) => {
      const val = cell.getValue() as string;
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip
            value={val ? new Date(val).toLocaleTimeString() : ''}
          />
        </RecordTableInlineCell>
      );
    },
    size: 150,
  },
  {
    id: 'posName',
    accessorKey: 'posName',
    header: () => <RecordTable.InlineHead icon={IconBuilding} label={t('pos')} />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={(cell.getValue() as string) || ''} />
      </RecordTableInlineCell>
    ),
    size: 150,
  },
  {
    id: 'branch',
    accessorKey: 'branch',
    header: () => <RecordTable.InlineHead icon={IconChartBar} label={t('branch')} />,
    cell: ({ row }) => {
      const b = row.original.branch;
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={b ? `${b.order} - ${b.title}` : ''} />
        </RecordTableInlineCell>
      );
    },
    size: 200,
  },
  {
    id: 'department',
    accessorKey: 'department',
    header: () => <RecordTable.InlineHead icon={IconClock} label={t('department')} />,
    cell: ({ row }) => {
      const d = row.original.department;
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={d ? `${d.order} - ${d.title}` : ''} />
        </RecordTableInlineCell>
      );
    },
    size: 200,
  },
  {
    id: 'user',
    accessorKey: 'user',
    header: () => <RecordTable.InlineHead icon={IconUser} label={t('cashier')} />,
    cell: ({ row }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={row.original.user?.email || ''} />
      </RecordTableInlineCell>
    ),
    size: 200,
  },
  {
    id: 'type',
    accessorKey: 'type',
    header: () => <RecordTable.InlineHead icon={IconUser} label={t('type')} />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <Badge variant="default">{(cell.getValue() as string) || ''}</Badge>
      </RecordTableInlineCell>
    ),
    size: 150,
  },
  {
    id: 'billType',
    accessorKey: 'billType',
    header: () => <RecordTable.InlineHead icon={IconUser} label={t('bill-type')} />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={(cell.getValue() as string) || ''} />
      </RecordTableInlineCell>
    ),
    size: 120,
  },
  {
    id: 'registerNumber',
    accessorKey: 'registerNumber',
    header: () => <RecordTable.InlineHead icon={IconUser} label={t('company-rd')} />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={(cell.getValue() as string) || ''} />
      </RecordTableInlineCell>
    ),
    size: 150,
  },
  {
    id: 'customerType',
    accessorKey: 'customerType',
    header: () => <RecordTable.InlineHead icon={IconUser} label={t('customer-type')} />,
    cell: ({ cell }) => {
      const value = cell.getValue() as string;
      return (
        <RecordTableInlineCell>
          {value ? <Badge variant="default">{value}</Badge> : ''}
        </RecordTableInlineCell>
      );
    },
    size: 150,
  },
  {
    id: 'customer',
    accessorKey: 'customer.primaryEmail',
    header: () => <RecordTable.InlineHead icon={IconUser} label={t('customer')} />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={(cell.getValue() as string) || ''} />
      </RecordTableInlineCell>
    ),
    size: 150,
  },
  {
    id: 'barcode',
    header: () => <RecordTable.InlineHead icon={IconUser} label={t('barcode')} />,
    cell: ({ row }) => {
      const item = row.original.items;
      const barcodes = item?.barcodes ?? item?.product?.barcodes ?? [];
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={barcodes.join(', ')} />
        </RecordTableInlineCell>
      );
    },
    size: 150,
  },
  {
    id: 'factor',
    accessorKey: 'factor',
    header: () => <RecordTable.InlineHead icon={IconUser} label={t('factor')} />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={fmt(cell.getValue() as number)} />
      </RecordTableInlineCell>
    ),
    size: 150,
  },
  {
    id: 'code',
    header: () => <RecordTable.InlineHead icon={IconUser} label={t('code')} />,
    cell: ({ row }) => {
      const item = row.original.items;
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={item?.product?.code || ''} />
        </RecordTableInlineCell>
      );
    },
    size: 150,
  },
  {
    id: 'categoryCode',
    header: () => <RecordTable.InlineHead icon={IconUser} label={t('category-code')} />,
    cell: ({ row }) => {
      const item = row.original.items;
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip
            value={
              item?.productCategoryCode ||
              item?.productCategory?.code ||
              item?.product?.productCategory?.code ||
              ''
            }
          />
        </RecordTableInlineCell>
      );
    },
    size: 150,
  },
  {
    id: 'categoryName',
    header: () => <RecordTable.InlineHead icon={IconUser} label={t('category-name')} />,
    cell: ({ row }) => {
      const item = row.original.items;
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip
            value={
              item?.productCategoryName ||
              item?.productCategory?.name ||
              item?.product?.productCategory?.name ||
              ''
            }
          />
        </RecordTableInlineCell>
      );
    },
    size: 200,
  },
  {
    id: 'name',
    header: () => <RecordTable.InlineHead icon={IconUser} label={t('name')} />,
    cell: ({ row }) => {
      const item = row.original.items;
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={item?.product?.name || ''} />
        </RecordTableInlineCell>
      );
    },
    size: 250,
  },
  {
    id: 'count',
    header: () => <RecordTable.InlineHead icon={IconUser} label={t('count')} />,
    cell: ({ row }) => {
      const item = row.original.items;
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip
            value={item?.count != null ? String(item.count) : '0'}
          />
        </RecordTableInlineCell>
      );
    },
    size: 150,
  },
  {
    id: 'firstPrice',
    header: () => <RecordTable.InlineHead icon={IconUser} label={t('first-price')} />,
    cell: ({ row }) => {
      const item = row.original.items;
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={fmt(item?.unitPrice)} />
        </RecordTableInlineCell>
      );
    },
    size: 150,
  },
  {
    id: 'discount',
    header: () => <RecordTable.InlineHead icon={IconUser} label={t('discount')} />,
    cell: ({ row }) => {
      const item = row.original.items;
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={fmt(item?.discountAmount)} />
        </RecordTableInlineCell>
      );
    },
    size: 150,
  },
  {
    id: 'discountType',
    header: () => <RecordTable.InlineHead icon={IconUser} label={t('discount-type')} />,
    cell: ({ row }) => {
      const item = row.original.items;
      let value = '';
      if (item?.discountPercent && item.discountPercent > 0) {
        value = 'Percent';
      } else if (item?.discountAmount && item.discountAmount > 0) {
        value = 'Amount';
      }
      return (
        <RecordTableInlineCell>
          {value ? <Badge variant="default">{value}</Badge> : ''}
        </RecordTableInlineCell>
      );
    },
    size: 150,
  },
  {
    id: 'salePrice',
    header: () => <RecordTable.InlineHead icon={IconUser} label={t('sale-price')} />,
    cell: ({ row }) => {
      const item = row.original.items;
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={fmt(item?.unitPrice)} />
        </RecordTableInlineCell>
      );
    },
    size: 150,
  },
  {
    id: 'totalAmount',
    accessorKey: 'totalAmount',
    header: () => <RecordTable.InlineHead icon={IconUser} label={t('amount')} />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={fmt(cell.getValue() as number)} />
      </RecordTableInlineCell>
    ),
    size: 150,
  },
  {
    id: 'paymentType',
    accessorKey: 'paidAmounts',
    header: () => <RecordTable.InlineHead icon={IconUser} label={t('payment-type')} />,
    cell: ({ row }) => {
      const raw = row.original.paidAmounts;
      const paidAmounts: Array<{ type?: string }> = Array.isArray(raw)
        ? raw
        : raw
          ? [raw as { type?: string }]
          : [];
      const types = paidAmounts
        .map((pa) => pa.type)
        .filter((t): t is string => Boolean(t))
        .join(', ');
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={types} />
        </RecordTableInlineCell>
      );
    },
    size: 200,
  },
];
