import {
  RecordTable,
  RecordTableInlineCell,
  TextOverflowTooltip,
  RelativeDateDisplay,
  Badge,
} from 'erxes-ui';
import { ColumnDef } from '@tanstack/react-table';
import { pageMoreColumn } from './PagesMoreColumn';
import { IconUser, IconArticle, IconCalendar } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

export const usePagesColumns = (
  onEditPage?: (page: any) => void,
  onRefetch?: () => void,
): ColumnDef<any>[] => {
  const navigate = useNavigate();

  return [
    pageMoreColumn(onEditPage, undefined, onRefetch),
    RecordTable.checkboxColumn as ColumnDef<any>,
    {
      id: 'name',
      header: () => <RecordTable.InlineHead icon={IconUser} label="Name" />,
      accessorKey: 'name',
      cell: ({ cell, row }) => {
        const page = row.original;
        return (
          <RecordTableInlineCell>
            <div
              onClick={(e) => {
                e.stopPropagation();
                navigate(
                  `/content/cms/${page.clientPortalId}/pages/detail/${page._id}`,
                );
              }}
              className="cursor-pointer "
            >
              <Badge variant="secondary">
                <TextOverflowTooltip value={page.name} />
              </Badge>
            </div>
          </RecordTableInlineCell>
        );
      },
      size: 400,
    },
    {
      id: 'slug',
      header: () => <RecordTable.InlineHead icon={IconArticle} label="Slug" />,
      accessorKey: 'slug',
      cell: ({ cell }) => (
        <RecordTableInlineCell className="text-gray-500">
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      ),
    },

    {
      id: 'createdAt',
      header: () => (
        <RecordTable.InlineHead icon={IconCalendar} label="Created" />
      ),
      accessorKey: 'createdAt',
      cell: ({ cell }) => (
        <RelativeDateDisplay value={cell.getValue() as string} asChild>
          <RecordTableInlineCell className="text-xs font-medium text-muted-foreground">
            <RelativeDateDisplay.Value value={cell.getValue() as string} />
          </RecordTableInlineCell>
        </RelativeDateDisplay>
      ),
    },
    {
      id: 'updatedAt',
      header: () => (
        <RecordTable.InlineHead icon={IconCalendar} label="Updated" />
      ),
      accessorKey: 'updatedAt',
      cell: ({ cell }) => (
        <RelativeDateDisplay value={cell.getValue() as string} asChild>
          <RecordTableInlineCell className="text-xs font-medium text-muted-foreground">
            <RelativeDateDisplay.Value value={cell.getValue() as string} />
          </RecordTableInlineCell>
        </RelativeDateDisplay>
      ),
    },
  ];
};
