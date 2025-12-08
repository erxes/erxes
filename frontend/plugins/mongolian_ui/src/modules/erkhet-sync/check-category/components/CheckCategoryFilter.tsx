import { Button } from 'erxes-ui';
import { useCheckCategory } from '../hooks/useCheckCategory';

interface CheckCategoryFilterProps {
  onFilterClick?: (filter: 'create' | 'update' | 'delete') => void;
}

export const CheckCategoryFilter = ({
  onFilterClick,
}: CheckCategoryFilterProps) => {
  const { selectedFilter, setSelectedFilter, toCheckCategoriesData } =
    useCheckCategory();

  const handleFilterClick = (filter: 'create' | 'update' | 'delete') => {
    if (onFilterClick) {
      onFilterClick(filter);
    } else {
      setSelectedFilter(filter);
    }
  };
  const getCount = (type: 'create' | 'update' | 'delete') => {
    return toCheckCategoriesData?.[type]?.items?.length || 0;
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
