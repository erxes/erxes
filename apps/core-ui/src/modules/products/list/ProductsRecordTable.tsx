import { IconPackage, IconPlus } from '@tabler/icons-react';
import { Button, Empty, RecordTable } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { messageOf } from '~/lib/api';
import { EmptyList } from '~/modules/contacts/components/EmptyList';
import {
  PRODUCTS_SESSION_KEY,
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
    <Empty className="absolute inset-x-0 top-[25%]">
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
  const { list, loading, error, hasNextPage, hasPreviousPage, handleFetchMore } = useProducts();
  const columns = useProductsColumns();
  const filtered = useFiltered();

  if (error) {
    return <div className="m-3 text-sm text-destructive">{messageOf(error)}</div>;
  }

  return (
    <RecordTable.Provider
      columns={columns}
      data={list}
      stickyColumns={['more', 'image', 'name']}
      className="m-3"
      tableId="products_record_table"
    >
      <RecordTable.CursorProvider
        hasPreviousPage={hasPreviousPage}
        hasNextPage={hasNextPage}
        dataLength={list.length}
        sessionKey={PRODUCTS_SESSION_KEY}
      >
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            <RecordTable.CursorBackwardSkeleton handleFetchMore={handleFetchMore} />
            {loading ? <RecordTable.RowSkeleton rows={32} /> : <RecordTable.RowList />}
            <RecordTable.CursorForwardSkeleton handleFetchMore={handleFetchMore} />
          </RecordTable.Body>
        </RecordTable>
      </RecordTable.CursorProvider>
      {!loading && !list.length && (filtered ? <EmptyList /> : <NoProducts />)}
    </RecordTable.Provider>
  );
};
