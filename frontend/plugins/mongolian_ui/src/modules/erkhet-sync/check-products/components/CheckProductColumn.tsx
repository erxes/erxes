import { IconHash, IconCode, IconCircleCheck } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import {
  RecordTable,
  TextOverflowTooltip,
  RecordTableInlineCell,
} from 'erxes-ui';

import { CheckProductMoreColumn } from './CheckProductMoreColumn';
import { ProductItem } from '../types/productItem';

export const checkProductColumns: ColumnDef<ProductItem>[] = [
  CheckProductMoreColumn,
  RecordTable.checkboxColumn as ColumnDef<ProductItem>,
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
    id: 'barcodes',
    accessorKey: 'barcodes',
    header: () => <RecordTable.InlineHead label="Bar codes" icon={IconHash} />,
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
    header: () => <RecordTable.InlineHead label="Unit price" icon={IconHash} />,
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
