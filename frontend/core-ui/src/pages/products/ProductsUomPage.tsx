import { ProductsHeader } from '@/products/components/ProductsHeader';
import { PageContainer } from 'erxes-ui';
import { ProductSidebar } from '@/products/components/ProductSidebar';
import { AddUomSheet } from '@/products/settings/components/uoms/AddUomSheet';
import { UomsRecordTable } from '@/products/settings/components/uoms/UomsRecordTable';

export const ProductUomPage = () => {
  return (
    <PageContainer>
      <ProductsHeader>
        <AddUomSheet />
      </ProductsHeader>
      <div className="flex overflow-hidden flex-auto">
        <ProductSidebar />
        <div className="flex flex-col flex-auto overflow-hidden w-full">
          <div className="overflow-hidden flex-auto p-3">
            <div className="h-full">
              <UomsRecordTable />
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
