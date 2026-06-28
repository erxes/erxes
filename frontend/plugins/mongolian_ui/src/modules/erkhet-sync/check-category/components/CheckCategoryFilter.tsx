import { Button } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useCheckCategory } from '../hooks/useCheckCategory';

export type CategoryFilterType = 'create' | 'update' | 'delete';

interface CheckCategoryFilterProps {
  onFilterClick?: (filter: CategoryFilterType) => void;
}

export const CheckCategoryFilter = ({
  onFilterClick,
}: CheckCategoryFilterProps) => {
  const { t } = useTranslation('mongolian');
  const { selectedFilter, setSelectedFilter, toCheckCategoriesData } =
    useCheckCategory();

  const handleFilterClick = (filter: CategoryFilterType) => {
    if (onFilterClick) {
      onFilterClick(filter);
    } else {
      setSelectedFilter(filter);
    }
  };

  const getCount = (type: CategoryFilterType) => {
    return toCheckCategoriesData?.[type]?.items?.length || 0;
  };

  return (
    <div className="flex gap-2">
      <Button
        variant={selectedFilter === 'create' ? 'default' : 'outline'}
        onClick={() => handleFilterClick('create')}
      >
        {t('create-categories')} ({getCount('create')})
      </Button>

      <Button
        variant={selectedFilter === 'update' ? 'default' : 'outline'}
        onClick={() => handleFilterClick('update')}
      >
        {t('update-categories')} ({getCount('update')})
      </Button>

      <Button
        variant={selectedFilter === 'delete' ? 'default' : 'outline'}
        onClick={() => handleFilterClick('delete')}
      >
        {t('delete-categories')} ({getCount('delete')})
      </Button>
    </div>
  );
};
