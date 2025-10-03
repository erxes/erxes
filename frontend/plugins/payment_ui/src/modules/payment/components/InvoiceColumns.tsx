import { IconAlignLeft, IconCalendarPlus, IconHash } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import {
  Badge,
  RecordTable,
  RecordTableInlineCell,
  RelativeDateDisplay,
} from 'erxes-ui';

import { IInvoice } from '~/modules/payment/types/Payment';

export const invoicesColumns: ColumnDef<IInvoice>[] = [
  RecordTable.checkboxColumn as ColumnDef<IInvoice>,
  {
    id: 'invoiceNumber',
    accessorKey: 'invoiceNumber',
    header: () => (
      <RecordTable.InlineHead label="Invoice number" icon={IconAlignLeft} />
    ),
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <Badge>{cell.getValue() as string}</Badge>
        </RecordTableInlineCell>
      );
    },
    size: 250,
  },
  {
    id: 'description',
    accessorKey: 'description',
    header: () => (
      <RecordTable.InlineHead label="description" icon={IconHash} />
    ),
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          {cell.getValue() as string}
        </RecordTableInlineCell>
      );
    },
    size: 350,
  },
  {
    id: 'amount',
    accessorKey: 'amount',
    header: () => <RecordTable.InlineHead label="amount" icon={IconHash} />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          {cell.getValue() as string}
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'currency',
    accessorKey: 'currency',
    header: () => <RecordTable.InlineHead label="currency" icon={IconHash} />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          {cell.getValue() as string}
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: () => <RecordTable.InlineHead label="status" icon={IconHash} />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <Badge
            variant={
              (cell.getValue() as string) === 'paid' ? 'success' : 'destructive'
            }
          >
            {cell.getValue() as string}
          </Badge>
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: () => (
      <RecordTable.InlineHead label="date created" icon={IconCalendarPlus} />
    ),
    cell: ({ cell }) => {
      return (
        <RelativeDateDisplay value={cell.getValue() as string} asChild>
          <RecordTableInlineCell>
            <RelativeDateDisplay.Value value={cell.getValue() as string} />
          </RecordTableInlineCell>
        </RelativeDateDisplay>
      );
    },
  },
];
