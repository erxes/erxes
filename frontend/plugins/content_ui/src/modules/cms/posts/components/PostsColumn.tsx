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
  IconClock,
  IconTag,
  IconFolder,
  IconHash,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { postMoreColumn } from './PostMoreColumn';
import { PostsRecordTableStatusInlineCell } from './PostsRecordTableStatusInlineCell';

export const usePostsColumns = (
  onEditPost?: (post: any) => void,
  onRefetch?: () => void,
): ColumnDef<any>[] => {
  const navigate = useNavigate();

  return [
    postMoreColumn(onEditPost, undefined, onRefetch),
    RecordTable.checkboxColumn as ColumnDef<any>,
    {
      id: 'title',
      header: () => (
        <RecordTable.InlineHead label="Post Name" icon={IconFile} />
      ),
      accessorKey: 'title',
      cell: ({ cell, row }) => {
        const post = row.original;
        return (
          <RecordTableInlineCell>
            <div
              onClick={() =>
                navigate(
                  `/content/cms/${post.clientPortalId}/posts/detail/${post._id}`,
                )
              }
              className="cursor-pointer "
            >
              <Badge variant="secondary">
                <TextOverflowTooltip value={post.title || post.name} />
              </Badge>
            </div>
          </RecordTableInlineCell>
        );
      },
      size: 200,
    },
    {
      id: 'status',
      accessorKey: 'status',
      header: () => <RecordTable.InlineHead label="Status" icon={IconClock} />,
      cell: ({ cell }) => {
        return <PostsRecordTableStatusInlineCell cell={cell} />;
      },
      size: 100,
    },
    {
      id: 'categories',
      accessorKey: 'categories',
      header: () => (
        <RecordTable.InlineHead icon={IconFolder} label="Categories" />
      ),
      cell: ({ row }) => {
        return (
          <RecordTableInlineCell>
            <TextOverflowTooltip
              value={
                row.original.categories?.map((c: any) => c.name).join(', ') ||
                ''
              }
            />
          </RecordTableInlineCell>
        );
      },
    },
    {
      id: 'tags',
      accessorKey: 'tags',
      header: () => <RecordTable.InlineHead icon={IconHash} label="Tags" />,
      cell: ({ row }) => {
        return (
          <RecordTableInlineCell>
            <TextOverflowTooltip
              value={
                row.original.tags?.map((c: any) => c.name).join(', ') || ''
              }
            />
          </RecordTableInlineCell>
        );
      },
    },

    {
      id: 'type',
      accessorKey: 'type',
      header: () => <RecordTable.InlineHead icon={IconTag} label="Type" />,
      cell: ({ row }) => {
        const post = row.original;
        const typeLabel = post.customPostType?.label || post.type;
        return (
          <RecordTableInlineCell>
            <TextOverflowTooltip value={typeLabel} />
          </RecordTableInlineCell>
        );
      },
    },
    {
      id: 'scheduledDate',
      header: () => (
        <div className="flex items-center gap-1 cursor-pointer select-none">
          <RecordTable.InlineHead
            label="Publish Date"
            icon={IconCalendarEvent}
          />
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
};
