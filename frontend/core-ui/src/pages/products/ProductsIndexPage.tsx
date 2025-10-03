import { ProductsHeader } from '@/products/components/ProductsHeader';
import { ProductDetail } from '@/products/detail/components/ProductDetail';
import { ProductsRecordTable } from '@/products/components/ProductsRecordTable';
import { ProductsFilter } from '@/products/components/ProductsFilter';
import { PageContainer, PageSubHeader } from 'erxes-ui';

export const ProductsIndexPage = () => {
  return (
    <PageContainer>
      <ProductsHeader />
      <PageSubHeader>
        <ProductsFilter />
      </PageSubHeader>
      <ProductsRecordTable />
      <ProductDetail />
    </PageContainer>
  );
};
