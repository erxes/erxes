import { Button } from 'erxes-ui';

import { useCheckCategory } from '../hooks/useCheckCategory';
import { CategoryFilterType } from '../types/inventoryCategory';

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
      <Button
        variant={selectedFilter === 'create' ? 'default' : 'outline'}
        onClick={() => handleFilterClick('create')}
      >
        Create Categories ({getCount('create')})
      </Button>

      <Button
        variant={selectedFilter === 'update' ? 'default' : 'outline'}
        onClick={() => handleFilterClick('update')}
      >
        Update Categories ({getCount('update')})
      </Button>

      <Button
        variant={selectedFilter === 'delete' ? 'default' : 'outline'}
        onClick={() => handleFilterClick('delete')}
      >
        Delete Categories ({getCount('delete')})
      </Button>
    </div>
  );
};
