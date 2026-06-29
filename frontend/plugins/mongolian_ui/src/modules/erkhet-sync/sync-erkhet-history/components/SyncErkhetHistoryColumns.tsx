import {
  IconCategory,
  IconCurrencyDollar,
  IconHash,
  IconUser,
  IconCalendarPlus,
} from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/react-table';
import {
  TextOverflowTooltip,
  RecordTableInlineCell,
  RelativeDateDisplay,
} from 'erxes-ui';

import { ISyncHistory } from '../types/syncHistory';
import { SyncErkhetHistoryMoreColumn } from './SyncErkhetHistoryMoreColumn';
import { SyncHistoryClickableColumnCell } from '~/modules/shared/sync-history/components/SyncHistoryClickableColumnCell';
import { HeaderCell } from '../../components/HeaderCell';

const stringify = (value: any) => {
  if (!value) {
    return '';
  }

  if (typeof value === 'string') {
    return value;
  }

  return JSON.stringify(value);
};

export const syncErkhetHistoryColumns: ColumnDef<ISyncHistory>[] = [
  SyncErkhetHistoryMoreColumn,
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: () => <HeaderCell icon={IconCalendarPlus} label="created-at" />,
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
    header: () => <HeaderCell icon={IconHash} label="user" />,
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
    header: () => <HeaderCell icon={IconCurrencyDollar} label="content-type" />,
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
    header: () => <HeaderCell icon={IconUser} label="content" />,
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
    header: () => <HeaderCell icon={IconCategory} label="response" />,
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
    header: () => <HeaderCell icon={IconCategory} label="error" />,
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
