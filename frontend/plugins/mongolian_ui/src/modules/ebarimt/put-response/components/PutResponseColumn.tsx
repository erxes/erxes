import {
  IconCategory,
  IconCurrencyDollar,
  IconHash,
  IconLabel,
  IconUser,
} from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import {
  RecordTable,
  TextOverflowTooltip,
  RecordTableInlineCell,
  RelativeDateDisplay,
} from 'erxes-ui';
import { IPutResponse } from '~/modules/ebarimt/put-response/types/PutResponseType';
import { putResponseMoreColumn } from '~/modules/ebarimt/put-response/components/PutResponseMoreColumn';
export const putResponseColumns: ColumnDef<IPutResponse>[] = [
  putResponseMoreColumn,
  RecordTable.checkboxColumn as ColumnDef<IPutResponse>,
  {
    id: 'id',
    accessorKey: 'id',
    header: () => <RecordTable.InlineHead icon={IconHash} label="Bill ID" />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'billId',
    accessorKey: 'billId',
    header: () => (
      <RecordTable.InlineHead icon={IconLabel} label="Subbillids" />
    ),
    cell: ({ row }) => {
      const receipts = row.original.receipts;
      const receiptId = receipts?.[0]?.id || '-';
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={receiptId} />
        </RecordTableInlineCell>
      );
    },
  },

  {
    id: 'number',
    accessorKey: 'number',
    header: () => (
      <RecordTable.InlineHead icon={IconCurrencyDollar} label="Number" />
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
    header: () => <RecordTable.InlineHead icon={IconUser} label="Date" />,
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
    id: 'status',
    accessorKey: 'status',
    header: () => <RecordTable.InlineHead icon={IconCategory} label="Status" />,
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
    header: () => (
      <RecordTable.InlineHead icon={IconCategory} label="Bill Type" />
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
    id: 'receipts',
    accessorKey: 'receipts',
    header: () => (
      <RecordTable.InlineHead icon={IconCategory} label="Receipts" />
    ),
    cell: ({ row }) => {
      const receipts = row.original.receipts;
      if (!receipts || !Array.isArray(receipts) || receipts.length === 0) {
        return (
          <RecordTableInlineCell>
            <TextOverflowTooltip value="-" />
          </RecordTableInlineCell>
        );
      }

      const firstReceipt = receipts[0];
      const items = firstReceipt?.items;

      if (!items || !Array.isArray(items) || items.length === 0) {
        return (
          <RecordTableInlineCell>
            <TextOverflowTooltip value="-" />
          </RecordTableInlineCell>
        );
      }

      const quantity = items[0]?.qty;
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={String(quantity || '')} />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'totalAmount',
    accessorKey: 'totalAmount',
    header: () => <RecordTable.InlineHead icon={IconCategory} label="Amount" />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'message',
    accessorKey: 'message',
    header: () => (
      <RecordTable.InlineHead icon={IconCategory} label="Message" />
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
    id: 'inactiveId',
    accessorKey: 'inactiveId',
    header: () => (
      <RecordTable.InlineHead icon={IconCategory} label="Inactive Id" />
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
    id: 'user',
    accessorKey: 'user',
    header: () => <RecordTable.InlineHead icon={IconCategory} label="User" />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
  },
];
