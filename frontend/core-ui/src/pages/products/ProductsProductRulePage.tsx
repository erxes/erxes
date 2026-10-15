import { ProductsHeader } from '@/products/components/ProductsHeader';
import { PageContainer } from 'erxes-ui';
import { ProductSidebar } from '@/products/components/ProductSidebar';
import { ProductRuleSheet } from '@/products/settings/components/productsConfig/productRule/ProductRuleSheet';
import { ProductRuleRecordTable } from '@/products/settings/components/productsConfig/productRule/ProductRuleRecordTable';

export const ProductsProductRulePage = () => {
  return (
    <PageContainer className="flex-row">
      <ProductSidebar />
      <div className="flex min-w-0 flex-auto flex-col overflow-hidden">
        <ProductsHeader>
          <ProductRuleSheet />
        </ProductsHeader>
        <div className="flex overflow-hidden flex-col flex-auto w-full">
          <div className="overflow-hidden flex-auto p-3">
            <div className="h-full">
              <ProductRuleRecordTable />
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
