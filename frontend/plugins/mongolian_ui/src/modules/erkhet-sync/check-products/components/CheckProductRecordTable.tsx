import { RecordTable, Spinner } from 'erxes-ui';
import { IconShoppingCartX } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { CHECK_PRODUCTS_CURSOR_SESSION_KEY } from '../constants/checkProductsCursorSessionKey';
import { useCheckProduct } from '../hooks/useCheckProduct';
import { checkProductColumns } from './CheckProductColumn';
import { CheckProductCommandBar } from './CheckProductCommandBar';

export const CheckProductRecordTable = () => {
  const { filteredProducts, loading, pageInfo, checkProduct, toCheckProducts } =
    useCheckProduct();
  const { t } = useTranslation('mongolian');
  const { hasPreviousPage, hasNextPage } = pageInfo || {};
  const isInitialLoading = loading && toCheckProducts === null;

  return (
    <RecordTable.Provider
      columns={checkProductColumns(t)}
      data={filteredProducts || []}
      className="m-3"
      stickyColumns={['more', 'checkbox', 'createdAt']}
    >
      <RecordTable.CursorProvider
        hasPreviousPage={hasPreviousPage}
        hasNextPage={hasNextPage}
        dataLength={filteredProducts?.length}
        sessionKey={CHECK_PRODUCTS_CURSOR_SESSION_KEY}
      >
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            <RecordTable.CursorBackwardSkeleton
              handleFetchMore={checkProduct}
            />
            {loading && <RecordTable.RowSkeleton rows={40} />}
            <RecordTable.RowList />
            <RecordTable.CursorForwardSkeleton handleFetchMore={checkProduct} />
          </RecordTable.Body>
        </RecordTable>
        {isInitialLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Spinner />
          </div>
        )}
        {!loading &&
          !toCheckProducts?.length &&
          filteredProducts?.length === 0 && (
            <div className="absolute inset-0">
              <div className="h-full w-full px-8 flex justify-center">
                <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
                  <div className="mb-6">
                    <IconShoppingCartX
                      size={64}
                      className="text-muted-foreground mx-auto mb-4"
                    />
                    <h3 className="text-xl font-semibold mb-2">
                      {t('no-product-yet')}
                    </h3>
                    <p className="text-muted-foreground max-w-md">
                      {t('create-first-product')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
      </RecordTable.CursorProvider>
      <CheckProductCommandBar />
    </RecordTable.Provider>
  );
};
