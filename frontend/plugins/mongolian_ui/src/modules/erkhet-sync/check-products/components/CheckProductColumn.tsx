import { IconHash, IconCode, IconArrowsExchange } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import { RecordTable, TextOverflowTooltip, RecordTableInlineCell } from 'erxes-ui';

import { ProductItem, ProductStatus } from '../types/productItem';

const STATUS_STYLES: Record<ProductStatus, string> = {
  create: 'bg-green-100 text-green-700',
  update: 'bg-blue-100 text-blue-700',
  delete: 'bg-red-100 text-red-700',
  synced: 'bg-gray-100 text-gray-600',
};

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
  {
    id: 'status',
    accessorKey: 'status',
    size: 90,
    header: () => <RecordTable.InlineHead label="Status" icon={IconArrowsExchange} />,
    cell: ({ cell }) => {
      const status = cell.getValue() as ProductStatus;
      return (
        <RecordTableInlineCell>
          <span
            className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[status] ?? ''}`}
          >
            {status}
          </span>
        </RecordTableInlineCell>
      );
    },
  },
];
