import { ProductsHeader } from '@/products/components/ProductsHeader';
import { ProductCategoryAddSheet } from '@/products/product-category/components/AddProductCategoryForm';
import { CategoryFilter } from '@/products/product-category/components/CategoryFilter';
import { ProductCategoriesRecordTable } from '@/products/product-category/components/ProductCategoriesRecordTable';
import { CategoryDetailSheet } from '@/products/product-category/detail/components/CategoryDetailSheet';
import { PageContainer, PageSubHeader } from 'erxes-ui';
import { ProductSidebar } from '@/products/components/ProductSidebar';

export const ProductCategoryPage = () => {
  return (
    <PageContainer>
      <ProductsHeader>
        <ProductCategoryAddSheet />
      </ProductsHeader>

      <div className="flex overflow-hidden flex-auto">
        <ProductSidebar />
        <div className="flex overflow-hidden flex-col flex-auto w-full">
          <ProductCategoryPageContent />
        </div>
      </div>
    </PageContainer>
  );
};

const ProductCategoryPageContent = () => {
  return (
    <>
      <PageSubHeader>
        <CategoryFilter />
      </PageSubHeader>
      <div className="overflow-hidden flex-auto p-3">
        <div className="h-full">
          <ProductCategoriesRecordTable />
        </div>
      </div>
      <CategoryDetailSheet />
    </>
  );
};
