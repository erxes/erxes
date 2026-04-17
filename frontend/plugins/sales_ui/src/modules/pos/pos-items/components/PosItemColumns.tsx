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

export const PosItemColumns: ColumnDef<IPosItem>[] = [
  PosItemMoreColumn,
  {
    id: 'number',
    accessorKey: 'number',
    header: () => <RecordTable.InlineHead icon={IconLabel} label="Number" />,
    cell: ({ cell, row }) => {
      return (
        <ClickableBillNumber value={cell.getValue() as string} row={row} />
      );
    },
  },
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: () => (
      <RecordTable.InlineHead icon={IconLabel} label="Created Date" />
    ),
    cell: ({ cell }) => {
      const createdAt = cell.getValue() as string;
      const date = createdAt ? new Date(createdAt).toLocaleDateString() : '';
      return (
        <RecordTableInlineCell className="text-xs font-medium text-muted-foreground">
          <TextOverflowTooltip value={date} />
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
      const createdAt = cell.getValue() as string;
      const time = createdAt ? new Date(createdAt).toLocaleTimeString() : '';
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={time} />
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
        <TextOverflowTooltip value={cell.getValue() as string} />
      </RecordTableInlineCell>
    ),
    size: 150,
  },
  {
    id: 'branch',
    accessorKey: 'branch',
    header: () => <RecordTable.InlineHead icon={IconChartBar} label="Branch" />,
    cell: ({ row }) => {
      const branch = row.original.branch;
      const branchDisplay = branch ? `${branch.order} - ${branch.title}` : '';
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={branchDisplay} />
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
      const department = row.original.department;
      const departmentDisplay = department
        ? `${department.order} - ${department.title}`
        : '';
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={departmentDisplay} />
        </RecordTableInlineCell>
      );
    },
    size: 200,
  },
  {
    id: 'user',
    accessorKey: 'user',
    header: () => <RecordTable.InlineHead icon={IconUser} label="Cashier" />,
    cell: ({ row }) => {
      const user = row.original.user;
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={user?.email || ''} />
        </RecordTableInlineCell>
      );
    },
    size: 200,
  },
  {
    id: 'type',
    accessorKey: 'type',
    header: () => <RecordTable.InlineHead icon={IconUser} label="Type" />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <Badge variant="default">{cell.getValue() as string}</Badge>
      </RecordTableInlineCell>
    ),
    size: 150,
  },
  {
    id: 'billType',
    accessorKey: 'billType',
    header: () => <RecordTable.InlineHead icon={IconUser} label="Bill Type" />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={cell.getValue() as string} />
      </RecordTableInlineCell>
    ),
    size: 120,
  },
  {
    id: 'registerNumber',
    accessorKey: 'registerNumber',
    header: () => <RecordTable.InlineHead icon={IconUser} label="Company RD" />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={cell.getValue() as string} />
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
        <TextOverflowTooltip value={cell.getValue() as string} />
      </RecordTableInlineCell>
    ),
    size: 150,
  },
  {
    id: 'barcode',
    header: () => <RecordTable.InlineHead icon={IconUser} label="Barcode" />,
    cell: ({ row }) => {
      const item = row.original.items?.[0];
      const barcodes = item?.product?.barcodes;
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={(barcodes || []).join(', ')} />
        </RecordTableInlineCell>
      );
    },
    size: 150,
  },
  {
    id: 'code',
    header: () => <RecordTable.InlineHead icon={IconUser} label="Code" />,
    cell: ({ row }) => {
      const item = row.original.items?.[0];
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
      const item = row.original.items?.[0];
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={item?.productCategoryCode || ''} />
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
      const item = row.original.items?.[0];
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={item?.productCategoryName || ''} />
        </RecordTableInlineCell>
      );
    },
    size: 200,
  },
  {
    id: 'name',
    header: () => <RecordTable.InlineHead icon={IconUser} label="Name" />,
    cell: ({ row }) => {
      const item = row.original.items?.[0];
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
      const item = row.original.items?.[0];
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={item?.count != null ? String(item.count) : '0'} />
        </RecordTableInlineCell>
      );
    },
    size: 150,
  },
  {
    id: 'unitPrice',
    header: () => (
      <RecordTable.InlineHead icon={IconUser} label="Unit Price" />
    ),
    cell: ({ row }) => {
      const item = row.original.items?.[0];
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={item?.unitPrice != null ? item.unitPrice.toLocaleString() : '0'} />
        </RecordTableInlineCell>
      );
    },
    size: 150,
  },
  {
    id: 'discount',
    header: () => <RecordTable.InlineHead icon={IconUser} label="Discount" />,
    cell: ({ row }) => {
      const item = row.original.items?.[0];
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={item?.discountAmount != null ? item.discountAmount.toLocaleString() : '0'} />
        </RecordTableInlineCell>
      );
    },
    size: 150,
  },
  {
    id: 'discountPercent',
    header: () => (
      <RecordTable.InlineHead icon={IconUser} label="Discount %" />
    ),
    cell: ({ row }) => {
      const item = row.original.items?.[0];
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={item?.discountPercent != null ? `${item.discountPercent}%` : '0%'} />
        </RecordTableInlineCell>
      );
    },
    size: 120,
  },
  {
    id: 'totalAmount',
    accessorKey: 'totalAmount',
    header: () => <RecordTable.InlineHead icon={IconUser} label="Amount" />,
    cell: ({ cell }) => {
      const val = cell.getValue() as number | undefined;
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={val != null ? val.toLocaleString() : '0'} />
        </RecordTableInlineCell>
      );
    },
    size: 150,
  },
  {
    id: 'paymentType',
    header: () => (
      <RecordTable.InlineHead icon={IconUser} label="Payment Type" />
    ),
    cell: ({ row }) => {
      const paidAmounts = row.original.paidAmounts;
      const types = (paidAmounts || [])
        .map((pa) => pa.type)
        .filter((t): t is string => !!t)
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
