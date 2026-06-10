import {
  IconAlertTriangle,
  IconCalendarPlus,
  IconCategory,
  IconExchange,
  IconHash,
  IconUser,
} from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/react-table';
import {
  RecordTable,
  RecordTableInlineCell,
  RelativeDateDisplay,
  TextOverflowTooltip,
} from 'erxes-ui';
import { IMSDynamicSyncHistory } from '../types/msDynamicSyncHistory';
import { MSDynamicSyncHistoryMoreColumn } from './MSDynamicSyncHistoryMoreColumn';
import { stringifySyncValueInline } from './stringifySyncValue';
import { SyncHistoryClickableColumnCell } from '~/modules/shared/sync-history/components/SyncHistoryClickableColumnCell';

const InlineCell = ({ value }: { value: unknown }) => (
  <RecordTableInlineCell>
    <TextOverflowTooltip
      value={typeof value === 'string' ? value : ''}
    />
  </RecordTableInlineCell>
);

export const msDynamicSyncHistoryColumns: ColumnDef<IMSDynamicSyncHistory>[] = [
  MSDynamicSyncHistoryMoreColumn,
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: () => (
      <RecordTable.InlineHead label="Created At" icon={IconCalendarPlus} />
    ),
    cell: ({ getValue }) => {
      const msDynamicSyncHistoryCreatedAt = getValue() as string;
      return (
        <RelativeDateDisplay value={msDynamicSyncHistoryCreatedAt} asChild>
          <RecordTableInlineCell className="text-xs font-medium text-muted-foreground">
            <RelativeDateDisplay.Value value={msDynamicSyncHistoryCreatedAt} />
          </RecordTableInlineCell>
        </RelativeDateDisplay>
      );
    },
  },
  {
    id: 'createdUser',
    accessorKey: 'createdUser',
    header: () => <RecordTable.InlineHead icon={IconUser} label="User" />,
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
    header: () => (
      <RecordTable.InlineHead icon={IconCategory} label="Content Type" />
    ),
    cell: ({ cell }) => <InlineCell value={cell.getValue()} />,
  },
  {
    id: 'content',
    accessorKey: 'content',
    header: () => <RecordTable.InlineHead icon={IconHash} label="Content" />,
    cell: ({ cell }) => <InlineCell value={cell.getValue()} />,
  },
  {
    id: 'response',
    accessorKey: 'responseStr',
    header: () => (
      <RecordTable.InlineHead icon={IconExchange} label="Response" />
    ),
    cell: ({ row }) => {
      return (
        <SyncHistoryClickableColumnCell
          row={row}
          value={stringifySyncValueInline(
            row.original.responseData || row.original.responseStr,
          )}
        />
      );
    },
  },
  {
    id: 'error',
    accessorKey: 'error',
    header: () => (
      <RecordTable.InlineHead icon={IconAlertTriangle} label="Error" />
    ),
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
