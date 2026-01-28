import { ProductAddSheet } from '@/products/components/ProductAddSheet';
import { ProductsFilter } from '@/products/components/ProductsFilter';
import { ProductsHeader } from '@/products/components/ProductsHeader';
import { ProductsRecordTable } from '@/products/components/ProductsRecordTable';
import { ProductDetail } from '@/products/product-detail/components/ProductDetail';
import { ProductDetailSheet } from '@/products/product-detail/components/ProductDetailSheet';
import { PageContainer, PageSubHeader } from 'erxes-ui';


export const ProductsIndexPage = () => {
  return (
    <PageContainer>
      <ProductsHeader >
        <ProductAddSheet />
      </ProductsHeader>
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
