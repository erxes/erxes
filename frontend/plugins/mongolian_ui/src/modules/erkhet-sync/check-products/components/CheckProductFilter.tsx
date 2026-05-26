import { SyncStatusFilter, FilterableStatus } from '../../shared/SyncStatusFilter';
import { useCheckProduct } from '../hooks/useCheckProduct';
import { ProductStatus } from '../types/productItem';

export const CheckProductFilter = () => {
  const { selectedFilter, setSelectedFilter, toCheckProductsData } =
    useCheckProduct();

  const getCount = (type: FilterableStatus) =>
    toCheckProductsData?.[type]?.items?.length ?? 0;

  return (
    <SyncStatusFilter
      selectedFilter={selectedFilter}
      onFilterChange={(val) => setSelectedFilter(val as ProductStatus)}
      getCount={getCount}
    />
  );
};
