import { ProductsHeader } from '@/products/components/ProductsHeader';
import { PageContainer, PageSubHeader } from 'erxes-ui';
import { ProductSidebar } from '@/products/components/ProductSidebar';
import { BundleConditionSheet } from '@/products/settings/components/productsConfig/bundleCondition/BundleConditionSheet';
import { BundleConditionRecordTable } from '@/products/settings/components/productsConfig/bundleCondition/BundleConditionRecordTable';
import { BundleConditionFilter } from '@/products/settings/components/productsConfig/bundleCondition/bundleConditionFilter';

export const ProductsBundleConditionPage = () => {
  return (
    <PageContainer className="flex-row">
      <ProductSidebar />
      <div className="flex min-w-0 flex-auto flex-col overflow-hidden">
        <ProductsHeader>
          <BundleConditionSheet />
        </ProductsHeader>
        <div className="flex overflow-hidden flex-col flex-auto w-full">
          <ProductsBundleConditionPageContent />
        </div>
      </div>
    </PageContainer>
  );
};

const ProductsBundleConditionPageContent = () => {
  return (
    <>
      <PageSubHeader>
        <BundleConditionFilter />
      </PageSubHeader>

      <div className="overflow-hidden flex-auto p-3">
        <div className="h-full">
          <BundleConditionRecordTable />
        </div>
      </div>
    </>
  );
};
