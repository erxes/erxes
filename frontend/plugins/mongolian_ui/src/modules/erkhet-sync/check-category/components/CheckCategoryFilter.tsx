import { SyncStatusFilter, FilterableStatus } from '../../shared/SyncStatusFilter';
import { useCheckCategory } from '../hooks/useCheckCategory';
import { CategoryStatus } from '../types/categoryItem';

export const CheckCategoryFilter = () => {
  const { selectedFilter, setSelectedFilter, toCheckCategoriesData } =
    useCheckCategory();

  const getCount = (type: FilterableStatus) =>
    toCheckCategoriesData?.[type]?.items?.length ?? 0;

  return (
    <SyncStatusFilter
      selectedFilter={selectedFilter}
      onFilterChange={(val) => setSelectedFilter(val as CategoryStatus)}
      getCount={getCount}
    />
  );
};
