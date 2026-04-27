import { IconHash, IconCode, IconCircleCheck } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import {
  RecordTable,
  TextOverflowTooltip,
  RecordTableInlineCell,
} from 'erxes-ui';

import { CheckCategoryMoreColumn } from './CheckCategoryMoreColumn';
import { CategoryItem } from '../types/categoryItem';

export const checkCategoryColumns: ColumnDef<CategoryItem>[] = [
  CheckCategoryMoreColumn,
  RecordTable.checkboxColumn as ColumnDef<CategoryItem>,
  {
    id: 'code',
    accessorKey: 'code',
    header: () => <RecordTable.InlineHead label="Code" icon={IconCode} />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: () => <RecordTable.InlineHead icon={IconHash} label="Name" />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'status',
    accessorKey: 'isSynced',
    header: () => (
      <RecordTable.InlineHead label="Status" icon={IconCircleCheck} />
    ),
    cell: ({ row }) => {
      const isSynced = row.original.isSynced;

      return (
        <RecordTableInlineCell>
          {isSynced ? (
            <span className="text-green-600 font-medium">Synced</span>
          ) : (
            <span className="text-gray-400"></span>
          )}
        </RecordTableInlineCell>
      );
    },
  },
];
