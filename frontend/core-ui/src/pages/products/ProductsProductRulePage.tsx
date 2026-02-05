import { ProductsHeader } from '@/products/components/ProductsHeader';
import { PageContainer } from 'erxes-ui';
import { ProductSidebar } from '@/products/components/ProductSidebar';
import { useTranslation } from 'react-i18next';

export const ProductsProductRulePage = () => {
  const { t } = useTranslation('product');

  return (
    <PageContainer>
      <ProductsHeader />
      <div className="flex overflow-hidden flex-auto">
        <ProductSidebar />
        <div className="flex overflow-hidden flex-col flex-auto w-full">
          <div className="overflow-hidden flex-auto p-3">
            <div className="p-6 h-full rounded-md border bg-card">
              <h2 className="mb-2 text-lg font-semibold">
                {t('product-rule')}
              </h2>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
