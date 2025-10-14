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
  Badge,
} from 'erxes-ui';

import { IOrder } from '../../types/order';
import { ordersMoreColumn } from './OrdersMoreColumn';

export const orderColumns: ColumnDef<IOrder>[] = [
  ordersMoreColumn,
  RecordTable.checkboxColumn as ColumnDef<IOrder>,
  {
    id: 'billNumber',
    accessorKey: 'billNumber',
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
    id: 'date',
    accessorKey: 'date',
    header: () => <RecordTable.InlineHead icon={IconMobiledata} label="Date" />,
    cell: ({ cell }) => {
      const value = cell.getValue() as boolean;
      return (
        <RecordTableInlineCell>
          <Badge variant={value ? 'success' : 'secondary'}>
            {value ? 'Online' : 'Offline'}
          </Badge>
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
      const value = cell.getValue() as boolean;
      return (
        <RecordTableInlineCell>
          <Badge variant="default">{value ? 'On Server' : 'Local Only'}</Badge>
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
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'amount',
    accessorKey: 'amount',
    header: () => <RecordTable.InlineHead icon={IconChartBar} label="Amount" />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'customer',
    accessorKey: 'customer',
    header: () => <RecordTable.InlineHead icon={IconClock} label="Customer" />,
    cell: ({ cell }) => {
      const rawDate = cell.getValue() as string;
      const formattedDate = new Date(rawDate).toLocaleString();

      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={formattedDate} />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'pos',
    accessorKey: 'pos',
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
    id: 'user',
    accessorKey: 'user',
    header: () => <RecordTable.InlineHead icon={IconUser} label="User" />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'үйлдлүүд',
    accessorKey: 'үйлдлүүд',
    header: () => <RecordTable.InlineHead icon={IconUser} label="Үйлдлүүд" />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
  },
];
