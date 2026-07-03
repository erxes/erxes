import {
  IconCategory,
  IconCurrencyDollar,
  IconHash,
  IconUser,
  IconCalendarPlus,
} from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/react-table';
import {
  RecordTable,
  TextOverflowTooltip,
  RecordTableInlineCell,
  RelativeDateDisplay,
} from 'erxes-ui';
import type { TFunction } from 'i18next';

import { ISyncHistory } from '../types/syncHistory';
import { SyncErkhetHistoryMoreColumn } from './SyncErkhetHistoryMoreColumn';
import { SyncHistoryClickableColumnCell } from '~/modules/shared/sync-history/components/SyncHistoryClickableColumnCell';

const stringify = (value: unknown) => {
  if (value == null) {
    return '';
  }

  if (typeof value === 'string') {
    return value;
  }

  return JSON.stringify(value);
};

export const syncErkhetHistoryColumns = (t: TFunction): ColumnDef<ISyncHistory>[] => [
  SyncErkhetHistoryMoreColumn,
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: () => <RecordTable.InlineHead icon={IconCalendarPlus} label={t('created-at')} />,
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
    id: 'createdUser',
    accessorKey: 'createdUser',
    header: () => <RecordTable.InlineHead icon={IconHash} label={t('user')} />,
    cell: ({ row }) => {
      const user = row.original.createdUser;
      const value =
        user?.email || user?.details?.fullName || row.original.createdBy || '';

      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={value} />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'contentType',
    accessorKey: 'contentType',
    header: () => <RecordTable.InlineHead icon={IconCurrencyDollar} label={t('content-type')} />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={(cell.getValue() as string) || ''} />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'content',
    accessorKey: 'content',
    header: () => <RecordTable.InlineHead icon={IconUser} label={t('content')} />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={(cell.getValue() as string) || ''} />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'response',
    accessorKey: 'responseStr',
    header: () => <RecordTable.InlineHead icon={IconCategory} label={t('response')} />,
    cell: ({ row }) => {
      return (
        <SyncHistoryClickableColumnCell
          row={row}
          value={stringify(
            row.original.responseData || row.original.responseStr,
          )}
        />
      );
    },
  },
  {
    id: 'error',
    accessorKey: 'error',
    header: () => <RecordTable.InlineHead icon={IconCategory} label={t('error')} />,
    cell: ({ row }) => {
      return (
        <SyncHistoryClickableColumnCell
          row={row}
          value={row.original.error || ''}
          isError
        />
      );
    },
  },
];
