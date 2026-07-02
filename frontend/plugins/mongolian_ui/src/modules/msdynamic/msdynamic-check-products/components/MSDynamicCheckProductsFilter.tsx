import { Button } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

import { useMSDynamicCheckProducts } from '../hooks/useMSDynamicCheckProducts';
import { MSDynamicCheckProductStatus } from '../types/msDynamicCheckProduct';

const FILTERS: MSDynamicCheckProductStatus[] = ['create', 'update', 'delete'];

const STATUS_KEYS: Record<MSDynamicCheckProductStatus, string> = {
  create: 'create-products',
  update: 'update-products',
  delete: 'delete-products',
};

export const MSDynamicCheckProductsFilter = () => {
  const { t } = useTranslation('mongolian');
  const { selectedFilter, setSelectedFilter, productsData } =
    useMSDynamicCheckProducts();

  const getCount = (status: MSDynamicCheckProductStatus) =>
    productsData?.[status]?.items?.length || 0;

  return (
    <div className="flex flex-wrap gap-2">
      {FILTERS.map((status) => (
        <Button
          key={status}
          variant={selectedFilter === status ? 'default' : 'outline'}
          onClick={() => setSelectedFilter(status)}
        >
          {t(STATUS_KEYS[status])} ({getCount(status)})
        </Button>
      ))}
    </div>
  );
};
