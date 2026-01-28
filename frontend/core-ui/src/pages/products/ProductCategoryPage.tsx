import { ProductsHeader } from '@/products/components/ProductsHeader';
import { ProductCategoryAddSheet } from '@/products/product-category/components/AddProductCategoryForm';
import { CategoryFilter } from '@/products/product-category/components/CategoryFilter';
import { ProductCategoriesRecordTable } from '@/products/product-category/components/ProductCategoriesRecordTable';
import { CategoryDetailSheet } from '@/products/product-category/detail/components/CategoryDetailSheet';
import { PageContainer, PageSubHeader } from 'erxes-ui';

export const ProductCategoryPage = () => {
  return (
    <PageContainer>
      <ProductsHeader >
        <ProductCategoryAddSheet />
      </ProductsHeader>
      <PageSubHeader>
        <CategoryFilter />
      </PageSubHeader>
      <ProductCategoriesRecordTable />
      <CategoryDetailSheet />
    </PageContainer>
  );
};
