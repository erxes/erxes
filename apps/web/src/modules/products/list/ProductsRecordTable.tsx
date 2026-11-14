import { IconPackage, IconPlus } from '@tabler/icons-react';
import { Button, Empty } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { CursorRecordTable } from '~/components/CursorRecordTable';
import { EmptyList } from '~/components/EmptyList';
import {
  useCanManageProducts,
  useOpenProduct,
  useProducts,
  useProductsFilters,
} from '../useProducts';
import { useProductsColumns } from './productsColumns';

/** No products at all yet: what the catalog is for. */
const NoProducts = () => {
  const { t } = useTranslation('product');
  const { openNewProduct } = useOpenProduct();
  const manage = useCanManageProducts();

  return (
    <Empty className="absolute inset-x-0 top-1/4">
      <Empty.Header>
        <Empty.Media variant="icon">
          <IconPackage />
        </Empty.Media>
        <Empty.Title>{t('empty.title', 'No products yet')}</Empty.Title>
        <Empty.Description>
          {t(
            'empty.description',
            'Products are the goods and services you sell. Add each one once here; your shop, sales pipeline, invoices and other apps all use the same catalog.',
          )}
        </Empty.Description>
      </Empty.Header>
      {manage && (
        <Button onClick={openNewProduct}>
          <IconPlus />
          {t('add', 'Add product')}
        </Button>
      )}
    </Empty>
  );
};

/** Whether the list is narrowed by anything (else an empty list means an empty catalog). */
const useFiltered = () => {
  const { search, filter, status } = useProductsFilters();

  return !!(search || filter || status === 'archived');
};

export const ProductsRecordTable = () => {
  const filtered = useFiltered();

  return (
    <CursorRecordTable
      cursor={useProducts()}
      columns={useProductsColumns()}
      stickyColumns={['more', 'image', 'name']}
      tableId="products_record_table"
      empty={filtered ? <EmptyList /> : <NoProducts />}
    />
  );
};
