import { PageContainer } from 'erxes-ui';
import { ProductsHeader } from '@/products/components/ProductsHeader';
import { ProductSidebar } from '@/products/components/ProductSidebar';
import { ConditionRecordTable } from '@/products/settings/components/productsConfig/condition/ConditionRecordTable';
import { ConditionSheet } from '@/products/settings/components/productsConfig/condition/ConditionSheet';

export const ProductsConditionsPage = () => (
  <PageContainer className="flex-row">
    <ProductSidebar />
    <div className="flex min-w-0 flex-auto flex-col overflow-hidden">
      <ProductsHeader>
        <ConditionSheet />
      </ProductsHeader>
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
