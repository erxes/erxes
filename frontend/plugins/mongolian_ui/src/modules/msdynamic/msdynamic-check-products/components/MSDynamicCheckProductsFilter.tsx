import { Button } from 'erxes-ui';

import { useMSDynamicCheckProducts } from '../hooks/useMSDynamicCheckProducts';
import {
  MSDYNAMIC_PRODUCT_FILTER_LABELS,
  MSDynamicCheckProductStatus,
} from '../types/msDynamicCheckProduct';

const FILTERS: MSDynamicCheckProductStatus[] = ['create', 'update', 'delete'];

/** Product filter buttons and count by status */
export const MSDynamicCheckProductsFilter = () => {
  const { selectedFilter, setSelectedFilter, productsData } =
    useMSDynamicCheckProducts();

  /** Get count of products by status */
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
