import {
  IconBuilding,
  IconChartBar,
  IconLabel,
  IconMobiledata,
  IconPhone,
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

export const orderColumns: ColumnDef<IOrder>[] = [
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
      <RecordTable.InlineHead icon={IconPhone} label="Cash Amount" />
    ),
    cell: ({ cell }) => {
      const value = cell.getValue() as number;
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={value?.toLocaleString() || '0'} />
        </RecordTableInlineCell>
      );
    },
    size: 120,
  },
  {
    id: 'mobileAmount',
    accessorKey: 'mobileAmount',
    header: () => (
      <RecordTable.InlineHead icon={IconBuilding} label="Mobile Amount" />
    ),
    cell: ({ cell }) => {
      const value = cell.getValue() as number;
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={value?.toLocaleString() || '0'} />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'loyalty',
    accessorKey: 'loyalty',
    header: () => <RecordTable.InlineHead icon={IconClock} label="Loyalty" />,
    cell: ({ cell }) => {
      const value = cell.getValue() as string;
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={value} />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'paidAmounts',
    accessorKey: 'paidAmounts',
    header: () => (
      <RecordTable.InlineHead icon={IconClock} label="Paid Amounts" />
    ),
    cell: ({ cell }) => {
      const value = cell.getValue() as any;
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={JSON.stringify(value)} />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'totalAmount',
    accessorKey: 'totalAmount',
    header: () => <RecordTable.InlineHead icon={IconChartBar} label="Amount" />,
    cell: ({ cell }) => {
      const value = cell.getValue() as number;
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={value?.toLocaleString() || '0'} />
        </RecordTableInlineCell>
      );
    },
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
    size: 120,
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
    size: 80,
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
    size: 80,
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
    size: 120,
  },
];
