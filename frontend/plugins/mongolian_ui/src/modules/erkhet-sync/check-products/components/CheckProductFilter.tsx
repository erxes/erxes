import { SyncStatusFilter, FilterableStatus } from '../../shared/SyncStatusFilter';
import { useCheckProduct } from '../hooks/useCheckProduct';

export const CheckProductFilter = () => {
  const { selectedFilter, setSelectedFilter, toCheckProductsData } =
    useCheckProduct();

  const getCount = (type: FilterableStatus) =>
    toCheckProductsData?.[type]?.items?.length ?? 0;

  return (
    <SyncStatusFilter
      selectedFilter={selectedFilter}
      onFilterChange={setSelectedFilter}
      getCount={getCount}
    />
  );
};
