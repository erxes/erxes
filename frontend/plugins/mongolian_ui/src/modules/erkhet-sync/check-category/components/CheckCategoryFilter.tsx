import { SyncStatusFilter, FilterableStatus } from '../../shared/SyncStatusFilter';
import { useCheckCategory } from '../hooks/useCheckCategory';

export const CheckCategoryFilter = () => {
  const { selectedFilter, setSelectedFilter, toCheckCategoriesData } =
    useCheckCategory();

  const getCount = (type: FilterableStatus) =>
    toCheckCategoriesData?.[type]?.items?.length ?? 0;

  return (
    <SyncStatusFilter
      selectedFilter={selectedFilter}
      onFilterChange={setSelectedFilter}
      getCount={getCount}
    />
  );
};
