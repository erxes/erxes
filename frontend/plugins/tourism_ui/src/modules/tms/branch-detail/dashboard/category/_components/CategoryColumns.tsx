import { ColumnDef } from '@tanstack/table-core';
import { IconLabel, IconFolder, IconImageInPicture } from '@tabler/icons-react';
import {
  RecordTable,
  RecordTableInlineCell,
  RecordTableTree,
  Avatar,
} from 'erxes-ui';
import { ICategory } from '../types/category';

export const categoryColumns: (
  categoryObject: Record<string, ICategory>,
) => ColumnDef<ICategory & { hasChildren: boolean }>[] = (categoryObject) => [
  RecordTable.checkboxColumn as ColumnDef<ICategory & { hasChildren: boolean }>,
  {
    id: 'attachment',
    header: () => <RecordTable.InlineHead icon={IconImageInPicture} label="" />,
    accessorKey: 'attachment',
    cell: ({ cell, row }) => {
      return (
        <RecordTableInlineCell className="justify-center px-1">
          <Avatar>
            <Avatar.Image src={(cell.getValue() as any)?.url || ''} />
            <Avatar.Fallback>
              {row.original.name?.charAt(0) || '?'}
            </Avatar.Fallback>
          </Avatar>
        </RecordTableInlineCell>
      );
    },
    size: 32,
  },
  {
    id: 'name',
    header: () => <RecordTable.InlineHead icon={IconLabel} label="Name" />,
    accessorKey: 'name',
    cell: ({ cell, row }) => {
      const name = (cell.getValue() as string) || '';

      return (
        <RecordTableInlineCell>
          <RecordTableTree.Trigger
            order={row.original.order || ''}
            name={name}
            hasChildren={row.original.hasChildren}
          >
            {cell.getValue() as string}
          </RecordTableTree.Trigger>
        </RecordTableInlineCell>
      );
    },
    size: 300,
  },
  {
    id: 'parentId',
    header: () => <RecordTable.InlineHead icon={IconFolder} label="Parent" />,
    accessorKey: 'parentId',
    cell: ({ cell }) => {
      const parent = categoryObject[cell.getValue() as string];
      return (
        <RecordTableInlineCell>{parent?.name || '-'}</RecordTableInlineCell>
      );
    },
  },
];
