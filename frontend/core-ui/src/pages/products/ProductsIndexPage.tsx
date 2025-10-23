import { ProductsHeader } from '@/products/components/ProductsHeader';
import { ProductDetail } from '@/products/product-detail/components/ProductDetail';
import { ProductsRecordTable } from '@/products/components/ProductsRecordTable';
import { ProductsFilter } from '@/products/components/ProductsFilter';
import { PageContainer, PageSubHeader } from 'erxes-ui';
import { ProductDetailSheet } from '@/products/product-detail/components/ProductDetailSheet';

export const ProductsIndexPage = () => {
  return (
    <PageContainer>
      <ProductsHeader />
      <PageSubHeader>
        <ProductsFilter />
      </PageSubHeader>
      <ProductsRecordTable />
      <ProductDetailSheet>
        <ProductDetail />
      </ProductDetailSheet>
    </PageContainer>
  );
};
