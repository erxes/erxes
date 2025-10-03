import { CategoryFilter } from '@/products/product-category/components/CategoryFilter';
import { ProductCategoriesHeader } from '@/products/product-category/components/ProductCategoriesHeader';
import { ProductCategoriesRecordTable } from '@/products/product-category/components/ProductCategoriesRecordTable';
import { CategoryDetailSheet } from '@/products/product-category/detail/components/CategoryDetailSheet';
import { PageContainer, PageSubHeader } from 'erxes-ui';

export const ProductCategoryPage = () => {
  return (
    <PageContainer>
      <ProductCategoriesHeader />
      <PageSubHeader>
        <CategoryFilter/>
      </PageSubHeader>
      <ProductCategoriesRecordTable />
      <CategoryDetailSheet/>
    </PageContainer>
  );
};
