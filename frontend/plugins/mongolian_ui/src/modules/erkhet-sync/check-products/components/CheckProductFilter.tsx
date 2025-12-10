import { Button } from 'erxes-ui';
import { useCheckProduct } from '../hooks/useCheckProduct';

interface CheckProductFilterProps {
  onFilterClick?: (filter: 'create' | 'update' | 'delete') => void;
}

export const CheckProductFilter = ({
  onFilterClick,
}: CheckProductFilterProps) => {
  const { selectedFilter, setSelectedFilter, toCheckProductsData } =
    useCheckProduct();

  const handleFilterClick = (filter: 'create' | 'update' | 'delete') => {
    if (onFilterClick) {
      onFilterClick(filter);
    } else {
      setSelectedFilter(filter);
    }
  };
  const getCount = (type: 'create' | 'update' | 'delete') => {
    return toCheckProductsData?.[type]?.items?.length || 0;
  };

  return (
    <div className="flex gap-2">
      <Button
        variant={selectedFilter === 'create' ? 'default' : 'outline'}
        onClick={() => handleFilterClick('create')}
      >
        Create Products ({getCount('create')})
      </Button>
      <Button
        variant={selectedFilter === 'update' ? 'default' : 'outline'}
        onClick={() => handleFilterClick('update')}
      >
        Update Products ({getCount('update')})
      </Button>
      <Button
        variant={selectedFilter === 'delete' ? 'default' : 'outline'}
        onClick={() => handleFilterClick('delete')}
      >
        Delete Products ({getCount('delete')})
      </Button>
    </div>
  );
};
