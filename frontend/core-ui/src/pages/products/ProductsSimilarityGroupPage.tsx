import { ProductsHeader } from '@/products/components/ProductsHeader';
import { Button, PageContainer } from 'erxes-ui';
import { IconPlus } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { ProductSidebar } from '@/products/components/ProductSidebar';
import { SimilarityGroupList } from '@/products/settings/components/productsConfig/similarityConfig';
import { useSimilarityGroups } from '@/products/settings/components/productsConfig/similarityConfig/useSimilarityGroups';

export const ProductsSimilarityGroupPage = () => {
  const { t } = useTranslation('product', { keyPrefix: 'similarity-config' });
  const {
    groupsMap,
    configsLoading,
    newlyAddedKey,
    handleAddNew,
    handleSave,
    handleDelete,
  } = useSimilarityGroups();

  return (
    <PageContainer className="flex-row">
      <ProductSidebar />
      <div className="flex min-w-0 flex-auto flex-col overflow-hidden">
        <ProductsHeader>
          <Button onClick={handleAddNew}>
            <IconPlus size={16} />
            {t('new-config', 'New Config')}
          </Button>
        </ProductsHeader>
        <div className="flex overflow-hidden flex-col flex-auto p-3 w-full min-h-0">
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
