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

import { IPosItem } from '@/pos/pos-items/types/posItem';
import { PosItemMoreColumn } from '@/pos/pos-items/components/PosItemMoreColumns';
import { ClickableBillNumber } from './ClickableBillNumber';

const fmt = (val: number | null | undefined) =>
  val != null ? val.toLocaleString() : '0';

export const PosItemColumns: ColumnDef<IPosItem>[] = [
  PosItemMoreColumn,
  {
    id: 'number',
    accessorKey: 'number',
    header: () => <RecordTable.InlineHead icon={IconLabel} label="Number" />,
    cell: ({ cell, row }) => (
      <ClickableBillNumber value={cell.getValue() as string} row={row} />
    ),
  },
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: () => (
      <RecordTable.InlineHead icon={IconLabel} label="Created Date" />
    ),
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
    header: () => (
      <RecordTable.InlineHead icon={IconLabel} label="Created Time" />
    ),
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
    header: () => <RecordTable.InlineHead icon={IconBuilding} label="Pos" />,
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
    header: () => (
      <RecordTable.InlineHead icon={IconChartBar} label="Branch" />
    ),
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
    header: () => (
      <RecordTable.InlineHead icon={IconClock} label="Department" />
    ),
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
    header: () => <RecordTable.InlineHead icon={IconUser} label="Cashier" />,
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
    header: () => <RecordTable.InlineHead icon={IconUser} label="Type" />,
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
    header: () => (
      <RecordTable.InlineHead icon={IconUser} label="Bill Type" />
    ),
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
    header: () => (
      <RecordTable.InlineHead icon={IconUser} label="Company RD" />
    ),
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
    header: () => (
      <RecordTable.InlineHead icon={IconUser} label="Customer Type" />
    ),
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
    header: () => <RecordTable.InlineHead icon={IconUser} label="Customer" />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={(cell.getValue() as string) || ''} />
      </RecordTableInlineCell>
    ),
    size: 150,
  },
  {
    id: 'barcode',
    header: () => <RecordTable.InlineHead icon={IconUser} label="Barcode" />,
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
    header: () => <RecordTable.InlineHead icon={IconUser} label="Factor" />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={fmt(cell.getValue() as number)} />
      </RecordTableInlineCell>
    ),
    size: 150,
  },
  {
    id: 'code',
    header: () => <RecordTable.InlineHead icon={IconUser} label="Code" />,
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
    header: () => (
      <RecordTable.InlineHead icon={IconUser} label="Category Code" />
    ),
    cell: ({ row }) => {
      const item = row.original.items;
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip
            value={
              item?.productCategoryCode ||
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
    header: () => (
      <RecordTable.InlineHead icon={IconUser} label="Category Name" />
    ),
    cell: ({ row }) => {
      const item = row.original.items;
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip
            value={
              item?.productCategoryName ||
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
    header: () => <RecordTable.InlineHead icon={IconUser} label="Name" />,
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
    header: () => <RecordTable.InlineHead icon={IconUser} label="Count" />,
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
    header: () => (
      <RecordTable.InlineHead icon={IconUser} label="First Price" />
    ),
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
    header: () => <RecordTable.InlineHead icon={IconUser} label="Discount" />,
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
    accessorKey: 'discountType',
    header: () => (
      <RecordTable.InlineHead icon={IconUser} label="Discount Type" />
    ),
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
    id: 'salePrice',
    header: () => (
      <RecordTable.InlineHead icon={IconUser} label="Sale Price" />
    ),
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
    header: () => <RecordTable.InlineHead icon={IconUser} label="Amount" />,
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
    header: () => (
      <RecordTable.InlineHead icon={IconUser} label="Payment Type" />
    ),
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
