import { PageContainer } from 'erxes-ui';
import { EditFixedAssetCategory } from '@/settings/fixed-assets/components/EditFixedAssetCategory';
import { FixedAssetCategoriesTable } from '@/settings/fixed-assets/components/FixedAssetCategoriesTable';

export const FixedAssetCategoriesPage = () => {
  return (
    <PageContainer>
      <FixedAssetCategoriesTable />
      <EditFixedAssetCategory />
    </PageContainer>
  );
};
