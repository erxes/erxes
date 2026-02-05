import { ProductsHeader } from '@/products/components/ProductsHeader';
import { PageContainer } from 'erxes-ui';
import { ProductSidebar } from '@/products/components/ProductSidebar';
import { SimilarityConfigForm } from '@/products/settings/components/productsConfig/similarityConfig/SimilarityConfigForm';
import { SimilarityConfigGroupList } from '@/products/settings/components/productsConfig/similarityConfig/SimilarityConfigGroupList';
import { SimilarityConfigProvider } from '@/products/settings/components/productsConfig/similarityConfig/SimilarityConfigContext';

export const ProductsSimilarityGroupPage = () => {
  return (
    <SimilarityConfigProvider>
      <PageContainer>
        <ProductsHeader>
          <SimilarityConfigForm />
        </ProductsHeader>
        <div className="flex overflow-hidden flex-auto">
          <ProductSidebar />
          <div className="flex overflow-y-auto flex-col flex-auto w-full min-h-0">
            <div className="p-3">
              <SimilarityConfigGroupList />
            </div>
          </div>
        </div>
      </PageContainer>
    </SimilarityConfigProvider>
  );
};
