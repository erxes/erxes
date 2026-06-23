import { IconPackageOff } from '@tabler/icons-react';
import { RecordTable } from 'erxes-ui';
import { useCheckProduct } from '../hooks/useCheckProduct';
import { checkProductColumns } from './CheckProductColumn';

export const CheckProductRecordTable = () => {
  const { filteredProducts, loading, toCheckProducts } = useCheckProduct();

  const data = filteredProducts ?? [];
  const hasChecked = !!toCheckProducts;
  const isEmpty = hasChecked && data.length === 0 && !loading;

  return (
    <div className="flex flex-1 overflow-hidden">
      <RecordTable.Provider
        columns={checkProductColumns}
        data={data}
        className="h-full w-full"
      >
        <RecordTable.Scroll>
          <RecordTable>
            <RecordTable.Header />
            <RecordTable.Body>
              <RecordTable.RowList />
              {loading && <RecordTable.RowSkeleton rows={20} />}
            </RecordTable.Body>
          </RecordTable>
        </RecordTable.Scroll>
        {isEmpty && (
          <div className="flex flex-col items-center justify-center flex-1 text-center text-muted-foreground py-12">
            <IconPackageOff size={48} className="mb-3 opacity-40" />
            <p className="text-sm">No products in this list</p>
          </div>
        )}
      </RecordTable.Provider>
    </div>
  );
};
