import { IconBuilding, IconPackage, IconCalendar } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import {
  RecordTable,
  TextOverflowTooltip,
  RecordTableInlineCell,
  Badge,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { InsuranceVendor } from '~/modules/insurance/types';
import { VendorsMoreColumn } from './VendorsMoreColumn';

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('mn-MN');
};

export const vendorsColumns: ColumnDef<InsuranceVendor>[] = [
  {
    id: 'more',
    accessorKey: 'more',
    header: '',
    cell: ({ cell }) => <VendorsMoreColumn cell={cell} />,
    size: 32,
  },
  {
    ...(RecordTable.checkboxColumn as ColumnDef<InsuranceVendor>),
    size: 32,
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: () => {
      const { t } = useTranslation('insurance');
      return <RecordTable.InlineHead icon={IconBuilding} label={t('vendor')} />;
    },
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
    header: () => {
      const { t } = useTranslation('insurance');
      return <RecordTable.InlineHead icon={IconPackage} label={t('products')} />;
    },
    cell: ({ cell }) => {
      const { t } = useTranslation('insurance');
      const products = cell.row.original.offeredProducts || [];
      return (
        <RecordTableInlineCell>
          <Badge variant="secondary">{products.length} {t('products-offered')}</Badge>
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'products',
    accessorKey: 'offeredProducts',
    header: () => {
      const { t } = useTranslation('insurance');
      return <RecordTable.InlineHead icon={IconPackage} label={t('offered-products')} />;
    },
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
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: () => {
      const { t } = useTranslation('insurance');
      return <RecordTable.InlineHead icon={IconCalendar} label={t('created-at')} />;
    },
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={formatDate(cell.getValue() as Date)} />
        </RecordTableInlineCell>
      );
    },
  },
];
