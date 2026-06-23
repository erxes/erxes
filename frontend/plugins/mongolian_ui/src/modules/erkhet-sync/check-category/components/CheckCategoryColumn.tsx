import { IconHash, IconCode } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import { RecordTable, TextOverflowTooltip, RecordTableInlineCell } from 'erxes-ui';

import { makeSyncStatusColumn } from '../../shared/syncStatusColumn';
import { CategoryItem } from '../types/categoryItem';

export const checkCategoryColumns: ColumnDef<CategoryItem>[] = [
  {
    id: 'code',
    accessorKey: 'code',
    header: () => <RecordTable.InlineHead label="Code" icon={IconCode} />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={cell.getValue() as string} />
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: () => <RecordTable.InlineHead icon={IconHash} label="Name" />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={cell.getValue() as string} />
      </RecordTableInlineCell>
    ),
  },
  makeSyncStatusColumn<CategoryItem>(),
];
