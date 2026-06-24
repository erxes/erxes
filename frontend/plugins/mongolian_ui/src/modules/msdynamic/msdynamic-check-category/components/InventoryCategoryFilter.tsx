import { Button } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

import { useCheckCategory } from '../hooks/useCheckCategory';
import { CategoryFilterType } from '../types/inventoryCategory';

const categoryFilters: { label: string; value: CategoryFilterType }[] = [
  { label: 'create-categories', value: 'create' },
  { label: 'update-categories', value: 'update' },
  { label: 'delete-categories', value: 'delete' },
];

/* Check hiisen category item-uudiig create/update/delete tab-aar shuune */
export const InventoryCategoryFilter = () => {
  const { t } = useTranslation('mongolian');
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
          {t(filter.label)} ({getCount(filter.value)})
        </Button>
      ))}
    </div>
  );
};
