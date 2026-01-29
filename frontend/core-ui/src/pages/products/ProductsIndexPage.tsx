import { ProductAddSheet } from '@/products/components/ProductAddSheet';
import { ProductsFilter } from '@/products/components/ProductsFilter';
import { ProductsHeader } from '@/products/components/ProductsHeader';
import { ProductsRecordTable } from '@/products/components/ProductsRecordTable';
import { ProductDetailSheet } from '@/products/product-detail/components/ProductDetailSheet';
import { PageContainer, PageSubHeader } from 'erxes-ui';
import { ProductSidebar } from '@/products/components/ProductSidebar';

export const ProductsIndexPage = () => {
  return (
    <PageContainer>
      <ProductsHeader>
        <ProductAddSheet />
      </ProductsHeader>

      <div className="flex overflow-hidden flex-auto">
        <ProductSidebar />
        <div className="flex overflow-hidden flex-col flex-auto w-full">
          <ProductsIndexPageContent />
        </div>
      </div>
    </PageContainer>
  );
};

const ProductsIndexPageContent = () => {
  return (
    <>
      <PageSubHeader>
        <ProductsFilter />
      </PageSubHeader>
      <div className="overflow-hidden flex-auto p-3">
        <div className="h-full">
          <ProductsRecordTable />
        </div>
      </div>
      <ProductDetailSheet />
    </>
  );
};
