import { IProduct } from 'ui-modules';
import { ProductCommandBar } from '../product-command-bar/ProductCommandBar';
import { RecordTable } from 'erxes-ui';
import { productColumns } from './ProductColumns';

export const ProductsRecordTable = ({ products }: { products: IProduct[] }) => {
  return (
    <RecordTable.Provider
      columns={productColumns}
      data={products || []}
      className="m-3"
      stickyColumns={['more', 'checkbox', 'name']}
    >
      <RecordTable.Scroll>
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            <RecordTable.RowList />
            {/* {!detailsLoading && adjustInventoryDetailsCount > adjustInventoryDetails?.length && (
                      <RecordTable.RowSkeleton rows={4} handleInView={handleFetchMore} />
                    )} */}
          </RecordTable.Body>
        </RecordTable>
      </RecordTable.Scroll>
      <ProductCommandBar />
    </RecordTable.Provider>
  );
};
