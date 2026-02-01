import { ProductsHeader } from '@/products/components/ProductsHeader';
import UomsList from '@/products/settings/components/uoms/UomsList';
import { PageContainer, PageSubHeader } from 'erxes-ui';

export const ProductUomPage = () => {
  return (
    <PageContainer>
      <ProductsHeader />
      <PageSubHeader>
      </PageSubHeader>
      <UomsList />
    </PageContainer>
  );
};
