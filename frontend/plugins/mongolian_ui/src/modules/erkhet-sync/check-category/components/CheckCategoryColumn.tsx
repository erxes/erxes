import { IconHash, IconCode, IconCircleCheck } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import {
  RecordTable,
  TextOverflowTooltip,
  RecordTableInlineCell,
} from 'erxes-ui';
import type { TFunction } from 'i18next';
import { CategoryItem } from '../types/categoryItem';
import { SyncedStatusCell } from '../../shared/components/SyncedStatusCell';

export const checkCategoryColumns = (t: TFunction): ColumnDef<CategoryItem>[] => [
  RecordTable.checkboxColumn as ColumnDef<CategoryItem>,
  {
    id: 'code',
    accessorKey: 'code',
    header: () => <RecordTable.InlineHead icon={IconCode} label={t('code')} />,
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
    header: () => <RecordTable.InlineHead icon={IconHash} label={t('name')} />,
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
    header: () => <RecordTable.InlineHead icon={IconCircleCheck} label={t('status')} />,
    cell: ({ row }) => <SyncedStatusCell isSynced={row.original.isSynced} />,
  },
];
