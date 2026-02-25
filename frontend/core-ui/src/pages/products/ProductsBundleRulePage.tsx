import { ProductsHeader } from '@/products/components/ProductsHeader';
import { PageContainer } from 'erxes-ui';
import { ProductSidebar } from '@/products/components/ProductSidebar';
import { BundleRuleSheet } from '@/products/settings/components/productsConfig/bundleRule/BundleRuleSheet';
import { BundleRuleRecordTable } from '@/products/settings/components/productsConfig/bundleRule/BundleRuleRecordTable';

export const ProductsBundleRulePage = () => {
  return (
    <PageContainer>
      <ProductsHeader>
        <BundleRuleSheet />
      </ProductsHeader>
      <div className="flex overflow-hidden flex-auto">
        <ProductSidebar />
        <div className="flex overflow-hidden flex-col flex-auto w-full">
          <div className="overflow-hidden flex-auto p-3">
            <div className="h-full">
              <BundleRuleRecordTable />
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
