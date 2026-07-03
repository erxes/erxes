import { IconHash, IconCode, IconCircleCheck } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import {
  RecordTable,
  TextOverflowTooltip,
  RecordTableInlineCell,
} from 'erxes-ui';
import type { TFunction } from 'i18next';
import { ProductItem } from '../types/productItem';
import { SyncedStatusCell } from '../../shared/components/SyncedStatusCell';

export const checkProductColumns = (t: TFunction): ColumnDef<ProductItem>[] => [
  RecordTable.checkboxColumn as ColumnDef<ProductItem>,
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
    id: 'barcodes',
    accessorKey: 'barcodes',
    header: () => <RecordTable.InlineHead icon={IconHash} label={t('bar-codes')} />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'unit_price',
    accessorKey: 'unit_price',
    header: () => <RecordTable.InlineHead icon={IconHash} label={t('unit-price')} />,
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
