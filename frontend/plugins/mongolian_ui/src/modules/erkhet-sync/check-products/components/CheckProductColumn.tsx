import { IconHash, IconCode } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import { RecordTable, TextOverflowTooltip, RecordTableInlineCell } from 'erxes-ui';

import { makeSyncStatusColumn } from '../../shared/syncStatusColumn';
import { ProductItem } from '../types/productItem';

export const checkProductColumns: ColumnDef<ProductItem>[] = [
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
  {
    id: 'barcodes',
    accessorKey: 'barcodes',
    header: () => <RecordTable.InlineHead label="Bar codes" icon={IconHash} />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={cell.getValue() as string} />
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'unit_price',
    accessorKey: 'unit_price',
    header: () => <RecordTable.InlineHead label="Unit price" icon={IconHash} />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={cell.getValue() as string} />
      </RecordTableInlineCell>
    ),
  },
  makeSyncStatusColumn<ProductItem>(),
];
