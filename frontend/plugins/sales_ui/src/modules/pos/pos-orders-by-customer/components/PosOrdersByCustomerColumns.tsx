import { IconLabel } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import {
  RecordTable,
  TextOverflowTooltip,
  RecordTableInlineCell,
} from 'erxes-ui';

import { IPosOrdersByCustomer } from '@/pos/pos-orders-by-customer/types/posOrdersByCustomerType';
import { PosOrdersByCustomerMoreColumn } from '@/pos/pos-orders-by-customer/components/PosOrdersByCustomerMoreColumn';

export const PosOrdersByCustomerColumns: ColumnDef<IPosOrdersByCustomer>[] = [
  PosOrdersByCustomerMoreColumn,
  RecordTable.checkboxColumn as ColumnDef<IPosOrdersByCustomer>,
  {
    id: 'customerType',
    accessorKey: 'customerType',
    header: () => <RecordTable.InlineHead icon={IconLabel} label="Type" />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'customerDetail.primaryName',
    accessorKey: 'customerDetail.primaryName',
    header: () => (
      <RecordTable.InlineHead icon={IconLabel} label="Customer Name" />
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
    id: 'customerDetail.emails.email',
    accessorKey: 'customerDetail.emails.email',
    header: () => (
      <RecordTable.InlineHead icon={IconLabel} label="Customer Email" />
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
    id: 'totalOrders',
    accessorKey: 'totalOrders',
    header: () => (
      <RecordTable.InlineHead icon={IconLabel} label="Orders Count" />
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
    id: 'totalAmount',
    accessorKey: 'totalAmount',
    header: () => (
      <RecordTable.InlineHead icon={IconLabel} label="Total Amount" />
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
    id: 'customerType',
    accessorKey: 'customerType',
    header: () => <RecordTable.InlineHead icon={IconLabel} label="Type" />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
  },
];
