import {
  IconLabel,
  IconMobiledata,
  IconClock,
  IconUser,
  IconTag,
} from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import {
  RecordTable,
  TextOverflowTooltip,
  RecordTableInlineCell,
  RelativeDateDisplay,
  Badge,
} from 'erxes-ui';

import { IOrder } from '@/pos/types/order';
import { ordersMoreColumn } from '@/pos/orders/components/OrdersMoreColumn';
import { ClickableBillNumber } from './ClickableBillNumber';

export const generateOtherPaymentColumns = (
  summary: any,
): ColumnDef<unknown>[] => {
  const otherPayTitles = (summary ? Object.keys(summary) || [] : [])
    .filter((a) => !['_id'].includes(a))
    .sort();

  return otherPayTitles.map((title: string, index) => ({
    id: `${title}_${index}`,
    header: () => <RecordTable.InlineHead icon={IconClock} label={title} />,
    cell: ({ row }: any) => {
      const order = row.original;
      const value = order[title] || 0;

      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={value?.toLocaleString()} />
        </RecordTableInlineCell>
      );
    },
    size: 150,
  }));
};
export const firstOrderColumns: ColumnDef<IOrder>[] = [
  ordersMoreColumn,
  {
    id: 'number',
    accessorKey: 'number',
    header: () => (
      <RecordTable.InlineHead icon={IconLabel} label="Bill Number" />
    ),
    cell: ({ cell, row }) => {
      return (
        <ClickableBillNumber value={cell.getValue() as string} row={row} />
      );
    },
  },
  {
    id: 'paidDate',
    accessorKey: 'paidDate',
    header: () => <RecordTable.InlineHead icon={IconMobiledata} label="Date" />,
    cell: ({ cell }) => {
      return (
        <RelativeDateDisplay value={cell.getValue() as string} asChild>
          <RecordTableInlineCell className="text-xs font-medium text-muted-foreground">
            <RelativeDateDisplay.Value value={cell.getValue() as string} />
          </RecordTableInlineCell>
        </RelativeDateDisplay>
      );
    },
  },
  {
    id: 'cashAmount',
    accessorKey: 'cashAmount',
    header: () => (
      <RecordTable.InlineHead icon={IconLabel} label="Cash Amount" />
    ),
    cell: ({ cell }) => {
      const value = cell.getValue() as number;
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={value?.toLocaleString()} />
        </RecordTableInlineCell>
      );
    },
    size: 150,
  },
  {
    id: 'mobileAmount',
    accessorKey: 'mobileAmount',
    header: () => (
      <RecordTable.InlineHead icon={IconLabel} label="Mobile Amount" />
    ),
    cell: ({ cell }) => {
      const value = cell.getValue() as number;
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={value?.toLocaleString()} />
        </RecordTableInlineCell>
      );
    },
    size: 150,
  },
];

export const secondOrderColumns: ColumnDef<IOrder>[] = [
  {
    id: 'totalAmount',
    accessorKey: 'totalAmount',
    header: () => <RecordTable.InlineHead icon={IconLabel} label="Amount" />,
    cell: ({ cell }) => {
      const value = cell.getValue() as number;
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={value?.toLocaleString()} />
        </RecordTableInlineCell>
      );
    },
    size: 150,
  },
  {
    id: 'customerType',
    accessorKey: 'customerType',
    header: () => <RecordTable.InlineHead icon={IconClock} label="Customer" />,
    cell: ({ cell }) => {
      const value = cell.getValue() as string;
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={value} />
        </RecordTableInlineCell>
      );
    },
    size: 150,
  },
  {
    id: 'posName',
    accessorKey: 'posName',
    header: () => <RecordTable.InlineHead icon={IconUser} label="Pos" />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
    size: 120,
  },
  {
    id: 'type',
    accessorKey: 'type',
    header: () => <RecordTable.InlineHead icon={IconTag} label="Type" />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <Badge variant="default">{cell.getValue() as string}</Badge>
        </RecordTableInlineCell>
      );
    },
    size: 100,
  },
  {
    id: 'user',
    accessorKey: 'user',
    header: () => <RecordTable.InlineHead icon={IconUser} label="User" />,
    cell: ({ cell }) => {
      const user = cell.getValue() as any;
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={user?.username || ''} />
        </RecordTableInlineCell>
      );
    },
    size: 150,
  },
];

export const orderColumns: ColumnDef<IOrder>[] = [
  ...firstOrderColumns,
  ...secondOrderColumns,
];
