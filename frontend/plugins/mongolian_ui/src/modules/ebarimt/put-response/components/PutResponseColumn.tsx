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
export const putResponseColumns: ColumnDef<IPutResponse>[] = [
  putResponseMoreColumn,
  RecordTable.checkboxColumn as ColumnDef<IPutResponse>,
  {
    id: 'id',
    accessorKey: 'id',
    header: () => {
      const { t } = useTranslation('mongolian');
      return <RecordTable.InlineHead icon={IconHash} label={t('bill-id')} />;
    },
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
    header: () => {
      const { t } = useTranslation('mongolian');
      return <RecordTable.InlineHead icon={IconLabel} label={t('sub-bill-ids')} />;
    },
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
    header: () => {
      const { t } = useTranslation('mongolian');
      return <RecordTable.InlineHead icon={IconCurrencyDollar} label={t('number')} />;
    },
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
    header: () => {
      const { t } = useTranslation('mongolian');
      return <RecordTable.InlineHead icon={IconUser} label={t('date')} />;
    },
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
    header: () => {
      const { t } = useTranslation('mongolian');
      return <RecordTable.InlineHead icon={IconCategory} label={t('status')} />;
    },
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
    header: () => {
      const { t } = useTranslation('mongolian');
      return <RecordTable.InlineHead icon={IconCategory} label={t('bill-type')} />;
    },
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
    header: () => {
      const { t } = useTranslation('mongolian');
      return <RecordTable.InlineHead icon={IconCategory} label={t('receipts')} />;
    },
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
    header: () => {
      const { t } = useTranslation('mongolian');
      return <RecordTable.InlineHead icon={IconCategory} label={t('amount')} />;
    },
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
    header: () => {
      const { t } = useTranslation('mongolian');
      return <RecordTable.InlineHead icon={IconCategory} label={t('message')} />;
    },
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
    header: () => {
      const { t } = useTranslation('mongolian');
      return <RecordTable.InlineHead icon={IconCategory} label={t('inactive-id')} />;
    },
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
    header: () => {
      const { t } = useTranslation('mongolian');
      return <RecordTable.InlineHead icon={IconCategory} label={t('user')} />;
    },
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
  },
];
