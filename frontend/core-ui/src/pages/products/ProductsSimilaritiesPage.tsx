import { PageContainer } from 'erxes-ui';
import { ProductsHeader } from '@/products/components/ProductsHeader';
import { ProductSidebar } from '@/products/components/ProductSidebar';
import { SimilarityAddButton } from '@/products/bulk-similarity/components/SimilarityAddButton';
import { SimilarityList } from '@/products/bulk-similarity/components/SimilarityList';
import {
  SIMILARITY_CONTENT_TYPE,
  SIMILARITY_QUERY_KEY,
} from '@/products/bulk-similarity/constants/similarityContentType';
import { RecordDetailLink } from '@/side-panel/components/RecordDetailLink';

export const ProductsSimilaritiesPage = () => {
  return (
    <PageContainer className="flex-row">
      <ProductSidebar />
      <div className="flex min-w-0 flex-auto flex-col overflow-hidden">
        <ProductsHeader>
          <SimilarityAddButton />
        </ProductsHeader>
        <div className="flex overflow-hidden flex-col flex-auto p-3 w-full min-h-0">
          <SimilarityList />
        </div>
      </div>
      <RecordDetailLink
        queryKey={SIMILARITY_QUERY_KEY}
        contentType={SIMILARITY_CONTENT_TYPE}
      />
    </PageContainer>
  );
};
