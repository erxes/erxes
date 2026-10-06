import { PageContainer } from 'erxes-ui';
import { ProductsHeader } from '@/products/components/ProductsHeader';
import { ProductSidebar } from '@/products/components/ProductSidebar';
import { ConditionGroupRecordTable } from '@/products/settings/components/productsConfig/conditionGroup/ConditionGroupRecordTable';
import { ConditionGroupSheet } from '@/products/settings/components/productsConfig/conditionGroup/ConditionGroupSheet';

export const ProductsConditionGroupPage = () => (
  <PageContainer>
    <ProductsHeader>
      <ConditionGroupSheet />
    </ProductsHeader>
    <div className="flex overflow-hidden flex-auto">
      <ProductSidebar />
      <div className="flex overflow-hidden flex-col flex-auto w-full">
        <div className="overflow-hidden flex-auto p-3">
          <div className="h-full">
            <ConditionGroupRecordTable />
          </div>
        </div>
      </div>
    </div>
  </PageContainer>
);
