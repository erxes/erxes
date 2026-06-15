import { Button } from 'erxes-ui';

import { useMSDynamicCheckProducts } from '../hooks/useMSDynamicCheckProducts';
import {
  MSDYNAMIC_PRODUCT_FILTER_LABELS,
  MSDynamicCheckProductStatus,
} from '../types/msDynamicCheckProduct';

const FILTERS: MSDynamicCheckProductStatus[] = ['create', 'update', 'delete'];

export const MSDynamicCheckProductsFilter = () => {
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
          {MSDYNAMIC_PRODUCT_FILTER_LABELS[status]} ({getCount(status)})
        </Button>
      ))}
    </div>
  );
};
