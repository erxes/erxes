import { ProductAddSheet } from '@/products/components/ProductAddSheet';
import { ProductsFilter } from '@/products/components/ProductsFilter';
import { ProductsHeader } from '@/products/components/ProductsHeader';
import { ProductsRecordTable } from '@/products/components/ProductsRecordTable';
import { useProducts } from '@/products/hooks/useProducts';
import { ProductDetail } from '@/products/product-detail/components/ProductDetail';
import { ProductDetailSheet } from '@/products/product-detail/components/ProductDetailSheet';
import { PageContainer, PageSubHeader } from 'erxes-ui';
import { Export, Import } from 'ui-modules';


export const ProductsIndexPage = () => {
  
  const { productsQueryVariables } = useProducts();

  const getFilters = () => {
    const { cursor, limit, ...filters } = productsQueryVariables || {};
    return filters;
  };


  return (
    <PageContainer>
      <ProductsHeader >
        <ProductAddSheet />
      </ProductsHeader>
      <PageSubHeader>
        <ProductsFilter />
        <Import
            pluginName="core"
            moduleName="product"
            collectionName="product"
          />
        <Export
          pluginName="core"
          moduleName="product"
          collectionName="product"
          getFilters={getFilters}
        />
      </PageSubHeader>
      <ProductsRecordTable />
      <ProductDetailSheet>
        <ProductDetail />
      </ProductDetailSheet>
    </PageContainer>
  );
};
