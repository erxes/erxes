import { ProductAddSheet } from '@/products/components/ProductAddSheet';
import { ProductsFilter } from '@/products/components/ProductsFilter';
import { ProductsHeader } from '@/products/components/ProductsHeader';
import { ProductsRecordTable } from '@/products/components/ProductsRecordTable';
import { ProductDetailSheet } from '@/products/product-detail/components/ProductDetailSheet';
import { PageContainer, PageSubHeader } from 'erxes-ui';
import { ProductSidebar } from '@/products/components/ProductSidebar';
import { useProducts } from '@/products/hooks/useProducts';
import { Export, Import } from 'ui-modules';

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
  const { productsQueryVariables } = useProducts();

  const getFilters = () => {
    const { cursor, limit, ...filters } = productsQueryVariables || {};
    return filters;
  };

  return (
    <>
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
      <div className="overflow-hidden flex-auto p-3">
        <div className="h-full">
          <ProductsRecordTable />
        </div>
      </div>
      <ProductDetailSheet />
    </>
  );
};
