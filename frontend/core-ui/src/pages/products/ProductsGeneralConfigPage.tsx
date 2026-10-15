import { GeneralConfigForm } from '@/products/settings/components/productsConfig/generalConfig/GeneralConfigForm';
import { ProductsHeader } from '@/products/components/ProductsHeader';
import { PageContainer } from 'erxes-ui';
import { ProductSidebar } from '@/products/components/ProductSidebar';

export const ProductsGeneralConfigPage = () => {
  return (
    <PageContainer className="flex-row">
      <ProductSidebar />
      <div className="flex min-w-0 flex-auto flex-col overflow-hidden">
        <ProductsHeader />
        <div className="flex overflow-hidden flex-col flex-auto w-full">
          <div className="p-3">
            <GeneralConfigForm />
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
