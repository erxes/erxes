import { ProductsHeader } from '@/products/components/ProductsHeader';
import { PageContainer } from 'erxes-ui';
import { ProductSidebar } from '@/products/components/ProductSidebar';
import { BundleConditionSheet } from '@/products/settings/components/productsConfig/bundleCondition/BundleConditionSheet';
import { BundleConditionRecordTable } from '@/products/settings/components/productsConfig/bundleCondition/BundleConditionRecordTable';

export const ProductsBundleConditionPage = () => {
  return (
    <PageContainer>
      <ProductsHeader>
        <BundleConditionSheet />
      </ProductsHeader>

      <div className="flex overflow-hidden flex-auto">
        <ProductSidebar />
        <div className="flex overflow-hidden flex-col flex-auto w-full">
          <div className="overflow-hidden flex-auto p-3">
            <div className="h-full">
              <BundleConditionRecordTable />
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
