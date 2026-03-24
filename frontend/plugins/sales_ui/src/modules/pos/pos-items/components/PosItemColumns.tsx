import {
  IconBuilding,
  IconChartBar,
  IconLabel,
  IconPhone,
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

export const PosItemColumns: ColumnDef<IPosItem>[] = [
  PosItemMoreColumn,
  RecordTable.checkboxColumn as ColumnDef<IPosItem>,
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
    id: 'number',
    accessorKey: 'number',
    header: () => <RecordTable.InlineHead icon={IconPhone} label="Number" />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={cell.getValue() as string} />
      </RecordTableInlineCell>
    ),
    size: 200,
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
    accessorKey: 'customer',
    header: () => <RecordTable.InlineHead icon={IconUser} label="Customer" />,
    cell: ({ row }) => {
      const customer = row.original.customer;
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={customer?.primaryEmail || ''} />
        </RecordTableInlineCell>
      );
    },
    size: 150,
  },
  {
    id: 'items',
    accessorKey: 'barcodes',
    header: () => <RecordTable.InlineHead icon={IconUser} label="Barcode" />,
    cell: ({ row }) => {
      const items = row.original.items;
      const barcodes =
        items && items.length > 0 ? items[0]?.barcodes?.join(', ') || '' : '';
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={barcodes} />
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
        <TextOverflowTooltip value={cell.getValue() as string} />
      </RecordTableInlineCell>
    ),
    size: 150,
  },
  {
    id: 'items',
    accessorKey: 'code',
    header: () => <RecordTable.InlineHead icon={IconUser} label="Code" />,
    cell: ({ row }) => {
      const items = row.original.items;
      const productCode =
        items && items.length > 0 ? items[0]?.productCode || '' : '';
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={productCode} />
        </RecordTableInlineCell>
      );
    },
    size: 150,
  },
  {
    id: 'categoryCode',
    accessorKey: 'items',
    header: () => (
      <RecordTable.InlineHead icon={IconUser} label="Category Code" />
    ),
    cell: ({ row }) => {
      const items = row.original.items;
      const categoryCode =
        items && items.length > 0 ? items[0]?.productCategoryCode || '' : '';
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={categoryCode} />
        </RecordTableInlineCell>
      );
    },
    size: 150,
  },
  {
    id: 'items.categoryName',
    accessorKey: 'items',
    header: () => (
      <RecordTable.InlineHead icon={IconUser} label="Category Name" />
    ),
    cell: ({ row }) => {
      const items = row.original.items;
      const categoryName =
        items && items.length > 0 ? items[0]?.productCategoryName || '' : '';
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={categoryName} />
        </RecordTableInlineCell>
      );
    },
    size: 150,
  },
  {
    id: 'items',
    accessorKey: 'name',
    header: () => <RecordTable.InlineHead icon={IconUser} label="Name" />,
    cell: ({ row }) => {
      const items = row.original.items;
      const productName =
        items && items.length > 0 ? items[0]?.productName || '' : '';
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={productName} />
        </RecordTableInlineCell>
      );
    },
    size: 200,
  },
  {
    id: 'items',
    accessorKey: 'count',
    header: () => <RecordTable.InlineHead icon={IconUser} label="Count" />,
    cell: ({ row }) => {
      const items = row.original.items;
      const count =
        items && items.length > 0 ? items[0]?.count?.toString() || '' : '';
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={count} />
        </RecordTableInlineCell>
      );
    },
    size: 150,
  },
  {
    id: 'items',
    accessorKey: 'firstPrice',
    header: () => (
      <RecordTable.InlineHead icon={IconUser} label="First Price" />
    ),
    cell: ({ row }) => {
      const items = row.original.items;
      const unitPrice =
        items && items.length > 0 ? items[0]?.unitPrice?.toString() || '' : '';
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={unitPrice} />
        </RecordTableInlineCell>
      );
    },
    size: 150,
  },
  {
    id: 'items',
    accessorKey: 'discount',
    header: () => <RecordTable.InlineHead icon={IconUser} label="Discount" />,
    cell: ({ row }) => {
      const items = row.original.items;
      const discountAmount =
        items && items.length > 0
          ? items[0]?.discountAmount?.toString() || ''
          : '';
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={discountAmount} />
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
    id: 'items',
    accessorKey: 'salePrice',
    header: () => <RecordTable.InlineHead icon={IconUser} label="Sale Price" />,
    cell: ({ row }) => {
      const items = row.original.items;
      const salePrice =
        items && items.length > 0 ? items[0]?.unitPrice?.toString() || '' : '';
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={salePrice} />
        </RecordTableInlineCell>
      );
    },
    size: 150,
  },
  {
    id: 'items',
    accessorKey: 'amount',
    header: () => <RecordTable.InlineHead icon={IconUser} label="Amount" />,
    cell: ({ row }) => {
      const paidAmounts = row.original.paidAmounts || [];
      const totalAmount = paidAmounts
        .map((pa: any) => pa.amount || 0)
        .reduce((sum: number, amount: number) => sum + amount, 0)
        .toString();
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={totalAmount} />
        </RecordTableInlineCell>
      );
    },
    size: 150,
  },
  {
    id: 'items',
    accessorKey: 'paidAmounts',
    header: () => (
      <RecordTable.InlineHead icon={IconUser} label="Payment Type" />
    ),
    cell: ({ cell }) => {
      const paidAmounts = cell.getValue() as Array<{ type: string }>;
      const types = paidAmounts
        .map((pa) => pa.type)
        .filter((t): t is string => t !== undefined && t !== null)
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
