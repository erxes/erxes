import {
  RecordTable,
  TextOverflowTooltip,
  RecordTableInlineCell,
  RelativeDateDisplay,
  Badge,
} from 'erxes-ui';
import { ColumnDef } from '@tanstack/react-table';
import {
  IconCalendarEvent,
  IconCalendarPlus,
  IconCalendarUp,
  IconFile,
} from '@tabler/icons-react';
import { postMoreColumn } from './PostMoreColumn';

export const postsColumns = (
  onEditPost?: (post: any) => void,
  onRefetch?: () => void,
): ColumnDef<any>[] => [
  postMoreColumn(onEditPost, undefined, onRefetch),
  RecordTable.checkboxColumn as ColumnDef<any>,
  {
    id: 'title',
    header: () => <RecordTable.InlineHead label="Post Name" icon={IconFile} />,
    accessorKey: 'title',
    cell: ({ cell, row }) => {
      const post = row.original;
      return (
        <RecordTableInlineCell>
          <div onClick={() => onEditPost?.(post)} className="cursor-pointer">
            <Badge variant="secondary">
              <TextOverflowTooltip value={post.title || post.name} />
            </Badge>
          </div>
        </RecordTableInlineCell>
      );
    },
    size: 300,
  },

  {
    id: 'excerpt',
    header: () => (
      <RecordTable.InlineHead label="Description" icon={IconFile} />
    ),
    accessorKey: 'excerpt',
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
    size: 300,
  },
  {
    id: 'scheduledDate',
    header: () => (
      <div className="flex items-center gap-1 cursor-pointer select-none">
        <RecordTable.InlineHead label="Publish Date" icon={IconCalendarEvent} />
      </div>
    ),
    accessorFn: (row: any) => row.scheduledDate || row.createdAt,
    cell: ({ row }) => {
      const date = row.original.scheduledDate;
      return (
        <div className="mx-2 my-1 p-1 inline-flex items-center rounded-sm px-2 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 whitespace-nowrap font-medium w-fit h-6 text-xs border gap-1">
          <IconCalendarEvent className="h-3 w-3" />
          {date
            ? new Date(date).toLocaleDateString('mn-MN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })
            : 'Date not selected'}
        </div>
      );
    },
  },
  {
    id: 'createdAt',
    header: () => (
      <RecordTable.InlineHead label="Created At" icon={IconCalendarPlus} />
    ),
    accessorKey: 'createdAt',
    cell: ({ cell }) => (
      <RelativeDateDisplay value={cell.getValue() as string} asChild>
        <RecordTableInlineCell className="text-xs font-medium text-muted-foreground">
          <RelativeDateDisplay.Value value={cell.getValue() as string} />
        </RecordTableInlineCell>
      </RelativeDateDisplay>
    ),
    size: 180,
  },
  {
    id: 'updatedAt',
    header: () => (
      <RecordTable.InlineHead label="Updated At" icon={IconCalendarUp} />
    ),
    accessorKey: 'updatedAt',
    cell: ({ cell }) => (
      <RelativeDateDisplay value={cell.getValue() as string} asChild>
        <RecordTableInlineCell className="text-xs font-medium text-muted-foreground">
          <RelativeDateDisplay.Value value={cell.getValue() as string} />
        </RecordTableInlineCell>
      </RelativeDateDisplay>
    ),
    size: 180,
  },
];
