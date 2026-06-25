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
import { useTranslation } from 'react-i18next';
import { IPutResponse } from '~/modules/ebarimt/put-response/types/PutResponseType';
import { putResponseMoreColumn } from '~/modules/ebarimt/put-response/components/PutResponseMoreColumn';

const HeaderCell = ({ icon, label }: { icon: any; label: string }) => {
  const { t } = useTranslation('mongolian');
  return <RecordTable.InlineHead icon={icon} label={t(label)} />;
};

export const putResponseColumns: ColumnDef<IPutResponse>[] = [
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
