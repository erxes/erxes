import { ColumnDef } from '@tanstack/table-core';
import { IconLabel, IconFolder } from '@tabler/icons-react';
import {
  RecordTable,
  RecordTableInlineCell,
  TextOverflowTooltip,
  Badge,
} from 'erxes-ui';
import { ICategory } from '../types/category';
import { CategoryEditSheet } from './CategoryEditSheet';

export const categoryColumns: ColumnDef<ICategory>[] = [
  RecordTable.checkboxColumn as ColumnDef<ICategory>,
  {
    id: 'name',
    accessorKey: 'name',
    header: () => <RecordTable.InlineHead icon={IconLabel} label="Name" />,
    cell: ({ cell, row }: { cell: any; row: any }) => {
      const category = row.original as ICategory;
      return (
        <RecordTableInlineCell>
          <CategoryEditSheet category={category} showTrigger={false}>
            <Badge
              variant="secondary"
              className="px-2 py-1 font-medium cursor-pointer hover:bg-accent"
            >
              <TextOverflowTooltip value={(cell.getValue() as string) || '-'} />
            </Badge>
          </CategoryEditSheet>
        </RecordTableInlineCell>
      );
    },
    size: 300,
  },
  {
    id: 'parentId',
    accessorKey: 'parentId',
    header: () => (
      <RecordTable.InlineHead icon={IconFolder} label="Parent ID" />
    ),
    cell: ({ cell }: { cell: any }) => {
      return (
        <RecordTableInlineCell className="text-xs font-medium text-muted-foreground">
          <TextOverflowTooltip value={(cell.getValue() as string) || '-'} />
        </RecordTableInlineCell>
      );
    },
    size: 200,
  },
];
