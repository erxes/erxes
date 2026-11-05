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
import { useTourismPanel } from '@/tms/side-panel/useTourismPanel';
import { TMS_CATEGORY_CONTENT_TYPE } from '@/tms/side-panel/tourismPanelTypes';
import { categoryMoreColumn } from './CategoryMoreCell';

const CategoryNameBadge = ({ category }: { category: ICategory }) => {
  const { openDetail } = useTourismPanel(TMS_CATEGORY_CONTENT_TYPE);

  return (
    <Badge
      variant="secondary"
      className="px-2 py-1 font-medium cursor-pointer hover:bg-accent"
      onClick={() => openDetail(category._id)}
    >
      <TextOverflowTooltip value={category.name || '-'} />
    </Badge>
  );
};

export const categoryColumns: (
  categoryObject: Record<string, ICategory>,
  t?: (key: string) => string,
) => ColumnDef<ICategory & { hasChildren: boolean }>[] = (
  categoryObject,
  t = (k) => k,
) => [
  categoryMoreColumn(),
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
    header: () => <RecordTable.InlineHead icon={IconLabel} label={t('name')} />,
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
            <CategoryNameBadge category={row.original} />
          </RecordTableTree.Trigger>
        </RecordTableInlineCell>
      );
    },
    size: 300,
  },
  {
    id: 'code',
    header: () => <RecordTable.InlineHead icon={IconLabel} label={t('code')} />,
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
    header: () => (
      <RecordTable.InlineHead icon={IconFolder} label={t('parent')} />
    ),
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
      <RecordTable.InlineHead icon={IconLabel} label={t('tour-count')} />
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
      <RecordTable.InlineHead icon={IconCalendarPlus} label={t('created')} />
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
      <RecordTable.InlineHead icon={IconCalendarDot} label={t('modified')} />
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
