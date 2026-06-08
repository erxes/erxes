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
import { MSDynamicSyncHistory } from '../types/msDynamicSyncHistory';

const stringify = (value: unknown) => {
  if (!value) {
    return '';
  }

  if (typeof value === 'string') {
    return value;
  }

  return JSON.stringify(value);
};

const MSDynamicSyncHistoryTextCell = ({
  value,
  isError,
}: {
  value: string;
  isError?: boolean;
}) => {
  return (
    <RecordTableInlineCell
      className={cn(
        'rounded px-2',
        isError && value ? 'text-destructive' : 'text-muted-foreground',
      )}
    >
      <TextOverflowTooltip value={value || '-'} />
    </RecordTableInlineCell>
  );
};

export const msDynamicSyncHistoryColumns: ColumnDef<MSDynamicSyncHistory>[] = [
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: () => (
      <RecordTable.InlineHead label="Created At" icon={IconCalendarPlus} />
    ),
    cell: ({ cell }) => {
      const value = cell.getValue() as string | undefined;

      return (
        <RelativeDateDisplay value={value || ''} asChild>
          <RecordTableInlineCell className="text-xs font-medium text-muted-foreground">
            <RelativeDateDisplay.Value value={value || ''} />
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

      return <MSDynamicSyncHistoryTextCell value={value} />;
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
        <MSDynamicSyncHistoryTextCell
          value={(cell.getValue() as string | undefined) || ''}
        />
      );
    },
  },
  {
    id: 'content',
    accessorKey: 'content',
    header: () => <RecordTable.InlineHead icon={IconHash} label="Content" />,
    cell: ({ cell }) => {
      return (
        <MSDynamicSyncHistoryTextCell
          value={(cell.getValue() as string | undefined) || ''}
        />
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
        <MSDynamicSyncHistoryTextCell
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
    header: () => (
      <RecordTable.InlineHead icon={IconAlertTriangle} label="Error" />
    ),
    cell: ({ row }) => {
      return (
        <MSDynamicSyncHistoryTextCell
          value={row.original.error || ''}
          isError
        />
      );
    },
  },
];
