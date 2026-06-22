import { Button } from 'erxes-ui';

import { useCheckCategory } from '../hooks/useCheckCategory';
import { CategoryFilterType } from '../types/inventoryCategory';

const categoryFilters: { label: string; value: CategoryFilterType }[] = [
  { label: 'Create Categories', value: 'create' },
  { label: 'Update Categories', value: 'update' },
  { label: 'Delete Categories', value: 'delete' },
];

/* Check hiisen category item-uudiig create/update/delete tab-aar shuune */
export const InventoryCategoryFilter = () => {
  const { selectedFilter, items, setSelectedFilter } = useCheckCategory();

  /* Songogdson tab-iig state deer hadgalna */
  const handleFilterClick = (filter: CategoryFilterType) => {
    setSelectedFilter(filter);
  };

  /* Tab deer haruulah item count-iig tootsono */
  const getCount = (type: CategoryFilterType) => {
    return items?.[type]?.items?.length || 0;
  };

  return (
    <div className="flex gap-2">
      {categoryFilters.map((filter) => (
        <Button
          key={filter.value}
          variant={selectedFilter === filter.value ? 'default' : 'outline'}
          onClick={() => handleFilterClick(filter.value)}
        >
          {filter.label} ({getCount(filter.value)})
        </Button>
      ))}
    </div>
  );
};
