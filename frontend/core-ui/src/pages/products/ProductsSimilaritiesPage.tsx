import { Button, PageContainer } from 'erxes-ui';
import { IconPlus } from '@tabler/icons-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ProductsHeader } from '@/products/components/ProductsHeader';
import { ProductSidebar } from '@/products/components/ProductSidebar';
import { BulkProductAddSheet } from '@/products/bulk-similarity/components/BulkProductAddSheet';
import { SimilarityList } from '@/products/bulk-similarity/components/SimilarityList';
import {
  SIMILARITY_CONTENT_TYPE,
  SIMILARITY_QUERY_KEY,
} from '@/products/bulk-similarity/constants/similarityContentType';
import { RecordDetailLink } from '@/side-panel/components/RecordDetailLink';

export const ProductsSimilaritiesPage = () => {
  const { t } = useTranslation('product', { keyPrefix: 'bulk-similarity' });
  const [creating, setCreating] = useState(false);

  const handleNew = () => setCreating(true);

  const handleOpenChange = (next: boolean) => {
    if (!next) setCreating(false);
  };

  return (
    <PageContainer className="flex-row">
      <ProductSidebar />
      <div className="flex min-w-0 flex-auto flex-col overflow-hidden">
        <ProductsHeader>
          <Button onClick={handleNew}>
            <IconPlus size={16} />
            {t('new-similarity', 'New similarity')}
          </Button>
        </ProductsHeader>
        <div className="flex overflow-hidden flex-col flex-auto p-3 w-full min-h-0">
          <SimilarityList onNew={handleNew} />
        </div>
      </div>

      <BulkProductAddSheet open={creating} onOpenChange={handleOpenChange} />

      <RecordDetailLink
        queryKey={SIMILARITY_QUERY_KEY}
        contentType={SIMILARITY_CONTENT_TYPE}
      />
    </PageContainer>
  );
};
