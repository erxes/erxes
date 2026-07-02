import { IconHash, IconCode, IconCircleCheck } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import {
  RecordTable,
  TextOverflowTooltip,
  RecordTableInlineCell,
} from 'erxes-ui';
import { ProductItem } from '../types/productItem';
import { HeaderCell } from '../../components/HeaderCell';
import { SyncedStatusCell } from '../../shared/components/SyncedStatusCell';

export const checkProductColumns: ColumnDef<ProductItem>[] = [
  RecordTable.checkboxColumn as ColumnDef<ProductItem>,
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
    id: 'barcodes',
    accessorKey: 'barcodes',
    header: () => <HeaderCell icon={IconHash} label="bar-codes" />,
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
    header: () => <HeaderCell icon={IconHash} label="unit-price" />,
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
