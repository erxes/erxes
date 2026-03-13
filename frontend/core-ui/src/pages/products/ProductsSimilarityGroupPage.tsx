import { ProductsHeader } from '@/products/components/ProductsHeader';
import { Button, PageContainer } from 'erxes-ui';
import { IconPlus } from '@tabler/icons-react';
import { ProductSidebar } from '@/products/components/ProductSidebar';
import { SimilarityGroupList } from '@/products/settings/components/productsConfig/similarityConfig';
import { useSimilarityGroups } from '@/products/settings/components/productsConfig/similarityConfig/useSimilarityGroups';

export const ProductsSimilarityGroupPage = () => {
  const {
    groupsMap,
    configsLoading,
    newlyAddedKey,
    handleAddNew,
    handleSave,
    handleDelete,
  } = useSimilarityGroups();

  return (
    <PageContainer>
      <ProductsHeader>
        <Button onClick={handleAddNew}>
          <IconPlus size={16} />
          New Config
        </Button>
      </ProductsHeader>
      <div className="flex overflow-hidden flex-auto">
        <ProductSidebar />
        <div className="flex overflow-y-auto flex-col flex-auto p-3 w-full min-h-0">
          <SimilarityGroupList
            groupsMap={groupsMap}
            configsLoading={configsLoading}
            newlyAddedKey={newlyAddedKey}
            onSave={handleSave}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </PageContainer>
  );
};
