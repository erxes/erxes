import { ColumnDef } from '@tanstack/table-core';
import {
  IconLabel,
  IconFolder,
  IconImageInPicture,
  IconCalendarPlus,
  IconCalendarDot,
} from '@tabler/icons-react';
import {
  RecordTable,
  RecordTableInlineCell,
  RecordTableTree,
  Avatar,
  Badge,
  TextOverflowTooltip,
  RelativeDateDisplay,
} from 'erxes-ui';
import { ICategory } from '../types/category';
import { CategoryEditSheet } from './CategoryEditSheet';
import { categoryMoreColumn } from './CategoryMoreCell';

export const categoryColumns: (
  categoryObject: Record<string, ICategory>,
  branchLanguages?: string[],
  mainLanguage?: string,
) => ColumnDef<ICategory & { hasChildren: boolean }>[] = (
  categoryObject,
  branchLanguages,
  mainLanguage,
) => [
  RecordTable.checkboxColumn as ColumnDef<ICategory & { hasChildren: boolean }>,
  categoryMoreColumn(branchLanguages, mainLanguage),
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
            <CategoryEditSheet
              category={row.original}
              showTrigger={false}
              branchLanguages={branchLanguages}
              mainLanguage={mainLanguage}
            >
              <Badge
                variant="secondary"
                className="px-2 py-1 font-medium cursor-pointer hover:bg-accent"
              >
                <TextOverflowTooltip
                  value={(cell.getValue() as string) || '-'}
                />
              </Badge>
            </CategoryEditSheet>
          </RecordTableTree.Trigger>
        </RecordTableInlineCell>
      );
    },
    size: 300,
  },
  {
    id: 'code',
    header: () => <RecordTable.InlineHead icon={IconLabel} label="Code" />,
    accessorKey: 'code',
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={(cell.getValue() as string) || '-'} />
        </RecordTableInlineCell>
      );
    },
    size: 180,
  },
  {
    id: 'parentId',
    header: () => <RecordTable.InlineHead icon={IconFolder} label="Parent" />,
    accessorKey: 'parentId',
    cell: ({ cell }) => {
      const parent = categoryObject[cell.getValue() as string];
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={parent?.name || '-'} />
        </RecordTableInlineCell>
      );
    },
    size: 180,
  },
  {
    id: 'tourCount',
    header: () => (
      <RecordTable.InlineHead icon={IconLabel} label="Tour count" />
    ),
    accessorKey: 'tourCount',
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={(cell.getValue() as string) || '-'} />
        </RecordTableInlineCell>
      );
    },
    size: 180,
  },
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: () => (
      <RecordTable.InlineHead icon={IconCalendarPlus} label="Created" />
    ),
    cell: ({ cell }: { cell: any }) => {
      return (
        <RelativeDateDisplay value={cell.getValue() as string} asChild>
          <RecordTableInlineCell className="text-xs font-medium text-muted-foreground">
            <RelativeDateDisplay.Value value={cell.getValue() as string} />
          </RecordTableInlineCell>
        </RelativeDateDisplay>
      );
    },
    size: 180,
  },
  {
    id: 'modifiedAt',
    accessorKey: 'modifiedAt',
    header: () => (
      <RecordTable.InlineHead icon={IconCalendarDot} label="Modified" />
    ),
    cell: ({ cell }: { cell: any }) => {
      return (
        <RelativeDateDisplay value={cell.getValue() as string} asChild>
          <RecordTableInlineCell className="text-xs font-medium text-muted-foreground">
            <RelativeDateDisplay.Value value={cell.getValue() as string} />
          </RecordTableInlineCell>
        </RelativeDateDisplay>
      );
    },
    size: 180,
  },
];
