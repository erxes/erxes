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
  cn,
} from 'erxes-ui';
import { IMSDynamicSyncHistory } from '../types/msDynamicSyncHistory';
import { useSearchParams } from 'react-router';
import { MSDynamicSyncHistoryMoreColumn } from './MSDynamicSyncHistoryMoreColumn';
import { stringifySyncValueInline } from './stringifySyncValue';

const SyncErkhetHistoryClickableCell = ({
  row,
  value,
  isError,
}: {
  row: { original: IMSDynamicSyncHistory };
  value: string;
  isError?: boolean;
}) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const handleOpen = () => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('syncHistory_id', row.original._id);
    setSearchParams(newSearchParams);
  };

  return (
    <RecordTableInlineCell
      role="button"
      tabIndex={0}
      onClick={handleOpen}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handleOpen();
        }
      }}
      className={cn(
        'cursor-pointer rounded px-2 hover:bg-muted',
        isError && value ? 'text-destructive' : 'text-muted-foreground',
      )}
    >
      <TextOverflowTooltip value={String(value || '-')} />
    </RecordTableInlineCell>
  );
};

export const msDynamicSyncHistoryColumns: ColumnDef<IMSDynamicSyncHistory>[] = [
  MSDynamicSyncHistoryMoreColumn,
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: () => (
      <RecordTable.InlineHead label="Created At" icon={IconCalendarPlus} />
    ),
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
    header: () => <RecordTable.InlineHead icon={IconHash} label="Content" />,
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
    header: () => (
      <RecordTable.InlineHead icon={IconExchange} label="Response" />
    ),
    cell: ({ row }) => {
      return (
        <SyncErkhetHistoryClickableCell
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
        <SyncErkhetHistoryClickableCell
          row={row}
          value={row.original.error || ''}
          isError
        />
      );
    },
  },
];
