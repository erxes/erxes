import { Button, PageContainer, useQueryState } from 'erxes-ui';
import { IconPlus } from '@tabler/icons-react';
import { useState } from 'react';
import { ProductsHeader } from '@/products/components/ProductsHeader';
import { ProductSidebar } from '@/products/components/ProductSidebar';
import { BulkProductAddSheet } from '@/products/bulk-similarity/components/BulkProductAddSheet';
import { BulkProductEditSheet } from '@/products/bulk-similarity/components/BulkProductEditSheet';
import { SimilarityList } from '@/products/bulk-similarity/components/SimilarityList';
import { useProductSimilarity } from '@/products/bulk-similarity/hooks/useProductSimilarityDetail';

export const ProductsSimilaritiesPage = () => {
  const [creating, setCreating] = useState(false);
  const [editId, setEditId] = useQueryState<string>('similarityId');
  const { similarity } = useProductSimilarity(editId || undefined);

  const handleNew = () => {
    setEditId(null);
    setCreating(true);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setCreating(false);
      setEditId(null);
    }
  };

  return (
    <PageContainer>
      <ProductsHeader>
        <Button onClick={handleNew}>
          <IconPlus size={16} />
          New similarity
        </Button>
      </ProductsHeader>

      <div className="flex overflow-hidden flex-auto">
        <ProductSidebar />
        <div className="flex overflow-hidden flex-col flex-auto w-full min-h-0">
          <SimilarityList onNew={handleNew} />
        </div>
      </div>

      <BulkProductAddSheet open={creating} onOpenChange={handleOpenChange} />

      {/* when editing, wait for the record to load before mounting the form so
          react-hook-form picks up the real default values */}
      {!!editId && !!similarity && (
        <BulkProductEditSheet
          open
          onOpenChange={handleOpenChange}
          similarity={similarity}
        />
      )}
    </PageContainer>
  );
};
