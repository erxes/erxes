import { IconBuilding, IconPackage } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import {
  RecordTable,
  TextOverflowTooltip,
  RecordTableInlineCell,
  Badge,
} from 'erxes-ui';
import { InsuranceVendor } from '~/modules/insurance/types';
import { createCreatedAtColumn } from '../shared';
import { VendorsMoreColumn } from './VendorsMoreColumn';

export const createVendorsColumns = (labels: {
  vendor: string;
  products: string;
  productsOffered: string;
  offeredProducts: string;
  createdAt: string;
}): ColumnDef<InsuranceVendor>[] => [
  {
    id: 'more',
    accessorKey: 'more',
    header: () => <RecordTable.ColumnSelector />,
    cell: ({ cell }) => <VendorsMoreColumn cell={cell} />,
    size: 33,
  },
  {
    ...(RecordTable.checkboxColumn as ColumnDef<InsuranceVendor>),
    size: 33,
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: () => (
      <RecordTable.InlineHead icon={IconBuilding} label={labels.vendor} />
    ),
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'productsCount',
    accessorKey: 'offeredProducts',
    header: () => (
      <RecordTable.InlineHead icon={IconPackage} label={labels.products} />
    ),
    cell: ({ cell }) => {
      const products = cell.row.original.offeredProducts || [];
      return (
        <RecordTableInlineCell>
          <Badge variant="secondary">
            {products.length} {labels.productsOffered}
          </Badge>
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'products',
    accessorKey: 'offeredProducts',
    header: () => (
      <RecordTable.InlineHead icon={IconPackage} label={labels.offeredProducts} />
    ),
    cell: ({ cell }) => {
      const products = cell.row.original.offeredProducts || [];
      const productNames = products
        .slice(0, 3)
        .map((vp) => vp.product.name)
        .join(', ');
      const suffix = products.length > 3 ? ` +${products.length - 3}` : '';
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={productNames + suffix} />
        </RecordTableInlineCell>
      );
    },
  },
  createCreatedAtColumn<InsuranceVendor>(labels.createdAt),
];
