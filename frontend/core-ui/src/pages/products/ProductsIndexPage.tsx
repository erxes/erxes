import { ProductAddButton } from '@/products/components/ProductAddButton';
import { ProductsFilter } from '@/products/components/ProductsFilter';
import { ProductsHeader } from '@/products/components/ProductsHeader';
import { ProductsRecordTable } from '@/products/components/ProductsRecordTable';
import { PageContainer, PageSubHeader } from 'erxes-ui';
import { ProductSidebar } from '@/products/components/ProductSidebar';
import { useProducts } from '@/products/hooks/useProducts';
import { Can, Export, Import } from 'ui-modules';
import { RecordDetailLink } from '@/side-panel/components/RecordDetailLink';
import {
  PRODUCT_CONTENT_TYPE,
  PRODUCT_QUERY_KEY,
} from '@/products/constants/productQueryKey';

export const ProductsIndexPage = () => {
  return (
    <PageContainer className="flex-row">
      <ProductSidebar />
      <div className="@container/products flex min-w-0 flex-auto flex-col overflow-hidden">
        <ProductsHeader>
          <ProductAddButton />
        </ProductsHeader>
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
        <Can action="productsImportManage">
          <Import
            pluginName="core"
            moduleName="product"
            collectionName="product"
          />
        </Can>
        <Can action="productsExportManage">
          <Export
            pluginName="core"
            moduleName="product"
            collectionName="product"
            getFilters={getFilters}
          />
        </Can>
      </PageSubHeader>
      <div className="overflow-hidden flex-auto p-3">
        <div className="h-full">
          <ProductsRecordTable />
        </div>
      </div>
      <RecordDetailLink
        queryKey={PRODUCT_QUERY_KEY}
        contentType={PRODUCT_CONTENT_TYPE}
      />
    </>
  );
};
