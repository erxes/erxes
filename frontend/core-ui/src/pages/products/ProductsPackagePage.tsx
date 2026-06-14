import { ProductsHeader } from '@/products/components/ProductsHeader';
import { ProductSidebar } from '@/products/components/ProductSidebar';
import { PackageAddSheet } from '@/products/packages/components/PackageAddSheet';
import { PackageDetailSheet } from '@/products/packages/components/PackageDetailSheet';
import { PackagesRecordTable } from '@/products/packages/components/PackagesRecordTable';
import { PackagesFilter } from '@/products/packages/components/PackagesFilter';
import { PageContainer, PageSubHeader } from 'erxes-ui';

export const ProductsPackagePage = () => {
  return (
    <PageContainer>
      <ProductsHeader>
        <PackageAddSheet />
      </ProductsHeader>
      <div className="flex overflow-hidden flex-auto">
        <ProductSidebar />
        <div className="flex flex-col flex-auto overflow-hidden w-full">
          <PageSubHeader>
            <PackagesFilter />
          </PageSubHeader>
          <div className="overflow-hidden flex-auto p-3">
            <div className="h-full">
              <PackagesRecordTable />
            </div>
          </div>
        </div>
      </div>
      <PackageDetailSheet />
    </PageContainer>
  );
};
