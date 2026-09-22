import { EditProductGroupRow } from '@/ebarimt/settings/product-group/components/EditProductGroupRow';
import { ProductGroupFilter } from '@/ebarimt/settings/product-group/components/ProductGroupFilter';
import { ProductGroupTable } from '@/ebarimt/settings/product-group/components/ProductGroupTable';

export const ProductGroupPage = () => {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-3 py-2 border-b">
        <ProductGroupFilter />
      </div>
      <div className="flex-auto p-3 overflow-hidden flex">
        <ProductGroupTable />
      </div>
      <EditProductGroupRow />
    </div>
  );
};
