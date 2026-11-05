import {
  IconCategory,
  IconCurrencyDollar,
  IconHash,
  IconLabel,
  IconUser,
} from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import { format } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import {
  TextOverflowTooltip,
  RecordTableInlineCell,
} from 'erxes-ui';
import { IPutResponse } from '~/modules/ebarimt/put-response/types/PutResponseType';
import { putResponseMoreColumn } from '~/modules/ebarimt/put-response/components/PutResponseMoreColumn';
import { HeaderCell } from '~/modules/ebarimt/put-response/components/HeaderCell';

const getDisplayDate = (putResponse: IPutResponse, timeZone: string): string => {
  if (putResponse.date) {
    // The receipt service returns UTC timestamps without a timezone suffix.
    const timestamp = /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}(?:\.\d+)?$/.test(putResponse.date)
      ? `${putResponse.date.replace(' ', 'T')}Z`
      : putResponse.date;
    const date = new Date(timestamp);

    if (!Number.isNaN(date.getTime())) {
      return formatInTimeZone(date, timeZone, 'yyyy-MM-dd HH:mm:ss');
    }
  }

  const { createdAt } = putResponse;
  return createdAt && !Number.isNaN(Date.parse(createdAt))
    ? format(new Date(createdAt), 'yyyy-MM-dd HH:mm:ss')
    : '-';
};

export const putResponseColumns = (timeZone: string): ColumnDef<IPutResponse>[] => [
  putResponseMoreColumn,
  {
    id: 'id',
    accessorKey: 'id',
    header: () => <HeaderCell icon={IconHash} label="bill-id" />,
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
    header: () => <HeaderCell icon={IconLabel} label="sub-bill-ids" />,
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
    header: () => <HeaderCell icon={IconCurrencyDollar} label="number" />,
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
    header: () => <HeaderCell icon={IconUser} label="date" />,
    cell: ({ row }) => {
      const displayDate = getDisplayDate(row.original, timeZone);

      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={displayDate} />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: () => <HeaderCell icon={IconCategory} label="status" />,
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
    header: () => <HeaderCell icon={IconCategory} label="bill-type" />,
    cell: ({ row }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={row.original.type} />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'receipts',
    accessorKey: 'receipts',
    header: () => <HeaderCell icon={IconCategory} label="receipts" />,
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
    header: () => <HeaderCell icon={IconCategory} label="amount" />,
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
    header: () => <HeaderCell icon={IconCategory} label="message" />,
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
    header: () => <HeaderCell icon={IconCategory} label="inactive-id" />,
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
    header: () => <HeaderCell icon={IconCategory} label="user" />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
  },
];
