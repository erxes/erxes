import { Button } from 'erxes-ui';

import { useCheckCategory } from '../hooks/useCheckCategory';
import { CategoryFilterType } from '../types/inventoryCategory';

const categoryFilters: { label: string; value: CategoryFilterType }[] = [
  { label: 'Create Categories', value: 'create' },
  { label: 'Update Categories', value: 'update' },
  { label: 'Delete Categories', value: 'delete' },
];

export const InventoryCategoryFilter = () => {
  const { selectedFilter, items, setSelectedFilter } = useCheckCategory();

  const handleFilterClick = (filter: CategoryFilterType) => {
    setSelectedFilter(filter);
  };

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
