import { ProductsHeader } from '@/products/components/ProductsHeader';
import { ProductSidebar } from '@/products/components/ProductSidebar';
import { PackageAddSheet } from '@/products/packages/components/PackageAddSheet';
import { PackagesRecordTable } from '@/products/packages/components/PackagesRecordTable';
import { PackagesFilter } from '@/products/packages/components/PackagesFilter';
import {
  PACKAGE_CONTENT_TYPE,
  PACKAGE_QUERY_KEY,
} from '@/products/packages/constants/packageContentType';
import { RecordDetailLink } from '@/side-panel/components/RecordDetailLink';
import { PageContainer, PageSubHeader } from 'erxes-ui';

export const ProductsPackagePage = () => {
  return (
    <PageContainer className="flex-row">
      <ProductSidebar />
      <div className="flex min-w-0 flex-auto flex-col overflow-hidden">
        <ProductsHeader>
          <PackageAddSheet />
        </ProductsHeader>
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
      <RecordDetailLink
        queryKey={PACKAGE_QUERY_KEY}
        contentType={PACKAGE_CONTENT_TYPE}
      />
    </PageContainer>
  );
};
