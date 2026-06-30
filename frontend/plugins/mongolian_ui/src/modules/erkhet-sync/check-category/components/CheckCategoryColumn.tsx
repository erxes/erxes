import { IconHash, IconCode, IconCircleCheck } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import {
  RecordTable,
  TextOverflowTooltip,
  RecordTableInlineCell,
} from 'erxes-ui';
import { CategoryItem } from '../types/categoryItem';
import { HeaderCell } from '../../components/HeaderCell';
import { SyncedStatusCell } from '../../shared/components/SyncedStatusCell';

export const checkCategoryColumns: ColumnDef<CategoryItem>[] = [
  RecordTable.checkboxColumn as ColumnDef<CategoryItem>,
  {
    id: 'code',
    accessorKey: 'code',
    header: () => <HeaderCell icon={IconCode} label="code" />,
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
    header: () => <HeaderCell icon={IconHash} label="name" />,
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
    header: () => <HeaderCell icon={IconCircleCheck} label="status" />,
    cell: ({ row }) => <SyncedStatusCell isSynced={row.original.isSynced} />,
  },
];
