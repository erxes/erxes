import {
  IconBuilding,
  IconChartBar,
  IconLabel,
  IconMobiledata,
  IconPhone,
  IconClock,
  IconUser,
} from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import {
  RecordTable,
  TextOverflowTooltip,
  RecordTableInlineCell,
} from 'erxes-ui';

import { IOrder } from '@/pos/types/order';
import { ordersMoreColumn } from '@/pos/orders/components/OrdersMoreColumn';

export const orderColumns: ColumnDef<IOrder>[] = [
  ordersMoreColumn,
  RecordTable.checkboxColumn as ColumnDef<IOrder>,
  {
    id: 'number',
    accessorKey: 'number',
    header: () => (
      <RecordTable.InlineHead icon={IconLabel} label="Bill Number" />
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
    id: 'paidDate',
    accessorKey: 'paidDate',
    header: () => <RecordTable.InlineHead icon={IconMobiledata} label="Date" />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
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
    id: 'customer',
    accessorKey: 'customer',
    header: () => <RecordTable.InlineHead icon={IconClock} label="Customer" />,
    cell: ({ cell }) => {
      const value = cell.getValue() as string;
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={value || 'N/A'} />
        </RecordTableInlineCell>
      );
    },
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
  },
  {
    id: 'type',
    accessorKey: 'type',
    header: () => <RecordTable.InlineHead icon={IconUser} label="Type" />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'user.email',
    accessorKey: 'user.email',
    header: () => <RecordTable.InlineHead icon={IconUser} label="User" />,
    cell: ({ cell }) => {
      const value = cell.getValue() as string;
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={value || 'N/A'} />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'actions',
    accessorKey: 'actions',
    header: () => <RecordTable.InlineHead icon={IconUser} label="Actions" />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
  },
];
