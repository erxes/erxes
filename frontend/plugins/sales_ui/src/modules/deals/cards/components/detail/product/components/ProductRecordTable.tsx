import { IProduct } from 'ui-modules';
import { ProductCommandBar } from '../product-command-bar/ProductCommandBar';
import { RecordTable } from 'erxes-ui';
import { productColumns } from './ProductColumns';

export const ProductsRecordTable = ({
  products,
  refetch,
  dealId,
}: {
  products: IProduct[];
  refetch: () => void;
  dealId: string;
}) => {
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
          </RecordTable.Body>
        </RecordTable>
      </RecordTable.Scroll>
      <ProductCommandBar refetch={refetch} dealId={dealId} />
    </RecordTable.Provider>
  );
};
