import { useMemo } from 'react';
import { RecordTable } from 'erxes-ui';
import { IconPackage } from '@tabler/icons-react';
import { createProductsColumns } from './ProductsColumns';
import { useInsuranceProducts } from '~/modules/insurance/hooks';
import { InsuranceProduct } from '~/modules/insurance/types';

const PRODUCTS_CURSOR_SESSION_KEY = 'products-cursor';

interface ProductsRecordTableProps {
  onEdit: (product: InsuranceProduct) => void;
  onDelete: (product: InsuranceProduct) => void;
}

export const ProductsRecordTable = ({
  onEdit,
  onDelete,
}: ProductsRecordTableProps) => {
  const { insuranceProducts, loading } = useInsuranceProducts();

  const columns = useMemo(
    () => createProductsColumns(onEdit, onDelete),
    [onEdit, onDelete],
  );

  return (
    <RecordTable.Provider
      columns={columns}
      data={insuranceProducts || []}
      className="m-3"
      stickyColumns={['more', 'checkbox', 'name']}
    >
      <RecordTable.CursorProvider
        hasPreviousPage={false}
        hasNextPage={false}
        dataLength={insuranceProducts?.length}
        sessionKey={PRODUCTS_CURSOR_SESSION_KEY}
      >
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            {loading && <RecordTable.RowSkeleton rows={40} />}
            <RecordTable.RowList />
          </RecordTable.Body>
        </RecordTable>
        {!loading && insuranceProducts?.length === 0 && (
          <div className="h-full w-full px-8 flex justify-center">
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
              <div className="mb-6">
                <IconPackage
                  size={64}
                  className="text-muted-foreground mx-auto mb-4"
                />
                <h3 className="text-xl font-semibold mb-2">
                  No insurance products yet
                </h3>
                <p className="text-muted-foreground max-w-md">
                  Get started by creating your first insurance product.
                </p>
              </div>
            </div>
          </div>
        )}
      </RecordTable.CursorProvider>
    </RecordTable.Provider>
  );
};
