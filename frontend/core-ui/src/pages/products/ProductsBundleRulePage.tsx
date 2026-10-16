import { ProductsHeader } from '@/products/components/ProductsHeader';
import { PageContainer } from 'erxes-ui';
import { ProductSidebar } from '@/products/components/ProductSidebar';
import { BundleRuleSheet } from '@/products/settings/components/productsConfig/bundleRule/BundleRuleSheet';
import { BundleRuleRecordTable } from '@/products/settings/components/productsConfig/bundleRule/BundleRuleRecordTable';

export const ProductsBundleRulePage = () => {
  return (
    <PageContainer className="flex-row">
      <ProductSidebar />
      <div className="flex min-w-0 flex-auto flex-col overflow-hidden">
        <ProductsHeader>
          <BundleRuleSheet />
        </ProductsHeader>
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
