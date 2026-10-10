import { PageContainer } from 'erxes-ui';
import { ProductsHeader } from '@/products/components/ProductsHeader';
import { ProductSidebar } from '@/products/components/ProductSidebar';
import { ConditionRecordTable } from '@/products/settings/components/productsConfig/condition/ConditionRecordTable';
import { ConditionSheet } from '@/products/settings/components/productsConfig/condition/ConditionSheet';

export const ProductsConditionsPage = () => (
  <PageContainer>
    <ProductsHeader>
      <ConditionSheet />
    </ProductsHeader>
    <div className="flex overflow-hidden flex-auto">
      <ProductSidebar />
      <div className="flex overflow-hidden flex-col flex-auto w-full">
        <div className="overflow-hidden flex-auto p-3">
          <div className="h-full">
            <ConditionRecordTable />
          </div>
        </div>
      </div>
    </div>
  </PageContainer>
);
