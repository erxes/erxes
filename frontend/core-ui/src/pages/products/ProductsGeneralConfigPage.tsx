import { GeneralConfigForm } from '@/products/settings/components/productsConfig/generalConfig/GeneralConfigForm';
import { ProductsHeader } from '@/products/components/ProductsHeader';
import { PageContainer } from 'erxes-ui';
import { ProductSidebar } from '@/products/components/ProductSidebar';

export const ProductsGeneralConfigPage = () => {
  return (
    <PageContainer>
      <ProductsHeader />
      <div className="flex overflow-hidden flex-auto">
        <ProductSidebar />
        <div className="flex overflow-hidden flex-col flex-auto w-full">
          <div className="p-3">
            <GeneralConfigForm />
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
